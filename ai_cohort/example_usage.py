"""
Example usage of the Analytical Agent
Demonstrates different ways to use the agent programmatically
"""

from analytical_agent import AnalyticalAgent
from predefined_questions import PREDEFINED_QUESTIONS
import os

def example_1_basic_question():
    """Example 1: Ask a simple question"""
    print("\n" + "="*80)
    print("Example 1: Basic Question")
    print("="*80 + "\n")
    
    # Initialize agent
    agent = AnalyticalAgent(
        data_dir="./data",
        output_dir="./outputs"
    )
    
    # Ask a question
    result = agent.answer_question(
        "What is the total revenue from all sales?"
    )
    
    # Check results
    if result['success']:
        print(f"✅ Success!")
        print(f"Execution Time: {result['execution_time']:.2f} seconds")
        if 'summary' in result['answer']:
            print(f"Summary: {result['answer']['summary']}")
    else:
        print(f"❌ Failed: {result['error']}")

def example_2_with_visualization():
    """Example 2: Question with visualization"""
    print("\n" + "="*80)
    print("Example 2: Question with Visualization")
    print("="*80 + "\n")
    
    agent = AnalyticalAgent()
    
    result = agent.answer_question(
        "Show me the top 5 products by revenue in a bar chart",
        question_id="example2_top_products"
    )
    
    if result['success']:
        print(f"✅ Success!")
        print(f"Chart saved to: {result['chart_path']}")
        print(f"Time: {result['execution_time']:.2f}s")
        
        # Access the generated data
        if 'data' in result['answer']:
            print(f"\nData type: {type(result['answer']['data'])}")

def example_3_pdf_analysis():
    """Example 3: Analyze PDF document"""
    print("\n" + "="*80)
    print("Example 3: PDF Document Analysis")
    print("="*80 + "\n")
    
    agent = AnalyticalAgent()
    
    result = agent.answer_question(
        "Extract the quarterly revenue figures from the annual report and show them in a line chart",
        question_id="example3_quarterly"
    )
    
    if result['success']:
        print(f"✅ Success!")
        print(f"Summary: {result['answer'].get('summary', 'N/A')}")
        print(f"Chart: {result['chart_path']}")

def example_4_batch_questions():
    """Example 4: Run multiple questions"""
    print("\n" + "="*80)
    print("Example 4: Batch Processing")
    print("="*80 + "\n")
    
    agent = AnalyticalAgent()
    
    questions = [
        ("batch1", "What is the average order value?"),
        ("batch2", "Which region has the highest sales?"),
        ("batch3", "What are the top 3 customer segments by revenue?"),
    ]
    
    results = agent.run_predefined_questions(questions)
    
    print(f"\n✅ Processed {results['successful']} out of {results['total_questions']} questions")
    print(f"Average time: {results['average_time_per_question']:.2f}s")

def example_5_custom_data():
    """Example 5: Working with specific data columns"""
    print("\n" + "="*80)
    print("Example 5: Specific Data Analysis")
    print("="*80 + "\n")
    
    agent = AnalyticalAgent()
    
    # You can also ask about specific columns or relationships
    result = agent.answer_question(
        "Is there a correlation between product price and quantity sold? Show a scatter plot with a trend line.",
        question_id="example5_correlation"
    )
    
    if result['success']:
        print(f"✅ Success!")
        print(f"Insight: {result['answer'].get('summary', 'See chart for details')}")
        print(f"Chart: {result['chart_path']}")

def example_6_time_series():
    """Example 6: Time series analysis"""
    print("\n" + "="*80)
    print("Example 6: Time Series Analysis")
    print("="*80 + "\n")
    
    agent = AnalyticalAgent()
    
    result = agent.answer_question(
        "Show me the daily sales trend for the last quarter of 2023. Include a 7-day moving average.",
        question_id="example6_timeseries"
    )
    
    if result['success']:
        print(f"✅ Success!")
        print(f"Time: {result['execution_time']:.2f}s")

def example_7_error_handling():
    """Example 7: Handle errors gracefully"""
    print("\n" + "="*80)
    print("Example 7: Error Handling")
    print("="*80 + "\n")
    
    agent = AnalyticalAgent()
    
    # Ask a question about non-existent data
    result = agent.answer_question(
        "What is the revenue from product XYZ-999 that doesn't exist?"
    )
    
    if not result['success']:
        print(f"❌ Question failed as expected")
        print(f"Error: {result.get('error', 'Unknown')}")
        print(f"This demonstrates proper error handling")
    else:
        print(f"✅ Agent handled the edge case")

def main():
    """Run all examples"""
    print("\n" + "#"*80)
    print("# Analytical Agent - Example Usage")
    print("#"*80)
    
    # Check if API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("\n❌ Error: OPENAI_API_KEY environment variable not set")
        print("\nPlease set your API key:")
        print("  export OPENAI_API_KEY='your-api-key-here'")
        return
    
    # Check if data exists
    if not os.path.exists("data/sales_transactions.csv"):
        print("\n❌ Error: Sample data not found")
        print("\nPlease generate sample data first:")
        print("  python3 generate_sample_data.py")
        print("  python3 generate_sample_pdf.py")
        return
    
    print("\n🚀 Running examples...")
    print("Note: Each example will make API calls and may take 10-30 seconds")
    
    # Run examples (uncomment the ones you want to try)
    
    # Basic examples
    example_1_basic_question()
    example_2_with_visualization()
    
    # Uncomment to run more examples:
    # example_3_pdf_analysis()
    # example_4_batch_questions()
    # example_5_custom_data()
    # example_6_time_series()
    # example_7_error_handling()
    
    print("\n" + "="*80)
    print("Examples complete! Check the outputs/ directory for generated charts.")
    print("="*80 + "\n")
    
    print("💡 Tips:")
    print("  - Uncomment more examples in this file to try them")
    print("  - Modify questions to explore different analyses")
    print("  - Check the generated code in result['code']")
    print("  - Add your own CSV/PDF files to data/ directory")

if __name__ == "__main__":
    main()

