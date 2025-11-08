import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiCheckCircle, 
  FiArrowRight,
  FiPlay,
  FiTarget,
  FiList,
  FiTrendingUp,
  FiFolder,
  FiShield,
  FiBarChart2,
  FiZap,
  FiPlayCircle,
  FiClock,
  FiAlertCircle,
  FiDollarSign,
  FiUsers,
  FiAward,
  FiMonitor,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi';
import * as assessmentService from '../services/assessmentService';

// =======================
// STYLED COMPONENTS
// =======================

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
  color: #1e293b;
  padding-top: 68px; /* Height of fixed nav */
`;

// Hero Section with Gradient Background
const HeroGradientBG = styled.div`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: radial-gradient(1200px 600px at 50% -10%, #0a2a6a 0%, #0c2f77 22%, #0e3688 45%, #0f3b94 60%, #102043 100%);
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: 0.2;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cpath d='M0 0h160v160H0z' fill='none'/%3E%3Cg stroke='%23fff' stroke-opacity='0.08' stroke-width='1'%3E%3Cpath d='M0 80h160M80 0v160'/%3E%3C/g%3E%3C/svg%3E");
  }
`;

const HeroHeader = styled.header`
  max-width: 1400px;
  margin: 0 auto;
  padding: 96px 24px;

  @media (max-width: 768px) {
    padding: 64px 20px;
  }
`;

// GlobalNav is now a separate component imported in App.js

const HeroContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
  }
`;

const HeroText = styled.div`
  h1 {
    font-size: 3.75rem;
    font-weight: 800;
    color: white;
    line-height: 1.1;
    margin-bottom: 24px;
    letter-spacing: -0.03em;

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }

  p {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.7;
    margin-bottom: 40px;

    @media (max-width: 768px) {
      font-size: 1.125rem;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    justify-content: center;
  }

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Button = styled(motion.button)`
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  position: relative;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 40px rgba(255, 107, 53, 0.5);
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const SampleDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 10;
  overflow: hidden;
`;

const SampleMenuItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: background 0.2s;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f9fafb;
  }

  .label {
    font-weight: 600;
    display: block;
    margin-bottom: 2px;
  }

  .desc {
    font-size: 0.75rem;
    color: #6b7280;
  }
`;

const HeroSidebar = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 40px;
  backdrop-filter: blur(10px);

  @media (max-width: 1024px) {
    margin: 0 auto;
    max-width: 600px;
  }

  @media (max-width: 640px) {
    padding: 28px;
  }
`;

const MetricPills = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 32px;
`;

const MetricPill = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px;
  border-radius: 12px;
  text-align: center;

  .number {
    font-size: 1.875rem;
    font-weight: 800;
    color: white;
    margin-bottom: 4px;
  }

  .label {
    font-size: 0.813rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }
`;

const BenefitsCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 24px;

  h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: white;
    margin-bottom: 16px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.938rem;
    margin-bottom: 12px;
    line-height: 1.5;

    &:last-child {
      margin-bottom: 0;
    }

    svg {
      margin-top: 2px;
      color: #86efac;
      flex-shrink: 0;
    }
  }
`;

// Content Sections
const Section = styled.section`
  max-width: 1400px;
  margin: 0 auto;
  padding: 96px 24px;

  @media (max-width: 768px) {
    padding: 64px 20px;
  }

  &.alt-bg {
    background: #f9fafb;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 64px;

  h2 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 16px;
    letter-spacing: -0.02em;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  p {
    font-size: 1.125rem;
    color: #64748b;
    line-height: 1.7;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  align-items: stretch;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  &.three-columns {
    grid-template-columns: repeat(3, 1fr);

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
`;

const Card = styled(motion.div)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
  }

  @media (max-width: 640px) {
    padding: 24px;
  }
`;

const CardIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: ${props => props.$bgColor || 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'};
  display: grid;
  place-items: center;
  margin-bottom: 20px;
  color: white;
  font-size: 24px;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
`;

