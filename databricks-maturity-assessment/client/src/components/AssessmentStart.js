import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight, FiFileText, FiEdit3 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StartContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const FormCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
`;

const FormTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
`;

const FormSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 40px;
  text-align: center;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 16px;
  border: 2px solid ${props => props.$hasError ? '#ff4444' : '#e0e0e0'};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: ${props => props.$hasError ? '#fff5f5' : 'white'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#ff4444' : '#ff6b35'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255, 107, 53, 0.1)'};
  }
  
  &::placeholder {
    color: #999;
  }
  
  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const TextArea = styled.textarea`
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #ff6b35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #6c757d;
  }
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  border: none;
  padding: 18px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 0.9rem;
  margin-top: 8px;
`;


const AssessmentStart = ({ onStart }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contactEmail: '',
    assessmentName: '',
    assessmentDescription: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.assessmentName.trim()) {
      newErrors.assessmentName = 'Assessment name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors below');
      return;
    }

    setIsSubmitting(true);

    try {
      const assessment = await onStart(formData);
      toast.success('Assessment started successfully!');
      
      // Navigate to first assessment area (Platform & Governance)
      navigate(`/assessment/${assessment.assessmentId}/platform_governance`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('Failed to start assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StartContainer>
      <FormCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <FormTitle>Start Your Assessment</FormTitle>
        <FormSubtitle>
          Begin your Databricks maturity assessment journey. We'll guide you through 
          evaluating your current capabilities and future goals.
        </FormSubtitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="assessmentName">
              <FiFileText size={18} />
              Assessment Name *
            </Label>
            <Input
              id="assessmentName"
              name="assessmentName"
              type="text"
              placeholder="Enter a name for this assessment (e.g., 'Q4 2024 Maturity Review')"
              value={formData.assessmentName}
              onChange={handleInputChange}
              disabled={isSubmitting}
              $hasError={!!errors.assessmentName}
            />
            {errors.assessmentName && (
              <ErrorMessage>{errors.assessmentName}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="assessmentDescription">
              <FiEdit3 size={18} />
              Assessment Description (Optional)
            </Label>
            <TextArea
              id="assessmentDescription"
              name="assessmentDescription"
              placeholder="Briefly describe the purpose or context of this assessment..."
              value={formData.assessmentDescription}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="contactEmail">
              <FiMail size={18} />
              Contact Email *
            </Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              placeholder="Enter your email address"
              value={formData.contactEmail}
              onChange={handleInputChange}
              disabled={isSubmitting}
              $hasError={!!errors.contactEmail}
            />
            {errors.contactEmail && (
              <ErrorMessage>{errors.contactEmail}</ErrorMessage>
            )}
          </FormGroup>

          <SubmitButton
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? 'Starting Assessment...' : 'Begin Assessment'}
            <FiArrowRight size={20} />
          </SubmitButton>
        </Form>
      </FormCard>
    </StartContainer>
  );
};

export default AssessmentStart;
