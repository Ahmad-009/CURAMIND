import json
import re
import traceback
from pydantic import BaseModel
from core.database import SessionLocal
from core.models import MessageEvaluation
from modules.generation.service import resilient_llm_call

class EvaluationSchema(BaseModel):
    faithfulness_score: float
    relevance_score: float
    correctness_score: float
    reasoning: str

async def run_live_audit(query: str, retrieved_chunks: list, generated_answer: str, message_id: int):
    db = SessionLocal()
    print(f"🚀 [AUDITOR] Starting Audit for Message ID: {message_id}")
    
    try:
        judge_prompt = f"""
        ACT AS A STRICT MEDICAL AUDITOR.
        
        Evaluation Criteria:
        1. Faithfulness (0.0 - 1.0): How much of the answer is derived ONLY from the provided Chunks? 
           - IF THE CHUNKS ARE EMPTY OR DO NOT MENTION THE DATA, THE SCORE MUST BE 0.0.
           - DO NOT use your own external knowledge to verify this specific score.
        2. Relevance (0.0 - 1.0): Does the answer directly address the user's Question?
        3. Correctness (0.0 - 1.0): Is the answer medically accurate based on general clinical standards?

        [Question]: {query}
        [Chunks]: {retrieved_chunks}
        [Answer]: {generated_answer}
        
        Return the evaluation strictly according to the provided schema in JSON format.
        """

        response = await resilient_llm_call(
            prompt_string=judge_prompt,
            schema=EvaluationSchema, 
            temp=0.0
        )

        if not response or not response.text:
            print(f"❌ [AUDITOR] Empty response from LLM for Message {message_id}")
            return

        clean_json = re.sub(r'```json|```', '', response.text).strip()
        audit_result = json.loads(clean_json)

        new_evaluation = MessageEvaluation(
            message_id=message_id,
            faithfulness_score=float(audit_result.get("faithfulness_score", 0.0)),
            relevance_score=float(audit_result.get("relevance_score", 0.0)),
            correctness_score=float(audit_result.get("correctness_score", 0.0)),
            reasoning=audit_result.get("reasoning", "Audit complete.")
        )

        db.add(new_evaluation)
        db.commit()
        print(f"✅ [AUDITOR] SUCCESS! Saved evaluation for Message {message_id}")

    except Exception as e:
        print(f"❌ [AUDITOR] CRITICAL FAILURE for Message {message_id} | Error: {str(e)}")
        traceback.print_exc() 
        db.rollback()
    finally:
        db.close()