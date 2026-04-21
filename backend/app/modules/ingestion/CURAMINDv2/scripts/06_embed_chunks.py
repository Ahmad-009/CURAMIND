import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
import os

# ==============================
# CONFIG
# ==============================
INPUT_PATH = "data/chunks/chunks_filtered.json"

FAISS_INDEX_PATH = "embeddings/faiss.index"
METADATA_PATH = "embeddings/chunk_metadata.json"

MODEL_NAME = "pritamdeka/PubMedBERT-mnli-snli-scinli-scitail-mednli-stsb"

BATCH_SIZE = 64


# ==============================
# MAIN PIPELINE
# ==============================

def main():
    print("🧠 Loading chunks...")

    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    texts = [chunk["text"] for chunk in chunks]

    print(f"📄 Total chunks: {len(texts)}")

    # ==============================
    # LOAD MODEL
    # ==============================
    print("🤖 Loading embedding model...")
    #model = SentenceTransformer(MODEL_NAME)

    # ==============================
    # GENERATE EMBEDDINGS (BATCHED)
    # ==============================
    print("⚡ Generating embeddings...")

    embeddings = model.encode(
        texts,
        batch_size=BATCH_SIZE,
        show_progress_bar=True,
        normalize_embeddings=True
    )

    embeddings = np.array(embeddings).astype("float32")

    # ==============================
    # BUILD FAISS INDEX
    # ==============================
    print("📦 Building FAISS index...")

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)  # cosine similarity (since normalized)

    index.add(embeddings)

    # ==============================
    # SAVE INDEX
    # ==============================
    os.makedirs("embeddings", exist_ok=True)

    faiss.write_index(index, FAISS_INDEX_PATH)

    # ==============================
    # SAVE METADATA (CRITICAL)
    # ==============================
    metadata = []

    for chunk in chunks:
        metadata.append({
            "chunk_id": chunk["chunk_id"],
            "text": chunk["text"],
            "source": chunk.get("source"),
            "year": chunk.get("year"),
            "metadata": chunk.get("metadata", {}),
            "entities": chunk.get("entities", {})
        })

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    # ==============================
    # FINAL STATS
    # ==============================
    print("\n✅ EMBEDDING COMPLETE")
    print(f"📊 Total vectors: {index.ntotal}")
    print(f"📐 Dimension: {dim}")
    print(f"💾 Index saved: {FAISS_INDEX_PATH}")
    print(f"🧠 Metadata saved: {METADATA_PATH}")


# ==============================
# ENTRY POINT
# ==============================

if __name__ == "__main__":
    main()
