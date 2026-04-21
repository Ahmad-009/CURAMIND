import json

# ==============================
# CONFIG
# ==============================
INPUT_PATH = "data/chunks/chunks_with_entities.json"
OUTPUT_PATH = "data/chunks/chunks_filtered.json"

MIN_TEXT_LENGTH = 100
MIN_ENTITY_COUNT = 1


# ==============================
# QUALITY CHECKS
# ==============================

def has_valid_entities(entities):
    diseases = entities.get("diseases", [])
    drugs = entities.get("drugs", [])

    return (len(diseases) + len(drugs)) >= MIN_ENTITY_COUNT


def is_high_information(text):
    """
    Keep chunks that are meaningful even without entities
    (important for PubMed explanations)
    """
    keywords = [
        "study", "results", "patients", "treatment",
        "clinical", "trial", "analysis", "risk",
        "outcome", "therapy"
    ]

    text_lower = text.lower()
    return any(k in text_lower for k in keywords)


def is_high_quality(chunk):
    text = chunk.get("text", "")
    entities = chunk.get("entities", {})

    # Basic length check
    if len(text) < MIN_TEXT_LENGTH:
        return False

    # Keep if:
    if has_valid_entities(entities):
        return True

    # OR if high information text
    if is_high_information(text):
        return True

    return False


# ==============================
# MAIN PIPELINE
# ==============================

def main():
    print("🧹 Filtering high-quality chunks...")

    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    filtered = []
    removed = []

    for chunk in chunks:
        if is_high_quality(chunk):
            filtered.append(chunk)
        else:
            removed.append(chunk)

    # ==============================
    # SAVE OUTPUT
    # ==============================
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(filtered, f, indent=2, ensure_ascii=False)

    # ==============================
    # STATS
    # ==============================
    total = len(chunks)
    kept = len(filtered)
    removed_count = total - kept

    print("\n✅ FILTERING COMPLETE")
    print(f"🧩 Original chunks: {total}")
    print(f"✅ Kept: {kept}")
    print(f"❌ Removed: {removed_count}")
    print(f"📊 Retention rate: {round((kept/total)*100, 2)}%")


# ==============================
# ENTRY POINT
# ==============================

if __name__ == "__main__":
    main()