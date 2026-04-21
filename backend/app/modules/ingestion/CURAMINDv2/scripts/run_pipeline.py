import subprocess
import logging
import sys

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

# The exact chronological order of the pipeline
PIPELINE_SCRIPTS = [
    "01_fetch_pubmed.py",
    "01c_fetch_clinical_trials.py",
    "01b_fetch_drugbank.py",
    "01b_validate_drugbank.py",
    "02_clean_text.py",
    "04_extract_entities.py",
    "03_chunk_text.py",
    "05_filter_chunks.py",
    "06_embed_chunks.py",
    "07_store_metadata.py",
    "push_to_postgress.py" # The new script we are about to write!
]

def run_script(script_name):
    """Runs a python script and halts if it fails."""
    logging.info(f"🚀 Running {script_name}...")
    try:
        # Runs the script and streams the output to your terminal
        subprocess.run([sys.executable, script_name], check=True)
        logging.info(f"✅ {script_name} completed successfully.\n")
    except subprocess.CalledProcessError as e:
        logging.error(f"❌ CRITICAL ERROR: {script_name} failed. Halting pipeline.")
        sys.exit(1)

def main():
    logging.info("Starting Curamind Data Ingestion Pipeline...")
    for script in PIPELINE_SCRIPTS:
        run_script(script)
    logging.info("🎉 Pipeline complete! Database is updated and ready for Queries.")

if __name__ == "__main__":
    main()