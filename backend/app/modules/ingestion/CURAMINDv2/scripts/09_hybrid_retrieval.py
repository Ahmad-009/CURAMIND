import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi

# ==============================
# CONFIG
# ==============================
FAISS_PATH = "embeddings/faiss.index"
METADATA_PATH = "embeddings/chunk_metadata.json"

MODEL_NAME = "pritamdeka/PubMedBERT-mnli-snli-scinli-scitail-mednli-stsb"

TOP_K = 5


# ==============================
# LOAD SYSTEM
# ==============================
print("🔄 Loading system...")

index = faiss.read_index(FAISS_PATH)

with open(METADATA_PATH, "r", encoding="utf-8") as f:
    metadata = json.load(f)

#model = SentenceTransformer(MODEL_NAME)

texts = [chunk["text"] for chunk in metadata]
tokenized_corpus = [text.lower().split() for text in texts]
bm25 = BM25Okapi(tokenized_corpus)

print("✅ System loaded")


# ==============================
# HYBRID SEARCH
# ==============================

def hybrid_search(query, top_k=TOP_K):
    # -------- Dense (FAISS) --------
    query_embedding = model.encode(
        [query],
        normalize_embeddings=True
    ).astype("float32")

    D, I = index.search(query_embedding, top_k * 3)

    dense_results = {}
    for score, idx in zip(D[0], I[0]):
        dense_results[idx] = float(score)

    # -------- Sparse (BM25) --------
    tokenized_query = query.lower().split()
    bm25_scores = bm25.get_scores(tokenized_query)

    # 🔥 NORMALIZATION FIX
    max_bm25 = max(bm25_scores) if max(bm25_scores) != 0 else 1

    sparse_results = {
        idx: float(score) / max_bm25
        for idx, score in enumerate(bm25_scores)
    }

    # -------- Score Fusion --------
    combined_scores = {}

    for idx in range(len(metadata)):
        dense_score = dense_results.get(idx, 0)
        sparse_score = sparse_results.get(idx, 0)

        # Balanced hybrid
        combined_score = (0.6 * dense_score) + (0.4 * sparse_score)
        combined_scores[idx] = combined_score

    # -------- Ranking --------
    ranked = sorted(
        combined_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )[:top_k]

    # -------- Output --------
    results = []
    for idx, score in ranked:
        chunk = metadata[idx]

        results.append({
            "score": round(score, 4),
            "text": chunk["text"],
            "source": chunk["source"],
            "year": chunk["year"],
            "entities": chunk["entities"]
        })

    return results


# ==============================
# INTERACTIVE LOOP
# ==============================

if __name__ == "__main__":
    while True:
        query = input("\n🔍 Enter your medical query (or 'exit'): ")

        if query.lower() == "exit":
            break

        results = hybrid_search(query)

        print("\n📌 Top Results:\n")

        for i, res in enumerate(results, 1):
            print(f"{i}. Score: {res['score']}")
            print(f"   Source: {res['source']} | Year: {res['year']}")
            print(f"   Diseases: {res['entities']['diseases'][:3]}")
            print(f"   Drugs: {res['entities']['drugs'][:3]}")
            print(f"   Text: {res['text'][:250]}...\n")
