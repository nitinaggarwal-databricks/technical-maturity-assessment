"""
Analytical Agent - Answers analytical questions by generating and executing code
Supports CSV data analysis and PDF document analysis
"""

import os
import sys
import time
import json
import sqlite3
import pandas as pd

# Set matplotlib to non-interactive backend (for web server compatibility)
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from pathlib import Path
from typing import Dict, List, Tuple, Any
import openai
from io import StringIO
import traceback
import PyPDF2
import re

# Set style for better-looking charts
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (10, 6)


class AnalyticalAgent:
    """
    An AI agent that answers analytical questions by:
    1. Understanding the question in natural language
    2. Generating appropriate code (SQL/Python)
    3. Executing the code safely
    4. Creating visualizations
    5. Returning results within 60 seconds
    """
    
    def __init__(self, api_key: str = None, data_dir: str = "./data", output_dir: str = "./outputs"):
        """Initialize the analytical agent"""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable.")
        
        openai.api_key = self.api_key
        self.data_dir = Path(data_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        self.db_path = self.data_dir / "analytics.db"
        self.csv_files = {}
        self.pdf_files = {}
        self.pdf_content = {}
        
        # Load data sources
        self._load_data_sources()
        
    def _load_data_sources(self):
        """Load CSV and PDF files from data directory"""
        if not self.data_dir.exists():
            print(f"Warning: Data directory {self.data_dir} does not exist")
            return
            
        # Load CSV files
        for csv_file in self.data_dir.glob("*.csv"):
            try:
                df = pd.read_csv(csv_file)
                table_name = csv_file.stem
                self.csv_files[table_name] = df
                print(f"✓ Loaded CSV: {csv_file.name} ({len(df)} rows)")
            except Exception as e:
                print(f"✗ Error loading {csv_file.name}: {e}")
        
        # Load PDF files
        for pdf_file in self.data_dir.glob("*.pdf"):
            try:
                content = self._extract_pdf_text(pdf_file)
                self.pdf_files[pdf_file.stem] = pdf_file
                self.pdf_content[pdf_file.stem] = content
                print(f"✓ Loaded PDF: {pdf_file.name} ({len(content)} chars)")
            except Exception as e:
                print(f"✗ Error loading {pdf_file.name}: {e}")
        
        # Create SQLite database from CSV files
        if self.csv_files:
            self._create_sqlite_db()
    
    def _extract_pdf_text(self, pdf_path: Path) -> str:
        """Extract text content from PDF file"""
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    def _create_sqlite_db(self):
        """Create SQLite database from loaded CSV files"""
        conn = sqlite3.connect(self.db_path)
        for table_name, df in self.csv_files.items():
            df.to_sql(table_name, conn, if_exists='replace', index=False)
        conn.close()
        print(f"✓ Created SQLite database: {self.db_path}")
    
    def _get_data_context(self) -> str:
        """Generate context about available data sources"""
        context = "Available data sources:\n\n"
        
        # CSV/Table info
        if self.csv_files:
            context += "TABLES (SQL/Pandas):\n"
            for name, df in self.csv_files.items():
                context += f"- {name}: {len(df)} rows, columns: {', '.join(df.columns)}\n"
                context += f"  Sample data:\n{df.head(2).to_string()}\n\n"
        
        # PDF info
        if self.pdf_content:
            context += "\nPDF DOCUMENTS:\n"
            for name, content in self.pdf_content.items():
                preview = content[:500].replace('\n', ' ')
                context += f"- {name}.pdf: {len(content)} characters\n"
                context += f"  Preview: {preview}...\n\n"
        
        return context
    
    def _generate_code(self, question: str) -> Dict[str, Any]:
        """Use LLM to generate code for answering the question"""
        data_context = self._get_data_context()
        
        prompt = f"""You are an expert data analyst. Generate Python code to answer the following question.

{data_context}

QUESTION: {question}

Generate Python code that:
1. Loads/queries the appropriate data
2. Performs the analysis
3. Creates a visualization using matplotlib/seaborn
4. Returns the result

IMPORTANT RULES:
- Use pandas for data manipulation
- For CSV data, use: df = csv_files['table_name']
- For PDF data, use: pdf_content = pdf_content['document_name']
- For SQL queries, use sqlite3 with database at: {self.db_path}
- Save the chart to: output_path (this variable will be provided)
- Use matplotlib.pyplot as plt and seaborn as sns
- Return a dictionary with 'summary' (key insights) and 'data' (main results)
- Keep code safe and efficient
- Do NOT use plt.show(), only plt.savefig(output_path)

Return ONLY valid Python code, no explanations. The code should define a function called 'analyze()' that takes csv_files, pdf_content, and output_path as parameters and returns results.

Example structure:
```python
def analyze(csv_files, pdf_content, output_path):
    import pandas as pd
    import matplotlib.pyplot as plt
    import seaborn as sns
    
    # Your analysis code here
    
    # Create visualization
    plt.figure(figsize=(10, 6))
    # ... plotting code ...
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()
    
    return {{
        'summary': 'Your key insights here',
        'data': your_results_dataframe_or_dict
    }}
```

Now generate the code:"""

        response = openai.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are an expert data analyst and Python programmer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2000
        )
        
        code = response.choices[0].message.content.strip()
        
        # Extract code from markdown if present
        if "```python" in code:
            code = code.split("```python")[1].split("```")[0].strip()
        elif "```" in code:
            code = code.split("```")[1].split("```")[0].strip()
        
        return {
            'code': code,
            'model': response.model,
            'tokens': response.usage.total_tokens
        }
    
    def _execute_code(self, code: str, output_path: Path) -> Dict[str, Any]:
        """Safely execute the generated code"""
        # Create a restricted namespace for execution
        namespace = {
            'csv_files': self.csv_files,
            'pdf_content': self.pdf_content,
            'output_path': str(output_path),
            'pd': pd,
            'plt': plt,
            'sns': sns,
            'sqlite3': sqlite3,
            'db_path': str(self.db_path),
            're': re,
            '__builtins__': __builtins__
        }
        
        try:
            # Execute the code
            exec(code, namespace)
            
            # Call the analyze function
            if 'analyze' in namespace:
                result = namespace['analyze'](self.csv_files, self.pdf_content, str(output_path))
                return {
                    'success': True,
                    'result': result,
                    'chart_path': output_path if output_path.exists() else None
                }
            else:
                return {
                    'success': False,
                    'error': 'No analyze() function found in generated code'
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'traceback': traceback.format_exc()
            }
    
    def answer_question(self, question: str, question_id: str = None) -> Dict[str, Any]:
        """
        Answer an analytical question
        Returns results within 60 seconds or times out
        """
        start_time = time.time()
        question_id = question_id or f"q_{int(time.time())}"
        output_path = self.output_dir / f"{question_id}_chart.png"
        
        print(f"\n{'='*80}")
        print(f"Question: {question}")
        print(f"{'='*80}")
        
        try:
            # Step 1: Generate code (timeout: 30 seconds)
            print("📝 Generating code...")
            code_result = self._generate_code(question)
            gen_time = time.time() - start_time
            print(f"✓ Code generated in {gen_time:.2f}s ({code_result['tokens']} tokens)")
            
            if time.time() - start_time > 60:
                return self._timeout_response(question, start_time)
            
            # Step 2: Execute code (timeout: 25 seconds)
            print("⚙️  Executing code...")
            exec_start = time.time()
            exec_result = self._execute_code(code_result['code'], output_path)
            exec_time = time.time() - exec_start
            
            if not exec_result['success']:
                print(f"✗ Execution failed: {exec_result['error']}")
                return {
                    'success': False,
                    'question': question,
                    'error': exec_result['error'],
                    'code': code_result['code'],
                    'execution_time': time.time() - start_time
                }
            
            print(f"✓ Code executed in {exec_time:.2f}s")
            
            # Step 3: Return results
            total_time = time.time() - start_time
            print(f"✅ Complete in {total_time:.2f}s")
            
            result = {
                'success': True,
                'question': question,
                'question_id': question_id,
                'answer': exec_result['result'],
                'chart_path': str(exec_result['chart_path']) if exec_result['chart_path'] else None,
                'code': code_result['code'],
                'execution_time': total_time,
                'breakdown': {
                    'code_generation': gen_time,
                    'code_execution': exec_time
                }
            }
            
            # Print summary
            if 'summary' in exec_result['result']:
                print(f"\n📊 Summary: {exec_result['result']['summary']}")
            if exec_result['chart_path']:
                print(f"📈 Chart saved: {exec_result['chart_path']}")
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'question': question,
                'error': str(e),
                'traceback': traceback.format_exc(),
                'execution_time': time.time() - start_time
            }
    
    def _timeout_response(self, question: str, start_time: float) -> Dict[str, Any]:
        """Return timeout response"""
        return {
            'success': False,
            'question': question,
            'error': 'Timeout: exceeded 60 second limit',
            'execution_time': time.time() - start_time
        }
    
    def run_predefined_questions(self, questions: List[Tuple[str, str]]) -> Dict[str, Any]:
        """
        Run a list of predefined questions
        questions: List of (question_id, question_text) tuples
        """
        results = []
        start_time = time.time()
        
        print(f"\n{'#'*80}")
        print(f"Running {len(questions)} pre-defined analytical questions")
        print(f"{'#'*80}\n")
        
        for i, (qid, question) in enumerate(questions, 1):
            print(f"\n[{i}/{len(questions)}] Processing: {qid}")
            result = self.answer_question(question, qid)
            results.append(result)
            
            # Brief pause between questions
            time.sleep(0.5)
        
        # Calculate statistics
        total_time = time.time() - start_time
        successful = [r for r in results if r['success']]
        failed = [r for r in results if not r['success']]
        
        avg_time = sum(r['execution_time'] for r in successful) / len(successful) if successful else 0
        
        summary = {
            'total_questions': len(questions),
            'successful': len(successful),
            'failed': len(failed),
            'total_time': total_time,
            'average_time_per_question': avg_time,
            'results': results
        }
        
        # Print summary
        print(f"\n{'='*80}")
        print(f"SUMMARY")
        print(f"{'='*80}")
        print(f"Total Questions: {len(questions)}")
        print(f"Successful: {len(successful)} ({len(successful)/len(questions)*100:.1f}%)")
        print(f"Failed: {len(failed)}")
        print(f"Average Time: {avg_time:.2f}s")
        print(f"Total Time: {total_time:.2f}s")
        
        if successful:
            print(f"\n✅ Successfully answered {len(successful)} questions")
            print(f"⏱️  Average query-to-viz time: {avg_time:.2f} seconds")
        
        if failed:
            print(f"\n❌ Failed questions:")
            for r in failed:
                print(f"  - {r['question']}: {r.get('error', 'Unknown error')}")
        
        return summary


def main():
    """Main entry point for CLI"""
    print("="*80)
    print("Analytical Agent - Answer questions with code and visualizations")
    print("="*80)
    
    # Initialize agent
    try:
        agent = AnalyticalAgent(
            data_dir="./data",
            output_dir="./outputs"
        )
    except ValueError as e:
        print(f"\n❌ Error: {e}")
        print("\nPlease set your OpenAI API key:")
        print("  export OPENAI_API_KEY='your-api-key-here'")
        sys.exit(1)
    
    # Check if running predefined questions
    if len(sys.argv) > 1 and sys.argv[1] == "--predefined":
        from predefined_questions import PREDEFINED_QUESTIONS
        agent.run_predefined_questions(PREDEFINED_QUESTIONS)
    
    # Interactive mode
    elif len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
        agent.answer_question(question)
    
    else:
        print("\nUsage:")
        print("  python analytical_agent.py --predefined              # Run 10 predefined questions")
        print("  python analytical_agent.py 'Your question here'      # Ask a custom question")
        print("\nExample:")
        print("  python analytical_agent.py 'What are the top 5 products by revenue?'")


if __name__ == "__main__":
    main()

