# scripts/01_fetch_pubmed.py

from Bio import Entrez
import json
import time
from typing import List, Dict

# ==============================
# CONFIG
# ==============================
Entrez.email = "hamzaanjum484@gmail.com"

KEYWORDS = [
    "hypertension treatment",
    "diabetes management",
    "breast cancer therapy",
    "lung cancer treatment",
    "asthma treatment",
    "heart disease treatment",
    "kidney disease management",
    "stroke treatment",
    "liver disease treatment",
    "infectious diseases treatment"
]

RETMAX = 300
OUTPUT_PATH = "data/raw/pubmed.json"

# ==============================
# FETCH FUNCTIONS
# ==============================

def fetch_pmids(query: str) -> List[str]:
    handle = Entrez.esearch(
        db="pubmed",
        term=query,
        retmax=RETMAX
    )
    record = Entrez.read(handle)
    handle.close()
    return record["IdList"]


def fetch_articles(pmids: List[str], batch_size: int = 50, max_retries: int = 3) -> Dict:
    """
    Fetch articles in batches to avoid connection errors
    """
    all_records = {"PubmedArticle": []}

    for i in range(0, len(pmids), batch_size):
        batch = pmids[i:i + batch_size]

        for attempt in range(max_retries):
            try:
                handle = Entrez.efetch(
                    db="pubmed",
                    id=",".join(batch),
                    rettype="abstract",
                    retmode="xml"
                )

                records = Entrez.read(handle)
                handle.close()

                if "PubmedArticle" in records:
                    all_records["PubmedArticle"].extend(records["PubmedArticle"])

                break  # success → exit retry loop

            except Exception as e:
                print(f"⚠️ Batch failed (attempt {attempt+1}): {e}")
                time.sleep(2)

        time.sleep(0.5)  # small delay between batches

    return all_records


# ==============================
# PARSING HELPERS
# ==============================

def extract_abstract(article_data) -> str:
    try:
        abstract_parts = article_data["Abstract"]["AbstractText"]
        if isinstance(abstract_parts, list):
            return " ".join(str(part) for part in abstract_parts)
        return str(abstract_parts)
    except:
        return ""


def extract_year(article_data) -> int:
    try:
        pub_date = article_data["Journal"]["JournalIssue"]["PubDate"]

        if "Year" in pub_date:
            return int(pub_date["Year"])

        if "MedlineDate" in pub_date:
            return int(pub_date["MedlineDate"][:4])

    except:
        pass

    return None


def normalize_pubmed_record(article) -> Dict:
    try:
        citation = article["MedlineCitation"]
        article_data = citation["Article"]

        pmid = str(citation["PMID"])
        title = str(article_data.get("ArticleTitle", "")).strip()
        abstract = extract_abstract(article_data)
        year = extract_year(article_data)

        if not abstract:
            return None

        return {
            "id": f"pubmed_{pmid}",
            "text": f"{title}. {abstract}",
            "source": "pubmed",
            "year": year,
            "metadata": {
                "pmid": pmid
            }
        }

    except Exception:
        return None


# ==============================
# MAIN PIPELINE
# ==============================

def main():
    all_papers = []

    for keyword in KEYWORDS:
        print(f"🔍 Fetching papers for: {keyword}")

        pmids = fetch_pmids(keyword)
        records = fetch_articles(pmids)

        if not records or "PubmedArticle" not in records:
            continue

        for article in records["PubmedArticle"]:
            normalized = normalize_pubmed_record(article)
            if normalized:
                all_papers.append(normalized)

        time.sleep(1)  # NCBI rate limit safety

    # ==============================
    # SAVE OUTPUT
    # ==============================
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_papers, f, indent=2, ensure_ascii=False)

    print(f"✅ Saved {len(all_papers)} PubMed records to {OUTPUT_PATH}")


# ==============================
# ENTRY POINT
# ==============================

if __name__ == "__main__":
    main()