import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiDownload, FiShare2, FiAlertTriangle, FiUpload, FiX, FiLink, FiEdit2, FiTrash2, FiPlus, FiBarChart2, FiMonitor } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as assessmentService from '../services/assessmentService';
import ExecutiveDashboard from './ExecutiveDashboard';
import ROICalculator from './ROICalculator';
import RiskHeatmap from './RiskHeatmap';
import Footer from './Footer';

// =====================
// STYLED COMPONENTS
// =====================

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 108px 0 40px 0;

  @media (max-width: 768px) {
    padding: 92px 0 24px 0;
  }
`;

const PageHeader = styled.div`
  position: relative;
  margin: 0 0 32px 0;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LogoContainer = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  opacity: ${props => props.$hasLogo ? '1' : '0'};
  transition: opacity 0.3s ease;

  ${PageHeader}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    position: static;
    transform: none;
    margin-top: 16px;
  }

  @media print {
    opacity: ${props => props.$hasLogo ? '1' : '0'} !important;
  }
`;

const LogoUploadBox = styled.div`
  position: relative;
  width: 180px;
  height: 80px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }

  @media print {
    border-style: solid;
  }
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
`;

const LogoPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 0.875rem;
  text-align: center;
  padding: 12px;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const RemoveLogoButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;

  ${LogoUploadBox}:hover & {
    opacity: 1;
  }

  &:hover {
    background: #dc2626;
  }

  @media print {
    display: none;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const LogoOptionsModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const LogoOptionsContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const LogoOptionsTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px 0;
`;

const LogoOptionButton = styled.button`
  width: 100%;
  padding: 16px 20px;
  margin-bottom: 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
    color: #3b82f6;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const URLInputForm = styled.form`
  margin-top: 16px;
`;

const URLInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 12px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const URLSubmitButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LogoCancelButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  background: transparent;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  margin-top: 8px;
  transition: color 0.2s;

  &:hover {
    color: #1e293b;
  }
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

const BenchmarkButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #10b981;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  @media print {
    display: none;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${PageHeader}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }

  @media print {
    display: none;
  }
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  padding: 0 40px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const LoadingContainer = styled.div`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
`;

const ErrorContainer = styled.div`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
  padding: 40px;
`;

const ErrorText = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #ef4444;
  text-align: center;
`;

// Roadmap & Impact Sections
const Section = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  position: relative;
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const RoadmapDescription = styled.p`
  font-size: 1rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const RoadmapPhases = styled.div`
  display: grid;
  gap: 24px;
`;

const PhaseCard = styled.div`
  border-radius: 12px;
  padding: 24px;
  transition: transform 0.2s;
  position: relative;

  &:hover {
    transform: translateX(4px);
  }
`;

const PhaseCardActions = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${PhaseCard}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1;
  }
`;

const PhaseTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const PhaseItems = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PhaseItem = styled.li`
  font-size: 0.95rem;
  color: #475569;
  padding: 8px 0 8px 24px;
  position: relative;
  line-height: 1.6;

  &:before {
    content: '▸';
    position: absolute;
    left: 0;
    color: #3b82f6;
    font-weight: bold;
  }
`;

const ImpactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;

const ImpactCard = styled.div`
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
  }
`;

const ImpactValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
`;

const ImpactLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
`;

const ImpactDrivers = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-style: italic;
  line-height: 1.5;
`;

const ImpactCardActions = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${ImpactCard}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1;
  }
`;

// Action buttons for CRUD
const SectionActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${SectionHeader}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1;
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #f0f9ff;
  }
`;

const AddButton = styled(IconButton)`
  border-color: #10b981;
  color: #10b981;

  &:hover {
    border-color: #059669;
    color: #059669;
    background: #ecfdf5;
  }
`;

// Modal Styled Components
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    text-transform: capitalize;
  }

  button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #64748b;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      background: #f1f5f9;
      color: #1e293b;
    }
  }
`;

const ModalBody = styled.div`
  padding: 32px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 8px;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #00A972;
      box-shadow: 0 0 0 3px rgba(0, 169, 114, 0.1);
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #00A972 0%, #008c5f 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 169, 114, 0.3);
  }
`;

const CancelButton = styled.button`
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

// 🎬 Slideshow Styled Components
const SlideContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SlideContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  padding: 45px 60px 20px 60px;
`;

