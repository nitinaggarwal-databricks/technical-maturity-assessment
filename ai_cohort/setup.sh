#!/bin/bash

echo "=================================================="
echo "Analytical Agent Setup"
echo "=================================================="
echo ""

# Check Python version
echo "Checking Python version..."
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Error: Python 3 is required"
    exit 1
fi
echo "✓ Python is installed"
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY environment variable not set"
    echo ""
    echo "Please set your OpenAI API key:"
    echo "  export OPENAI_API_KEY='your-api-key-here'"
    echo ""
    echo "Or add it to your shell profile (~/.bashrc or ~/.zshrc):"
    echo "  echo 'export OPENAI_API_KEY=\"your-key\"' >> ~/.zshrc"
    echo "  source ~/.zshrc"
    echo ""
else
    echo "✓ OPENAI_API_KEY is set"
    echo ""
fi

# Generate sample data
echo "Generating sample data..."
python3 generate_sample_data.py
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to generate CSV data"
    exit 1
fi
echo ""

echo "Generating sample PDF..."
python3 generate_sample_pdf.py
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to generate PDF"
    exit 1
fi
echo ""

# Create outputs directory
mkdir -p outputs
echo "✓ Created outputs directory"
echo ""

echo "=================================================="
echo "Setup Complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Set your OpenAI API key (if not already set):"
echo "   export OPENAI_API_KEY='your-key'"
echo ""
echo "2. Run the predefined questions:"
echo "   python3 analytical_agent.py --predefined"
echo ""
echo "3. Or ask a custom question:"
echo "   python3 analytical_agent.py 'What are the top products?'"
echo ""

