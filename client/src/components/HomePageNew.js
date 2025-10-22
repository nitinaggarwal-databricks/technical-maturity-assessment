import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FiZap
} from 'react-icons/fi';
import * as assessmentService from '../services/assessmentService';

// =======================
// STYLED COMPONENTS
// =======================

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
  color: #1e293b;
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
  padding: 56px 24px 96px;

  @media (max-width: 768px) {
    padding: 40px 20px 60px;
  }
`;

const HeaderNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 56px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.div`
  height: 40px;
  width: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
`;

const LogoText = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  letter-spacing: 0.02em;
  font-size: 1rem;
`;

const TopNav = styled.div`
  display: none;
  align-items: center;
  gap: 32px;
  
  @media (min-width: 768px) {
    display: flex;
  }

  a {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: white;
    }
  }
`;

const HeroContent = styled.div`
  display: grid;
  align-items: center;
  gap: 40px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 80px;
  }
`;

const HeroLeft = styled.div``;

const HeroTitle = styled(motion.h1)`
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 600;
  color: white;
  margin-bottom: 16px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    font-size: 3.75rem;
  }

  span {
    display: block;
  }
`;

const HeroSubtitle = styled(motion.p)`
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.125rem;
  max-width: 640px;
  line-height: 1.6;
`;

const HeroButtons = styled(motion.div)`
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
`;

const PrimaryButton = styled(motion.button)`
  height: 44px;
  padding: 0 24px;
  font-size: 1rem;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.95;
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(255, 107, 53, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled(motion.button)`
  height: 44px;
  padding: 0 20px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SampleDropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const SampleDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 100;
  min-width: 240px;
`;

const SampleMenuItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #0a2a6a;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }

  .title {
    font-weight: 700;
    font-size: 1rem;
  }

  .subtitle {
    font-size: 0.85rem;
    opacity: 0.7;
    font-weight: 400;
  }
`;

const MetricPills = styled(motion.div)`
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const MetricPill = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);

  .value {
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .label {
    font-size: 0.875rem;
    opacity: 0.9;
  }
`;

const BenefitsCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 32px 28px;
  
  @media (min-width: 1024px) {
    justify-self: end;
  }
`;

const BenefitsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;

  svg {
    color: #10b981;
  }
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: start;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;

  &:last-child {
    margin-bottom: 0;
  }

  svg {
    margin-top: 2px;
    color: #10b981;
    flex-shrink: 0;
  }
`;

// Content Sections
const Section = styled.section`
  padding: 64px 24px;
  background: ${props => props.bg || 'white'};
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  max-width: 768px;
  margin: 0 auto;
  text-align: center;
  margin-bottom: 64px;
`;

const SectionTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1e293b;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 1.875rem;
  }
`;

const SectionSubtitle = styled.p`
  margin-top: 12px;
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
`;

// How It Works Cards
const StepsGrid = styled.div`
  display: grid;
  gap: 24px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StepCard = styled(motion.div)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
    border-color: #cbd5e1;
  }
`;

const StepBadge = styled.div`
  display: inline-block;
  background: #f1f5f9;
  color: #475569;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 16px;
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  
  svg {
    color: #64748b;
  }
`;

const StepTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
`;

const StepText = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.6;
`;

// Why It Matters Section
const MaturityGrid = styled.div`
  display: grid;
  gap: 24px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const PyramidCard = styled(motion.div)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const PyramidTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
  
  svg {
    color: #64748b;
  }