const SlideHeading = styled.div`
  position: absolute;
  top: 20px;
  left: 60px;
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  pointer-events: none;
`;

const SlideCounter = styled.div`
  position: absolute;
  bottom: 20px;
  right: 60px;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  pointer-events: none;
`;

const ClickArea = styled.div`
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  cursor: ${props => props.$direction === 'left' ? 'w-resize' : 'e-resize'};
  z-index: 1;
  ${props => props.$direction === 'left' ? 'left: 0;' : 'right: 0;'}
`;

const ExitButton = styled(motion.button)`
  position: absolute;
  top: 20px;
  right: 60px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  z-index: 10;
  pointer-events: auto;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(239, 68, 68, 1);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }
`;

// =====================
// COMPONENT
// =====================

const ExecutiveCommandCenter = () => {
  const { assessmentId} = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [customerLogo, setCustomerLogo] = useState(null);
  const fileInputRef = React.useRef(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showURLInput, setShowURLInput] = useState(false);
  const [logoURL, setLogoURL] = useState('');
  const [loadingURL, setLoadingURL] = useState(false);

  // 🎨 CRUD State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'phase', 'metric', 'section', etc.
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // 🎬 Presentation Mode State
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('[ExecutiveCommandCenter] Fetching results for:', assessmentId);
        const response = await assessmentService.getAssessmentResults(assessmentId);
        
        if (response.success && response.data) {
          setResults(response.data);
        } else {
          throw new Error('Failed to load assessment results');
        }
      } catch (err) {
        console.error('[ExecutiveCommandCenter] Error loading results:', err);
        setError(err.message || 'Failed to load assessment results');
        toast.error('Failed to load executive dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchResults();
    }
  }, [assessmentId]);


  const handleBack = () => {
    navigate(`/results/${assessmentId}`);
  };

  const handleBenchmark = () => {
    navigate(`/benchmarks/${assessmentId}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Executive Command Center',
        text: 'View our Databricks maturity assessment executive summary',
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Logo file size must be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomerLogo(reader.result);
        toast.success('Customer logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = (e) => {
    e.stopPropagation();
    setCustomerLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Logo removed');
  };

  const handleLogoClick = () => {
    if (!customerLogo) {
      setShowLogoModal(true);
    }
  };

  const handleUploadFromDevice = () => {
    setShowLogoModal(false);
    fileInputRef.current?.click();
  };

  const handleFetchFromURL = () => {
    setShowURLInput(true);
  };

  const handleURLSubmit = async (e) => {
    e.preventDefault();
    if (!logoURL.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoadingURL(true);
    
    try {
      // Call backend API to fetch logo (bypasses CORS)
      const response = await assessmentService.fetchLogoFromURL(logoURL);
      
      if (response.success && response.data) {
        setCustomerLogo(response.data);
        toast.success('Logo fetched successfully from customer portal');
        setShowLogoModal(false);
        setShowURLInput(false);
        setLogoURL('');
      } else {
        toast.error(response.message || 'Failed to fetch logo');
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
      toast.error(error.message || 'Failed to fetch logo from URL. Please check the URL and try again.');
    } finally {
      setLoadingURL(false);
    }
  };

  const handleCancelModal = () => {
    setShowLogoModal(false);
    setShowURLInput(false);
    setLogoURL('');
  };

  // 🎨 CRUD Handlers
  const handleEdit = (type, item) => {
    console.log('[Edit]', type, item);
    setModalType(type);
    setEditingItem(item);
    setFormData(item || {});
    setShowModal(true);
    toast.success(`Opening ${type} editor`);
  };

  const handleDelete = (type, item) => {
    console.log('[Delete]', type, item);
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      // In a real app, you'd update the backend here
      toast.success(`${type} deleted successfully!`);
    }
  };

  const handleAdd = (type) => {
    console.log('[Add]', type);
    setModalType(type);
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
    toast.success(`Add new ${type}`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('[Form Submit]', modalType, formData);
    // In a real app, you'd save to backend here
    setShowModal(false);
    toast.success(`${modalType} ${editingItem ? 'updated' : 'added'} successfully!`);
  };

  // 🎬 Presentation Mode Handlers
  const startPresentation = () => {
    setPresentationMode(true);
    setCurrentSlide(0);
    document.body.style.overflow = 'hidden';
  };

  const exitPresentation = () => {
    setPresentationMode(false);
    setCurrentSlide(0);
    document.body.style.overflow = 'auto';
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

  // Keyboard navigation for slideshow
  useEffect(() => {
    if (!presentationMode) return;

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') exitPresentation();
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') previousSlide();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [presentationMode, currentSlide]);

  // Define slides for Executive Command Center
  const slides = [
    {
      id: 'title',
      title: 'Executive Command Center',
      type: 'title'
    },
    {
      id: 'strategic-roadmap',
      title: 'Strategic Roadmap & Next Steps',
      type: 'single'
    },
    {
      id: 'business-impact',
      title: 'Expected Business Impact',
      type: 'single'
    },
    {
      id: 'roi',
      title: 'Interactive ROI Calculator',
      type: 'single'
    },
    {
      id: 'risk-heatmap',
      title: 'Risk Heatmap',
      type: 'single'
    }
  ];

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading Executive Command Center...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <FiAlertTriangle size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
          <ErrorText>Assessment not found</ErrorText>
          <div style={{ textAlign: 'center', color: '#64748b', maxWidth: '500px', marginBottom: '32px' }}>
            <p style={{ marginBottom: '16px' }}>
              The assessment "{assessmentId}" could not be found. This may happen if:
            </p>
            <ul style={{ textAlign: 'left', paddingLeft: '20px', marginBottom: '24px', lineHeight: '1.8' }}>
              <li>The assessment hasn't been created yet</li>
              <li>The assessment ID is incorrect</li>
              <li>The assessment has been deleted</li>
            </ul>
            <p style={{ fontWeight: '600' }}>
              Try one of these options:
            </p>
          </div>
          <ActionButtons style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <ActionButton
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiArrowLeft />
              Back to Home
            </ActionButton>
            <ActionButton
              onClick={() => navigate('/assessments')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View My Assessments
            </ActionButton>
            <ActionButton
              onClick={() => navigate('/start')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start New Assessment
            </ActionButton>
          </ActionButtons>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // 🚨 CHECK: Are there any fully completed pillars?
  const completedPillars = results?.assessmentInfo?.completedPillars || 0;
  const hasNoCompletedPillars = completedPillars === 0;

  return (
    <PageContainer>
      <PageHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <BackButton
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiArrowLeft />
            Full Report
          </BackButton>

          <BenchmarkButton
            onClick={handleBenchmark}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiBarChart2 />
            Industry Benchmarks
          </BenchmarkButton>

          <LogoContainer $hasLogo={!!customerLogo}>
            <LogoUploadBox onClick={handleLogoClick}>
              {customerLogo ? (
                <>
                  <LogoImage src={customerLogo} alt="Customer Logo" />
                  <RemoveLogoButton onClick={handleRemoveLogo}>
                    <FiX size={14} />
                  </RemoveLogoButton>
                </>
              ) : (
                <LogoPlaceholder>
                  <FiUpload />
                  <span>Customer Logo</span>
                </LogoPlaceholder>
              )}
            </LogoUploadBox>
            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
            />
          </LogoContainer>
        </div>

        <ActionButtons>
          <ActionButton
            onClick={handlePrint}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiDownload />
            Print / Save PDF
          </ActionButton>
          <ActionButton
            onClick={handleShare}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiShare2 />
            Share
          </ActionButton>
          <ActionButton
            onClick={startPresentation}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
            title="View Executive Command Center in presentation slideshow mode"
          >
            <FiMonitor />
            Start Slideshow
          </ActionButton>
        </ActionButtons>
      </PageHeader>

      <ContentContainer>
        {/* 🚨 Show warning if no completed pillars */}
        {hasNoCompletedPillars ? (
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '48px 32px',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '80px auto'
          }}>
            <FiAlertTriangle size={64} style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px' }}>
              Executive Command Center Unavailable
            </h2>
            <p style={{ fontSize: '1.25rem', opacity: 0.95, marginBottom: '32px' }}>
              Complete at least one pillar (answer or skip all questions) to access executive dashboards, ROI calculations, and strategic insights.
            </p>
            <button
              onClick={() => navigate(`/assessment/${assessmentId}/platform_governance`)}
              style={{
                background: 'white',
                color: '#ef4444',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '1.125rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}
            >
              Continue Assessment →
            </button>
          </div>
        ) : (
          <>
            {/* Executive Dashboard */}
            <ExecutiveDashboard 
              results={results} 
              assessment={results?.assessmentInfo}
            />

            {/* Strategic Roadmap & Next Steps */}
            {results?.roadmap?.phases && (
              <Section style={{ marginTop: '40px' }}>
                <SectionHeader>
                  <SectionTitle>📍 Strategic Roadmap & Next Steps</SectionTitle>
                  <SectionActions>
                    <IconButton title="Add Phase" onClick={() => handleAdd('phase')}>
                      <FiPlus size={16} />
                    </IconButton>
                    <IconButton title="Edit Section" onClick={() => handleEdit('roadmap-section', results?.roadmap)}>
                      <FiEdit2 size={16} />
                    </IconButton>
                    <IconButton title="Delete Section" onClick={() => handleDelete('roadmap-section', results?.roadmap)}>
                      <FiTrash2 size={16} />
                    </IconButton>
                  </SectionActions>
                </SectionHeader>
                <RoadmapDescription>
                  {results.roadmap.roadmapIntro || 'This roadmap outlines key phases to accelerate your data platform maturity.'}
                </RoadmapDescription>
                <RoadmapPhases>
                  {results.roadmap.phases.map((phase, index) => (
                    <PhaseCard
                      key={phase.id}
                      style={{
                        background: phase.bgColor || '#f3f4f6',
                        borderLeft: `4px solid ${phase.borderColor || '#3b82f6'}`
                      }}
                    >
                      <PhaseCardActions>
                        <IconButton title="Edit Phase" onClick={() => handleEdit('phase', phase)}>
                          <FiEdit2 size={14} />
                        </IconButton>
                        <IconButton title="Delete Phase" onClick={() => handleDelete('phase', phase)}>
                          <FiTrash2 size={14} />
                        </IconButton>
                      </PhaseCardActions>
                      <PhaseTitle>{phase.title}</PhaseTitle>
                      <PhaseItems>
                        {phase.items.map((item, idx) => (
                          <PhaseItem key={idx}>{item}</PhaseItem>
                        ))}
                      </PhaseItems>
                    </PhaseCard>
                  ))}
                </RoadmapPhases>
              </Section>
            )}

            {/* Expected Business Impact */}
            {results?.businessImpact?.metrics && (
              <Section style={{ marginTop: '40px' }}>
                <SectionHeader>
                  <SectionTitle>📊 Expected Business Impact</SectionTitle>
                  <SectionActions>
                    <IconButton title="Add Metric" onClick={() => handleAdd('impact-metric')}>
                      <FiPlus size={16} />
                    </IconButton>
                    <IconButton title="Edit Section" onClick={() => handleEdit('impact-section', results?.businessImpact)}>
                      <FiEdit2 size={16} />
                    </IconButton>
                    <IconButton title="Delete Section" onClick={() => handleDelete('impact-section', results?.businessImpact)}>
                      <FiTrash2 size={16} />
                    </IconButton>
                  </SectionActions>
                </SectionHeader>
                <ImpactGrid>
                  {results.businessImpact.metrics.map((metric, index) => (
                    <ImpactCard key={index}>
                      <ImpactCardActions>
                        <IconButton title="Edit Metric" onClick={() => handleEdit('impact-metric', metric)}>
                          <FiEdit2 size={14} />
                        </IconButton>
                        <IconButton title="Delete Metric" onClick={() => handleDelete('impact-metric', metric)}>
                          <FiTrash2 size={14} />
                        </IconButton>
                      </ImpactCardActions>
                      <ImpactValue>{metric.value}</ImpactValue>
                      <ImpactLabel>{metric.label}</ImpactLabel>
                      <ImpactDrivers>{metric.keyDrivers}</ImpactDrivers>
                    </ImpactCard>
                  ))}
                </ImpactGrid>
              </Section>
            )}

            {/* ROI Calculator */}
            <Section>
              <SectionHeader>
                <SectionTitle>Interactive ROI Calculator</SectionTitle>
                <SectionActions>
                  <IconButton title="Edit ROI Calculator" onClick={() => handleEdit('roi-calculator', null)}>
                    <FiEdit2 size={14} />
                  </IconButton>
                  <IconButton title="Delete ROI Calculator" onClick={() => handleDelete('roi-calculator', null)}>
                    <FiTrash2 size={14} />
                  </IconButton>
                </SectionActions>
              </SectionHeader>
              <ROICalculator 
                results={results} 
                assessment={results?.assessmentInfo}
              />
            </Section>

            {/* Risk Heatmap */}
            <RiskHeatmap 
              results={results} 
              assessment={results?.assessmentInfo}
            />
          </>
        )}
      </ContentContainer>

      {/* Logo Upload Options Modal */}
      {showLogoModal && (
        <LogoOptionsModal onClick={handleCancelModal}>
          <LogoOptionsContent onClick={(e) => e.stopPropagation()}>
            <LogoOptionsTitle>Add Customer Logo</LogoOptionsTitle>
            
            {!showURLInput ? (
              <>
                <LogoOptionButton onClick={handleUploadFromDevice}>
                  <FiUpload />
                  Upload from Device
                </LogoOptionButton>
                
                <LogoOptionButton onClick={handleFetchFromURL}>
                  <FiLink />
                  Fetch from Customer Portal URL
                </LogoOptionButton>
                
                <LogoCancelButton onClick={handleCancelModal}>
                  Cancel
                </LogoCancelButton>
              </>
            ) : (
              <>
                <div style={{ 
                  marginBottom: '16px', 
                  padding: '12px', 
                  background: '#f0f9ff', 
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: '#0369a1',
                  lineHeight: '1.5'
                }}>
                  🤖 <strong>Smart Logo Detection:</strong> Enter any customer website URL and we'll automatically find and extract their logo!
                  <br/>
                  <strong>Examples:</strong>
                  <br/>
                  • https://google.com (extracts Google logo)
                  <br/>
                  • https://databricks.com (extracts Databricks logo)
                  <br/>
                  • https://company.com/logo.png (direct image link)
                </div>
                
                <URLInputForm onSubmit={handleURLSubmit}>
                  <URLInput
                    type="url"
                    value={logoURL}
                    onChange={(e) => setLogoURL(e.target.value)}
                    placeholder="https://cdn.example.com/logo.png"
                    required
                  />
                  <URLSubmitButton type="submit" disabled={loadingURL}>
                    {loadingURL ? 'Loading Logo...' : 'Add Logo'}
                  </URLSubmitButton>
                </URLInputForm>
                
                <LogoCancelButton onClick={handleCancelModal}>
                  Cancel
                </LogoCancelButton>
              </>
            )}
          </LogoOptionsContent>
        </LogoOptionsModal>
      )}

      {/* CRUD Modal */}
      <AnimatePresence>
        {showModal && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h2>{editingItem ? 'Edit' : 'Add'} {modalType}</h2>
                <button onClick={() => setShowModal(false)}>✕</button>
              </ModalHeader>
              <ModalBody>
                <form onSubmit={handleFormSubmit}>
                  {modalType === 'roi-calculator' && (
                    <>
                      <FormGroup>
                        <label>Calculator Title</label>
                        <input
                          type="text"
                          value={formData.title || 'Interactive ROI Calculator'}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter calculator title..."
                        />
                      </FormGroup>
                      <FormGroup>
                        <label>Subtitle/Description</label>
                        <textarea
                          rows="2"
                          value={formData.subtitle || 'Customize assumptions to see your specific business case for Databricks'}
                          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                          placeholder="Enter subtitle..."
                        />
                      </FormGroup>
                      <FormGroup>
                        <label>Note</label>
                        <textarea
                          rows="3"
                          value={formData.note || ''}
                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                          placeholder="Add any special notes or instructions..."
                        />
                      </FormGroup>
                    </>
                  )}

                  <ModalFooter>
                    <SaveButton type="submit">
                      {editingItem ? 'Save Changes' : 'Add'}
                    </SaveButton>
                    <CancelButton type="button" onClick={() => setShowModal(false)}>
                      Cancel
                    </CancelButton>
                  </ModalFooter>
                </form>
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />

      {/* 🎬 Presentation Slideshow Overlay */}
      <AnimatePresence>
        {presentationMode && (
          <SlideContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ClickArea $direction="left" onClick={previousSlide} />
            <ClickArea $direction="right" onClick={nextSlide} />
            
            <SlideHeading>{slides[currentSlide]?.title}</SlideHeading>
            <SlideCounter>{currentSlide + 1} / {slides.length}</SlideCounter>

            {/* Exit Button - Shows on hover on last slide */}
            {currentSlide === slides.length - 1 && (
              <ExitButton
                onClick={(e) => {
                  e.stopPropagation();
                  exitPresentation();
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{ opacity: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                ×
              </ExitButton>
            )}

            <SlideContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Title Slide */}
                  {slides[currentSlide].id === 'title' && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      textAlign: 'center',
                      gap: '32px'
                    }}>
                      <div style={{
                        fontSize: '4.5rem',
                        fontWeight: 700,
                        color: 'white',
                        marginBottom: '24px'
                      }}>
                        Executive Command Center
                      </div>
                      <div style={{
                        fontSize: '2rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        maxWidth: '900px'
                      }}>
                        Strategic Insights & Decision Intelligence
                      </div>
                      {customerLogo && (
                        <img 
                          src={customerLogo} 
                          alt="Customer Logo" 
                          style={{
                            maxHeight: '120px',
                            maxWidth: '400px',
                            objectFit: 'contain',
                            marginTop: '40px'
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Strategic Roadmap Slide */}
                  {slides[currentSlide].id === 'strategic-roadmap' && results?.strategicRoadmap && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '24px',
                      height: '100%',
                      alignItems: 'start'
                    }}>
                      {results.strategicRoadmap.map((phase, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '16px',
                            padding: '28px',
                            border: '4px solid #3b82f6',
                            height: 'fit-content'
                          }}
                        >
                          <div style={{
                            fontSize: '1.8rem',
                            fontWeight: 700,
                            color: '#1e293b',
                            marginBottom: '16px'
                          }}>
                            {phase.phase}
                          </div>
                          <div style={{
                            fontSize: '1.35rem',
                            color: '#64748b',
                            marginBottom: '20px'
                          }}>
                            {phase.timeframe}
                          </div>
                          <div style={{
                            fontSize: '1.2rem',
                            color: '#475569',
                            lineHeight: '1.8'
                          }}>
                            {phase.priorities?.map((priority, pIdx) => (
                              <div key={pIdx} style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                                <span style={{ color: '#3b82f6', fontWeight: 600 }}>•</span>
                                <span>{priority}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Business Impact Slide */}
                  {slides[currentSlide].id === 'business-impact' && results?.businessImpact && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '24px',
                      height: '100%',
                      alignItems: 'start'
                    }}>
                      {results.businessImpact.map((impact, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '16px',
                            padding: '28px',
                            border: '4px solid #10b981',
                            height: 'fit-content'
                          }}
                        >
                          <div style={{
                            fontSize: '1.8rem',
                            fontWeight: 700,
                            color: '#1e293b',
                            marginBottom: '16px'
                          }}>
                            {impact.category}
                          </div>
                          <div style={{
                            fontSize: '1.35rem',
                            color: '#64748b',
                            marginBottom: '20px'
                          }}>
                            {impact.metric}
                          </div>
                          <div style={{
                            fontSize: '1.2rem',
                            color: '#475569',
                            lineHeight: '1.8'
                          }}>
                            {impact.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ROI Calculator Slide */}
                  {slides[currentSlide].id === 'roi' && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '16px',
                        padding: '48px',
                        maxWidth: '1200px',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '3rem',
                          fontWeight: 700,
                          color: '#1e293b',
                          marginBottom: '24px'
                        }}>
                          Interactive ROI Calculator
                        </div>
                        <div style={{
                          fontSize: '1.6rem',
                          color: '#64748b',
                          lineHeight: '1.8'
                        }}>
                          Calculate your return on investment with Databricks platform maturity improvements
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risk Heatmap Slide */}
                  {slides[currentSlide].id === 'risk-heatmap' && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '16px',
                        padding: '48px',
                        maxWidth: '1200px',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '3rem',
                          fontWeight: 700,
                          color: '#1e293b',
                          marginBottom: '24px'
                        }}>
                          Risk Heatmap
                        </div>
                        <div style={{
                          fontSize: '1.6rem',
                          color: '#64748b',
                          lineHeight: '1.8'
                        }}>
                          Visualize and prioritize risks across your Databricks implementation
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </SlideContent>
          </SlideContainer>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default ExecutiveCommandCenter;

