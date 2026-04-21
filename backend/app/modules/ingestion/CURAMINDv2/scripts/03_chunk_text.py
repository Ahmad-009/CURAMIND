import json
from transformers import AutoTokenizer

# ==============================
# CONFIG
# ==============================
INPUT_PATH = "data/cleaned/merged_clean.json"
OUTPUT_PATH = "data/chunks/chunks.json"

CHUNK_SIZE = 250
OVERLAP = 50

tokenizer = AutoTokenizer.from_pretrained("bert-base-cased")

# 🔥 CRITICAL FIX (removes warning completely)
tokenizer.model_max_length = 10**9


# ==============================
# CHUNKING FUNCTION (FIXED)
# ==============================

def chunk_document(doc):
    # ✅ SAFE TOKENIZATION (NO TRUNCATION WARNING)
    tokens = tokenizer(
        doc["text"],
        add_special_tokens=False,
        truncation=False,
        return_attention_mask=False
    )["input_ids"]

    chunks = []
    start = 0
    chunk_index = 0

    while start < len(tokens):
        end = start + CHUNK_SIZE
        chunk_tokens = tokens[start:end]

        chunk_text = tokenizer.decode(chunk_tokens, skip_special_tokens=True)

        # Skip empty/very small chunks
        if len(chunk_text.strip()) > 20:
            chunk = {
                "chunk_id": f"{doc['id']}_chunk_{chunk_index}",
                "text": chunk_text,
                "source": doc.get("source"),
                "year": doc.get("year"),
                "metadata": doc.get("metadata", {})
            }
            chunks.append(chunk)
            chunk_index += 1

        start += CHUNK_SIZE - OVERLAP

    return chunks


# ==============================
# MAIN PIPELINE
# ==============================

def main():
    print("✂️ Chunking documents...")

    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        documents = json.load(f)

    all_chunks = []

    for doc in documents:
        chunks = chunk_document(doc)
        all_chunks.extend(chunks)

    # ==============================
    # SAVE OUTPUT
    # ==============================
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2, ensure_ascii=False)

    print("\n✅ CHUNKING COMPLETE")
    print(f"📄 Total documents: {len(documents)}")
    print(f"🧩 Total chunks created: {len(all_chunks)}")
    print(f"📁 Saved to: {OUTPUT_PATH}")


# ==============================
# ENTRY POINT
# ==============================

if __name__ == "__main__":
    main()