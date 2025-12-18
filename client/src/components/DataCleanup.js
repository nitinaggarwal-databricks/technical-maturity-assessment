import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTrash2, FiAlertTriangle, FiRefreshCw, FiCheckCircle, FiDatabase } from 'react-icons/fi';
import toast from 'react-hot-toast';
import dataCleanupService from '../services/dataCleanupService';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 120px 24px 40px 24px;

  @media (max-width: 768px) {
    padding: 100px 16px 40px 16px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #64748b;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${props => props.$color || '#3b82f6'};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const TableHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TableTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.$variant === 'primary' && `
    background: #3b82f6;
    color: white;
    &:hover {
      background: #2563eb;
    }
  `}

  ${props => props.$variant === 'danger' && `
    background: #ef4444;
    color: white;
    &:hover {
      background: #dc2626;
    }
  `}

  ${props => props.$variant === 'secondary' && `
    background: #f3f4f6;
    color: #374151;
    &:hover {
      background: #e5e7eb;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;

  &:hover {
    background: #f9fafb;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 24px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableCell = styled.td`
  padding: 16px 24px;
  font-size: 0.875rem;
  color: #374151;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$color || '#fef3c7'};
  color: ${props => props.$textColor || '#92400e'};
`;

const EmptyState = styled.div`
  padding: 80px 24px;
  text-align: center;
  color: #64748b;
`;

const CheckboxCell = styled.td`
  padding: 16px 24px;
  width: 40px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const DataCleanup = () => {
  const [stats, setStats] = useState(null);
  const [corruptedAssessments, setCorruptedAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, corruptedData] = await Promise.all([
        dataCleanupService.getDataQualityStats(),
        dataCleanupService.getCorruptedAssessments()
      ]);

      setStats(statsData.stats);
      setCorruptedAssessments(corruptedData.assessments);
      toast.success('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(corruptedAssessments.map(a => a.assessmentId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (assessmentId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(assessmentId)) {
      newSelected.delete(assessmentId);
    } else {
      newSelected.add(assessmentId);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      toast.error('No assessments selected');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.size} corrupted assessment(s)? This cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const result = await dataCleanupService.bulkDeleteCorrupted(Array.from(selectedIds));
      toast.success(`Deleted ${result.results.deleted.length} assessment(s)`);
      if (result.results.failed.length > 0) {
        toast.error(`Failed to delete ${result.results.failed.length} assessment(s)`);
      }
      setSelectedIds(new Set());
      await loadData();
    } catch (error) {
      console.error('Error deleting assessments:', error);
      toast.error('Failed to delete assessments');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <FiRefreshCw size={48} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
            <p style={{ marginTop: '16px', color: '#64748b' }}>Loading data...</p>
          </div>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>
            <FiDatabase size={40} />
            Data Cleanup & Quality
          </Title>
          <Subtitle>
            Identify and remove corrupted assessments with inconsistent data
          </Subtitle>
        </Header>

        {stats && (
          <StatsGrid>
            <StatCard
              $color="#3b82f6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <StatLabel>Total Assessments</StatLabel>
              <StatValue>{stats.totalAssessments}</StatValue>
            </StatCard>

            <StatCard
              $color="#10b981"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatLabel>Data Quality Score</StatLabel>
              <StatValue>{stats.dataQualityScore}%</StatValue>
            </StatCard>

            <StatCard
              $color="#ef4444"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <StatLabel>Corrupted Assessments</StatLabel>
              <StatValue>{stats.corruptedAssessments}</StatValue>
            </StatCard>

            <StatCard
              $color="#f59e0b"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <StatLabel>No Responses</StatLabel>
              <StatValue>{stats.assessmentsWithNoResponses}</StatValue>
            </StatCard>
          </StatsGrid>
        )}

        <TableContainer>
          <TableHeader>
            <TableTitle>
              <FiAlertTriangle style={{ display: 'inline', marginRight: '8px', color: '#ef4444' }} />
              Corrupted Assessments ({corruptedAssessments.length})
            </TableTitle>
            <ActionButtons>
              <Button
                $variant="secondary"
                onClick={loadData}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiRefreshCw />
                Refresh
              </Button>
              <Button
                $variant="danger"
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0 || isDeleting}
                whileHover={{ scale: selectedIds.size > 0 ? 1.05 : 1 }}
                whileTap={{ scale: selectedIds.size > 0 ? 0.95 : 1 }}
              >
                <FiTrash2 />
                Delete Selected ({selectedIds.size})
              </Button>
            </ActionButtons>
          </TableHeader>

          {corruptedAssessments.length === 0 ? (
            <EmptyState>
              <FiCheckCircle size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px', color: '#1e293b' }}>
                No Corrupted Assessments Found
              </div>
              <div>Your data is clean! All assessments have consistent metadata and response data.</div>
            </EmptyState>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>
                    <Checkbox
                      type="checkbox"
                      checked={selectedIds.size === corruptedAssessments.length}
                      onChange={handleSelectAll}
                    />
                  </TableHeaderCell>
                  <TableHeaderCell>Assessment Name</TableHeaderCell>
                  <TableHeaderCell>Organization</TableHeaderCell>
                  <TableHeaderCell>Industry</TableHeaderCell>
                  <TableHeaderCell>Completed Pillars</TableHeaderCell>
                  <TableHeaderCell>Actual Responses</TableHeaderCell>
                  <TableHeaderCell>Updated</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {corruptedAssessments.map((assessment) => (
                  <TableRow key={assessment.assessmentId}>
                    <CheckboxCell>
                      <Checkbox
                        type="checkbox"
                        checked={selectedIds.has(assessment.assessmentId)}
                        onChange={() => handleSelectOne(assessment.assessmentId)}
                      />
                    </CheckboxCell>
                    <TableCell>
                      <strong>{assessment.assessmentName || 'Untitled'}</strong>
                    </TableCell>
                    <TableCell>{assessment.organizationName || '-'}</TableCell>
                    <TableCell>{assessment.industry || '-'}</TableCell>
                    <TableCell>
                      <Badge $color="#fef3c7" $textColor="#92400e">
                        {assessment.completedPillarsCount} pillars
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge $color="#fecaca" $textColor="#991b1b">
                        {assessment.actualResponsesCount} responses
                      </Badge>
                    </TableCell>
                    <TableCell style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                      {formatDate(assessment.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </TableContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

export default DataCleanup;

