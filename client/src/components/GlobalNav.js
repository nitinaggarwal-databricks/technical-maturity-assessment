import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiBarChart2, FiArrowRight } from 'react-icons/fi';

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 12px 0;
  }
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  padding-left: 24px;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    padding-left: 16px;
  }
`;

const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const LogoText = styled.span`
  color: #1e293b;
  font-weight: 700;
  letter-spacing: -0.01em;
  font-size: 1.25rem;

  @media (max-width: 640px) {
    font-size: 1.1rem;
  }
`;

const TopNav = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  padding-right: 24px;

  @media (max-width: 768px) {
    gap: 16px;
    padding-right: 16px;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px 0;
  position: relative;

  &:hover {
    color: #3b82f6;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #3b82f6;
    transform: scaleX(0);
    transition: transform 0.2s;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

const CTAButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;

const GlobalNav = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    // If not on home page, navigate to home first
    if (window.location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <Nav>
      <NavContainer>
        <Logo onClick={() => navigate('/')}>
          <LogoIcon>
            <FiBarChart2 size={20} />
          </LogoIcon>
          <LogoText>Databricks Technical Maturity Assessment</LogoText>
        </Logo>
        <TopNav>
          <NavLink onClick={() => scrollToSection('why-assessment')}>Why This Matters</NavLink>
          <NavLink onClick={() => scrollToSection('how-it-works')}>How It Works</NavLink>
          <NavLink onClick={() => scrollToSection('pillars')}>Explore Framework</NavLink>
          <NavLink onClick={() => navigate('/assessments')}>My Assessments</NavLink>
          <NavLink onClick={() => navigate('/insights-dashboard')}>Dashboard</NavLink>
          <CTAButton onClick={() => navigate('/start')}>
            Start Assessment
            <FiArrowRight size={16} />
          </CTAButton>
        </TopNav>
      </NavContainer>
    </Nav>
  );
};

export default GlobalNav;

