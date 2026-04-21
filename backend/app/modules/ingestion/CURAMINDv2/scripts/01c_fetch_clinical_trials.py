# scripts/01c_fetch_clinical_trials.py

import requests
import json
import time
from typing import Dict, List

# ==============================
# CONFIG
# ==============================
OUTPUT_PATH = "data/raw/clinical_trials.json"
BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

QUERIES = [
    "hypertension",
    "diabetes",
    "breast cancer",
    "lung cancer",
    "asthma",
    "heart disease",
    "kidney disease",
    "stroke",
    "liver disease",
    "infectious disease"
]

MAX_TOTAL = 500
PER_DOMAIN = 50
PAGE_SIZE = 50


# ==============================
# HELPERS
# ==============================

def extract_year(date_str: str):
    if not date_str:
        return None
    try:
        return int(date_str[:4])
    except:
        return None


def is_valid_conditions(conditions: List[str]) -> bool:
    """Filter out low-quality or irrelevant trials"""
    if not conditions:
        return False

    invalid_conditions = ["healthy", "normal", "volunteers"]

    for cond in conditions:
        if cond.lower() in invalid_conditions:
            return False

    return True


def normalize_trial(study: Dict) -> Dict:
    try:
        protocol = study.get("protocolSection", {})

        id_module = protocol.get("identificationModule", {})
        desc_module = protocol.get("descriptionModule", {})
        cond_module = protocol.get("conditionsModule", {})
        arms_module = protocol.get("armsInterventionsModule", {})
        status_module = protocol.get("statusModule", {})

        nct_id = id_module.get("nctId")
        if not nct_id:
            return None

        summary = desc_module.get("briefSummary", "")
        conditions = cond_module.get("conditions", [])

        # 🚨 FILTER BAD CONDITIONS
        if not is_valid_conditions(conditions):
            return None

        interventions = []
        for arm in arms_module.get("interventions", []):
            name = arm.get("name")
            if name:
                interventions.append(name)

        # Construct clean text
        text_parts = []

        if summary:
            text_parts.append(summary.replace("\n", " "))

        if conditions:
            text_parts.append("Conditions: " + ", ".join(conditions))

        if interventions:
            text_parts.append("Interventions: " + ", ".join(interventions))

        combined_text = ". ".join(text_parts).strip()

        if not combined_text:
            return None

        year = extract_year(
            status_module.get("startDateStruct", {}).get("date")
        )

        return {
            "id": f"clinical_trials_{nct_id}",
            "text": combined_text,
            "source": "clinical_trials",
            "year": year,
            "metadata": {
                "nct_id": nct_id,
                "conditions": conditions,
                "interventions": interventions
            }
        }

    except Exception:
        return None


# ==============================
# MAIN PIPELINE
# ==============================

def main():
    all_trials: List[Dict] = []

    for query in QUERIES:
        print(f"\n🔍 Fetching trials for: {query}")
        collected = 0
        page_token = None

        while collected < PER_DOMAIN:
            params = {
                "query.term": query,
                "pageSize": PAGE_SIZE,
                "format": "json"
            }

            if page_token:
                params["pageToken"] = page_token

            try:
                response = requests.get(BASE_URL, params=params, timeout=15)
                response.raise_for_status()
                data = response.json()

            except Exception as e:
                print(f"⚠️ API error: {e}")
                time.sleep(2)
                continue

            studies = data.get("studies", [])

            for study in studies:
                normalized = normalize_trial(study)

                if normalized:
                    all_trials.append(normalized)
                    collected += 1

                if collected >= PER_DOMAIN or len(all_trials) >= MAX_TOTAL:
                    break

            page_token = data.get("nextPageToken")
            if not page_token:
                break

            time.sleep(0.5)

        print(f"✅ Collected {collected} trials for {query}")

        if len(all_trials) >= MAX_TOTAL:
            break

    # ==============================
    # SAVE OUTPUT
    # ==============================
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_trials, f, indent=2, ensure_ascii=False)

    print(f"\n🎯 Total saved: {len(all_trials)} trials")


# ==============================
# ENTRY POINT
# ==============================

if __name__ == "__main__":
    main()