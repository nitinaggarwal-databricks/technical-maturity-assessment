import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header';
import HomePage from './components/HomePageNew';
import LandingPage from './components/LandingPage';
import AssessmentStart from './components/AssessmentStart';
import AssessmentQuestion from './components/AssessmentQuestion';
import AssessmentResults from './components/AssessmentResults';
import ExecutiveSummary from './components/ExecutiveSummaryNew';
import PillarResults from './components/PillarResults';
import AssessmentManagement from './components/AssessmentsListNew';
import AssessmentDashboard from './components/AssessmentDashboard';
import LoadingSpinner from './components/LoadingSpinner';

// Services
import * as assessmentService from './services/assessmentService';

function App() {
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [assessmentFramework, setAssessmentFramework] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessmentFramework();
    loadCurrentSession();
  }, []);

  // Load current session from localStorage
  const loadCurrentSession = () => {
    try {
      const savedAssessment = localStorage.getItem('currentAssessment');
      if (savedAssessment) {
        const assessment = JSON.parse(savedAssessment);
        setCurrentAssessment(assessment);
      }
    } catch (error) {
      console.error('Error loading current session:', error);
      localStorage.removeItem('currentAssessment');
    }
  };

  // Save current session to localStorage
  const saveCurrentSession = (assessment) => {
    try {
      if (assessment) {
        localStorage.setItem('currentAssessment', JSON.stringify(assessment));
      } else {
        localStorage.removeItem('currentAssessment');
      }
    } catch (error) {
      console.error('Error saving current session:', error);
    }
  };

  // Load current assessment when URL changes
  useEffect(() => {
    const loadCurrentAssessment = async () => {
      const path = window.location.pathname;
      const assessmentMatch = path.match(/\/assessment\/([^\/]+)/);
      
      if (assessmentMatch) {
        const assessmentId = assessmentMatch[1];
        try {
          const assessment = await assessmentService.getAssessmentStatus(assessmentId);
          if (assessment) {
            // Calculate progress
            const totalQuestions = assessmentFramework?.assessmentAreas?.reduce((total, area) => {
              return total + (area.dimensions?.reduce((dimTotal, dim) => {
                return dimTotal + (dim.questions?.length || 0);
              }, 0) || 0);
            }, 0) || 0;
            
            // Count unique questions (not perspectives)
            const questionIds = new Set();
            Object.keys(assessment.responses || {}).forEach(key => {
              if (key.includes('_comment') || key.includes('_skipped')) return;
              
              // Remove perspective suffixes to get question ID
              let questionId = key;
              const perspectiveSuffixes = ['_current_state', '_future_state', '_technical_pain', '_business_pain'];
              for (const suffix of perspectiveSuffixes) {
                if (key.endsWith(suffix)) {
                  questionId = key.substring(0, key.length - suffix.length);
                  break;
                }
              }
              questionIds.add(questionId);
            });
            const answeredQuestions = questionIds.size;
            
            const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
            
            setCurrentAssessment({
              ...assessment,
              progress
            });
          }
        } catch (error) {
          console.error('Error loading current assessment:', error);
        }
      } else {
        setCurrentAssessment(null);
      }
    };

    if (assessmentFramework) {
      loadCurrentAssessment();
    }
  }, [window.location.pathname, assessmentFramework]);

  const loadAssessmentFramework = async () => {
    try {
      setLoading(true);
      const framework = await assessmentService.getAssessmentFramework();
      setAssessmentFramework(framework);
    } catch (error) {
      console.error('Error loading assessment framework:', error);
      toast.error('Failed to load assessment framework');
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async (organizationInfo) => {
    try {
      const assessment = await assessmentService.startAssessment(organizationInfo);
      setCurrentAssessment(assessment);
      saveCurrentSession(assessment);
      toast.success('Assessment started successfully!');
      return assessment;
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('Failed to start assessment');
      throw error;
    }
  };

  const handleLogout = () => {
    setCurrentAssessment(null);
    saveCurrentSession(null);
    toast.success('Logged out successfully');
  };

  const updateAssessmentStatus = async (assessmentId) => {
    try {
      const status = await assessmentService.getAssessmentStatus(assessmentId);
      setCurrentAssessment(prev => ({ ...prev, ...status }));
      return status;
    } catch (error) {
      console.error('Error updating assessment status:', error);
      toast.error('Failed to update assessment status');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="App">
        <Header />
        <LoadingSpinner message="Loading assessment framework..." />
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header currentAssessment={currentAssessment} />
        
        <Routes>
          <Route 
            path="/" 
            element={
              currentAssessment ? (
                <AssessmentDashboard 
                  currentAssessment={currentAssessment}
                  framework={assessmentFramework}
                  onLogout={handleLogout}
                />
              ) : (
                <HomePage />
              )
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <AssessmentDashboard 
                currentAssessment={currentAssessment}
                framework={assessmentFramework}
                onLogout={handleLogout}
              />
            } 
          />
          
          <Route 
            path="/explore" 
            element={
              <LandingPage 
                framework={assessmentFramework}
                onStartAssessment={() => window.location.href = '/start'}
              />
            } 
          />
          
          <Route 
            path="/start" 
            element={
              currentAssessment ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AssessmentStart 
                  onStart={startAssessment}
                />
              )
            } 
          />
          
          <Route 
            path="/assessment/:assessmentId/:categoryId" 
            element={
              <AssessmentQuestion 
                framework={assessmentFramework}
                currentAssessment={currentAssessment}
                onUpdateStatus={updateAssessmentStatus}
              />
            } 
          />
          
          <Route 
            path="/results/:assessmentId" 
            element={
              <AssessmentResults 
                currentAssessment={currentAssessment}
                framework={assessmentFramework}
              />
            } 
          />
          
          <Route 
            path="/executive-summary/:assessmentId" 
            element={<ExecutiveSummary />} 
          />
          
          <Route 
            path="/pillar-results/:assessmentId/:pillarId" 
            element={<PillarResults />} 
          />
          
          <Route 
            path="/assessments" 
            element={<AssessmentManagement />} 
          />
          
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>

        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
            error: {
              duration: 5000,
              theme: {
                primary: '#ff4b4b',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;




