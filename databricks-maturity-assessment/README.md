# Databricks Maturity Assessment

A comprehensive web application that evaluates an organization's Databricks maturity across multiple dimensions and provides personalized recommendations for improvement.

## Features

- **Multi-Perspective Assessment**: Each question evaluates current state, future state vision, technical pain points, and business pain points
- **Horizontal Question Layout**: All perspectives for each question are displayed in a single horizontal line for easy comparison
- **Interactive UI**: Modern, responsive design with smooth animations and user-friendly interface
- **Comprehensive Scoring**: Advanced scoring algorithm that considers multiple dimensions
- **Personalized Recommendations**: Tailored action plans based on assessment results
- **Visual Reports**: Charts and graphs showing maturity levels across different areas
- **Export Capabilities**: PDF and email export functionality (coming soon)

## Assessment Areas

1. **Data Infrastructure & Storage**
   - Data storage architecture evaluation
   - Data processing and ETL capabilities

2. **Analytics & Machine Learning**
   - Analytics capabilities assessment
   - ML operations maturity

3. **Data Governance & Security**
   - Data governance framework evaluation
   - Security and compliance assessment

4. **Organizational Readiness**
   - Business alignment and strategy
   - Change management readiness

## Technology Stack

### Backend
- **Node.js** with Express.js
- **In-memory storage** (can be easily extended to use databases)
- **RESTful API** architecture
- **Comprehensive recommendation engine**

### Frontend
- **React 18** with modern hooks
- **Styled Components** for styling
- **Framer Motion** for animations
- **Chart.js** with React Chart.js 2 for data visualization
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd databricks-maturity-assessment
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the application**
   ```bash
   # Start both server and client (recommended for development)
   npm run dev
   
   # Or start them separately:
   # Terminal 1 - Start the server
   npm run server
   
   # Terminal 2 - Start the client
   npm run client
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## API Endpoints

### Assessment Management
- `GET /api/assessment/framework` - Get assessment framework
- `POST /api/assessment/start` - Start new assessment
- `GET /api/assessment/:id/status` - Get assessment status
- `GET /api/assessment/:id/category/:categoryId` - Get questions for area
- `POST /api/assessment/:id/category/:categoryId/submit` - Submit responses
- `GET /api/assessment/:id/results` - Get assessment results

### Utility
- `GET /api/health` - Health check
- `GET /api/assessments` - Get all assessments (admin)

## Assessment Structure

Each question in the assessment follows this structure:

```javascript
{
  id: 'unique_question_id',
  topic: 'Question Topic',
  question: 'Main question text',
  perspectives: [
    {
      id: 'current_state',
      label: 'Current State',
      type: 'single_choice',
      options: [...]
    },
    {
      id: 'future_state', 
      label: 'Future State Vision',
      type: 'single_choice',
      options: [...]
    },
    {
      id: 'technical_pain',
      label: 'Technical Pain Points',
      type: 'multiple_choice',
      options: [...]
    },
    {
      id: 'business_pain',
      label: 'Business Pain Points', 
      type: 'multiple_choice',
      options: [...]
    }
  ],
  commentBox: {
    label: 'Additional Comments',
    placeholder: 'Share any specific context...'
  }
}
```

## Scoring Algorithm

The assessment uses a sophisticated scoring system:

1. **Individual Perspective Scoring**: Each perspective is scored based on selected options
2. **Question-Level Aggregation**: Combines scores from all perspectives 
3. **Area-Level Scoring**: Averages scores across all questions in an area
4. **Overall Maturity Score**: Weighted average across all areas

## Maturity Levels

- **Level 1 - Initial**: Ad-hoc processes, limited data capabilities
- **Level 2 - Developing**: Basic data infrastructure with some governance
- **Level 3 - Defined**: Structured approach with established processes
- **Level 4 - Managed**: Advanced capabilities with strong governance
- **Level 5 - Optimized**: Industry-leading, AI-driven data organization

## Recommendation Engine

The system provides:

- **Priority Recommendations**: Critical, high, medium, and low priority actions
- **Quick Wins**: Low-effort, high-impact improvements
- **Risk Areas**: Critical areas requiring immediate attention
- **Implementation Roadmap**: Phased approach with timelines
- **Detailed Action Plans**: Specific steps for each recommendation

## Development

### Project Structure
```
databricks-maturity-assessment/
├── server/
│   ├── index.js                 # Main server file
│   ├── data/
│   │   └── assessmentFramework.js
│   └── services/
│       └── recommendationEngine.js
├── client/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API services
│   │   └── App.js              # Main app component
│   └── public/
├── package.json                 # Root package.json
└── README.md
```

### Available Scripts

- `npm run dev` - Start both server and client in development mode
- `npm run server` - Start only the server
- `npm run client` - Start only the client
- `npm run build` - Build the client for production
- `npm start` - Start the server in production mode

### Adding New Questions

1. Edit `server/data/assessmentFramework.js`
2. Add questions to the appropriate assessment area
3. Follow the established structure with all four perspectives
4. Update recommendation logic if needed

### Customizing Recommendations

1. Edit `server/services/recommendationEngine.js`
2. Modify scoring logic, recommendation categories, or action plans
3. Update maturity level definitions as needed

## Future Enhancements

- [ ] Database integration (PostgreSQL, MongoDB)
- [ ] PDF export functionality
- [ ] Email integration for results sharing
- [ ] Advanced analytics and benchmarking
- [ ] Multi-language support
- [ ] Admin dashboard for managing assessments
- [ ] Integration with Databricks APIs
- [ ] Automated follow-up assessments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please contact the development team or create an issue in the repository.