const CardDescription = styled.p`
  font-size: 0.938rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
`;

const PillarCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;

  .pillar-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .icon {
      font-size: 2rem;
    }

    h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
  }

  .pillar-desc {
    font-size: 0.938rem;
    color: #64748b;
    margin-bottom: 20px;
    line-height: 1.6;
    min-height: 3.6em;
  }

  .dimensions-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 10px;
  }

  .dimensions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
    align-content: flex-start;
  }

  .dimension-tag {
    font-size: 0.813rem;
    padding: 6px 12px;
    background: #f1f5f9;
    color: #475569;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    height: fit-content;
  }

  .explore-btn {
    margin-top: 20px;
    width: 100%;
    padding: 10px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: white;
      border-color: #cbd5e1;
    }
  }
`;

const CTABand = styled.div`
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  padding: 80px 24px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;

  h2 {
    font-size: 2.5rem;
    font-weight: 800;
    color: white;
    margin-bottom: 20px;
    letter-spacing: -0.02em;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  p {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 32px;
    line-height: 1.6;
  }
`;

const CTAButton = styled(motion.button)`
  padding: 18px 40px;
  background: white;
  color: #ff6b35;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.25);
  }

  @media (max-width: 640px) {
    padding: 16px 32px;
    font-size: 1rem;
  }
`;

const Footer = styled.footer`
  background: #0f172a;
  color: rgba(255, 255, 255, 0.8);
  padding: 64px 24px 32px;

  @media (max-width: 768px) {
    padding: 48px 20px 24px;
  }
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const FooterBrand = styled.div`
  h3 {
    font-size: 1.25rem;
    color: white;
    font-weight: 700;
    margin-bottom: 12px;
  }

  p {
    font-size: 0.938rem;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .security {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    color: #86efac;

    svg {
      color: #86efac;
    }
  }
`;

const FooterLinks = styled.div`
  h4 {
    font-size: 0.875rem;
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 16px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin-bottom: 12px;

    a, button {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      font-size: 0.938rem;
      transition: color 0.2s;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      font-family: inherit;

      &:hover {
        color: white;
      }
    }
  }
`;

const FooterCTA = styled.div`
  h4 {
    font-size: 0.875rem;
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 16px;
  }

  p {
    font-size: 0.875rem;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  button {
    width: 100%;
    padding: 12px 20px;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      opacity: 0.9;
    }
  }
`;

const FooterBottom = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
`;

// =======================
// SLIDESHOW MODE STYLES
// =======================

const PresentationButton = styled.button`
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    bottom: 24px;
    right: 24px;
    padding: 12px 20px;
    font-size: 0.875rem;
  }
`;

const SlideshowOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const SlideContainer = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
  }
`;

const SlideContent = styled(motion.div)`
  width: 100%;
  height: 100%;
  background: white;
  padding: 80px 60px 120px 60px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 60px 32px 100px 32px;
  }
`;

const SlideNavigation = styled.div`
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  display: flex;
  align-items: center;
  gap: 24px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  padding: 16px 32px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    bottom: 24px;
    padding: 12px 24px;
    gap: 16px;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: ${props => props.disabled ? 'rgba(148, 163, 184, 0.2)' : 'rgba(59, 130, 246, 0.2)'};
  color: ${props => props.disabled ? '#64748b' : '#3b82f6'};
  border: 2px solid ${props => props.disabled ? 'rgba(148, 163, 184, 0.2)' : 'rgba(59, 130, 246, 0.4)'};
  border-radius: 12px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.6);
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const SlideCounter = styled.div`
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0 16px;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.813rem;
    padding: 0 8px;
  }
`;

const ExitButton = styled.button`
  position: fixed;
  top: 32px;
  right: 32px;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(220, 38, 38, 1);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    top: 24px;
    right: 24px;
    width: 40px;
    height: 40px;
  }
