import json

INPUT_PATH = "data/raw/drugbank.json"


def main():
    print("🔍 Validating DrugBank dataset...\n")

    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    total = len(data)
    print(f"📊 Total records: {total}")

    missing_text = 0
    missing_id = 0
    interaction_count = 0
    total_text_length = 0

    sample_interactions = []

    for record in data:
        # Check ID
        if not record.get("id"):
            missing_id += 1

        # Check text
        text = record.get("text", "")
        if not text:
            missing_text += 1
        else:
            total_text_length += len(text)

        # Check interactions
        interactions = record.get("metadata", {}).get("interactions", [])
        if interactions:
            interaction_count += 1
            if len(sample_interactions) < 3:
                sample_interactions.append(interactions[:3])

    # ==============================
    # RESULTS
    # ==============================
    print("\n✅ VALIDATION RESULTS")

    print(f"✔ Missing IDs: {missing_id}")
    print(f"✔ Missing Text: {missing_text}")

    avg_length = total_text_length / total if total > 0 else 0
    print(f"✔ Avg text length: {int(avg_length)} characters")

    print(f"✔ Drugs with interactions: {interaction_count}/{total}")
    print(f"✔ Interaction coverage: {round((interaction_count/total)*100, 2)}%")

    print("\n🔬 Sample interactions:")
    for i, sample in enumerate(sample_interactions, 1):
        print(f"{i}. {sample}")


if __name__ == "__main__":
    main()