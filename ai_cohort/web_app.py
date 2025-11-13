#!/usr/bin/env python3
"""
Analytical Agent - Web Interface
Access the agent through your browser at http://localhost:5000
"""

from flask import Flask, render_template, request, jsonify, send_file
from analytical_agent import AnalyticalAgent
import os
import json
from datetime import datetime
from pathlib import Path

app = Flask(__name__)
app.config['SECRET_KEY'] = 'analytical-agent-secret-key'

# Initialize agent
agent = None
query_history = []

def init_agent():
    """Initialize the analytical agent"""
    global agent
    if agent is None:
        try:
            agent = AnalyticalAgent(
                data_dir="./data",
                output_dir="./outputs"
            )
            print("✅ Agent initialized successfully")
        except Exception as e:
            print(f"❌ Error initializing agent: {e}")
            raise

@app.route('/')
def home():
    """Home page with query interface"""
    return render_template('index.html')

@app.route('/architecture')
def architecture():
    """Architecture and dataflow documentation page"""
    return render_template('architecture.html')

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """Handle question submission"""
    global query_history
    
    data = request.get_json()
    question = data.get('question', '').strip()
    
    if not question:
        return jsonify({'error': 'Please enter a question'}), 400
    
    # Generate question ID
    qid = f"web_{int(datetime.now().timestamp())}"
    
    # Ask the agent
    try:
        result = agent.answer_question(question, qid)
        
        # Format response
        response = {
            'success': result['success'],
            'question': question,
            'question_id': qid,
            'execution_time': result['execution_time']
        }
        
        if result['success']:
            response['summary'] = result['answer'].get('summary', 'Analysis complete')
            response['chart_url'] = f"/api/chart/{Path(result['chart_path']).name}" if result.get('chart_path') else None
            response['code'] = result['code']
            
            # Add to history
            query_history.insert(0, {
                'question': question,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'execution_time': result['execution_time'],
                'chart_url': response['chart_url']
            })
            
            # Keep only last 50
            query_history = query_history[:50]
        else:
            response['error'] = result.get('error', 'Unknown error')
            
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predefined')
def get_predefined_questions():
    """Get list of predefined questions"""
    from predefined_questions import PREDEFINED_QUESTIONS
    
    questions = [
        {
            'id': qid,
            'question': q,
            'category': 'CSV Analysis' if i < 8 else 'PDF Analysis'
        }
        for i, (qid, q) in enumerate(PREDEFINED_QUESTIONS)
    ]
    
    return jsonify(questions)

@app.route('/api/history')
def get_history():
    """Get query history"""
    return jsonify(query_history)

@app.route('/api/chart/<filename>')
def serve_chart(filename):
    """Serve generated charts"""
    chart_path = Path('./outputs') / filename
    if chart_path.exists():
        return send_file(chart_path, mimetype='image/png')
    return "Chart not found", 404

@app.route('/api/data-info')
def get_data_info():
    """Get information about loaded data"""
    info = {
        'csv_files': {},
        'pdf_files': []
    }
    
    if agent:
        for name, df in agent.csv_files.items():
            info['csv_files'][name] = {
                'rows': len(df),
                'columns': list(df.columns)
            }
        
        info['pdf_files'] = list(agent.pdf_files.keys())
    
    return jsonify(info)

@app.route('/api/stats')
def get_stats():
    """Get statistics"""
    stats = {
        'total_queries': len(query_history),
        'avg_time': sum(q['execution_time'] for q in query_history) / len(query_history) if query_history else 0,
        'data_loaded': {
            'csv_count': len(agent.csv_files) if agent else 0,
            'pdf_count': len(agent.pdf_files) if agent else 0
        }
    }
    return jsonify(stats)

