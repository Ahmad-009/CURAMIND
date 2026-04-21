import xml.etree.ElementTree as ET
import json

# ==============================
# CONFIG
# ==============================
INPUT_PATH = "data/raw/full database.xml"
OUTPUT_PATH = "data/raw/drugbank.json"

MAX_DRUGS = 500

# DrugBank namespace
NS = {"db": "http://www.drugbank.ca"}


# ==============================
# HELPERS
# ==============================

def get_text(element, path):
    child = element.find(path, NS)
    return child.text.strip() if child is not None and child.text else ""


def extract_interactions(drug_element):
    interactions = []

    interactions_element = drug_element.find("db:drug-interactions", NS)

    if interactions_element is not None:
        for interaction in interactions_element.findall("db:drug-interaction", NS):
            name = get_text(interaction, "db:name")
            if name:
                interactions.append(name)

    return interactions


def build_text(name, description, indication, mechanism):
    parts = []

    if name:
        parts.append(f"Drug: {name}")

    if description:
        parts.append(description)

    if indication:
        parts.append(f"Indication: {indication}")

    if mechanism:
        parts.append(f"Mechanism: {mechanism}")

    return ". ".join(parts).strip()


def normalize_drug(drug_element):
    try:
        drug_id = get_text(drug_element, "db:drugbank-id")
        name = get_text(drug_element, "db:name")
        description = get_text(drug_element, "db:description")
        indication = get_text(drug_element, "db:indication")
        mechanism = get_text(drug_element, "db:mechanism-of-action")

        interactions = extract_interactions(drug_element)

        text = build_text(name, description, indication, mechanism)

        if not text or len(text) < 50:
            return None

        return {
            "id": f"drugbank_{drug_id}",
            "text": text,
            "source": "drugbank",
            "year": None,
            "metadata": {
                "drugbank_id": drug_id,
                "drug_name": name,
                "interactions": interactions[:20]
            }
        }

    except Exception:
        return None


# ==============================
# MAIN PIPELINE
# ==============================

def main():
    print("📥 Parsing DrugBank XML...")

    context = ET.iterparse(INPUT_PATH, events=("start", "end"))

    drugs = []
    count = 0

    for event, elem in context:
        if event == "end" and elem.tag.endswith("drug"):

            record = normalize_drug(elem)

            if record:
                drugs.append(record)
                count += 1

            elem.clear()

            if count >= MAX_DRUGS:
                break

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(drugs, f, indent=2, ensure_ascii=False)

    print(f"✅ Saved {len(drugs)} DrugBank records")
    print("💊 Drug interactions included ✔")


if __name__ == "__main__":
    main()