#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Build Vector Databases
echo "Building Law Explanation Vector DB..."
python -m module_a.process_documents
python -m module_a.build_vector_db

echo "Building Letter Generation Vector DB..."
python -m module_c.indexer

echo "Build complete!"
