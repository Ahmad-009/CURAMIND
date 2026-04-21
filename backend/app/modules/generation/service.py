import json
import time
import asyncio
from google.genai import types
from fastapi import HTTPException
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception
from sqlalchemy.orm.attributes import flag_modified

from core.database import SessionLocal
from core.models import ChatSession
from modules.generation.schema import GenerationRequest, GenerationResponse, PatientState
from modules.generation.utils import build_clinical_prompt
from core.llm_api import rotator

FALLBACK_MODELS = [
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest"
]

def is_retryable_error(exception):
    error_str = str(exception).lower()
    if any(x in error_str for x in ["429", "resource_exhausted", "503", "unavailable"]):
        return False
    return True

@retry(
    stop=stop_after_attempt(2), 
    wait=wait_exponential(multiplier=1, min=2, max=4), 
    retry=retry_if_exception(is_retryable_error),
    reraise=True
)
async def resilient_llm_call(prompt_string: str, schema: any, temp: float):
    last_error = None
    
    for model_id in FALLBACK_MODELS:
        attempts_per_model = len(rotator.keys)
        for _ in range(attempts_per_model):
            try:
                client = rotator.get_client()
                start_time = time.perf_counter()
                
                response = await asyncio.wait_for(
                    client.aio.models.generate_content(
                        model=model_id, 
                        contents=prompt_string,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            response_schema=schema, 
                            temperature=temp 
                        )
                    ),
                    timeout=15.0
                )
                
                latency = time.perf_counter() - start_time
                print(f"✅ SUCCESS | Model: {model_id} | Key: #{rotator.current_index + 1} | Latency: {latency:.3f}s")
                return response

            except asyncio.TimeoutError:
                print(f"⏱️ TIMEOUT | Model: {model_id} | Key: #{rotator.current_index + 1} hung. Rotating...")
                rotator.rotate()
                last_error = Exception("API Request Timed Out")
                continue

            except Exception as e:
                err_msg = str(e).upper()
                if any(x in err_msg for x in ["429", "RESOURCE_EXHAUSTED", "400", "INVALID_ARGUMENT", "503", "UNAVAILABLE", "500", "INTERNAL"]):
                    print(f"⚠️ API ERROR | Model: {model_id} | Key: #{rotator.current_index + 1}. Rotating...")
                    rotator.rotate()
                    last_error = e
                    continue
                
                raise e
                
    raise last_error

async def generate_clinical_response(request: GenerationRequest) -> GenerationResponse:
    try:
        prompt_string = build_clinical_prompt(request)
        
        response = await resilient_llm_call(
            prompt_string=prompt_string, 
            schema=GenerationResponse, 
            temp=0.2
        )
        
        response_dict = json.loads(response.text)
        
        seen_refs = set()
        unique_citations = []
        
        for cite in response_dict.get("citations", []):
            ref_id = cite.get("reference_id")
            if ref_id and ref_id != "N/A" and ref_id not in seen_refs:
                unique_citations.append(cite)
                seen_refs.add(ref_id)
        
        response_dict["citations"] = unique_citations
        
        return GenerationResponse(**response_dict)
        
    except Exception as e:
        err_str = str(e).lower()
        if "429" in err_str or "resource_exhausted" in err_str:
            raise HTTPException(status_code=429, detail="Medical AI quota fully exhausted. Try again later.")
        
        print(f"LLM Generation Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate clinical response.")

async def extract_and_update_lockbox(recent_messages: list, current_state_dict: dict, session_id: int) -> dict:
    try:
        buffer_str = "\n".join([f"{msg.get('role', 'unknown').capitalize()}: {msg.get('content', '')}" for msg in recent_messages])
        
        extraction_prompt = f"""
        Analyze the following recent medical conversation. 
        Extract any NEW patient conditions, medications, allergies, or key medical facts.
        Only extract confirmed facts, do not guess.
        
        [Recent Conversation]
        {buffer_str}
        """

        response = await resilient_llm_call(
            prompt_string=extraction_prompt, 
            schema=PatientState, 
            temp=0.0
        )
        
        extracted_data = json.loads(response.text)

        for key in ["conditions", "medications", "allergies", "key_facts"]:
            old_list = current_state_dict.get(key, [])
            new_items = extracted_data.get(key, [])
            
            for item in new_items:
                if item not in old_list:
                    old_list.append(item)
                    
            current_state_dict[key] = old_list

        db = SessionLocal()
        try:
            chat = db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if chat:
                chat.patient_state = current_state_dict      
                flag_modified(chat, "patient_state")         
                db.commit()
        finally:
            db.close()

        return current_state_dict

    except Exception as e:
        print(f"Background Extraction Error: {e}")
        return current_state_dict