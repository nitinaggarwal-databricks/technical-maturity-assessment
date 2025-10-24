import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiEdit2,
  FiStar,
  FiDownload,
  FiUpload,
  FiPlus,
  FiChevronDown
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as assessmentService from '../services/assessmentService';
import { exportAssessmentToExcel } from '../services/excelExportService';

// =======================
// STYLED COMPONENTS
// =======================

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding-top: 68px; /* Height of fixed GlobalNav */
`;

const Breadcrumb = styled.div`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #6b7280;

  a, button {
    color: #3b82f6;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font: inherit;
    transition: color 0.2s;

    &:hover {
      color: #2563eb;
      text-decoration: underline;
    }
  }

  span {
    color: #d1d5db;
  }
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const HeaderSection = styled.div`
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;

  .left {
    flex: 1;
    min-width: 250px;

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }

    p {
      font-size: 1rem;
      color: #6b7280;
      margin: 0;
    }
  }

  .right {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  @media (max-width: 768px) {
    .left h1 {
      font-size: 1.5rem;
    }

    .left p {
      font-size: 0.875rem;
    }

    .right {
      width: 100%;
      justify-content: stretch;

      button {
        flex: 1;
      }
    }
  }
`;

const Button = styled(motion.button)`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 9px 16px;
    font-size: 0.813rem;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);

  &:hover {
    opacity: 0.95;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: #374151;
  border-color: #e5e7eb;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const FilterBar = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;

  .top-row {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .bottom-row {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    padding: 16px;

    .top-row, .bottom-row {
      gap: 8px;
    }
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;

  input {
    width: 100%;
    padding: 10px 12px 10px 40px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
      color: #9ca3af;
    }
  }

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
  }

  @media (max-width: 768px) {
    min-width: 100%;

    input {
      padding: 9px 12px 9px 36px;
    }
  }
`;

const TabGroup = styled.div`
  display: flex;
  gap: 8px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 8px;
`;

const Tab = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#111827' : '#6b7280'};
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    color: #111827;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.813rem;
  }
`;

const Dropdown = styled.select`
  padding: 8px 32px 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  @media (max-width: 768px) {
    padding: 7px 28px 7px 10px;
    font-size: 0.813rem;
  }
`;

const BulkActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 20px;

  .left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .right {
    font-size: 0.875rem;
    color: #6b7280;
  }

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 12px;

    .left {
      flex: 1;
      min-width: 100%;
    }

    .right {
      width: 100%;
      text-align: right;
    }
  }
`;

const AssessmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AssessmentCard = styled(motion.div)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.813rem;
    color: #6b7280;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .pillars {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .progress-section {
    margin-bottom: 16px;
  }

  .progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.813rem;
    color: #6b7280;
    margin-bottom: 6px;
  }

  .progress-bar {
    height: 6px;
    background: #f3f4f6;
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #f3f4f6;
  }

  .maturity {
    font-size: 0.875rem;
    color: #6b7280;

    strong {
      color: #111827;
    }
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  @media (max-width: 768px) {
    padding: 16px;

    .title {
      font-size: 1rem;
    }

    .meta {
      font-size: 0.75rem;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  
  ${props => {
    switch (props.$status) {
      case 'completed':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'in_progress':
        return `
          background: #dbeafe;
          color: #1e40af;
        `;
      case 'not_started':
        return `
          background: #f3f4f6;
          color: #374151;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const PillarTag = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
`;

const ActionButton = styled.button`
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  &.primary {
    background: #111827;
    color: white;
    border-color: #111827;

    &:hover {
      background: #1f2937;
    }
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;

  .icon {
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.3;
  }

  .title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
  }

  .message {
    font-size: 1rem;
    color: #6b7280;
    margin-bottom: 24px;
  }
`;

const LoadingContainer = styled.div`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .spinner {
    text-align: center;
    
    .text {
      font-size: 1.125rem;
      color: #6b7280;
      margin-top: 16px;
    }
  }
`;

// =======================
// COMPONENT
// =======================

const AssessmentsListNew = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pillarFilter, setPillarFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentService.getAssessments();
      setAssessments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSample = async (level) => {
    try {
      toast.loading(`Generating ${level} sample assessment...`, { id: 'sample' });
      const result = await assessmentService.generateSampleAssessment(level);
      
      if (result && result.id) {
        toast.success('Sample assessment generated!', { id: 'sample' });
        await fetchAssessments();
        navigate(`/results/${result.id}`);
      }
    } catch (error) {
      console.error('Error generating sample:', error);
      toast.error('Failed to generate sample assessment', { id: 'sample' });
    }
  };

  const handleExportAssessment = async (assessmentId, assessmentName, event) => {
    event.stopPropagation();
    try {
      toast.loading('Exporting assessment...', { id: 'export' });
      await exportAssessmentToExcel(assessmentId, assessmentName);
      toast.success('Assessment exported successfully!', { id: 'export' });
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export assessment', { id: 'export' });
    }
  };

  // Filter and sort assessments
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = 
      searchTerm === '' ||
      (assessment.assessmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assessment.organizationName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'completed' && assessment.status === 'completed') ||
      (statusFilter === 'in_progress' && assessment.completedCategories && assessment.completedCategories.length > 0 && assessment.status !== 'completed') ||
      (statusFilter === 'not_started' && (!assessment.completedCategories || assessment.completedCategories.length === 0));

    return matchesSearch && matchesStatus;
  });

  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      case 'name':
        return (a.assessmentName || '').localeCompare(b.assessmentName || '');
      case 'progress':
        const progressA = (a.completedCategories?.length || 0) / 6;
        const progressB = (b.completedCategories?.length || 0) / 6;
        return progressB - progressA;
      default:
        return 0;
    }
  });

  const getStatusFromAssessment = (assessment) => {
    if (assessment.status === 'completed') return 'completed';
    if (assessment.completedCategories && assessment.completedCategories.length > 0) return 'in_progress';
    return 'not_started';
  };

  const getStatusLabel = (assessment) => {
    const status = getStatusFromAssessment(assessment);
    return status === 'in_progress' ? 'In Progress' : 
           status === 'completed' ? 'Completed' : 
           'Not Started';
  };

  const getProgressPercentage = (assessment) => {
    return Math.round(((assessment.completedCategories?.length || 0) / 6) * 100);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const pillars = ['Platform', 'Data', 'Analytics', 'ML', 'GenAI', 'Operations'];

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div className="spinner">
            <div className="text">Loading assessments...</div>
          </div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <Breadcrumb>
        <button onClick={() => navigate('/')}>Home</button>
        <span>›</span>
        <span style={{ color: '#111827' }}>Assessments</span>
      </Breadcrumb>

      <ContentContainer>
        {/* Header */}
        <HeaderSection>
          <div className="left">
            <h1>Assessments</h1>
            <p>Browse, filter, and manage all maturity assessments in one place.</p>
          </div>
          <div className="right">
            <PrimaryButton
              onClick={() => navigate('/start')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiPlus size={16} />
              New Assessment
            </PrimaryButton>
          </div>
        </HeaderSection>

        {/* Filter Bar */}
        <FilterBar>
          <div className="top-row">
            <SearchBox>
              <FiSearch size={18} />
              <input
                type="text"
                placeholder="Search assessments, orgs, owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>
            <TabGroup>
              <Tab 
                $active={statusFilter === 'all'} 
                onClick={() => setStatusFilter('all')}
              >
                All
              </Tab>
              <Tab 
                $active={statusFilter === 'in_progress'} 
                onClick={() => setStatusFilter('in_progress')}
              >
                In Progress
              </Tab>
              <Tab 
                $active={statusFilter === 'completed'} 
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </Tab>
              <Tab 
                $active={statusFilter === 'not_started'} 
                onClick={() => setStatusFilter('not_started')}
              >
                Not Started
              </Tab>
            </TabGroup>
          </div>
          <div className="bottom-row">
            <Dropdown value={pillarFilter} onChange={(e) => setPillarFilter(e.target.value)}>
              <option value="all">Filter by pillar</option>
              {pillars.map(pillar => (
                <option key={pillar} value={pillar.toLowerCase()}>{pillar}</option>
              ))}
            </Dropdown>
            <Dropdown value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
              <option value="all">Owner</option>
            </Dropdown>
            <Dropdown value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Sort by: Recent</option>
              <option value="name">Sort by: Name</option>
              <option value="progress">Sort by: Progress</option>
            </Dropdown>
            <SecondaryButton style={{ padding: '8px 16px' }}>
              <FiFilter size={16} />
              More filters
            </SecondaryButton>
          </div>
        </FilterBar>

        {/* Results Count */}
        <BulkActionBar>
          <div className="left">
            <div style={{ fontSize: '0.938rem', color: '#6b7280', fontWeight: 500 }}>
              {sortedAssessments.length} assessment{sortedAssessments.length !== 1 ? 's' : ''} found
            </div>
          </div>
          <div className="right">
            {/* Bulk actions removed - use individual Export buttons on assessment cards */}
          </div>
        </BulkActionBar>

        {/* Assessments Grid */}
        {sortedAssessments.length === 0 ? (
          <EmptyState>
            <div className="icon">📋</div>
            <div className="title">No assessments found</div>
            <div className="message">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Create your first assessment to get started'
              }
            </div>
            {!searchTerm && statusFilter === 'all' && (
              <PrimaryButton 
                onClick={() => navigate('/start')}
                style={{ margin: '0 auto' }}
              >
                <FiPlus size={16} />
                Create Assessment
              </PrimaryButton>
            )}
          </EmptyState>
        ) : (
          <AssessmentsGrid>
            {sortedAssessments.map((assessment) => {
              const status = getStatusFromAssessment(assessment);
              const progress = getProgressPercentage(assessment);
              const completedPillars = assessment.completedCategories || [];
              
              // Use assessmentId or id, whichever is available
              const assessmentId = assessment.id || assessment.assessmentId;
              
              console.log('[AssessmentsListNew] Assessment:', {
                id: assessment.id,
                assessmentId: assessment.assessmentId,
                name: assessment.assessmentName,
                finalId: assessmentId
              });

              return (
                <AssessmentCard
                  key={assessmentId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => {
                    console.log(`[AssessmentsListNew] Card clicked, navigating to: /assessment/${assessmentId}/platform_governance`);
                    navigate(`/assessment/${assessmentId}/platform_governance`);
                  }}
                >
                  <div className="header">
                    <div>
                      <div className="title">{assessment.assessmentName || 'Untitled Assessment'}</div>
                      <div className="meta">
                        <div className="meta-item">
                          <span>🏢</span>
                          <span>{assessment.organizationName || 'Unknown Org'}</span>
                        </div>
                        <span>›</span>
                        <div className="meta-item">
                          <span>👤</span>
                          <span>{assessment.contactEmail || 'No owner'}</span>
                        </div>
                        <span>•</span>
                        <div className="meta-item">
                          <span>🕒</span>
                          <span>{getTimeAgo(assessment.updatedAt || assessment.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge $status={status}>
                      {getStatusLabel(assessment)}
                    </StatusBadge>
                  </div>

                  <div className="pillars">
                    {completedPillars.slice(0, 5).map((pillar, idx) => (
                      <PillarTag key={idx}>
                        {pillar.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </PillarTag>
                    ))}
                    {completedPillars.length > 5 && (
                      <PillarTag>+{completedPillars.length - 5} more</PillarTag>
                    )}
                    {completedPillars.length === 0 && (
                      <PillarTag style={{ opacity: 0.5 }}>No pillars completed</PillarTag>
                    )}
                  </div>

                  <div className="progress-section">
                    <div className="progress-label">
                      <span>Progress</span>
                      <span><strong>{progress}%</strong></span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="footer">
                    <div className="maturity">
                      Maturity: <strong>L{Math.ceil((progress / 100) * 4) || 1}</strong>
                    </div>
                    <div className="actions">
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`[AssessmentsListNew] Edit clicked, navigating to: /assessment/${assessmentId}/platform_governance`);
                          navigate(`/assessment/${assessmentId}/platform_governance`);
                        }}
                      >
                        <FiEdit2 />
                        Edit
                      </ActionButton>
                      <ActionButton
                        className="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`[AssessmentsListNew] Open clicked, navigating to: /results/${assessmentId}`);
                          navigate(`/results/${assessmentId}`);
                        }}
                      >
                        <FiStar />
                        Open
                      </ActionButton>
                    </div>
                  </div>
                </AssessmentCard>
              );
            })}
          </AssessmentsGrid>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default AssessmentsListNew;

