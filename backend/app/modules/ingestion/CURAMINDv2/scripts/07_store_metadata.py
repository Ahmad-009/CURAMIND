import json
import psycopg2
from tqdm import tqdm

# ==============================
# CONFIG
# ==============================
CHUNKS_PATH = "data/chunks/chunks_filtered.json"

DB_CONFIG = {
    "dbname": "curamind",
    "user": "postgres",
    "password": "postgres",   # change if needed
    "host": "localhost",
    "port": "5432"
}


# ==============================
# MAIN PIPELINE
# ==============================

def main():
    print("💾 Storing metadata in PostgreSQL...")

    # Load chunks
    with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    # Connect to PostgreSQL
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # ==============================
    # CREATE TABLE
    # ==============================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chunks (
            vector_id INTEGER PRIMARY KEY,
            chunk_id TEXT,
            source TEXT,
            year INTEGER,
            text TEXT,
            diseases TEXT[],
            drugs TEXT[]
        )
    """)

    # Clear table (safe for reruns)
    cursor.execute("TRUNCATE TABLE chunks")

    # ==============================
    # INSERT DATA
    # ==============================
    for vector_id, chunk in tqdm(enumerate(chunks), total=len(chunks)):

        entities = chunk.get("entities", {})
        diseases = entities.get("diseases", [])
        drugs = entities.get("drugs", [])

        cursor.execute("""
            INSERT INTO chunks (
                vector_id,
                chunk_id,
                source,
                year,
                text,
                diseases,
                drugs
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            vector_id,
            chunk["chunk_id"],
            chunk.get("source"),
            chunk.get("year"),
            chunk.get("text"),
            diseases,
            drugs
        ))

    conn.commit()
    cursor.close()
    conn.close()

    print(f"✅ Stored metadata for {len(chunks)} chunks")


# ==============================
# ENTRY POINT
# ==============================

if __name__ == "__main__":
    main()