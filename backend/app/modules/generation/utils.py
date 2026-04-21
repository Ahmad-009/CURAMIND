from modules.generation.schema import GenerationRequest

def build_clinical_prompt(request: GenerationRequest) -> str:
    if request.patient_context:
        conditions = ", ".join(request.patient_context.conditions) if request.patient_context.conditions else "None"
        context_str = f"Name: {request.patient_context.name or 'N/A'}\nAge: {request.patient_context.age}\nSex: {request.patient_context.sex}\nIntake Conditions: {conditions}"
    else:
        context_str = "No specific patient intake data provided."

    if request.master_state:
        state_dict = request.master_state.model_dump()
        lockbox_str = "\n".join([f"{k.capitalize()}: {', '.join(v) if isinstance(v, list) else v}" for k, v in state_dict.items() if v])
        if not lockbox_str:
            lockbox_str = "No extracted dynamic facts yet."
    else:
        lockbox_str = "No extracted dynamic facts yet."

    if request.recent_messages:
        safe_messages = request.recent_messages[-6:]
        buffer_str = "\n".join([f"{msg.get('role', 'unknown').capitalize()}: {msg.get('content', '')}" for msg in safe_messages])
    else:
        buffer_str = "No prior conversation."

    if request.retrieved_docs:
        formatted_docs = []
        for doc in request.retrieved_docs:
            if isinstance(doc, dict):
                doc_string = (
                    f"SOURCE_ID: {doc.get('source', 'General Medical')}\n"
                    f"REFERENCE_ID: {doc.get('reference_id', 'N/A')}\n"
                    f"TITLE: {doc.get('title', 'N/A')}\n"
                    f"URL: {doc.get('url', 'N/A')}\n"
                    f"CONTENT: {doc.get('text', '')}"
                )
                formatted_docs.append(doc_string)
            else:
                formatted_docs.append(str(doc))
        docs_str = "\n---\n".join(formatted_docs)
    else:
        docs_str = "No external documents retrieved."

    final_prompt = f"""You are Curamind, a senior clinical decision support AI. 

STRICT INSTRUCTIONS:
1. Base your answer ONLY on the [Retrieved Evidence] and [Patient Data] provided.
2. For every clinical claim, you MUST provide a citation in the JSON response.
3. The 'source_id' in your citation MUST match the EXACT 'SOURCE_ID' provided in the evidence (e.g., 'pubmed', 'drugbank', or 'clinical_trials').
4. The 'reference_id' in your citation MUST match the EXACT 'REFERENCE_ID' provided for that source chunk.
5. If the evidence contains a URL, include it exactly. Use 'N/A' only if no URL is present.
6. Use a professional, clinical tone.

[Patient Profile]
{context_str}

[Current Medical Lockbox]
{lockbox_str}

[Conversation History]
{buffer_str}

[Retrieved Evidence]
{docs_str}

[Physician Query]
{request.query}
"""
    return final_prompt