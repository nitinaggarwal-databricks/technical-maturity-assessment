import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiBarChart2 } from 'react-icons/fi';

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const NavContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
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

  @media (max-width: 768px) {
    gap: 16px;
  }

  @media (max-width: 640px) {
    display: none;
  }

  button {
    background: none;
    border: none;
    color: #64748b;
    font-weight: 500;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: color 0.2s;
    padding: 8px 0;

    &:hover {
      color: #3b82f6;
    }
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
          <LogoText>Databricks</LogoText>
        </Logo>
        <TopNav>
          <button onClick={() => navigate('/insights-dashboard')}>Dashboard</button>
          <button onClick={() => scrollToSection('why-assessment')}>Why Assessment</button>
          <button onClick={() => scrollToSection('pillars')}>Explore Framework</button>
          <button onClick={() => scrollToSection('how-it-works')}>How It Works</button>
          <button onClick={() => navigate('/assessments')}>Past Assessments</button>
        </TopNav>
      </NavContainer>
    </Nav>
  );
};

export default GlobalNav;

