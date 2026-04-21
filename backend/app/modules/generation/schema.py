from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PatientContext(BaseModel):
    name: Optional[str] = Field(None, description="Patient's full name")
    age: int = Field(..., gt=0, description="Patient age in years")
    sex: str = Field(..., description="Biological sex of the patient")
    conditions: List[str] = Field(default=[], description="List of known conditions")

class PatientState(BaseModel):
    conditions: List[str] = Field(default=[], description="Extracted medical conditions")
    medications: List[str] = Field(default=[], description="Extracted medications")
    allergies: List[str] = Field(default=[], description="Extracted allergies")
    key_facts: List[str] = Field(default=[], description="Other critical patient facts")

class GenerationRequest(BaseModel):
    session_id: Optional[int] = Field(default=None, description="The active chat session ID")
    query: str = Field(..., min_length=10, description="The doctor's actual medical question")
    patient_context: Optional[PatientContext] = None 
    retrieved_docs: List[dict] = Field(default=[]) 
    master_state: Optional[PatientState] = Field(default=None, description="The JSON Lockbox from Postgres")
    recent_messages: List[Dict[str, str]] = Field(default=[], description="The Short-Term Buffer")

class Citation(BaseModel):
    source_id: str = Field(
        description="The source type provided in context, strictly: 'pubmed', 'drugbank', or 'clinical_trials'."
    )
    reference_id: str = Field(
        description="The exact PMID, NCT ID, or Drug ID provided in the REFERENCE_ID field of the context chunks."
    )
    url: str = Field(description="The absolute web link. Output 'N/A' if missing.")
    title: str = Field(description="The official title of the medical article.")
    snippet: str = Field(description="The exact quote from the source supporting the clinical claim.")
    
class GenerationResponse(BaseModel):
    answer: str
    citations: List[Citation] = Field(default=[])
    session_id: Optional[int] = None
    message_id: Optional[int] = None