# Use Python 3.12-slim as the base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (Hugging Face Spaces uses 7860 by default)
EXPOSE 7860

# Script to build vector DBs and start the server
RUN echo '#!/bin/bash\n\
    echo "Building Vector Databases..."\n\
    python -m module_a.process_documents\n\
    python -m module_a.build_vector_db\n\
    python -m module_c.indexer\n\
    echo "Starting FastAPI server on port ${PORT:-7860}..."\n\
    uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-7860}\n\
    ' > /app/start.sh && chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]
