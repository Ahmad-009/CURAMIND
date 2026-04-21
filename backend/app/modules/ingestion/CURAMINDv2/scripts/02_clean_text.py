import json
import re

# ==============================
# INPUT FILES (MULTI-SOURCE)
# ==============================
INPUT_FILES = [
    "data/raw/pubmed.json",
    "data/raw/clinical_trials.json",
    "data/raw/drugbank.json"
]

OUTPUT_PATH = "data/cleaned/merged_clean.json"


# ==============================
# CLEANING FUNCTIONS
# ==============================

def remove_citations(text: str) -> str:
    return re.sub(r"\[\d+\]", "", text)


def remove_urls(text: str) -> str:
    return re.sub(r"http\S+|www\S+", "", text)


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def clean_text(text: str) -> str:
    text = remove_citations(text)
    text = remove_urls(text)
    text = normalize_whitespace(text)
    return text


# ==============================
# MAIN PIPELINE
# ==============================

def main():
    print("🧼 Cleaning and merging datasets...")

    merged_data = []

    # Load all sources
    for file_path in INPUT_FILES:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                merged_data.extend(data)
                print(f"✔ Loaded {len(data)} records from {file_path}")
        except Exception as e:
            print(f"⚠️ Failed to load {file_path}: {e}")

    cleaned_data = []

    for record in merged_data:
        text = record.get("text", "")

        if not text:
            continue

        cleaned = clean_text(text)

        if not cleaned or len(cleaned) < 30:
            continue

        cleaned_record = {
            "id": record["id"],
            "text": cleaned,
            "year": record.get("year"),
            "source": record.get("source"),
            "metadata": record.get("metadata", {})
        }

        cleaned_data.append(cleaned_record)

    # ==============================
    # SAVE OUTPUT
    # ==============================
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned_data, f, indent=2, ensure_ascii=False)

    print("\n✅ CLEANING COMPLETE")
    print(f"📊 Total merged records: {len(merged_data)}")
    print(f"🧼 Cleaned records: {len(cleaned_data)}")
    print(f"📁 Saved to: {OUTPUT_PATH}")


# ==============================
# ENTRY POINT
# ==============================

if __name__ == "__main__":
    main()