#!/bin/bash

# Start the backend service
echo "Starting SMD VITAL Backend..."

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install -r requirements.txt

# Run database migrations (if needed)
echo "Running database migrations..."
# Add your migration commands here

# Start the application
echo "Starting FastAPI server..."
python -m uvicorn services.auth.main:app --host 0.0.0.0 --port $PORT
