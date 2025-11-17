import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  FiBook,
  FiUsers,
  FiTarget,
  FiCheckCircle,
  FiAlertCircle,
  FiHelpCircle,
  FiChevronDown,
  FiChevronRight,
  FiPlay,
  FiEdit3,
  FiEye,
  FiBarChart2,
  FiSettings,
  FiZap,
  FiTrendingUp,
  FiShield,
  FiDatabase,
  FiMonitor,
  FiDownload,
  FiUpload,
  FiClock,
  FiMessageSquare,
  FiStar,
  FiArrowRight,
  FiLayers,
  FiGrid,
  FiCommand,
  FiCpu,
  FiActivity,
  FiX,
  FiChevronLeft,
  FiPrinter,
  FiFileText
} from 'react-icons/fi';

// =======================
// STYLED COMPONENTS
// =======================

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 108px 0 80px 0;
  position: relative;
  overflow-x: hidden;
  overflow-y: visible;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 60px;
  color: white;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.5rem;
  opacity: 0.95;
  font-weight: 400;
  max-width: 800px;
  margin: 0 auto 40px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const QuickLinksGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 60px;
`;

const QuickLinkCard = styled(motion.button)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 24px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  svg {
    font-size: 2rem;
  }

  span {
    font-size: 1rem;
    font-weight: 600;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  align-items: start;
  position: relative;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 120px;
  align-self: start;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  z-index: 10;

  @media (max-width: 1024px) {
    position: relative;
    top: 0;
    max-height: none;
  }
`;

const SidebarTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavItem = styled(motion.button)`
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border: none;
  padding: 12px 16px;
  border-radius: 12px;
  text-align: left;
  font-size: 0.9375rem;
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f1f5f9'};
    color: ${props => props.$active ? 'white' : '#1e293b'};
  }

  svg {
    font-size: 1.125rem;
    flex-shrink: 0;
  }
`;

const MainContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 600px;

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;

  svg {
    color: #667eea;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  margin-bottom: 40px;
  line-height: 1.7;
`;

const RoleCard = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.$gradient});
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 8px 24px ${props => props.$shadow};
`;

const RoleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const RoleIcon = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
`;

const RoleTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
`;

const RoleDescription = styled.p`
  font-size: 1rem;
  opacity: 0.95;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const FeatureList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9375rem;
  opacity: 0.95;

  svg {
    flex-shrink: 0;
    font-size: 1.125rem;
  }
`;

const WorkflowCard = styled(motion.div)`
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  }
`;

const WorkflowHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const WorkflowNumber = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const WorkflowTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const WorkflowSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const WorkflowStep = styled.div`
  display: flex;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border-left: 4px solid #667eea;
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  background: #667eea;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const StepDescription = styled.p`
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
`;

const FAQAccordion = styled.div`
  margin-bottom: 16px;
`;

const FAQQuestion = styled(motion.button)`
  width: 100%;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 24px;
  text-align: left;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    background: #f1f5f9;
  }

  svg {
    flex-shrink: 0;
    transition: transform 0.2s ease;
    transform: ${props => props.$open ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const FAQAnswer = styled(motion.div)`
  padding: 20px 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 12px 12px;
  margin-top: -12px;
  font-size: 1rem;
  color: #475569;
  line-height: 1.7;
`;

const TroubleshootingCard = styled.div`
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 2px solid #fca5a5;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
`;

const TroubleshootingTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  color: #991b1b;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TroubleshootingSolution = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
`;

const SolutionTitle = styled.h5`
  font-size: 1rem;
  font-weight: 600;
  color: #059669;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SolutionSteps = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: #475569;
  font-size: 0.9375rem;
  line-height: 1.6;

  li {
    margin-bottom: 6px;
  }
`;

const HighlightBox = styled.div`
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px solid #60a5fa;
  border-radius: 12px;
  padding: 20px 24px;
  margin: 24px 0;
  display: flex;
  align-items: start;
  gap: 16px;

  svg {
    color: #1e40af;
    font-size: 1.5rem;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const HighlightContent = styled.div`
  flex: 1;

  h4 {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1e40af;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 0.9375rem;
    color: #1e3a8a;
    margin: 0;
    line-height: 1.6;
  }
`;

// Slideshow Button
const FloatingSlideshowButton = styled(motion.button)`
  position: fixed;
  top: 120px;
  right: 32px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  white-space: nowrap;
  z-index: 999;

  &:hover {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.6);
  }
`;

// Slideshow Overlay
const SlideshowOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SlideContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const SlideHeading = styled.div`
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
  font-size: 2rem;
  font-weight: 700;
  z-index: 2;
  padding: 0 100px;
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.3s ease;

  ${SlideContainer}:hover & {
    opacity: 1;
  }
`;

const SlideContent = styled.div`
  position: absolute;
  top: 75px;
  left: 95px;
  right: 95px;
  bottom: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: white;
`;

const NavigationButton = styled(motion.button)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$direction === 'left' ? 'left: 32px;' : 'right: 32px;'}
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  z-index: 3;
  opacity: 0;

  ${SlideContainer}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &[data-hide-on-print="true"] {
    @media print {
      display: none !important;
    }
  }
`;

const SlideCounter = styled.div`
  position: absolute;
  bottom: 40px;
  right: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  z-index: 3;
  opacity: 0;

  ${SlideContainer}:hover & {
    opacity: 1;
  }

  &[data-hide-on-print="true"] {
    @media print {
      display: none !important;
    }
  }
`;

const ExitButton = styled(motion.button)`
  position: absolute;
  top: 32px;
  right: 32px;
  background: rgba(239, 68, 68, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.3s ease;
  z-index: 3;
  opacity: 0;

  ${SlideContainer}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(220, 38, 38, 1);
    transform: scale(1.1);
  }

  &[data-hide-on-print="true"] {
    @media print {
      display: none !important;
    }
  }
`;

const PrintButton = styled(motion.button)`
  position: absolute;
  top: 32px;
  right: 96px;
  background: rgba(16, 185, 129, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 20px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.3s ease;
  z-index: 3;
  opacity: 0;

  ${SlideContainer}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(5, 150, 105, 1);
    transform: scale(1.05);
  }

  &[data-hide-on-print="true"] {
    @media print {
      display: none !important;
    }
  }
`;

// =======================
// COMPONENT
// =======================

const UserGuide = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [openFAQ, setOpenFAQ] = useState(null);
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const sections = [
    { id: 'overview', label: 'Overview', icon: FiBook },
    { id: 'roles', label: 'User Roles', icon: FiUsers },
    { id: 'workflows', label: 'Workflows', icon: FiTarget },
    { id: 'features', label: 'Key Features', icon: FiZap },
    { id: 'reports', label: 'Reports', icon: FiBarChart2 },
    { id: 'faq', label: 'FAQ', icon: FiHelpCircle },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: FiAlertCircle }
  ];

  const quickLinks = [
    { id: 'roles', label: 'User Roles', icon: FiUsers },
    { id: 'workflows', label: 'Workflows', icon: FiTarget },
    { id: 'features', label: 'Features', icon: FiZap },
    { id: 'faq', label: 'FAQ', icon: FiHelpCircle }
  ];

  const roles = [
    {
      title: 'Admin',
      icon: '👑',
      gradient: '#667eea 0%, #764ba2 100%',
      shadow: 'rgba(102, 126, 234, 0.3)',
      description: 'Full system access with complete control over users, assessments, and configurations.',
      features: [
        'Manage all users and permissions',
        'Create custom questions',
        'View organization-wide analytics',
        'Access admin-only features',
        'Export/import data via Excel',
        'Switch roles for testing',
        'View feedback dashboard',
        'Complete audit trail access'
      ]
    },
    {
      title: 'Author',
      icon: '✍️',
      gradient: '#10b981 0%, #059669 100%',
      shadow: 'rgba(16, 185, 129, 0.3)',
      description: 'Create and manage assessments, assign them to consumers, and track progress.',
      features: [
        'Create new assessments',
        'Assign assessments to consumers',
        'Clone existing assessments',
        'View all reports',
        'Monitor progress',
        'Edit assessment details',
        'Delete own assessments',
        'Access slideshow presentations'
      ]
    },
    {
      title: 'Consumer',
      icon: '👤',
      gradient: '#f59e0b 0%, #d97706 100%',
      shadow: 'rgba(245, 158, 11, 0.3)',
      description: 'Take assigned assessments, view results, and access personalized recommendations.',
      features: [
        'Take assigned assessments',
        'View assessment results',
        'Access all reports',
        'Use AI chatbot for help',
        'Present results via slideshow',
        'Provide feedback',
        'Track assessment progress',
        'View history and changes'
      ]
    }
  ];

  const workflows = [
    {
      number: 1,
      title: 'Create & Assign Assessment',
      steps: [
        {
          title: 'Create Assessment',
          description: 'Click "Dashboard" → "+ New Assessment". Fill in organization details (name, industry, size, region) and click "Create Assessment".'
        },
        {
          title: 'Assign to Consumer',
          description: 'From Dashboard, click the "Assign" icon. Select an existing consumer or create a new one by entering their details.'
        },
        {
          title: 'Monitor Progress',
          description: 'Track completion percentage on the Dashboard. Click "View Report" when progress > 0% to see results.'
        }
      ]
    },
    {
      number: 2,
      title: 'Take Assessment',
      steps: [
        {
          title: 'Access Assessment',
          description: 'Go to "Assessments" → "My Assessments". Click "Start Assessment" or "Continue Assessment".'
        },
        {
          title: 'Answer Questions',
          description: 'For each question, select Current State, Future State, pain points, and add notes. Navigate using Previous/Next buttons or question circles.'
        },
        {
          title: 'Complete & View Results',
          description: 'Complete all 60 questions across 6 pillars. Click "View Results" to access your maturity report and recommendations.'
        }
      ]
    },
    {
      number: 3,
      title: 'View Reports',
      steps: [
        {
          title: 'Maturity Report',
          description: 'Main report showing pillar scores, recommendations, and next steps. Access from "View Report" button.'
        },
        {
          title: 'Executive Command Center',
          description: 'High-level strategic view with ROI calculator, roadmap, and business impact metrics. Perfect for C-suite presentations.'
        },
        {
          title: 'Industry Benchmarks',
          description: 'Compare your scores to industry peers. See percentile rankings and competitive positioning.'
        }
      ]
    },
    {
      number: 4,
      title: 'Present with Slideshow',
      steps: [
        {
          title: 'Start Slideshow',
          description: 'Click the purple "Slideshow" button on any report page. Slideshow opens in full-screen mode.'
        },
        {
          title: 'Navigate Slides',
          description: 'Use arrow keys or on-screen arrows (appear on hover). Press Escape to exit. Slide counter shows progress.'
        },
        {
          title: 'Print to PDF',
          description: 'In slideshow mode, hover and click "Print" button. PDF generates with each slide as one page. Save or print.'
        }
      ]
    }
  ];

  const faqs = [
    {
      question: 'How long does it take to complete an assessment?',
      answer: 'On average, assessments take 45-60 minutes to complete. However, you can save progress and return anytime. The assessment auto-saves as you go, so you won\'t lose any work.'
    },
    {
      question: 'Can I edit my responses after submitting?',
      answer: 'Yes! You can edit responses at any time. Simply navigate back to the question and update your answer. Reports will automatically regenerate with your new responses. Admins can also edit questions inline or via Excel import.'
    },
    {
      question: 'What do the maturity levels mean?',
      answer: 'Maturity levels range from 1 to 5: Level 1 (Ad-hoc) = Manual, reactive processes. Level 2 (Developing) = Some automation, basic processes. Level 3 (Defined) = Standardized, documented processes. Level 4 (Managed) = Measured, optimized processes. Level 5 (Optimized) = Continuous improvement, industry-leading.'
    },
    {
      question: 'How are recommendations generated?',
      answer: 'Recommendations are AI-generated based on your responses, pain points, and notes. They consider your current state, target state, and the gap between them. The more detailed your notes, the more tailored your recommendations.'
    },
    {
      question: 'Can I export my assessment data?',
      answer: 'Yes! Admins and Authors can export assessments to Excel. Click the Excel icon on the Dashboard. The export includes all questions, responses, and notes. You can edit in Excel and re-import.'
    },
    {
      question: 'What is the difference between reports?',
      answer: 'Maturity Report = Detailed analysis with pillar scores and recommendations. Executive Command Center = Strategic view for executives with ROI and roadmap. Industry Benchmarks = Competitive positioning vs. peers. Deep Dive = Technical details and implementation plans. Insights Dashboard = Organization-wide analytics.'
    },
    {
      question: 'How do I share results with my team?',
      answer: 'Use the Slideshow mode to present results. Click "Slideshow" on any report, then use the Print button to generate a PDF. You can also export to Excel for custom analysis and sharing.'
    },
    {
      question: 'Can I create custom questions?',
      answer: 'Yes! Admins can create custom questions via "Admin" → "Question Manager". Define the question, maturity levels, pain points, and assign to specific assessments. You can also generate sample questions for each pillar.'
    },
    {
      question: 'What happens to my data?',
      answer: 'All data is securely stored in PostgreSQL. Assessment responses, history, and audit trails are maintained. Only authorized users can access their assigned assessments. Admins have full visibility for organizational oversight.'
    },
    {
      question: 'How do I get help while taking an assessment?',
      answer: 'Click the purple chat icon in the bottom right corner to access the AI chatbot. It can answer questions about maturity levels, pain points, and provide guidance on how to respond.'
    }
  ];

  const troubleshooting = [
    {
      issue: 'I can\'t see my assessment',
      solutions: [
        'Verify you\'re logged in with the correct account',
        'Check that the assessment was assigned to your email address',
        'Refresh the page (Cmd/Ctrl + Shift + R)',
        'Contact your admin to verify assignment'
      ]
    },
    {
      issue: 'My changes aren\'t saving',
      solutions: [
        'Check your internet connection',
        'Click the "Save" button explicitly',
        'Refresh the page and try again',
        'Clear browser cache and cookies',
        'Try a different browser (Chrome, Firefox, Safari)'
      ]
    },
    {
      issue: 'Reports aren\'t updating after I made changes',
      solutions: [
        'Click the "Refresh" button on the report page',
        'Hard refresh your browser (Cmd/Ctrl + Shift + R)',
        'Wait 30 seconds and refresh again (reports regenerate)',
        'Clear browser cache if issue persists'
      ]
    },
    {
      issue: 'Excel import failed',
      solutions: [
        'Ensure you didn\'t modify columns A-C (Pillar, Dimension, Question)',
        'Check that the file format is .xlsx (not .xls or .csv)',
        'Verify there are no special characters or formulas in cells',
        'Re-download the original Excel and try again',
        'Contact admin if error persists'
      ]
    },
    {
      issue: 'Slideshow is blank or not loading',
      solutions: [
        'Hard refresh the page (Cmd/Ctrl + Shift + R)',
        'Ensure the assessment has sufficient data (progress > 0%)',
        'Try a different browser',
        'Disable browser extensions temporarily',
        'Check that JavaScript is enabled'
      ]
    },
    {
      issue: 'PDF print is not working',
      solutions: [
        'Ensure you\'re in slideshow mode first',
        'Click the Print button and wait for PDF generation',
        'Allow pop-ups for this site in browser settings',
        'Try using Chrome or Firefox for best compatibility',
        'Check that you have sufficient disk space'
      ]
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <>
            <SectionTitle>
              <FiBook />
              Welcome to the User Guide
            </SectionTitle>
            <SectionSubtitle>
              Everything you need to know about the Databricks Technical Maturity Assessment tool.
            </SectionSubtitle>

            <HighlightBox>
              <FiStar />
              <HighlightContent>
                <h4>What is this tool?</h4>
                <p>
                  A comprehensive assessment platform that evaluates your organization's data analytics maturity across 6 key pillars: Platform & Governance, Data Engineering, Machine Learning, GenAI & Advanced Analytics, Enablement & Adoption, and Business Value & Strategy.
                </p>
              </HighlightContent>
            </HighlightBox>

            <WorkflowCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <WorkflowHeader>
                <FiTarget style={{ fontSize: '2rem', color: '#667eea' }} />
                <div>
                  <WorkflowTitle>6 Assessment Pillars</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Comprehensive evaluation across all dimensions</p>
                </div>
              </WorkflowHeader>
              <FeatureList>
                <FeatureItem>
                  <FiShield /> Platform & Governance
                </FeatureItem>
                <FeatureItem>
                  <FiDatabase /> Data Engineering
                </FeatureItem>
                <FeatureItem>
                  <FiCpu /> Machine Learning
                </FeatureItem>
                <FeatureItem>
                  <FiZap /> GenAI & Advanced Analytics
                </FeatureItem>
                <FeatureItem>
                  <FiUsers /> Enablement & Adoption
                </FeatureItem>
                <FeatureItem>
                  <FiTrendingUp /> Business Value & Strategy
                </FeatureItem>
              </FeatureList>
            </WorkflowCard>

            <WorkflowCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <WorkflowHeader>
                <FiCheckCircle style={{ fontSize: '2rem', color: '#10b981' }} />
                <div>
                  <WorkflowTitle>Key Benefits</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Why use this assessment tool</p>
                </div>
              </WorkflowHeader>
              <FeatureList>
                <FeatureItem>
                  <FiCheckCircle style={{ color: '#10b981' }} /> AI-powered recommendations
                </FeatureItem>
                <FeatureItem>
                  <FiCheckCircle style={{ color: '#10b981' }} /> Industry benchmarking
                </FeatureItem>
                <FeatureItem>
                  <FiCheckCircle style={{ color: '#10b981' }} /> Strategic roadmap generation
                </FeatureItem>
                <FeatureItem>
                  <FiCheckCircle style={{ color: '#10b981' }} /> ROI calculation
                </FeatureItem>
                <FeatureItem>
                  <FiCheckCircle style={{ color: '#10b981' }} /> Executive presentations
                </FeatureItem>
                <FeatureItem>
                  <FiCheckCircle style={{ color: '#10b981' }} /> Complete audit trail
                </FeatureItem>
              </FeatureList>
            </WorkflowCard>
          </>
        );

      case 'roles':
        return (
          <>
            <SectionTitle>
              <FiUsers />
              User Roles & Permissions
            </SectionTitle>
            <SectionSubtitle>
              Understand what each role can do and how to use the platform effectively.
            </SectionSubtitle>

            {roles.map((role, index) => (
              <RoleCard
                key={role.title}
                $gradient={role.gradient}
                $shadow={role.shadow}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RoleHeader>
                  <RoleIcon>{role.icon}</RoleIcon>
                  <div>
                    <RoleTitle>{role.title}</RoleTitle>
                  </div>
                </RoleHeader>
                <RoleDescription>{role.description}</RoleDescription>
                <FeatureList>
                  {role.features.map((feature, idx) => (
                    <FeatureItem key={idx}>
                      <FiCheckCircle />
                      {feature}
                    </FeatureItem>
                  ))}
                </FeatureList>
              </RoleCard>
            ))}
          </>
        );

      case 'workflows':
        return (
          <>
            <SectionTitle>
              <FiTarget />
              Step-by-Step Workflows
            </SectionTitle>
            <SectionSubtitle>
              Complete guides for common tasks and processes.
            </SectionSubtitle>

            {workflows.map((workflow, index) => (
              <WorkflowCard
                key={workflow.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <WorkflowHeader>
                  <WorkflowNumber>{workflow.number}</WorkflowNumber>
                  <WorkflowTitle>{workflow.title}</WorkflowTitle>
                </WorkflowHeader>
                <WorkflowSteps>
                  {workflow.steps.map((step, idx) => (
                    <WorkflowStep key={idx}>
                      <StepNumber>{idx + 1}</StepNumber>
                      <StepContent>
                        <StepTitle>{step.title}</StepTitle>
                        <StepDescription>{step.description}</StepDescription>
                      </StepContent>
                    </WorkflowStep>
                  ))}
                </WorkflowSteps>
              </WorkflowCard>
            ))}
          </>
        );

      case 'features':
        return (
          <>
            <SectionTitle>
              <FiZap />
              Key Features
            </SectionTitle>
            <SectionSubtitle>
              Discover powerful features that make assessment and reporting effortless.
            </SectionSubtitle>

            <WorkflowCard>
              <WorkflowHeader>
                <FiMonitor style={{ fontSize: '2rem', color: '#667eea' }} />
                <div>
                  <WorkflowTitle>Slideshow Presentations</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Professional full-screen presentations</p>
                </div>
              </WorkflowHeader>
              <StepDescription style={{ marginTop: '16px' }}>
                Present your results in a beautiful, full-screen slideshow format. Navigate with arrow keys, print to PDF with one click, and impress stakeholders with professional visualizations. Available on all report pages.
              </StepDescription>
            </WorkflowCard>

            <WorkflowCard>
              <WorkflowHeader>
                <FiDownload style={{ fontSize: '2rem', color: '#10b981' }} />
                <div>
                  <WorkflowTitle>Excel Export/Import</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Bulk data management</p>
                </div>
              </WorkflowHeader>
              <StepDescription style={{ marginTop: '16px' }}>
                Export assessments to Excel for offline analysis or bulk editing. Make changes in Excel and import back - all reports regenerate automatically. Perfect for large-scale updates or data analysis.
              </StepDescription>
            </WorkflowCard>

            <WorkflowCard>
              <WorkflowHeader>
                <FiEdit3 style={{ fontSize: '2rem', color: '#f59e0b' }} />
                <div>
                  <WorkflowTitle>Inline Question Editing</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Edit questions directly in the assessment</p>
                </div>
              </WorkflowHeader>
              <StepDescription style={{ marginTop: '16px' }}>
                Admins can edit question text, options, and pain points directly within the assessment interface. Changes are tracked in the audit trail and reports regenerate automatically.
              </StepDescription>
            </WorkflowCard>

            <WorkflowCard>
              <WorkflowHeader>
                <FiClock style={{ fontSize: '2rem', color: '#8b5cf6' }} />
                <div>
                  <WorkflowTitle>Assessment History</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Complete audit trail</p>
                </div>
              </WorkflowHeader>
              <StepDescription style={{ marginTop: '16px' }}>
                Track every change made to an assessment with detailed before/after comparisons. See who made changes, when, and what impact they had on reports. Perfect for compliance and auditing.
              </StepDescription>
            </WorkflowCard>

            <WorkflowCard>
              <WorkflowHeader>
                <FiMessageSquare style={{ fontSize: '2rem', color: '#ec4899' }} />
                <div>
                  <WorkflowTitle>AI Chatbot Assistant</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Get instant help anytime</p>
                </div>
              </WorkflowHeader>
              <StepDescription style={{ marginTop: '16px' }}>
                Click the chat icon in the bottom right corner to get instant help. Ask questions about maturity levels, pain points, or how to interpret results. The AI provides contextual guidance based on your assessment.
              </StepDescription>
            </WorkflowCard>

            <WorkflowCard>
              <WorkflowHeader>
                <FiSettings style={{ fontSize: '2rem', color: '#64748b' }} />
                <div>
                  <WorkflowTitle>Custom Questions</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Tailor assessments to your needs</p>
                </div>
              </WorkflowHeader>
              <StepDescription style={{ marginTop: '16px' }}>
                Admins can create custom questions specific to your organization. Define maturity levels, pain points, and assign to specific assessments. Generate sample questions for any pillar with one click.
              </StepDescription>
            </WorkflowCard>
          </>
        );

      case 'reports':
        return (
          <>
            <SectionTitle>
              <FiBarChart2 />
              Reports & Analytics
            </SectionTitle>
            <SectionSubtitle>
              Understand the different reports and when to use each one.
            </SectionSubtitle>

            <WorkflowCard>
              <WorkflowHeader>
                <FiFileText style={{ fontSize: '2rem', color: '#667eea' }} />
                <div>
                  <WorkflowTitle>Maturity Report</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Main assessment results</p>
                </div>
              </WorkflowHeader>
              <StepDescription style={{ marginTop: '16px' }}>
                <strong>Best for:</strong> Detailed analysis and understanding scores<br/>
                <strong>Includes:</strong> Overall maturity score, pillar breakdown, AI-generated recommendations, specific next steps, and improvement roadmap.
              </StepDescription>
            </WorkflowCard>

            <WorkflowCard>
              <WorkflowHeader>
                <FiCommand style={{ fontSize: '2rem', color: '#8b5cf6' }} />
                <div>
                  <WorkflowTitle>Executive Command Center</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Strategic executive view</p>
                </div>
              </WorkflowHeader>
              <StepDescription style={{ marginTop: '16px' }}>
                <strong>Best for:</strong> C-suite presentations and strategic planning<br/>
                <strong>Includes:</strong> Top 3 strategic imperatives, 3-phase roadmap, ROI calculator, risk heatmap, and business impact metrics.
              </StepDescription>
            </WorkflowCard>

            <WorkflowCard>
              <WorkflowHeader>
                <FiTrendingUp style={{ fontSize: '2rem', color: '#10b981' }} />
                <div>
                  <WorkflowTitle>Industry Benchmarks</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Competitive positioning</p>
                </div>
              </WorkflowHeader>
              <StepDescription style={{ marginTop: '16px' }}>
                <strong>Best for:</strong> Understanding your position vs. industry peers<br/>
                <strong>Includes:</strong> Percentile rankings, competitive vulnerabilities, strategic recommendations, and detailed pillar comparisons.
              </StepDescription>
            </WorkflowCard>

            <WorkflowCard>
              <WorkflowHeader>
                <FiLayers style={{ fontSize: '2rem', color: '#f59e0b' }} />
                <div>
                  <WorkflowTitle>Deep Dive</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Technical implementation details</p>
                </div>
              </WorkflowHeader>
              <StepDescription style={{ marginTop: '16px' }}>
                <strong>Best for:</strong> Technical teams and implementation planning<br/>
                <strong>Includes:</strong> Detailed technical roadmap, maturity matrices, category breakdowns, and specific action items by pillar.
              </StepDescription>
            </WorkflowCard>

            <WorkflowCard>
              <WorkflowHeader>
                <FiGrid style={{ fontSize: '2rem', color: '#ec4899' }} />
                <div>
                  <WorkflowTitle>Insights Dashboard</WorkflowTitle>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Organization-wide analytics</p>
                </div>
              </WorkflowHeader>
              <StepDescription style={{ marginTop: '16px' }}>
                <strong>Best for:</strong> Portfolio management and trend analysis<br/>
                <strong>Includes:</strong> Total assessments, average scores, industry breakdown, top performers, pillar performance, and maturity distribution.
              </StepDescription>
            </WorkflowCard>
          </>
        );

      case 'faq':
        return (
          <>
            <SectionTitle>
              <FiHelpCircle />
              Frequently Asked Questions
            </SectionTitle>
            <SectionSubtitle>
              Quick answers to common questions about the assessment tool.
            </SectionSubtitle>

            {faqs.map((faq, index) => (
              <FAQAccordion key={index}>
                <FAQQuestion
                  $open={openFAQ === index}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span>{faq.question}</span>
                  <FiChevronDown />
                </FAQQuestion>
                <AnimatePresence>
                  {openFAQ === index && (
                    <FAQAnswer
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {faq.answer}
                    </FAQAnswer>
                  )}
                </AnimatePresence>
              </FAQAccordion>
            ))}
          </>
        );

      case 'troubleshooting':
        return (
          <>
            <SectionTitle>
              <FiAlertCircle />
              Troubleshooting Guide
            </SectionTitle>
            <SectionSubtitle>
              Solutions to common issues and error messages.
            </SectionSubtitle>

            {troubleshooting.map((item, index) => (
              <TroubleshootingCard key={index}>
                <TroubleshootingTitle>
                  <FiAlertCircle />
                  {item.issue}
                </TroubleshootingTitle>
                <TroubleshootingSolution>
                  <SolutionTitle>
                    <FiCheckCircle />
                    Solutions:
                  </SolutionTitle>
                  <SolutionSteps>
                    {item.solutions.map((solution, idx) => (
                      <li key={idx}>{solution}</li>
                    ))}
                  </SolutionSteps>
                </TroubleshootingSolution>
              </TroubleshootingCard>
            ))}

            <HighlightBox>
              <FiMessageSquare />
              <HighlightContent>
                <h4>Still need help?</h4>
                <p>
                  Use the AI chatbot (bottom right corner) for instant assistance, or contact your administrator. For technical support, email nitin.aggarwal@databricks.com.
                </p>
              </HighlightContent>
            </HighlightBox>
          </>
        );

      default:
        return null;
    }
  };

  // Slideshow slides data
  const slides = [
    { id: 'title', title: 'User Guide', type: 'title' },
    { id: 'overview', title: 'Overview', type: 'content' },
    { id: 'roles-admin', title: 'Admin Role', type: 'role', role: roles[0] },
    { id: 'roles-author', title: 'Author Role', type: 'role', role: roles[1] },
    { id: 'roles-consumer', title: 'Consumer Role', type: 'role', role: roles[2] },
    { id: 'workflow-1', title: 'Create & Assign Assessment', type: 'workflow', workflow: workflows[0] },
    { id: 'workflow-2', title: 'Take Assessment', type: 'workflow', workflow: workflows[1] },
    { id: 'workflow-3', title: 'View Reports', type: 'workflow', workflow: workflows[2] },
    { id: 'workflow-4', title: 'Present with Slideshow', type: 'workflow', workflow: workflows[3] },
    { id: 'thankyou', title: 'Thank You', type: 'thankyou' }
  ];

  const totalSlides = slides.length;

  // Keyboard navigation
  useEffect(() => {
    if (!presentationMode) return;

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setPresentationMode(false);
        document.body.style.overflow = 'auto';
      } else if (e.key === 'ArrowLeft') {
        previousSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [presentationMode, currentSlide]);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setPresentationMode(false);
      document.body.style.overflow = 'auto';
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handlePrintSlideshow = async () => {
    const pdf = new jsPDF('landscape', 'pt', 'letter');
    const slideContainer = document.querySelector('.slideshow-single-slide');
    
    if (!slideContainer) return;

    // Hide UI elements
    const uiElements = document.querySelectorAll('[data-hide-on-print="true"]');
    uiElements.forEach(el => { el.style.display = 'none'; });

    // Temporarily hide body overflow
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    for (let i = 0; i < totalSlides; i++) {
      setCurrentSlide(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await new Promise(resolve => setTimeout(resolve, 200));

      // Capture the entire viewport
      const canvas = await html2canvas(slideContainer, {
        allowTaint: true,
        foreignObjectRendering: true,
        useCORS: true,
        scale: 2,
        backgroundColor: '#1e293b',
        width: window.innerWidth,
        height: window.innerHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      if (i > 0) pdf.addPage();
      // Fill entire page without aspect ratio to match slideshow exactly
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    // Restore UI elements and overflow
    uiElements.forEach(el => { el.style.display = ''; });
    document.body.style.overflow = originalOverflow;

    pdf.save('user-guide-presentation.pdf');
  };

  const renderSlideContent = (slide) => {
    switch (slide.type) {
      case 'title':
        return (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <FiBook style={{ fontSize: '6rem', marginBottom: '40px', color: '#8b5cf6' }} />
              <h1 style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '32px', letterSpacing: '-0.02em' }}>
                User Guide
              </h1>
              <p style={{ fontSize: '2rem', opacity: 0.9, fontWeight: 400 }}>
                Databricks Technical Maturity Assessment
              </p>
              <p style={{ fontSize: '1.5rem', opacity: 0.7, marginTop: '40px' }}>
                Complete training guide for all users
              </p>
            </motion.div>
          </div>
        );

      case 'role':
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              background: `linear-gradient(135deg, ${slide.role.gradient})`,
              borderRadius: '24px',
              padding: '56px',
              boxShadow: `0 16px 48px ${slide.role.shadow}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '40px' }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem'
                }}>
                  {slide.role.icon}
                </div>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 700, margin: 0 }}>{slide.role.title}</h2>
              </div>
              <p style={{ fontSize: '1.75rem', opacity: 0.95, marginBottom: '40px', lineHeight: 1.6 }}>
                {slide.role.description}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {slide.role.features.map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1.25rem' }}>
                    <FiCheckCircle style={{ fontSize: '1.75rem', flexShrink: 0 }} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'workflow':
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '56px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '44px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.75rem',
                  fontWeight: 700
                }}>
                  {slide.workflow.number}
                </div>
                <h2 style={{ fontSize: '2.75rem', fontWeight: 700, margin: 0 }}>{slide.workflow.title}</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', flex: 1 }}>
                {slide.workflow.steps.map((step, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex',
                    gap: '24px',
                    padding: '28px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    borderLeft: '4px solid #8b5cf6',
                    flex: 1
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: '#8b5cf6',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h4 style={{ fontSize: '1.625rem', fontWeight: 600, margin: '0 0 12px 0' }}>{step.title}</h4>
                      <p style={{ fontSize: '1.25rem', margin: 0, opacity: 0.9, lineHeight: 1.6 }}>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'thankyou':
        return (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <FiCheckCircle style={{ fontSize: '6rem', marginBottom: '40px', color: '#10b981' }} />
              <h1 style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '32px' }}>
                Thank You!
              </h1>
              <p style={{ fontSize: '2rem', opacity: 0.9, marginBottom: '48px' }}>
                You're now ready to use the assessment tool
              </p>
              <p style={{ fontSize: '1.5rem', opacity: 0.7 }}>
                For support: nitin.aggarwal@databricks.com
              </p>
            </motion.div>
          </div>
        );

      case 'content':
        // Overview slide
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '48px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '32px', textAlign: 'center' }}>
                What is the Databricks Technical Maturity Assessment?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <div style={{ 
                  background: 'rgba(139, 92, 246, 0.2)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  <FiTarget style={{ fontSize: '2.5rem', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>Purpose</h3>
                  <p style={{ fontSize: '1.125rem', opacity: 0.9, lineHeight: 1.6, margin: 0 }}>
                    Evaluate your organization's Databricks implementation maturity across 6 key pillars
                  </p>
                </div>
                <div style={{ 
                  background: 'rgba(139, 92, 246, 0.2)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  <FiBarChart2 style={{ fontSize: '2.5rem', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>Outcome</h3>
                  <p style={{ fontSize: '1.125rem', opacity: 0.9, lineHeight: 1.6, margin: 0 }}>
                    Get actionable insights, roadmaps, and recommendations to advance your maturity
                  </p>
                </div>
                <div style={{ 
                  background: 'rgba(139, 92, 246, 0.2)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  <FiUsers style={{ fontSize: '2.5rem', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>Who Uses It</h3>
                  <p style={{ fontSize: '1.125rem', opacity: 0.9, lineHeight: 1.6, margin: 0 }}>
                    Admins create assessments, Authors complete them, Consumers view results
                  </p>
                </div>
                <div style={{ 
                  background: 'rgba(139, 92, 246, 0.2)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  <FiCheckCircle style={{ fontSize: '2.5rem', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>Key Benefits</h3>
                  <p style={{ fontSize: '1.125rem', opacity: 0.9, lineHeight: 1.6, margin: 0 }}>
                    Industry benchmarking, executive presentations, and detailed technical deep-dives
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ width: '100%', maxWidth: '1200px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '24px' }}>{slide.title}</h2>
            <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>Content for {slide.title}</p>
          </div>
        );
    }
  };

  return (
    <>
      {/* Slideshow Mode */}
      <AnimatePresence>
        {presentationMode && (
          <SlideshowOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="slideshow-single-slide"
          >
            <SlideContainer>
              <SlideHeading $show={currentSlide > 0 && currentSlide < totalSlides - 1}>
                {slides[currentSlide]?.title}
              </SlideHeading>

              <SlideContent>
                {renderSlideContent(slides[currentSlide])}
              </SlideContent>

              <NavigationButton
                $direction="left"
                onClick={previousSlide}
                disabled={currentSlide === 0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                data-hide-on-print="true"
              >
                <FiChevronLeft />
              </NavigationButton>

              <NavigationButton
                $direction="right"
                onClick={nextSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                data-hide-on-print="true"
              >
                <FiChevronRight />
              </NavigationButton>

              <SlideCounter data-hide-on-print="true">
                {currentSlide + 1} / {totalSlides}
              </SlideCounter>

              <PrintButton
                onClick={handlePrintSlideshow}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-hide-on-print="true"
              >
                <FiPrinter />
                Print
              </PrintButton>

              <ExitButton
                onClick={() => {
                  setPresentationMode(false);
                  document.body.style.overflow = 'auto';
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                data-hide-on-print="true"
              >
                <FiX />
              </ExitButton>
            </SlideContainer>
          </SlideshowOverlay>
        )}
      </AnimatePresence>

      {/* Floating Slideshow Button */}
      {!presentationMode && (
        <FloatingSlideshowButton
          onClick={() => {
            setPresentationMode(true);
            setCurrentSlide(0);
            document.body.style.overflow = 'hidden';
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiMonitor size={18} />
          Slideshow
        </FloatingSlideshowButton>
      )}

      <PageContainer>
      <ContentWrapper>
        <HeroSection>
          <HeroTitle
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            📚 User Guide
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Master the Databricks Technical Maturity Assessment Tool
          </HeroSubtitle>
        </HeroSection>

        <ContentGrid>
          <Sidebar>
            <SidebarTitle>
              <FiBook />
              Contents
            </SidebarTitle>
            <SidebarNav>
              {sections.map((section) => (
                <NavItem
                  key={section.id}
                  $active={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <section.icon />
                  {section.label}
                </NavItem>
              ))}
            </SidebarNav>
          </Sidebar>

          <MainContent>
            {renderContent()}
          </MainContent>
        </ContentGrid>
      </ContentWrapper>
    </PageContainer>
    </>
  );
};

export default UserGuide;

