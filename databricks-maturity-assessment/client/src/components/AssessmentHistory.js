import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiClock,
  FiUser,
  FiCheck,
  FiEdit3,
  FiFileText,
  FiBarChart2,
  FiTrendingUp,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiDownload,
  FiTarget,
  FiZap,
  FiShield,
  FiDatabase,
  FiEye,
  FiCommand,
  FiActivity
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

// =======================
// STYLED COMPONENTS
// =======================

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  padding: 40px 24px;
  padding-top: 108px;

  @media (max-width: 768px) {
    padding: 24px 16px;
    padding-top: 92px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    transform: translateX(-4px);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, ${props => props.$bg1 || '#667eea'} 0%, ${props => props.$bg2 || '#764ba2'} 100%);
  padding: 20px;
  border-radius: 12px;
  color: white;
`;

const SummaryLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.9;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SummaryValue = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const TimelineContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const TimelineHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const TimelineTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled(motion.button)`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${props => props.$active ? '#667eea' : '#e2e8f0'};
  background: ${props => props.$active ? '#667eea' : 'white'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    background: ${props => props.$active ? '#667eea' : '#f8f9ff'};
  }
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 40px;

  &::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #667eea 0%, #e2e8f0 100%);
  }
`;

const TimelineEvent = styled(motion.div)`
  position: relative;
  margin-bottom: 32px;
  background: ${props => props.$expanded ? '#f8f9ff' : 'white'};
  border: 1px solid ${props => props.$expanded ? '#667eea' : '#e2e8f0'};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateX(4px);
  }

  &::before {
    content: '';
    position: absolute;
    left: -32px;
    top: 24px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.$dotColor || '#667eea'};
    border: 3px solid white;
    box-shadow: 0 0 0 2px ${props => props.$dotColor || '#667eea'};
  }
`;

const EventHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

const EventLeft = styled.div`
  flex: 1;
`;

const EventType = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  background: ${props => props.$bg || '#f8f9fa'};
  color: ${props => props.$color || '#475569'};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
`;

const EventTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.875rem;
  color: #64748b;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ExpandButton = styled(motion.button)`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f8f9ff;
  }
`;

const EventDetails = styled(motion.div)`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
`;

const DetailsSection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailsTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px 0;
`;

const ChangesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ChangeItem = styled.div`
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 3px solid ${props => props.$color || '#667eea'};
`;

const ChangeLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 600;
`;

const ChangeValue = styled.div`
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
`;

const ImpactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const ImpactBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  background: ${props => props.$bg || '#f8f9ff'};
  border: 1px solid ${props => props.$border || '#e2e8f0'};
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.$color || '#475569'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid ${props => props.$variant === 'primary' ? '#667eea' : '#e2e8f0'};
  background: ${props => props.$variant === 'primary' ? '#667eea' : 'white'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#475569'};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'primary' ? '#5568d3' : '#f8f9fa'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.3;
`;

const EmptyText = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const EmptySubtext = styled.div`
  font-size: 0.875rem;
  opacity: 0.8;
`;

// =======================
// HELPER FUNCTIONS
// =======================

