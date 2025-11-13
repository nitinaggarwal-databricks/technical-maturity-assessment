#!/usr/bin/env python3
"""
Interactive Demo - Analytical Agent
Shows you what questions you can ask and runs them for you
"""

import os
import sys
from analytical_agent import AnalyticalAgent

def print_header():
    print("\n" + "="*80)
    print("🤖 ANALYTICAL AGENT - INTERACTIVE DEMO")
    print("="*80 + "\n")

def print_menu():
    print("\n📊 AVAILABLE DEMONSTRATIONS:\n")
    print("1. 💰 Total Revenue Analysis")
    print("2. 📈 Top 5 Products by Revenue (Bar Chart)")
    print("3. 📅 Monthly Sales Trend (Line Chart)")
    print("4. 🥧 Revenue by Customer Segment (Pie Chart)")
    print("5. 🌍 Regional Sales Comparison (Bar Chart)")
    print("6. 👥 Top 10 Customers (Bar Chart)")
    print("7. 📊 Product Category Performance")
    print("8. 🔄 Price vs Quantity Correlation (Scatter Plot)")
    print("9. 📄 PDF: Extract Financial Metrics")
    print("10. 🚀 Run ALL Pre-defined Questions")
    print("11. ✍️  Ask Your Own Custom Question")
    print("12. 📁 View Generated Charts")
    print("0. ❌ Exit")
    print()

def run_question(agent, question, qid):
    """Run a single question"""
    print(f"\n{'='*80}")
    print(f"RUNNING: {question}")
    print(f"{'='*80}\n")
    
    result = agent.answer_question(question, qid)
    
    if result['success']:
        print(f"\n✅ SUCCESS! Completed in {result['execution_time']:.2f} seconds")
        if 'summary' in result.get('answer', {}):
            print(f"📊 {result['answer']['summary']}")
        if result.get('chart_path'):
            print(f"📈 Chart saved: {result['chart_path']}")
            print(f"\n💡 To view: open {result['chart_path']}")
    else:
        print(f"\n❌ Error: {result.get('error', 'Unknown error')}")
    
    input("\nPress Enter to continue...")

def view_charts():
    """Show generated charts"""
    output_dir = "./outputs"
    if not os.path.exists(output_dir):
        print("❌ No charts generated yet!")
        return
    
    charts = [f for f in os.listdir(output_dir) if f.endswith('.png')]
    
    if not charts:
        print("❌ No charts found in outputs/")
        return
    
    print(f"\n📁 Found {len(charts)} chart(s):\n")
    for i, chart in enumerate(charts, 1):
        chart_path = os.path.join(output_dir, chart)
        size = os.path.getsize(chart_path) / 1024  # KB
        print(f"{i}. {chart} ({size:.1f} KB)")
    
    print(f"\n💡 To view charts:")
    print(f"   macOS: open {output_dir}/*.png")
    print(f"   Linux: xdg-open {output_dir}/*.png")
    print(f"   Or manually open files in: {os.path.abspath(output_dir)}/")
    
    input("\nPress Enter to continue...")

def main():
    """Main interactive demo"""
    
    # Check API key
    if not os.getenv("OPENAI_API_KEY"):
        print("\n❌ ERROR: OPENAI_API_KEY not set!")
        print("\nPlease run:")
        print("export OPENAI_API_KEY='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'")
        sys.exit(1)
    
    print_header()
    
    # Initialize agent
    print("🔄 Initializing agent...")
    try:
        agent = AnalyticalAgent()
        print("✅ Agent ready!\n")
    except Exception as e:
        print(f"❌ Error initializing agent: {e}")
        sys.exit(1)
    
    # Show data summary
    print("📊 DATA LOADED:")
    print(f"   • {len(agent.csv_files)} CSV files")
    print(f"   • {len(agent.pdf_files)} PDF files")
    if agent.csv_files:
        for name, df in agent.csv_files.items():
            print(f"     - {name}: {len(df)} rows")
    
    # Interactive loop
    while True:
        print_menu()
        choice = input("Select option (0-12): ").strip()
        
        if choice == "0":
            print("\n👋 Thanks for using the Analytical Agent!")
            print(f"📁 Your charts are in: {os.path.abspath('./outputs')}/\n")
            break
        
        elif choice == "1":
            run_question(agent, "What is the total revenue from all sales transactions?", "demo_revenue")
        
        elif choice == "2":
            run_question(agent, "What are the top 5 products by total revenue? Show me a bar chart.", "demo_top5")
        
        elif choice == "3":
            run_question(agent, "Show me the monthly sales trend for 2023. Create a line chart.", "demo_trend")
        
        elif choice == "4":
            run_question(agent, "Which customer segment generates the most revenue? Show a pie chart.", "demo_segment")
        
        elif choice == "5":
            run_question(agent, "Compare sales performance across different regions. Show me a bar chart.", "demo_regions")
        
        elif choice == "6":
            run_question(agent, "Who are the top 10 customers by total purchase amount? Display in a bar chart.", "demo_customers")
        
        elif choice == "7":
            run_question(agent, "Which product categories have the highest average order value? Create a horizontal bar chart.", "demo_categories")
        
        elif choice == "8":
            run_question(agent, "Is there a correlation between product price and quantity sold? Show a scatter plot.", "demo_correlation")
        
        elif choice == "9":
            run_question(agent, "What are the key financial metrics mentioned in the annual report? Summarize the quarterly revenue.", "demo_pdf")
        
        elif choice == "10":
            print("\n🚀 Running ALL 10 pre-defined questions...")
            print("⏱️  This will take 2-5 minutes...\n")
            confirm = input("Continue? (y/n): ").strip().lower()
            if confirm == 'y':
                from predefined_questions import PREDEFINED_QUESTIONS
                agent.run_predefined_questions(PREDEFINED_QUESTIONS)
                input("\nPress Enter to continue...")
        
        elif choice == "11":
            print("\n✍️  CUSTOM QUESTION")
            print("Examples:")
            print("  - What is the average order value?")
            print("  - Which products are selling best in the West region?")
            print("  - Show me sales by month for Electronics category")
            question = input("\nYour question: ").strip()
            if question:
                run_question(agent, question, "demo_custom")
        
        elif choice == "12":
            view_charts()
        
        else:
            print("\n❌ Invalid option. Please select 0-12.")
            input("Press Enter to continue...")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Exiting... Goodbye!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

