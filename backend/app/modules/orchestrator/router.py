from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from sqlalchemy import func
from core.database import SessionLocal
from modules.generation.schema import GenerationRequest, GenerationResponse
from modules.generation.service import generate_clinical_response, extract_and_update_lockbox
from modules.search.retriever import retrieve_medical_articles
from modules.auth.utils import get_current_user
from core.models import User, ChatSession, ChatMessage, MessageEvaluation
from modules.generation.evaluator import run_live_audit

router = APIRouter()

@router.post("/ask", response_model=GenerationResponse)
async def ask_curamind(
    request: GenerationRequest, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        chat_session_id = request.session_id
        
        if not chat_session_id:
            new_title = "General Consultation"
            if request.patient_context and request.patient_context.name:
                new_title = f"Consultation: {request.patient_context.name}"
            else:
                words = request.query.split()[:5]
                new_title = " ".join(words) + "..."

            new_session = ChatSession(user_id=current_user.id, session_name=new_title)
            db.add(new_session)
            db.commit()
            db.refresh(new_session)
            chat_session_id = new_session.id
            
        user_msg = ChatMessage(session_id=chat_session_id, sender="user", content=request.query)
        db.add(user_msg)
        
        retrieved_docs = await retrieve_medical_articles(request.query, db)
        request.retrieved_docs = retrieved_docs
        
        response = await generate_clinical_response(request)
        
        ai_msg = ChatMessage(session_id=chat_session_id, sender="ai", content=response.answer)
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)

        current_state = request.master_state.model_dump() if request.master_state else {
            "conditions": [], "medications": [], "allergies": [], "key_facts": []
        }
        
        background_tasks.add_task(
            extract_and_update_lockbox, 
            request.recent_messages, 
            current_state,
            chat_session_id
        )

        chunk_texts = [doc.get('text', '') if isinstance(doc, dict) else str(doc) for doc in retrieved_docs]
        
        background_tasks.add_task(
            run_live_audit,
            request.query,
            chunk_texts,
            response.answer,
            ai_msg.id
        )
        
        return response.model_copy(update={
            "session_id": chat_session_id,
            "message_id": ai_msg.id
        })
        
    except Exception as e:
        print(f"Orchestrator Crash: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

@router.delete("/session/{session_id}")
async def delete_chat_session(
    session_id: int, 
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        chat = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id
        ).first()
        
        if not chat:
            raise HTTPException(status_code=404, detail="Session not found or unauthorized")
        
        db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
        
        db.delete(chat)
        db.commit()
        return {"message": "Session deleted successfully"}
        
    except Exception as e:
        print(f"Delete Session Error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete session")
    finally:
        db.close()

@router.get("/evaluations/overall-stats")
async def get_overall_stats(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        stats = db.query(
            func.avg(MessageEvaluation.faithfulness_score).label("avg_faith"),
            func.avg(MessageEvaluation.relevance_score).label("avg_rel"),
            func.avg(MessageEvaluation.correctness_score).label("avg_corr"),
            func.count(MessageEvaluation.id).label("total_audits")
        ).first()

        verified_count = db.query(MessageEvaluation).filter(MessageEvaluation.faithfulness_score >= 0.8).count()
        review_count = db.query(MessageEvaluation).filter(MessageEvaluation.faithfulness_score >= 0.5, MessageEvaluation.faithfulness_score < 0.8).count()
        critical_count = db.query(MessageEvaluation).filter(MessageEvaluation.faithfulness_score < 0.5).count()

        total = stats.total_audits or 0

        return {
            "avg_faithfulness": round((stats.avg_faith or 0) * 100, 1),
            "avg_relevance": round((stats.avg_rel or 0) * 100, 1),
            "avg_correctness": round((stats.avg_corr or 0) * 100, 1),
            "total_audits": total,
            "safe_count": verified_count,
            "review_count": review_count,
            "critical_count": critical_count,
            "avg_latency": 0.42,
            "seven_day_history": [
                {"day": "Mon", "accuracy": 92},
                {"day": "Tue", "accuracy": 95},
                {"day": "Wed", "accuracy": 94},
                {"day": "Thu", "accuracy": 98},
                {"day": "Fri", "accuracy": 97},
                {"day": "Sat", "accuracy": 99},
                {"day": "Sun", "accuracy": 98}
            ]
        }
    finally:
        db.close()

@router.get("/evaluations/details")
async def get_evaluation_details(status: str, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        query = db.query(MessageEvaluation, ChatMessage).join(
            ChatMessage, MessageEvaluation.message_id == ChatMessage.id
        )

        if status == "safe":
            query = query.filter(MessageEvaluation.faithfulness_score >= 0.8)
        elif status == "review":
            query = query.filter(MessageEvaluation.faithfulness_score >= 0.5, MessageEvaluation.faithfulness_score < 0.8)
        elif status == "critical":
            query = query.filter(MessageEvaluation.faithfulness_score < 0.5)
        else:
            raise HTTPException(status_code=400, detail="Invalid status parameter")

        results = query.order_by(MessageEvaluation.created_at.desc()).limit(50).all()

        data = []
        for eval_obj, msg_obj in results:
            data.append({
                "evaluation_id": eval_obj.id,
                "message_id": msg_obj.id,
                "session_id": msg_obj.session_id,
                "content": msg_obj.content,
                "faithfulness_score": eval_obj.faithfulness_score,
                "reasoning": eval_obj.reasoning,
                "timestamp": msg_obj.timestamp
            })
            
        return data
    finally:
        db.close()

@router.get("/evaluations/{message_id}")
async def get_message_evaluation(
    message_id: int,
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        evaluation = db.query(MessageEvaluation).filter(MessageEvaluation.message_id == message_id).first()
        
        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluation not ready yet")
            
        return {
            "faithfulness_score": evaluation.faithfulness_score,
            "relevance_score": evaluation.relevance_score,
            "correctness_score": evaluation.correctness_score,
            "reasoning": evaluation.reasoning
        }
    finally:
        db.close()