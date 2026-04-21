import json
import spacy
from tqdm import tqdm

# ==============================
# CONFIG
# ==============================
INPUT_PATH = "data/chunks/chunks.json"
OUTPUT_PATH = "data/chunks/chunks_with_entities.json"

# Load biomedical NER model
nlp = spacy.load("en_ner_bc5cdr_md")

# Disable unnecessary components for speed
nlp.disable_pipes("tagger", "parser", "lemmatizer")


# ==============================
# HELPER FUNCTIONS
# ==============================

def is_valid_entity(text: str) -> bool:
    if not text:
        return False

    # Too short
    if len(text) < 3:
        return False

    # Remove ALL CAPS abbreviations
    if text.isupper():
        return False

    # Remove pure numbers
    if text.isdigit():
        return False

    # Remove numeric-like tokens (e.g., "140", "300mg" edge cases)
    if any(char.isdigit() for char in text) and len(text) < 5:
        return False

    return True


def extract_entities_from_doc(doc):
    diseases = set()
    drugs = set()

    for ent in doc.ents:
        text = ent.text.strip().lower()

        if not is_valid_entity(text):
            continue

        if ent.label_ == "DISEASE":
            diseases.add(text)

        elif ent.label_ == "CHEMICAL":
            drugs.add(text)

    return {
        "diseases": sorted(list(diseases)),
        "drugs": sorted(list(drugs)),
        "num_diseases": len(diseases),
        "num_drugs": len(drugs)
    }


# ==============================
# MAIN PIPELINE
# ==============================

def main():
    print("🔬 Extracting medical entities...")

    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    texts = [chunk["text"] for chunk in chunks]

    enriched_chunks = []

    # 🔥 Fast batch processing
    docs = nlp.pipe(texts, batch_size=32)

    for chunk, doc in tqdm(zip(chunks, docs), total=len(chunks)):
        entities = extract_entities_from_doc(doc)

        enriched_chunk = {
            "chunk_id": chunk["chunk_id"],
            "text": chunk["text"],
            "source": chunk.get("source"),
            "year": chunk.get("year"),
            "metadata": chunk.get("metadata", {}),
            "entities": entities
        }

        enriched_chunks.append(enriched_chunk)

    # ==============================
    # SAVE OUTPUT
    # ==============================
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(enriched_chunks, f, indent=2, ensure_ascii=False)

    print("\n✅ ENTITY EXTRACTION COMPLETE")
    print(f"🧩 Total chunks processed: {len(enriched_chunks)}")
    print(f"📁 Saved to: {OUTPUT_PATH}")


# ==============================
# ENTRY POINT
# ==============================

if __name__ == "__main__":
    main()