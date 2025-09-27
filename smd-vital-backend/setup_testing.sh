#!/bin/bash
# Setup Testing Environment for SMD VITAL
# ======================================

set -e

echo "🚀 Setting up SMD VITAL Testing Environment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
check_python() {
    print_status "Checking Python installation..."
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
        print_success "Python $PYTHON_VERSION found"
    else
        print_error "Python3 not found. Please install Python 3.9 or higher."
        exit 1
    fi
}

# Check if pip is installed
check_pip() {
    print_status "Checking pip installation..."
    if command -v pip3 &> /dev/null; then
        print_success "pip3 found"
    else
        print_error "pip3 not found. Please install pip."
        exit 1
    fi
}

# Install Python dependencies
install_dependencies() {
    print_status "Installing Python dependencies..."
    
    # Upgrade pip
    python3 -m pip install --upgrade pip
    
    # Install test dependencies
    if [ -f "requirements-test.txt" ]; then
        pip3 install -r requirements-test.txt
        print_success "Test dependencies installed"
    else
        print_warning "requirements-test.txt not found"
    fi
    
    # Install main dependencies
    if [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt
        print_success "Main dependencies installed"
    else
        print_warning "requirements.txt not found"
    fi
}

# Setup test database
setup_test_database() {
    print_status "Setting up test database..."
    
    # Create test database directory
    mkdir -p test_data
    
    # Create test database file
    touch test_data/test.db
    print_success "Test database created"
}

# Setup test environment variables
setup_test_env() {
    print_status "Setting up test environment variables..."
    
    cat > .env.test << EOF
# Test Environment Variables
DATABASE_URL=sqlite:///./test_data/test.db
REDIS_URL=redis://localhost:6379/1
JWT_SECRET_KEY=test_secret_key_for_smd_vital_2024
STRIPE_SECRET_KEY=sk_test_1234567890
STRIPE_WEBHOOK_SECRET=whsec_test_1234567890
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USERNAME=test@smdvital.com
SMTP_PASSWORD=test_password
ENVIRONMENT=test
DEBUG=True
LOG_LEVEL=DEBUG
EOF
    
    print_success "Test environment variables configured"
}

# Create test directories
create_test_directories() {
    print_status "Creating test directories..."
    
    mkdir -p tests
    mkdir -p test_results
    mkdir -p test_data
    mkdir -p htmlcov
    mkdir -p logs
    
    print_success "Test directories created"
}

# Setup test configuration
setup_test_config() {
    print_status "Setting up test configuration..."
    
    # Create pytest.ini if it doesn't exist
    if [ ! -f "pytest.ini" ]; then
        print_warning "pytest.ini not found, creating default configuration"
        cat > pytest.ini << EOF
[tool:pytest]
testpaths = tests
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*
addopts = --verbose --tb=short --strict-markers
markers =
    unit: Unit tests
    integration: Integration tests
    load: Load tests
    security: Security tests
    slow: Slow running tests
EOF
    fi
    
    print_success "Test configuration setup complete"
}

# Run initial tests
run_initial_tests() {
    print_status "Running initial tests..."
    
    # Check if test files exist
    if [ -d "tests" ] && [ "$(ls -A tests)" ]; then
        print_status "Running basic test validation..."
        python3 -m pytest tests/ --collect-only -q
        print_success "Test collection successful"
    else
        print_warning "No test files found in tests/ directory"
    fi
}

# Setup pre-commit hooks
setup_pre_commit() {
    print_status "Setting up pre-commit hooks..."
    
    if command -v pre-commit &> /dev/null; then
        pre-commit install
        print_success "Pre-commit hooks installed"
    else
        print_warning "pre-commit not found, skipping hook setup"
    fi
}

# Setup test monitoring
setup_test_monitoring() {
    print_status "Setting up test monitoring..."
    
    # Create test monitoring script
    cat > monitor_tests.py << 'EOF'
#!/usr/bin/env python3
"""
Test Monitoring Script for SMD VITAL
===================================
"""

import time
import psutil
import os
from datetime import datetime

def monitor_tests():
    """Monitor test execution."""
    process = psutil.Process(os.getpid())
    
    print(f"Monitoring tests at {datetime.now()}")
    print(f"Memory usage: {process.memory_info().rss / 1024 / 1024:.2f} MB")
    print(f"CPU usage: {process.cpu_percent():.2f}%")
    
    # Monitor for 60 seconds
    for i in range(60):
        time.sleep(1)
        memory = process.memory_info().rss / 1024 / 1024
        cpu = process.cpu_percent()
        print(f"Second {i+1}: Memory: {memory:.2f} MB, CPU: {cpu:.2f}%")

if __name__ == "__main__":
    monitor_tests()
EOF
    
    chmod +x monitor_tests.py
    print_success "Test monitoring script created"
}

# Main setup function
main() {
    print_status "Starting SMD VITAL testing setup..."
    
    # Check prerequisites
    check_python
    check_pip
    
    # Setup environment
    create_test_directories
    setup_test_database
    setup_test_env
    setup_test_config
    
    # Install dependencies
    install_dependencies
    
    # Setup additional tools
    setup_pre_commit
    setup_test_monitoring
    
    # Run initial tests
    run_initial_tests
    
    print_success "SMD VITAL testing environment setup complete!"
    print_status "You can now run tests using:"
    echo "  python3 run_tests.py --unit"
    echo "  python3 run_tests.py --integration"
    echo "  python3 run_tests.py --performance"
    echo "  python3 run_tests.py --security"
    echo "  python3 run_tests.py --all"
}

# Run main function
main "$@"