`;

// =======================
// COMPONENT
// =======================

const HomePageNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [generatingSample, setGeneratingSample] = useState(false);
  const sampleMenuRef = useRef(null);

  // Presentation Mode State
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Define slides - each section becomes a slide
  const slides = [
    {
      id: 'hero',
      title: 'Databricks Maturity Assessment',
      type: 'hero'
    },
    {
      id: 'why-assessment',
      title: 'Why Take This Assessment?',
      type: 'section'
    },
    {
      id: 'how-it-works',
      title: 'How It Works',
      type: 'section'
    },
    {
      id: 'pillars-1',
      title: 'Assessment Pillars (Part 1)',
      type: 'section'
    },
    {
      id: 'pillars-2',
      title: 'Assessment Pillars (Part 2)',
      type: 'section'
    }
  ];

  // Presentation mode handlers
  const startPresentation = () => {
    setCurrentSlide(0);
    setPresentationMode(true);
    document.body.style.overflow = 'hidden';
  };

  const exitPresentation = () => {
    setPresentationMode(false);
    document.body.style.overflow = '';
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!presentationMode) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousSlide();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        exitPresentation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentationMode, currentSlide]);

  // Handle scrolling when navigated from another page
  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      // Small delay to ensure page is rendered
      setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sampleMenuRef.current && !sampleMenuRef.current.contains(event.target)) {
        setShowSampleMenu(false);
      }
    };

    if (showSampleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSampleMenu]);

  const handleGenerateSample = async (level) => {
    try {
      setGeneratingSample(true);
      setShowSampleMenu(false);
      toast.loading(`Generating ${level} sample assessment...`, { id: 'sample-gen' });
      
      const result = await assessmentService.generateSampleAssessment(level);
      
      // Server returns { success, message, assessment: { id, ... } }
      const assessmentId = result?.assessment?.id || result?.id;
      
      if (assessmentId) {
        // Get the first category from the framework to navigate to first question
        const framework = await assessmentService.getAssessmentFramework();
        const firstCategoryId = framework?.assessmentAreas?.[0]?.id;
        
        if (firstCategoryId) {
          toast.success('Sample assessment ready! Review your selections...', { id: 'sample-gen' });
          setTimeout(() => {
            // Navigate to first question, not directly to results
            navigate(`/assessment/${assessmentId}/${firstCategoryId}`);
          }, 500);
        } else {
          throw new Error('Could not determine first category');
        }
      } else {
        console.error('Invalid response structure:', result);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating sample:', error);
      toast.error(error.message || 'Failed to generate sample', { id: 'sample-gen' });
    } finally {
      setGeneratingSample(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PageContainer>
      {/* Hero Section */}
      <HeroGradientBG>
        <HeroHeader>
          <HeroContent>
            <HeroText>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Accelerate Your Data & AI Journey
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Get a comprehensive assessment of your organization's technical maturity across 6 critical pillars. 
                Receive personalized recommendations and a clear roadmap for success.
              </motion.p>
            </HeroText>

            <HeroSidebar>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <MetricPills>
                  <MetricPill>
                    <div className="number">6</div>
                    <div className="label">Pillars</div>
                  </MetricPill>
                  <MetricPill>
                    <div className="number">30</div>
                    <div className="label">Dimensions</div>
                  </MetricPill>
                  <MetricPill>
                    <div className="number">60</div>
                    <div className="label">Questions</div>
                  </MetricPill>
                  <MetricPill>
                    <div className="number">5</div>
                    <div className="label">Maturity Levels</div>
                  </MetricPill>
                </MetricPills>

                <BenefitsCard>
                  <h3>What You'll Get</h3>
                  <ul>
                    <li>
                      <FiCheckCircle size={18} />
                      <span>Comprehensive maturity assessment across 6 pillars</span>
                    </li>
                    <li>
                      <FiCheckCircle size={18} />
                      <span>Personalized recommendations based on your responses</span>
                    </li>
                    <li>
                      <FiCheckCircle size={18} />
                      <span>Prioritized action plan with timelines & impact</span>
                    </li>
                    <li>
                      <FiCheckCircle size={18} />
                      <span>Executive-ready reports (PDF & Excel)</span>
                    </li>
                    <li>
                      <FiCheckCircle size={18} />
                      <span>Identify gaps and opportunities for improvement</span>
                    </li>
                  </ul>
                </BenefitsCard>
              </motion.div>
            </HeroSidebar>
          </HeroContent>
        </HeroHeader>
      </HeroGradientBG>

      {/* Why Take This Assessment Section */}
      <Section id="why-assessment">
        <SectionHeader>
          <h2>Why take this assessment?</h2>
          <p>Gain clarity on your Databricks journey and unlock the full potential of your data and AI initiatives.</p>
        </SectionHeader>

        <Grid className="three-columns">
          <Card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <CardIcon $bgColor="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)">
              <FiTrendingUp />
            </CardIcon>
            <CardTitle>Accelerate Growth</CardTitle>
            <CardDescription>
              Identify opportunities to maximize your Databricks investment and accelerate your data maturity journey.
            </CardDescription>
          </Card>

          <Card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardIcon $bgColor="linear-gradient(135deg, #10b981 0%, #059669 100%)">
              <FiDollarSign />
            </CardIcon>
            <CardTitle>Maximize ROI</CardTitle>
            <CardDescription>
              Optimize costs, improve utilization, and demonstrate measurable business value from your platform.
            </CardDescription>
          </Card>

          <Card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardIcon $bgColor="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
              <FiUsers />
            </CardIcon>
            <CardTitle>Align Teams</CardTitle>
            <CardDescription>
              Create a shared understanding of priorities and build consensus around your data strategy and roadmap.
            </CardDescription>
          </Card>

          <Card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CardIcon $bgColor="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
              <FiClock />
            </CardIcon>
            <CardTitle>Save Time</CardTitle>
            <CardDescription>
              Focus your efforts on the highest-impact improvements with prioritized recommendations and clear next steps.
            </CardDescription>
          </Card>

          <Card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CardIcon $bgColor="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)">
              <FiShield />
            </CardIcon>
            <CardTitle>Reduce Risk</CardTitle>
            <CardDescription>
              Identify security gaps, governance weaknesses, and operational risks before they impact your business.
            </CardDescription>
          </Card>

          <Card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <CardIcon $bgColor="linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)">
              <FiAward />
            </CardIcon>
            <CardTitle>Best Practices</CardTitle>
            <CardDescription>
              Learn from industry best practices and proven patterns for successful Databricks implementations.
            </CardDescription>
          </Card>
        </Grid>
      </Section>

      {/* How It Works Section */}
      <Section id="how-it-works">
        <SectionHeader>
          <h2>How it works</h2>
          <p>Get actionable insights in three simple steps</p>
        </SectionHeader>

        <Grid className="three-columns">
          <Card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <CardIcon $bgColor="linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)">
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>1</span>
            </CardIcon>
            <CardTitle>Answer Questions</CardTitle>
            <CardDescription>
              Complete 60 targeted questions across 6 pillars. Takes 15-20 minutes. Save and resume anytime.
            </CardDescription>
          </Card>

          <Card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardIcon $bgColor="linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)">
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>2</span>
            </CardIcon>
            <CardTitle>Get Insights</CardTitle>
            <CardDescription>
              Receive instant analysis of your maturity level, gaps, and opportunities across all dimensions.
            </CardDescription>
          </Card>

          <Card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardIcon $bgColor="linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)">
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>3</span>
            </CardIcon>
            <CardTitle>Take Action</CardTitle>
            <CardDescription>
              Download executive reports and implement prioritized recommendations with clear timelines and impact.
            </CardDescription>
          </Card>
        </Grid>
      </Section>

      {/* Assessment Pillars Section */}
      <Section id="pillars" className="alt-bg">
        <SectionHeader>
          <h2>Assessment Pillars</h2>
          <p>Evaluate your Databricks maturity across these six comprehensive pillars. Each contains five dimensions with targeted questions.</p>
        </SectionHeader>

        <Grid className="three-columns">
          <PillarCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="pillar-header">
              <span className="icon">🧱</span>
              <h3>Platform & Governance</h3>
            </div>
            <div className="pillar-desc">
              Assess how well your Databricks foundation is secured, scalable, and governed.
            </div>
            <div className="dimensions-label">Dimensions:</div>
            <div className="dimensions">
              <span className="dimension-tag">Environment Architecture</span>
              <span className="dimension-tag">Security & Access</span>
              <span className="dimension-tag">Governance & Compliance</span>
              <span className="dimension-tag">Observability & Monitoring</span>
              <span className="dimension-tag">Cost Management</span>
            </div>
            <button className="explore-btn" onClick={() => navigate('/start')}>
              Explore questions →
            </button>
          </PillarCard>

          <PillarCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="pillar-header">
              <span className="icon">📊</span>
              <h3>Data Engineering & Integration</h3>
            </div>
            <div className="pillar-desc">
              Evaluate how efficiently data is ingested, transformed, and managed within Databricks.
            </div>
            <div className="dimensions-label">Dimensions:</div>
            <div className="dimensions">
              <span className="dimension-tag">Ingestion Strategy</span>
              <span className="dimension-tag">Lakehouse Architecture</span>
              <span className="dimension-tag">Orchestration</span>
              <span className="dimension-tag">Data Quality</span>
              <span className="dimension-tag">Performance & Scalability</span>
            </div>
            <button className="explore-btn" onClick={() => navigate('/start')}>
              Explore questions →
            </button>
          </PillarCard>

          <PillarCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="pillar-header">
              <span className="icon">📈</span>
              <h3>Analytics & BI Modernization</h3>
            </div>
            <div className="pillar-desc">
              Assess how Databricks supports governed analytics, performance, and self-service access.
            </div>
            <div className="dimensions-label">Dimensions:</div>
            <div className="dimensions">
              <span className="dimension-tag">Query Performance</span>
              <span className="dimension-tag">Data Modeling</span>
              <span className="dimension-tag">Visualization & Reporting</span>
              <span className="dimension-tag">Self-Service Enablement</span>
              <span className="dimension-tag">Collaboration & Sharing</span>
            </div>
            <button className="explore-btn" onClick={() => navigate('/start')}>
              Explore questions →
            </button>
          </PillarCard>

          <PillarCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="pillar-header">
              <span className="icon">🤖</span>
              <h3>Machine Learning & MLOps</h3>
            </div>
            <div className="pillar-desc">
              Understand how Databricks is leveraged for classical and predictive ML use cases with reliable operations.
            </div>
            <div className="dimensions-label">Dimensions:</div>
            <div className="dimensions">
              <span className="dimension-tag">Experimentation & Tracking</span>
              <span className="dimension-tag">Model Deployment</span>
              <span className="dimension-tag">Feature Management</span>
              <span className="dimension-tag">ML Lifecycle Governance</span>
              <span className="dimension-tag">Business Impact</span>
            </div>
            <button className="explore-btn" onClick={() => navigate('/start')}>
              Explore questions →
            </button>
          </PillarCard>

          <PillarCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="pillar-header">
              <span className="icon">💡</span>
              <h3>Generative AI & Agentic Capabilities</h3>
            </div>
            <div className="pillar-desc">
              Evaluate readiness to operationalize GenAI and agent-based intelligence within your organization.
            </div>
            <div className="dimensions-label">Dimensions:</div>
            <div className="dimensions">
              <span className="dimension-tag">GenAI Strategy</span>
              <span className="dimension-tag">Data & Knowledge Readiness</span>
              <span className="dimension-tag">Application Development</span>
              <span className="dimension-tag">Evaluation & Quality Control</span>
              <span className="dimension-tag">Responsible AI</span>
            </div>
            <button className="explore-btn" onClick={() => navigate('/start')}>
              Explore questions →
            </button>
          </PillarCard>

          <PillarCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="pillar-header">
              <span className="icon">⚙️</span>
              <h3>Operational Excellence & Adoption</h3>
            </div>
            <div className="pillar-desc">
              Measure organizational readiness, adoption velocity, and realized value from Databricks.
            </div>
            <div className="dimensions-label">Dimensions:</div>
            <div className="dimensions">
              <span className="dimension-tag">Center of Excellence</span>
              <span className="dimension-tag">Community of Practice</span>
              <span className="dimension-tag">Training & Enablement</span>
              <span className="dimension-tag">Financial Management</span>
              <span className="dimension-tag">Innovation & Improvement</span>
            </div>
            <button className="explore-btn" onClick={() => navigate('/start')}>
              Explore questions →
            </button>
          </PillarCard>
        </Grid>
      </Section>

      {/* CTA Band */}
      <CTABand>
        <CTAContent>
          <h2>Ready to begin?</h2>
          <p>Answer a few guided questions and get a shareable report with prioritized actions.</p>
          <CTAButton
            onClick={() => navigate('/start')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start My Free Assessment
            <FiArrowRight size={20} />
          </CTAButton>
        </CTAContent>
      </CTABand>

      {/* Footer */}
      <Footer>
        <FooterContent>
          <FooterBrand>
            <h3>Data & AI Maturity Assessment</h3>
            <p>
              A comprehensive framework to evaluate, benchmark, and accelerate your Databricks journey. 
              Built by practitioners, for practitioners.
            </p>
            <div className="security">
              <FiShield />
              <span>Enterprise-grade security & privacy</span>
            </div>
          </FooterBrand>

          <FooterLinks>
            <h4>Resources</h4>
            <ul>
              <li><button onClick={() => scrollToSection('why-assessment')}>Why Assessment</button></li>
              <li><button onClick={() => scrollToSection('pillars')}>Assessment Pillars</button></li>
              <li><button onClick={() => scrollToSection('how-it-works')}>How It Works</button></li>
              <li><button onClick={() => navigate('/assessments')}>Past Assessments</button></li>
            </ul>
          </FooterLinks>

          <FooterCTA>
            <h4>Get Started</h4>
            <p>Start your free assessment today and unlock insights.</p>
            <button onClick={() => navigate('/start')}>Start Assessment</button>
          </FooterCTA>
        </FooterContent>

        <FooterBottom>
          <p>&copy; 2025 Data & AI Technical Maturity Assessment Platform. All rights reserved.</p>
        </FooterBottom>
      </Footer>

      {/* Presentation Mode Button */}
      {!presentationMode && (
        <PresentationButton onClick={startPresentation}>
          <FiMonitor size={18} />
          Slideshow Mode
        </PresentationButton>
      )}

      {/* Slideshow Overlay */}
      <AnimatePresence>
        {presentationMode && (
          <SlideshowOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ExitButton onClick={exitPresentation} title="Exit (ESC)">
              <FiX size={20} />
            </ExitButton>

            <SlideContainer>
              <SlideContent
                key={currentSlide}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {/* Render current slide content */}
                {slides[currentSlide].id === 'hero' && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', padding: '0' }}>
                    <motion.h1
                      style={{
                        fontSize: '3rem',
                        fontWeight: 800,
                        color: '#1e293b',
                        marginBottom: '16px',
                        textAlign: 'center'
                      }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Databricks Maturity Assessment
                    </motion.h1>
                    <motion.p
                      style={{
                        fontSize: '1.5rem',
                        color: '#64748b',
                        marginBottom: '32px',
                        textAlign: 'center'
                      }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Evaluate your data and AI platform readiness across six key pillars
                    </motion.p>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      style={{ 
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        maxHeight: '500px'
                      }}
                    >
                      <img 
                        src="/maturity-scale.png" 
                        alt="Maturity Scale" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain'
                        }}
                      />
                    </motion.div>
                  </div>
                )}

                {slides[currentSlide].id === 'why-assessment' && (
                  <div style={{ padding: '20px 0' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '32px' }}>
                      Why Take This Assessment?
                    </h2>
                    <Grid style={{ marginTop: '40px' }}>
                      <Card>
                        <CardIcon $bgColor="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)">
                          <FiTarget size={24} />
                        </CardIcon>
                        <CardTitle>Accelerate Growth</CardTitle>
                        <CardDescription>
                          Identify opportunities to maximize your Databricks investment and accelerate your data maturity journey.
                        </CardDescription>
                      </Card>
                      <Card>
                        <CardIcon $bgColor="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                          <FiZap size={24} />
                        </CardIcon>
                        <CardTitle>Maximize ROI</CardTitle>
                        <CardDescription>
                          Optimize your platform costs, improve resource utilization, and demonstrate measurable business value.
                        </CardDescription>
                      </Card>
                      <Card>
                        <CardIcon $bgColor="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
                          <FiBarChart2 size={24} />
                        </CardIcon>
                        <CardTitle>Benchmark Progress</CardTitle>
                        <CardDescription>
                          See how your platform maturity compares to industry standards and identify improvement areas.
                        </CardDescription>
                      </Card>
                    </Grid>
                  </div>
                )}

                {slides[currentSlide].id === 'how-it-works' && (
                  <div style={{ padding: '20px 0' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '32px' }}>
                      How It Works
                    </h2>
                    <Grid style={{ marginTop: '40px' }}>
                      <Card>
                        <CardIcon $bgColor="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)">
                          <FiCheckCircle size={24} />
                        </CardIcon>
                        <CardTitle>1. Answer Questions</CardTitle>
                        <CardDescription>
                          Complete 30 targeted questions across six pillars covering platform governance, data engineering, ML, GenAI, and more.
                        </CardDescription>
                      </Card>
                      <Card>
                        <CardIcon $bgColor="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                          <FiTrendingUp size={24} />
                        </CardIcon>
                        <CardTitle>2. Get Insights</CardTitle>
                        <CardDescription>
                          Receive a detailed report with your current maturity scores, gap analysis, and personalized recommendations.
                        </CardDescription>
                      </Card>
                      <Card>
                        <CardIcon $bgColor="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
                          <FiPlayCircle size={24} />
                        </CardIcon>
                        <CardTitle>3. Take Action</CardTitle>
                        <CardDescription>
                          Download an actionable roadmap with prioritized initiatives to advance your platform maturity.
                        </CardDescription>
                      </Card>
                    </Grid>
                  </div>
                )}

                {slides[currentSlide].id === 'pillars-1' && (
                  <div style={{ padding: '20px 0' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '32px' }}>
                      Assessment Pillars
                    </h2>
                    <Grid className="three-columns" style={{ marginTop: '40px' }}>
                      <PillarCard>
                        <div className="pillar-header">
                          <span className="icon">🧱</span>
                          <h3>Platform & Governance</h3>
                        </div>
                        <div className="pillar-desc">
                          Assess how well your Databricks foundation is secured, scalable, and governed.
                        </div>
                        <div className="dimensions">
                          <span className="dimension-tag">Environment Architecture</span>
                          <span className="dimension-tag">Security & Access</span>
                          <span className="dimension-tag">Governance & Compliance</span>
                          <span className="dimension-tag">Observability</span>
                          <span className="dimension-tag">Cost Management</span>
                        </div>
                      </PillarCard>
                      <PillarCard>
                        <div className="pillar-header">
                          <span className="icon">📊</span>
                          <h3>Data Engineering & Integration</h3>
                        </div>
                        <div className="pillar-desc">
                          Evaluate how efficiently data is ingested, transformed, and managed within Databricks.
                        </div>
                        <div className="dimensions">
                          <span className="dimension-tag">Ingestion Strategy</span>
                          <span className="dimension-tag">Lakehouse Architecture</span>
                          <span className="dimension-tag">Pipeline Orchestration</span>
                          <span className="dimension-tag">Data Quality</span>
                          <span className="dimension-tag">Performance</span>
                        </div>
                      </PillarCard>
                      <PillarCard>
                        <div className="pillar-header">
                          <span className="icon">📈</span>
                          <h3>Analytics & BI Modernization</h3>
                        </div>
                        <div className="pillar-desc">
                          Assess how Databricks supports governed analytics, performance, and self-service access.
                        </div>
                        <div className="dimensions">
                          <span className="dimension-tag">Query Performance</span>
                          <span className="dimension-tag">Data Modeling</span>
                          <span className="dimension-tag">Visualization</span>
                          <span className="dimension-tag">Self-Service</span>
                          <span className="dimension-tag">Collaboration</span>
                        </div>
                      </PillarCard>
                    </Grid>
                  </div>
                )}

                {slides[currentSlide].id === 'pillars-2' && (
                  <div style={{ padding: '20px 0' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '32px' }}>
                      Assessment Pillars
                    </h2>
                    <Grid className="three-columns" style={{ marginTop: '40px' }}>
                      <PillarCard>
                        <div className="pillar-header">
                          <span className="icon">🤖</span>
                          <h3>Machine Learning & MLOps</h3>
                        </div>
                        <div className="pillar-desc">
                          Understand how Databricks is leveraged for classical and predictive ML use cases with reliable operations.
                        </div>
                        <div className="dimensions">
                          <span className="dimension-tag">Experimentation & Tracking</span>
                          <span className="dimension-tag">Model Deployment</span>
                          <span className="dimension-tag">Feature Management</span>
                          <span className="dimension-tag">ML Governance</span>
                          <span className="dimension-tag">Business Impact</span>
                        </div>
                      </PillarCard>
                      <PillarCard>
                        <div className="pillar-header">
                          <span className="icon">💡</span>
                          <h3>Generative AI & Agentic Capabilities</h3>
                        </div>
                        <div className="pillar-desc">
                          Evaluate readiness to operationalize GenAI and agent-based intelligence within your organization.
                        </div>
                        <div className="dimensions">
                          <span className="dimension-tag">GenAI Strategy</span>
                          <span className="dimension-tag">Data Readiness</span>
                          <span className="dimension-tag">Application Development</span>
                          <span className="dimension-tag">Quality Control</span>
                          <span className="dimension-tag">Responsible AI</span>
                        </div>
                      </PillarCard>
                      <PillarCard>
                        <div className="pillar-header">
                          <span className="icon">⚙️</span>
                          <h3>Operational Excellence & Adoption</h3>
                        </div>
                        <div className="pillar-desc">
                          Measure organizational readiness, adoption velocity, and realized value from Databricks.
                        </div>
                        <div className="dimensions">
                          <span className="dimension-tag">Center of Excellence</span>
                          <span className="dimension-tag">Community of Practice</span>
                          <span className="dimension-tag">Training & Enablement</span>
                          <span className="dimension-tag">Financial Management</span>
                          <span className="dimension-tag">Innovation & Improvement</span>
                        </div>
                      </PillarCard>
                    </Grid>
                  </div>
                )}
              </SlideContent>
            </SlideContainer>

            <SlideNavigation>
              <NavButton
                onClick={previousSlide}
                disabled={currentSlide === 0}
                title="Previous (←)"
              >
                <FiChevronLeft size={20} />
              </NavButton>
              
              <SlideCounter>
                {currentSlide + 1} / {slides.length}
              </SlideCounter>
              
              <NavButton
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                title="Next (→)"
              >
                <FiChevronRight size={20} />
              </NavButton>
            </SlideNavigation>
          </SlideshowOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default HomePageNew;