const getEventTypeConfig = (eventType) => {
  const configs = {
    assessment_created: {
      label: 'Created',
      icon: <FiFileText />,
      bg: '#dcfce7',
      color: '#16a34a',
      dotColor: '#22c55e'
    },
    metadata_updated: {
      label: 'Updated',
      icon: <FiEdit3 />,
      bg: '#dbeafe',
      color: '#2563eb',
      dotColor: '#3b82f6'
    },
    pillar_completed: {
      label: 'Pillar Completed',
      icon: <FiCheck />,
      bg: '#fef3c7',
      color: '#ca8a04',
      dotColor: '#eab308'
    },
    assessment_completed: {
      label: 'Completed',
      icon: <FiTarget />,
      bg: '#e9d5ff',
      color: '#9333ea',
      dotColor: '#a855f7'
    },
    response_updated: {
      label: 'Response Updated',
      icon: <FiBarChart2 />,
      bg: '#f3e8ff',
      color: '#7c3aed',
      dotColor: '#8b5cf6'
    }
  };

  return configs[eventType] || {
    label: eventType,
    icon: <FiAlertCircle />,
    bg: '#f8f9fa',
    color: '#475569',
    dotColor: '#94a3b8'
  };
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// =======================
// MAIN COMPONENT
// =======================

const AssessmentHistory = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedEvents, setExpandedEvents] = useState(new Set());

  useEffect(() => {
    fetchAuditTrail();
  }, [assessmentId]);

  useEffect(() => {
    filterEvents();
  }, [events, activeFilter]);

  const fetchAuditTrail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/assessment/${assessmentId}/audit-trail`);
      
      if (response.data.success) {
        setAuditData(response.data.data);
        setEvents(response.data.data.events || []);
      } else {
        toast.error('Failed to load audit trail');
      }
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      toast.error('Error loading audit trail');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    if (activeFilter === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(e => e.eventType === activeFilter));
    }
  };

  const toggleEventExpansion = (eventId) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const renderEventDetails = (event) => {
    // Determine which actions are available based on event type and impact
    const canViewReport = event.afterSnapshot?.completedCategories?.length > 0;
    const canViewExecutive = event.afterSnapshot?.status === 'completed' || 
                            (event.afterSnapshot?.completedCategories?.length >= 3);
    const canViewPillar = event.changes?.pillar?.id;
    const canViewDashboard = event.afterSnapshot?.completedCategories?.length > 0;

    const handleViewReport = (e) => {
      e.stopPropagation();
      navigate(`/results/${assessmentId}`);
      toast.success(`Viewing full assessment report`, {
        icon: '📊'
      });
    };

    const handleViewExecutive = (e) => {
      e.stopPropagation();
      navigate(`/executive/${assessmentId}`);
      toast.success(`Opening Executive Command Center`, {
        icon: '🎯'
      });
    };

    const handleViewPillar = (e) => {
      e.stopPropagation();
      const pillarId = event.changes?.pillar?.id;
      if (pillarId) {
        navigate(`/results/${assessmentId}#pillar-${pillarId}`);
        toast.success(`Viewing ${event.changes.pillar.name} results`, {
          icon: '📈'
        });
      }
    };

    const handleViewDashboard = (e) => {
      e.stopPropagation();
      navigate(`/insights-dashboard`);
      toast.success(`Opening Dashboard`, {
        icon: '📊'
      });
    };

    return (
      <EventDetails
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Changes */}
        {event.changes && Object.keys(event.changes).length > 0 && (
          <DetailsSection>
            <DetailsTitle>Changes Made</DetailsTitle>
            <ChangesList>
              {Object.entries(event.changes).map(([key, value]) => (
                <ChangeItem key={key} $color="#667eea">
                  <ChangeLabel>{key.replace(/([A-Z])/g, ' $1').trim()}</ChangeLabel>
                  {typeof value === 'object' && value.from !== undefined ? (
                    <ChangeValue>
                      <span style={{ color: '#dc2626' }}>{JSON.stringify(value.from)}</span>
                      {' → '}
                      <span style={{ color: '#16a34a' }}>{JSON.stringify(value.to)}</span>
                    </ChangeValue>
                  ) : (
                    <ChangeValue>{JSON.stringify(value)}</ChangeValue>
                  )}
                </ChangeItem>
              ))}
            </ChangesList>
          </DetailsSection>
        )}

        {/* Impact on Reports */}
        {event.impact && Object.keys(event.impact).length > 0 && (
          <DetailsSection>
            <DetailsTitle>Impact on Reports</DetailsTitle>
            <ImpactGrid>
              {event.impact.maturityScoreChanged && (
                <ImpactBadge $bg="#fef3c7" $border="#fbbf24" $color="#92400e">
                  <FiTrendingUp /> Maturity Score
                </ImpactBadge>
              )}
              {event.impact.recommendationsChanged && (
                <ImpactBadge $bg="#dbeafe" $border="#60a5fa" $color="#1e40af">
                  <FiZap /> Recommendations
                </ImpactBadge>
              )}
              {event.impact.executiveSummaryChanged && (
                <ImpactBadge $bg="#e9d5ff" $border="#c084fc" $color="#6b21a8">
                  <FiShield /> Executive Summary
                </ImpactBadge>
              )}
              {event.impact.strategicRoadmapChanged && (
                <ImpactBadge $bg="#d1fae5" $border="#6ee7b7" $color="#065f46">
                  <FiTarget /> Strategic Roadmap
                </ImpactBadge>
              )}
              {event.impact.benchmarkingChanged && (
                <ImpactBadge $bg="#fce7f3" $border="#f9a8d4" $color="#9f1239">
                  <FiBarChart2 /> Benchmarking
                </ImpactBadge>
              )}
              {event.impact.pillarResultsAvailable && (
                <ImpactBadge $bg="#dcfce7" $border="#86efac" $color="#15803d">
                  <FiDatabase /> Pillar Results
                </ImpactBadge>
              )}
            </ImpactGrid>
          </DetailsSection>
        )}

        {/* After Snapshot */}
        {event.afterSnapshot && (
          <DetailsSection>
            <DetailsTitle>Snapshot After Change</DetailsTitle>
            <ChangesList>
              {event.afterSnapshot.status && (
                <ChangeItem $color="#22c55e">
                  <ChangeLabel>Status</ChangeLabel>
                  <ChangeValue>{event.afterSnapshot.status}</ChangeValue>
                </ChangeItem>
              )}
              {event.afterSnapshot.progress !== undefined && (
                <ChangeItem $color="#3b82f6">
                  <ChangeLabel>Progress</ChangeLabel>
                  <ChangeValue>{event.afterSnapshot.progress}%</ChangeValue>
                </ChangeItem>
              )}
              {event.afterSnapshot.completedCategories && (
                <ChangeItem $color="#a855f7">
                  <ChangeLabel>Completed Pillars</ChangeLabel>
                  <ChangeValue>{event.afterSnapshot.completedCategories.length} / {auditData?.summary?.totalPillars || 6}</ChangeValue>
                </ChangeItem>
              )}
              {event.afterSnapshot.responseCount !== undefined && (
                <ChangeItem $color="#eab308">
                  <ChangeLabel>Total Responses</ChangeLabel>
                  <ChangeValue>{event.afterSnapshot.responseCount}</ChangeValue>
                </ChangeItem>
              )}
            </ChangesList>
          </DetailsSection>
        )}

        {/* Action Buttons */}
        {(canViewReport || canViewExecutive || canViewPillar || canViewDashboard) && (
          <ActionButtons>
            {canViewReport && (
              <ActionButton
                $variant="primary"
                onClick={handleViewReport}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiEye /> View Full Report
              </ActionButton>
            )}
            {canViewExecutive && (
              <ActionButton
                onClick={handleViewExecutive}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiCommand /> Executive Center
              </ActionButton>
            )}
            {canViewPillar && (
              <ActionButton
                onClick={handleViewPillar}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiActivity /> View Pillar
              </ActionButton>
            )}
            {canViewDashboard && (
              <ActionButton
                onClick={handleViewDashboard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiBarChart2 /> Dashboard
              </ActionButton>
            )}
          </ActionButtons>
        )}
      </EventDetails>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
            <div style={{ fontSize: '1.125rem', color: '#64748b' }}>Loading audit trail...</div>
          </div>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (!auditData) {
    return (
      <PageContainer>
        <ContentWrapper>
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <EmptyText>No Audit Trail Found</EmptyText>
            <EmptySubtext>This assessment doesn't have any recorded history yet.</EmptySubtext>
          </EmptyState>
        </ContentWrapper>
      </PageContainer>
    );
  }

  const eventTypes = [...new Set(events.map(e => e.eventType))];

  return (
    <PageContainer>
      <ContentWrapper>
        {/* Header */}
        <HeaderSection>
          <HeaderTop>
            <BackButton
              onClick={() => navigate(`/results/${assessmentId}`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiArrowLeft /> Back to Report
            </BackButton>
          </HeaderTop>

          <Title>{auditData.assessmentName} - History</Title>
          <Subtitle>{auditData.organizationName}</Subtitle>

          {/* Summary Cards */}
          <SummaryGrid>
            <SummaryCard $bg1="#667eea" $bg2="#764ba2">
              <SummaryLabel>
                <FiClock /> Total Events
              </SummaryLabel>
              <SummaryValue>{auditData.totalEvents}</SummaryValue>
            </SummaryCard>

            <SummaryCard $bg1="#f093fb" $bg2="#f5576c">
              <SummaryLabel>
                <FiUser /> Contributors
              </SummaryLabel>
              <SummaryValue>{auditData.summary.totalEditors}</SummaryValue>
            </SummaryCard>

            <SummaryCard $bg1="#4facfe" $bg2="#00f2fe">
              <SummaryLabel>
                <FiCheck /> Pillars Completed
              </SummaryLabel>
              <SummaryValue>
                {auditData.summary.pillarsCompleted} / {auditData.summary.totalPillars}
              </SummaryValue>
            </SummaryCard>

            <SummaryCard $bg1="#43e97b" $bg2="#38f9d7">
              <SummaryLabel>
                <FiBarChart2 /> Total Responses
              </SummaryLabel>
              <SummaryValue>{auditData.summary.responseCount}</SummaryValue>
            </SummaryCard>
          </SummaryGrid>
        </HeaderSection>

        {/* Timeline */}
        <TimelineContainer>
          <TimelineHeader>
            <TimelineTitle>
              <FiClock />
              Activity Timeline
            </TimelineTitle>

            <FilterGroup>
              <FilterButton
                $active={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                All ({events.length})
              </FilterButton>
              {eventTypes.map(type => {
                const config = getEventTypeConfig(type);
                const count = events.filter(e => e.eventType === type).length;
                return (
                  <FilterButton
                    key={type}
                    $active={activeFilter === type}
                    onClick={() => setActiveFilter(type)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {config.label} ({count})
                  </FilterButton>
                );
              })}
            </FilterGroup>
          </TimelineHeader>

          {filteredEvents.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🔍</EmptyIcon>
              <EmptyText>No events match your filter</EmptyText>
              <EmptySubtext>Try selecting a different filter</EmptySubtext>
            </EmptyState>
          ) : (
            <Timeline>
              <AnimatePresence>
                {filteredEvents.map((event, index) => {
                  const config = getEventTypeConfig(event.eventType);
                  const isExpanded = expandedEvents.has(event.id);

                  return (
                    <TimelineEvent
                      key={event.id}
                      $expanded={isExpanded}
                      $dotColor={config.dotColor}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => toggleEventExpansion(event.id)}
                    >
                      <EventHeader>
                        <EventLeft>
                          <EventType $bg={config.bg} $color={config.color}>
                            {config.icon}
                            {config.label}
                          </EventType>
                          <EventTitle>
                            {event.changes.pillar?.name || 
                             event.changes.assessmentName?.to || 
                             config.label}
                          </EventTitle>
                          <EventMeta>
                            <MetaItem>
                              <FiClock />
                              {formatTimestamp(event.timestamp)}
                            </MetaItem>
                            <MetaItem>
                              <FiUser />
                              {event.userEmail || 'System'}
                            </MetaItem>
                            {event.afterSnapshot?.progress !== undefined && (
                              <MetaItem>
                                <FiTrendingUp />
                                Progress: {event.afterSnapshot.progress}%
                              </MetaItem>
                            )}
                          </EventMeta>
                        </EventLeft>

                        <ExpandButton
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                        </ExpandButton>
                      </EventHeader>

                      {isExpanded && renderEventDetails(event)}
                    </TimelineEvent>
                  );
                })}
              </AnimatePresence>
            </Timeline>
          )}
        </TimelineContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

export default AssessmentHistory;