`;

const PyramidLevels = styled.div`
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
`;

const PyramidLevel = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PyramidBar = styled.div`
  height: 12px;
  border-radius: 9999px;
  flex: 1;
  background: linear-gradient(90deg, #e2e8f0, ${props => props.color});
`;

const PyramidLabel = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  width: 112px;
`;

const PyramidText = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.6;
`;

const StatsGrid = styled.div`
  display: grid;
  gap: 24px;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled(motion.div)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1e293b;
  margin-bottom: 8px;
`;

const StatCaption = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const StatSource = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
`;

const CurveCard = styled(motion.div)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  @media (min-width: 640px) {
    grid-column: span 2;
  }
`;

const CurveTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
  
  svg {
    color: #64748b;
  }
`;

const CurveSVG = styled.svg`
  width: 100%;
  height: 280px;
`;

const CurveCaption = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 16px;
`;

// CTA Band
const CTABand = styled.section`
  padding: 56px 24px;
`;

const CTACard = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 48px 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
`;

const CTAText = styled.div`
  flex: 1;
`;

const CTATitle = styled.h3`
  font-size: 1.875rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1e293b;
  margin-bottom: 8px;
`;

const CTASubtitle = styled.p`
  margin-top: 8px;
  color: #64748b;
  font-size: 1rem;
`;

// Footer
const Footer = styled.footer`
  background: #020617;
  color: #cbd5e1;
  padding: 48px 24px;
`;

const FooterContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const FooterGrid = styled.div`
  display: grid;
  gap: 32px;
  margin-bottom: 40px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FooterBrand = styled.div``;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const FooterLogoIcon = styled.div`
  height: 36px;
  width: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  display: grid;
  place-items: center;
  color: white;
`;

const FooterLogoText = styled.span`
  font-weight: 500;
  color: white;
`;

const FooterTagline = styled.p`
  font-size: 0.875rem;
  color: #94a3b8;
  max-width: 384px;
  line-height: 1.6;
`;

const FooterLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  font-size: 0.875rem;
`;

const FooterLinkGroup = styled.div`
  .title {
    color: #94a3b8;
    margin-bottom: 8px;
  }

  a {
    display: block;
    color: #cbd5e1;
    text-decoration: none;
    margin-bottom: 8px;
    transition: color 0.2s;

    &:hover {
      color: white;
    }
  }
`;

const FooterCTA = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  @media (min-width: 768px) {
    align-items: flex-end;
  }
`;

const FooterContact = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  font-size: 0.875rem;
  color: #94a3b8;

  span, a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: inherit;
    text-decoration: none;
    transition: color 0.2s;
  }

  a:hover {
    color: white;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FooterCopyright = styled.div`
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  color: #64748b;
`;

// =======================
// COMPONENT
// =======================

const HomePageNew = () => {
  const navigate = useNavigate();
  const [generatingSample, setGeneratingSample] = useState(false);
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const handleGenerateSample = async (completionLevel) => {
    try {
      setGeneratingSample(true);
      setShowSampleMenu(false);
      
      toast.loading('Generating sample assessment...', { id: 'sample-gen' });
      
      const response = await assessmentService.generateSampleAssessment(completionLevel);
      
      if (response.success) {
        toast.success(`Sample assessment created!`, {
          id: 'sample-gen',
          duration: 4000
        });
        
        setTimeout(() => {
          navigate(`/results/${response.assessment.id}`);
        }, 1000);
      } else {
        toast.error('Failed to generate sample assessment', { id: 'sample-gen' });
      }
    } catch (error) {
      console.error('Error generating sample:', error);
      toast.error('Error generating sample assessment', { id: 'sample-gen' });
    } finally {
      setGeneratingSample(false);
    }
  };

  const metrics = [
    { label: 'Pillars', value: 6 },
    { label: 'Dimensions', value: 30 },
    { label: 'Questions', value: 60 },
    { label: 'Maturity Levels', value: 5 },
  ];

  const steps = [
    {
      icon: <FiTarget size={24} />,
      title: 'Choose your focus',
      text: 'Start with any of the six focus areas or take the full assessment. Go at your own pace—each area is independent.',
    },
    {
      icon: <FiList size={24} />,
      title: 'Answer a few questions',
      text: 'Tell us where you are today, your goals, and the business challenges that matter most.',
    },
    {
      icon: <FiTrendingUp size={24} />,
      title: 'Get your insights report',
      text: 'Receive a clear maturity score, prioritized actions, and a roadmap for quick wins and long-term growth.',
    },
  ];

  const proof = [
    {
      stat: '63%',
      caption: 'of executives say analytics improves competitive positioning',
      source: 'Deloitte',
    },
    {
      stat: '2.8×',
      caption: 'higher likelihood of achieving double‑digit growth with advanced analytics',
      source: 'Forrester',
    },
    {
      stat: '6%',
      caption: 'average annual profit uplift across big‑data leaders (5‑year horizon)',
      source: 'McKinsey',
    },
  ];

  return (
    <PageContainer>
      {/* HERO SECTION */}
      <HeroGradientBG>
        <HeroHeader>
          <HeaderNav>
            <Logo>
              <LogoIcon>
                <FiZap size={20} />
              </LogoIcon>
              <LogoText>Data & AI Technical Maturity</LogoText>
            </Logo>
            <TopNav>
              <a href="#how">How it works</a>
              <a href="#value">Why it matters</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/assessments'); }}>Past Assessments</a>
            </TopNav>
          </HeaderNav>

          <HeroContent>
            <HeroLeft>
              <HeroTitle
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Discover your Databricks maturity —
                <span>clear actions in minutes.</span>
              </HeroTitle>
              <HeroSubtitle
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                A guided, non‑technical assessment that turns where you are today into a
                prioritized roadmap for platform, analytics, ML, and GenAI.
              </HeroSubtitle>

              <HeroButtons
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <PrimaryButton
                  onClick={() => navigate('/start')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start My Free Assessment
                  <FiArrowRight size={16} />
                </PrimaryButton>
                
                <SampleDropdownWrapper ref={dropdownRef}>
                  <SecondaryButton
                    onClick={() => setShowSampleMenu(!showSampleMenu)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={generatingSample}
                  >
                    <FiPlay size={16} />
                    {generatingSample ? 'Generating...' : 'Try Sample'}
                  </SecondaryButton>

                  <AnimatePresence>
                    {showSampleMenu && (
                      <SampleDropdown
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <SampleMenuItem onClick={() => handleGenerateSample('full')}>
                          <div className="title">🎯 Full Sample</div>
                          <div className="subtitle">All 6 pillars completed</div>
                        </SampleMenuItem>
                        <SampleMenuItem onClick={() => handleGenerateSample('partial')}>
                          <div className="title">⚡ Partial Sample</div>
                          <div className="subtitle">3-4 pillars completed</div>
                        </SampleMenuItem>
                        <SampleMenuItem onClick={() => handleGenerateSample('minimal')}>
                          <div className="title">🔍 Minimal Sample</div>
                          <div className="subtitle">1-2 pillars completed</div>
                        </SampleMenuItem>
                      </SampleDropdown>
                    )}
                  </AnimatePresence>
                </SampleDropdownWrapper>
              </HeroButtons>

              <MetricPills
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {metrics.map((m) => (
                  <MetricPill key={m.label}>
                    <span className="value">{m.value}</span>
                    <span className="label">{m.label}</span>
                  </MetricPill>
                ))}
              </MetricPills>
            </HeroLeft>

            <BenefitsCard
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <BenefitsTitle>
                <FiShield size={20} />
                What you'll receive
              </BenefitsTitle>
              <BenefitItem>
                <FiCheckCircle size={16} />
                Clear maturity score across 6 pillars
              </BenefitItem>
              <BenefitItem>
                <FiCheckCircle size={16} />
                Prioritized actions and quick wins
              </BenefitItem>
              <BenefitItem>
                <FiCheckCircle size={16} />
                Executive‑ready PDF with roadmap
              </BenefitItem>
              <BenefitItem>
                <FiCheckCircle size={16} />
                Optional deep‑dive by pillar
              </BenefitItem>
            </BenefitsCard>
          </HeroContent>
        </HeroHeader>
      </HeroGradientBG>

      {/* HOW IT WORKS SECTION */}
      <Section id="how">
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>How it works</SectionTitle>
            <SectionSubtitle>
              Three simple steps. No jargon. Start anywhere.
            </SectionSubtitle>
          </SectionHeader>

          <StepsGrid>
            {steps.map((step, i) => (
              <StepCard
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <StepBadge>Step {i + 1}</StepBadge>
                <StepHeader>
                  {step.icon}
                  <StepTitle>{step.title}</StepTitle>
                </StepHeader>
                <StepText>{step.text}</StepText>
              </StepCard>
            ))}
          </StepsGrid>
        </SectionContainer>
      </Section>

      {/* WHY IT MATTERS SECTION */}
      <Section id="value" bg="#f8fafc">
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>Why maturity matters — the direct link to value</SectionTitle>
            <SectionSubtitle>
              As your data maturity grows, so does your business advantage.
            </SectionSubtitle>
          </SectionHeader>

          <MaturityGrid>
            <PyramidCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <PyramidTitle>
                <FiBarChart2 size={20} />
                The Insights‑Driven Organization Pyramid
              </PyramidTitle>
              <PyramidLevels>
                {['Awareness', 'Adoption', 'Scale', 'AI Advantage'].map((level, i) => (
                  <PyramidLevel key={i}>
                    <PyramidBar color={['#cbd5e1', '#94a3b8', '#64748b', '#475569'][i]} />
                    <PyramidLabel>{level}</PyramidLabel>
                  </PyramidLevel>
                ))}
              </PyramidLevels>
              <PyramidText>
                Moving up the pyramid aligns people, process, and platform to turn data into decisions.
              </PyramidText>
            </PyramidCard>

            <div>
              <StatsGrid>
                {proof.map((p, i) => (
                  <StatCard
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <StatValue>{p.stat}</StatValue>
                    <StatCaption>{p.caption}</StatCaption>
                    <StatSource>— {p.source}</StatSource>
                  </StatCard>
                ))}
                
                <CurveCard
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <CurveTitle>
                    <FiTrendingUp size={20} />
                    Data Maturity Curve
                  </CurveTitle>
                  <CurveSVG viewBox="0 0 900 360">
                    <defs>
                      <linearGradient id="curve" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#e2e8f0" />
                        <stop offset="100%" stopColor="#94a3b8" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M40 300 C 210 270, 340 230, 460 180 S 700 80, 860 60"
                      fill="none"
                      stroke="url(#curve)"
                      strokeWidth="6"
                    />
                    {[
                      { x: 60, y: 292, label: 'Clean Data' },
                      { x: 200, y: 270, label: 'Reports' },
                      { x: 310, y: 240, label: 'Ad‑hoc Queries' },
                      { x: 420, y: 205, label: 'Exploration' },
                      { x: 540, y: 160, label: 'Predictive' },
                      { x: 680, y: 110, label: 'Prescriptive' },
                      { x: 840, y: 70, label: 'Automated Decisions' },
                    ].map((d, i) => (
                      <g key={i}>
                        <circle cx={d.x} cy={d.y} r="8" fill="white" stroke="#94a3b8" />
                        <text
                          x={d.x}
                          y={d.y - 16}
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="12"
                        >
                          {d.label}
                        </text>
                      </g>
                    ))}
                  </CurveSVG>
                  <CurveCaption>
                    From hindsight to foresight — moving up the curve grows competitive advantage.
                  </CurveCaption>
                </CurveCard>
              </StatsGrid>
            </div>
          </MaturityGrid>
        </SectionContainer>
      </Section>

      {/* CTA BAND */}
      <CTABand>
        <CTACard>
          <CTAText>
            <CTATitle>Ready to see where you stand?</CTATitle>
            <CTASubtitle>
              Get a shareable report with prioritized actions in under 20 minutes.
            </CTASubtitle>
          </CTAText>
          <PrimaryButton
            onClick={() => navigate('/start')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Take the Assessment
            <FiArrowRight size={16} />
          </PrimaryButton>
        </CTACard>
      </CTABand>

      {/* FOOTER */}
      <Footer>
        <FooterContainer>
          <FooterGrid>
            <FooterBrand>
              <FooterLogo>
                <FooterLogoIcon>
                  <FiZap size={16} />
                </FooterLogoIcon>
                <FooterLogoText>Data & AI Maturity</FooterLogoText>
              </FooterLogo>
              <FooterTagline>
                Empowering organizations to turn data into confident, automated decisions.
              </FooterTagline>
            </FooterBrand>

            <FooterLinks>
              <FooterLinkGroup>
                <div className="title">Explore</div>
                <a href="#how">How it works</a>
                <a href="#value">Why it matters</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>Framework</a>
              </FooterLinkGroup>
              <FooterLinkGroup>
                <div className="title">Company</div>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/assessments'); }}>Past Assessments</a>
                <a href="#">Privacy & Security</a>
                <a href="#">Contact</a>
              </FooterLinkGroup>
            </FooterLinks>

            <FooterCTA>
              <PrimaryButton
                onClick={() => navigate('/start')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start My Free Assessment
                <FiArrowRight size={16} />
              </PrimaryButton>
              <FooterContact>
                <span>🔒 Secure & Confidential</span>
              </FooterContact>
            </FooterCTA>
          </FooterGrid>

          <FooterCopyright>
            © {new Date().getFullYear()} Data & AI Technical Maturity Assessment Platform
          </FooterCopyright>
        </FooterContainer>
      </Footer>
    </PageContainer>
  );
};

export default HomePageNew;

