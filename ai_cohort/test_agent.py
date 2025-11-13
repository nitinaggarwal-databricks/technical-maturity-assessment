"""
Test script for the Analytical Agent
Run quick tests to verify the agent is working correctly
"""

import os
import sys
from analytical_agent import AnalyticalAgent

def test_initialization():
    """Test agent initialization"""
    print("Test 1: Agent Initialization")
    try:
        if not os.getenv("OPENAI_API_KEY"):
            print("⚠️  Skipped: OPENAI_API_KEY not set")
            return False
        
        agent = AnalyticalAgent()
        print("✓ Agent initialized successfully")
        return True
    except Exception as e:
        print(f"✗ Failed: {e}")
        return False

def test_data_loading():
    """Test data loading"""
    print("\nTest 2: Data Loading")
    try:
        agent = AnalyticalAgent()
        
        if not agent.csv_files:
            print("✗ No CSV files loaded")
            return False
        
        if not agent.pdf_content:
            print("✗ No PDF files loaded")
            return False
        
        print(f"✓ Loaded {len(agent.csv_files)} CSV files")
        print(f"✓ Loaded {len(agent.pdf_content)} PDF files")
        return True
    except Exception as e:
        print(f"✗ Failed: {e}")
        return False

def test_simple_question():
    """Test a simple question"""
    print("\nTest 3: Simple Question")
    
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  Skipped: OPENAI_API_KEY not set")
        return False
    
    try:
        agent = AnalyticalAgent()
        
        print("Asking: 'What is the total revenue in the sales data?'")
        result = agent.answer_question(
            "What is the total revenue in the sales data? Show it as a number.",
            question_id="test_simple"
        )
        
        if result['success']:
            print(f"✓ Question answered in {result['execution_time']:.2f}s")
            if result['execution_time'] > 60:
                print("⚠️  Warning: Exceeded 60 second target")
            return True
        else:
            print(f"✗ Failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"✗ Failed: {e}")
        return False

def test_visualization():
    """Test visualization generation"""
    print("\nTest 4: Visualization Generation")
    
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  Skipped: OPENAI_API_KEY not set")
        return False
    
    try:
        agent = AnalyticalAgent()
        
        print("Asking: 'Show top 3 products by revenue in a bar chart'")
        result = agent.answer_question(
            "Show the top 3 products by revenue in a bar chart",
            question_id="test_viz"
        )
        
        if result['success'] and result['chart_path']:
            print(f"✓ Chart generated: {result['chart_path']}")
            print(f"✓ Completed in {result['execution_time']:.2f}s")
            return True
        elif result['success']:
            print("⚠️  Question answered but no chart generated")
            return False
        else:
            print(f"✗ Failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"✗ Failed: {e}")
        return False

def main():
    """Run all tests"""
    print("="*60)
    print("Analytical Agent - Test Suite")
    print("="*60)
    
    # Check prerequisites
    if not os.path.exists("data"):
        print("\n❌ Error: data/ directory not found")
        print("Run: python generate_sample_data.py")
        sys.exit(1)
    
    if not os.path.exists("data/sales_transactions.csv"):
        print("\n❌ Error: Sample data not found")
        print("Run: python generate_sample_data.py")
        sys.exit(1)
    
    if not os.path.exists("data/annual_report_2023.pdf"):
        print("\n❌ Error: Sample PDF not found")
        print("Run: python generate_sample_pdf.py")
        sys.exit(1)
    
    # Run tests
    tests = [
        test_initialization,
        test_data_loading,
        test_simple_question,
        test_visualization,
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    passed = sum(1 for r in results if r)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("\n✅ All tests passed!")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed} test(s) failed or skipped")
        sys.exit(1)

if __name__ == "__main__":
    main()

