import json
import faiss
from collections import defaultdict

# ==============================
# PATHS
# ==============================
FAISS_PATH = "embeddings/faiss.index"
METADATA_PATH = "embeddings/chunk_metadata.json"


# ==============================
# LOAD DATA
# ==============================

def load_metadata():
    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_faiss():
    return faiss.read_index(FAISS_PATH)


# ==============================
# CHECK 1: ALIGNMENT
# ==============================

def check_vector_alignment(index, metadata):
    faiss_count = index.ntotal
    meta_count = len(metadata)

    return {
        "faiss_vectors": faiss_count,
        "metadata_records": meta_count,
        "status": "OK" if faiss_count == meta_count else "MISMATCH"
    }


# ==============================
# CHECK 2: YEAR DISTRIBUTION (FIXED)
# ==============================

def count_chunks_by_year(metadata):
    counts = defaultdict(int)

    for chunk in metadata:
        year = chunk.get("year")

        if year is None:
            counts["unknown"] += 1
        else:
            counts[year] += 1

    # Sort only numeric years
    sorted_items = sorted(
        [(k, v) for k, v in counts.items() if isinstance(k, int)]
    )

    # Add unknown at end
    if "unknown" in counts:
        sorted_items.append(("unknown", counts["unknown"]))

    return dict(sorted_items)


# ==============================
# CHECK 3: SOURCE DISTRIBUTION
# ==============================

def count_by_source(metadata):
    counts = defaultdict(int)

    for chunk in metadata:
        source = chunk.get("source", "unknown")
        counts[source] += 1

    return dict(counts)


# ==============================
# CHECK 4: ENTITY COVERAGE
# ==============================

def entity_stats(metadata):
    total = len(metadata)
    with_entities = 0

    for chunk in metadata:
        entities = chunk.get("entities", {})

        if entities.get("diseases") or entities.get("drugs"):
            with_entities += 1

    return {
        "chunks_with_entities": with_entities,
        "total_chunks": total,
        "coverage_percent": round((with_entities / total) * 100, 2)
    }


# ==============================
# MAIN
# ==============================

def main():
    print("🩺 Running system health check...\n")

    metadata = load_metadata()
    index = load_faiss()

    # 1. Alignment
    print("🔗 FAISS ↔ Metadata Alignment:")
    print(check_vector_alignment(index, metadata))

    # 2. Year distribution
    print("\n📊 Chunks by year:")
    print(count_chunks_by_year(metadata))

    # 3. Source distribution
    print("\n📚 Source distribution:")
    print(count_by_source(metadata))

    # 4. Entity stats
    print("\n🧬 Entity coverage:")
    print(entity_stats(metadata))

    print("\n✅ Health check complete.")


# ==============================
# ENTRY POINT
# ==============================

if __name__ == "__main__":
    main()