def create_templates():
    """Create HTML templates"""
    templates_dir = Path('templates')
    templates_dir.mkdir(exist_ok=True)
    
    # Create index.html
    index_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytical Agent - AI-Powered Data Analysis</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        header {
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            text-align: center;
        }
        
        h1 {
            color: #667eea;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 1.1em;
        }
        
        .main-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .panel {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .query-panel h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        
        .question-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 1em;
            margin-bottom: 15px;
            transition: border-color 0.3s;
        }
        
        .question-input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            padding: 12px 30px;
            border: none;
            border-radius: 10px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 100%;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .predefined-questions {
            margin-top: 30px;
        }
        
        .predefined-questions h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .question-chip {
            display: block;
            padding: 10px 15px;
            margin-bottom: 8px;
            background: #f5f5f5;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9em;
            text-align: left;
        }
        
        .question-chip:hover {
            background: #667eea;
            color: white;
            transform: translateX(5px);
        }
        
        .results-panel {
            min-height: 400px;
        }
        
        .results-panel h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        
        .loading {
            text-align: center;
            padding: 50px;
        }
        
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .result-card {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .result-header {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .result-question {
            font-size: 1.2em;
            color: #333;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .result-meta {
            display: flex;
            gap: 20px;
            font-size: 0.9em;
            color: #666;
        }
        
        .badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
        }
        
        .badge-success {
            background: #d4edda;
            color: #155724;
        }
        
        .badge-error {
            background: #f8d7da;
            color: #721c24;
        }
        
        .result-summary {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 1.05em;
            line-height: 1.6;
        }
        
        .result-chart {
            text-align: center;
            margin: 20px 0;
        }
        
        .result-chart img {
            max-width: 100%;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #999;
        }
        
        .empty-state-icon {
            font-size: 4em;
            margin-bottom: 20px;
        }
        
        .stats-bar {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        
        .stat-label {
            color: #666;
            margin-top: 5px;
            font-size: 0.9em;
        }
        
        .code-block {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            line-height: 1.5;
            margin-top: 15px;
        }
        
        .toggle-code {
            background: #667eea;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
            margin-top: 10px;
        }
        
        .toggle-code:hover {
            background: #5568d3;
        }
        
        @media (max-width: 1024px) {
            .main-content {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🤖 Analytical Agent</h1>
            <p class="subtitle">AI-Powered Data Analysis • Ask Questions in Natural Language</p>
        </header>
        
        <div class="stats-bar" id="statsBar">
            <div class="stat-card">
                <div class="stat-value" id="statQueries">0</div>
                <div class="stat-label">Total Queries</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="statAvgTime">0s</div>
                <div class="stat-label">Avg Response Time</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="statDatasets">0</div>
                <div class="stat-label">Datasets Loaded</div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="panel query-panel">
                <h2>📝 Ask a Question</h2>
                <textarea 
                    class="question-input" 
                    id="questionInput" 
                    placeholder="What are the top 5 products by revenue? Show me a bar chart."
                    rows="4"></textarea>
                <button class="btn btn-primary" id="askButton" onclick="askQuestion()">
                    🚀 Ask Question
                </button>
                
                <div class="predefined-questions">
                    <h3>💡 Quick Questions</h3>
                    <div id="predefinedList"></div>
                </div>
            </div>
            
            <div class="panel results-panel">
                <h2>📊 Results</h2>
                <div id="resultsContainer">
                    <div class="empty-state">
                        <div class="empty-state-icon">📈</div>
                        <p>Ask a question to see results here</p>
                        <p style="margin-top: 10px; font-size: 0.9em;">Try: "What are the top products by revenue?"</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let currentResult = null;
        
        // Load predefined questions
        async function loadPredefinedQuestions() {
            try {
                const response = await fetch('/api/predefined');
                const questions = await response.json();
                
                const container = document.getElementById('predefinedList');
                questions.slice(0, 8).forEach(q => {
                    const chip = document.createElement('div');
                    chip.className = 'question-chip';
                    chip.textContent = q.question;
                    chip.onclick = () => {
                        document.getElementById('questionInput').value = q.question;
                    };
                    container.appendChild(chip);
                });
            } catch (error) {
                console.error('Error loading questions:', error);
            }
        }
        
        // Load stats
        async function loadStats() {
            try {
                const response = await fetch('/api/stats');
                const stats = await response.json();
                
                document.getElementById('statQueries').textContent = stats.total_queries;
                document.getElementById('statAvgTime').textContent = stats.avg_time.toFixed(1) + 's';
                document.getElementById('statDatasets').textContent = stats.data_loaded.csv_count + stats.data_loaded.pdf_count;
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }
        
        // Ask question
        async function askQuestion() {
            const question = document.getElementById('questionInput').value.trim();
            if (!question) {
                alert('Please enter a question');
                return;
            }
            
            const button = document.getElementById('askButton');
            const resultsContainer = document.getElementById('resultsContainer');
            
            // Show loading
            button.disabled = true;
            button.textContent = '⏳ Analyzing...';
            resultsContainer.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Generating code and analyzing data...</p>
                    <p style="margin-top: 10px; color: #999; font-size: 0.9em;">This usually takes 10-30 seconds</p>
                </div>
            `;
            
            try {
                const response = await fetch('/api/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question })
                });
                
                const result = await response.json();
                currentResult = result;
                
                // Display result
                displayResult(result);
                
                // Reload stats
                loadStats();
                
            } catch (error) {
                resultsContainer.innerHTML = `
                    <div class="error-message">
                        <strong>❌ Error:</strong> ${error.message}
                    </div>
                `;
            } finally {
                button.disabled = false;
                button.textContent = '🚀 Ask Question';
            }
        }
        
        // Display result
        function displayResult(result) {
            const container = document.getElementById('resultsContainer');
            
            if (result.success) {
                let html = `
                    <div class="result-card">
                        <div class="result-header">
                            <div class="result-question">${result.question}</div>
                            <div class="result-meta">
                                <span class="badge badge-success">✓ Success</span>
                                <span>⏱️ ${result.execution_time.toFixed(2)}s</span>
                            </div>
                        </div>
                        <div class="result-summary">
                            ${result.summary}
                        </div>
                `;
                
                if (result.chart_url) {
                    html += `
                        <div class="result-chart">
                            <img src="${result.chart_url}" alt="Generated Chart">
                        </div>
                    `;
                }
                
                html += `
                        <button class="toggle-code" onclick="toggleCode()">
                            📝 View Generated Code
                        </button>
                        <div class="code-block" id="codeBlock" style="display: none;">
                            <pre>${escapeHtml(result.code)}</pre>
                        </div>
                    </div>
                `;
                
                container.innerHTML = html;
            } else {
                container.innerHTML = `
                    <div class="result-card">
                        <div class="result-header">
                            <div class="result-question">${result.question}</div>
                            <div class="result-meta">
                                <span class="badge badge-error">✗ Error</span>
                            </div>
                        </div>
                        <div class="error-message">
                            <strong>Error:</strong> ${result.error}
                        </div>
                    </div>
                `;
            }
        }
        
        function toggleCode() {
            const codeBlock = document.getElementById('codeBlock');
            codeBlock.style.display = codeBlock.style.display === 'none' ? 'block' : 'none';
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Allow Enter to submit
        document.getElementById('questionInput').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                askQuestion();
            }
        });
        
        // Initialize
        loadPredefinedQuestions();
        loadStats();
        
        // Auto-refresh stats every 30 seconds
        setInterval(loadStats, 30000);
    </script>
</body>
</html>"""
    
    with open(templates_dir / 'index.html', 'w') as f:
        f.write(index_html)

if __name__ == '__main__':
    print("="*80)
    print("🚀 Starting Analytical Agent Web Interface")
    print("="*80)
    
    # Check API key
    if not os.getenv("OPENAI_API_KEY"):
        print("\n❌ ERROR: OPENAI_API_KEY environment variable not set!")
        print("\nPlease run:")
        print("export OPENAI_API_KEY='your-key-here'")
        exit(1)
    
    # Create templates
    print("\n📁 Creating web templates...")
    create_templates()
    
    # Initialize agent
    print("🤖 Initializing agent...")
    init_agent()
    
    print("\n" + "="*80)
    print("✅ Server is ready!")
    print("="*80)
    print("\n🌐 Open your browser and go to:")
    print("\n    👉 http://localhost:5000")
    print("\n" + "="*80)
    print("\nPress Ctrl+C to stop the server")
    print("="*80 + "\n")
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5000, debug=False)

