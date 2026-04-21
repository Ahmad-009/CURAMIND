import os
import numpy as np
from typing import List
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
import google.generativeai as genai

from core.models import MedicalArticle 

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def apply_mmr(query_vector, candidate_vectors, k=5, lambda_mult=0.5):
    query_vector = np.array(query_vector)
    candidate_vectors = np.array(candidate_vectors)
    
    if len(candidate_vectors) == 0:
        return []
        
    q_norm = np.linalg.norm(query_vector)
    d_norms = np.linalg.norm(candidate_vectors, axis=1)
    
    sim_to_query = np.dot(candidate_vectors, query_vector) / (d_norms * q_norm + 1e-9)
    sim_matrix = np.dot(candidate_vectors, candidate_vectors.T) / (np.outer(d_norms, d_norms) + 1e-9)
    
    selected = []
    unselected = list(range(len(candidate_vectors)))
    
    for _ in range(min(k, len(candidate_vectors))):
        if not selected:
            idx = unselected[np.argmax(sim_to_query[unselected])]
        else:
            max_sims = np.max(sim_matrix[unselected][:, selected], axis=1)
            mmr_scores = lambda_mult * sim_to_query[unselected] - (1 - lambda_mult) * max_sims
            idx = unselected[np.argmax(mmr_scores)]
            
        selected.append(idx)
        unselected.remove(idx)
        
    return selected

async def retrieve_medical_articles(raw_query: str, db: Session) -> List[dict]:
    response = genai.embed_content(
        model="models/text-embedding-004",
        content=raw_query,
        task_type="retrieval_query"
    )
    query_vector = response['embedding']
    
    distance_func = MedicalArticle.embedding.cosine_distance(query_vector)
    
    stmt = select(MedicalArticle, distance_func.label('distance')).where(distance_func <= 0.75).order_by(distance_func).limit(15)
    
    results = db.execute(stmt).all()
    
    candidate_seeds = []
    for row in results:
        article = row[0]
        distance = row[1]
        print(f"DIAGNOSTIC - Title: {str(article.title)[:30]}... | Distance: {distance:.4f}")
        candidate_seeds.append(article)
    
    if not candidate_seeds:
        return []

    candidate_embeddings = [seed.embedding for seed in candidate_seeds]
    selected_indices = apply_mmr(query_vector, candidate_embeddings, k=5, lambda_mult=0.5)
    seeds = [candidate_seeds[i] for i in selected_indices]
    
    final_results = []
    
    for seed in seeds:
        neighbor_stmt = select(MedicalArticle).where(
            or_(
                MedicalArticle.id == seed.id - 1,
                MedicalArticle.id == seed.id + 1
            )
        )
        
        if seed.pmid:
            neighbor_stmt = neighbor_stmt.where(MedicalArticle.pmid == seed.pmid)
        elif seed.url:
            neighbor_stmt = neighbor_stmt.where(MedicalArticle.url == seed.url)
            
        neighbors = db.scalars(neighbor_stmt).all()
        
        all_chunks = sorted(neighbors + [seed], key=lambda x: x.id)
        full_text = " [...] ".join([c.content for c in all_chunks])
        
        final_results.append({
            "text": full_text,
            "source": seed.metadata_tags.get("source", "pubmed"),
            "url": seed.url or "N/A",
            "title": seed.title or "Untitled Article",
            "reference_id": (
                seed.metadata_tags.get("nct_id") or 
                seed.metadata_tags.get("pmid") or 
                seed.pmid or 
                "N/A"
            )
        })

    return final_results
