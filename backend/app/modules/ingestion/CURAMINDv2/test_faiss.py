import faiss
import numpy as np

print("🔍 Loading FAISS index...")

index = faiss.read_index("embeddings/faiss.index")

print(f"✅ Index loaded with {index.ntotal} vectors")

# Create random query vector (same dimension = 768)
query = np.random.rand(1, 768).astype("float32")

# Search top 5 nearest vectors
D, I = index.search(query, k=5)

print("\n🔎 Search Results:")
print("Indices:", I)
print("Scores:", D)