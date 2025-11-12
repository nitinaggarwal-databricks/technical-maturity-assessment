# Identity Management System - Implementation Guide

## ✅ COMPLETED (Backend & Services)

### 1. Database Schema
**File:** `server/db/migrations/006_user_management.sql`
- ✅ `users` table with roles (admin, author, consumer)
- ✅ `assessment_assignments` table
- ✅ `notifications` table  
- ✅ `sessions` table for authentication
- ✅ Default admin user (email: admin@databricks.com, password: admin123)

### 2. Backend Repositories
**Files:**
- ✅ `server/db/userRepository.js` - User management, authentication, sessions
- ✅ `server/db/assignmentRepository.js` - Assignment management with strict access control
- ✅ `server/db/notificationRepository.js` - Notification system

### 3. Backend Routes
**Files:**
- ✅ `server/routes/auth.js` - Login, logout, register, user management
- ✅ `server/routes/assignments.js` - Assign assessments, release results, email invitations
- ✅ `server/routes/notifications.js` - Notification CRUD
- ✅ `server/middleware/auth.js` - Authentication middleware

### 4. Frontend Services
**Files:**
- ✅ `client/src/services/authService.js` - Authentication service
- ✅ `client/src/services/assignmentService.js` - Assignment operations
- ✅ `client/src/services/notificationService.js` - Notification operations

### 5. UI Components
**Files:**
- ✅ `client/src/components/LoginModal.js` - Login UI with Databricks/Customer views

## 🚧 TO IMPLEMENT (Frontend Integration)

### STEP 1: Setup Database (REQUIRED FIRST)

```bash
# 1. Set environment variable
export DATABASE_URL="postgresql://username:password@localhost:5432/dbname"

# 2. Run migration
cd databricks-maturity-assessment
npm install
node server/db/run-user-migration.js

# 3. Verify tables created:
# - users
# - assessment_assignments
# - notifications
# - sessions
```

### STEP 2: Add Login Button to HomePage

**File to modify:** `client/src/components/HomePageNew.js`

```javascript
// At top of file, add imports:
import { FiLogIn, FiUser } from 'react-icons/fi';
import LoginModal from './LoginModal';
import authService from '../services/authService';

// In component, add state:
const [showLoginModal, setShowLoginModal] = useState(false);
const [currentUser, setCurrentUser] = useState(authService.getUser());

// Add useEffect to check authentication:
useEffect(() => {
  if (authService.isAuthenticated()) {
    setCurrentUser(authService.getUser());
  }
}, []);

// Add styled component for login button (after other styled components):
const LoginButton = styled(motion.button)`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
  }
`;

// In return statement, before PageContainer:
return (
  <>
    <LoginModal 
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      onLoginSuccess={(user) => {
        setCurrentUser(user);
        // Redirect based on role
        if (user.role === 'consumer') {
          navigate('/my-assessments');
        } else {
          navigate('/author-dashboard');
        }
      }}
    />
    
    {!currentUser ? (
      <LoginButton
        onClick={() => setShowLoginModal(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiLogIn size={18} />
        Login
      </LoginButton>
    ) : (
      <LoginButton
        onClick={() => {
          authService.logout();
          setCurrentUser(null);
          navigate('/');
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiUser size={18} />
        {currentUser.firstName || currentUser.email}
      </LoginButton>
    )}
    
    <PageContainer>
      {/* existing content */}
    </PageContainer>
  </>
);
```

### STEP 3: Create My Assessments Component (Customer View)

**Create new file:** `client/src/components/MyAssessments.js`

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiFileText, FiClock, FiCheckCircle, FiLock } from 'react-icons/fi';
import assignmentService from '../services/assignmentService';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 100px 24px 60px;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 12px;
  }
  
  p {
    font-size: 1.125rem;
    color: #64748b;
  }
`;

const AssessmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const AssessmentCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  border: 2px solid transparent;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.$clickable ? '#2563eb' : 'transparent'};
    box-shadow: ${props => props.$clickable ? '0 4px 12px rgba(37, 99, 235, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.08)'};
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 16px;
  
  ${props => {
    switch(props.$status) {
      case 'assigned':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'in_progress':
        return `
          background: #dbeafe;
          color: #1e40af;
        `;
      case 'submitted':
        return `
          background: #e0e7ff;
          color: #4338ca;
        `;
      case 'released':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      default:
        return `
          background: #f1f5f9;
          color: #475569;
        `;
    }
  }}
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const CardMeta = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 16px;
`;

const CardActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
  ` : `
    background: #f1f5f9;
    color: #475569;
    
    &:hover {
      background: #e2e8f0;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  
  svg {
    font-size: 4rem;
    color: #cbd5e1;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 12px;
  }
  
  p {
    font-size: 1rem;
    color: #64748b;
  }
`;

const MyAssessments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    const result = await assignmentService.getMyAssignments();
    if (result.success) {
      setAssignments(result.assignments);
    } else {
      toast.error('Failed to load assessments');
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'assigned':
      case 'in_progress':
        return <FiClock />;
      case 'submitted':
        return <FiFileText />;
      case 'released':
        return <FiCheckCircle />;
      default:
        return <FiLock />;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'assigned':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'submitted':
        return 'Pending Review';
      case 'released':
        return 'Results Available';
      default:
        return status;
    }
  };

  const handleCardClick = (assignment) => {
    if (assignment.status === 'assigned' || assignment.status === 'in_progress') {
      navigate(`/assessment/${assignment.assessment_id}`);
    } else if (assignment.status === 'released') {
      navigate(`/results/${assignment.assessment_id}`);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Content>
          <p>Loading...</p>
        </Content>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Content>
        <Header>
          <h1>My Assessments</h1>
          <p>Complete your assigned assessments and view results</p>
        </Header>

        {assignments.length === 0 ? (
          <EmptyState>
            <FiFileText />
            <h3>No Assessments Yet</h3>
            <p>You don't have any assigned assessments at this time.</p>
          </EmptyState>
        ) : (
          <AssessmentGrid>
            {assignments.map((assignment) => (
              <AssessmentCard
                key={assignment.id}
                $clickable={assignment.status !== 'submitted'}
                onClick={() => handleCardClick(assignment)}
                whileHover={{ y: -4 }}
              >
                <StatusBadge $status={assignment.status}>
                  {getStatusIcon(assignment.status)}
                  {getStatusLabel(assignment.status)}
                </StatusBadge>
                
                <CardTitle>{assignment.assessment_name}</CardTitle>
                <CardMeta>{assignment.organization_name}</CardMeta>
                
                {assignment.status === 'submitted' && (
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Your assessment has been submitted and is awaiting review by your Databricks team.
                  </p>
                )}
                
                {assignment.status === 'released' && (
                  <CardActions>
                    <Button 
                      $primary
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/results/${assignment.assessment_id}`);
                      }}
                    >
                      View Results
                    </Button>
                  </CardActions>
                )}
                
                {(assignment.status === 'assigned' || assignment.status === 'in_progress') && (
                  <CardActions>
                    <Button 
                      $primary
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/assessment/${assignment.assessment_id}`);
                      }}
                    >
                      {assignment.status === 'assigned' ? 'Start Assessment' : 'Continue'}
                    </Button>
                  </CardActions>
                )}
              </AssessmentCard>
            ))}
          </AssessmentGrid>
        )}
      </Content>
    </PageContainer>
  );
};

export default MyAssessments;
```

### STEP 4: Add Route for My Assessments

**File to modify:** `client/src/App.js`

```javascript
// Add import
import MyAssessments from './components/MyAssessments';

// Add route
<Route path="/my-assessments" element={<MyAssessments />} />
```

### STEP 5: Update GlobalNav for Role-Based Visibility

**File to modify:** `client/src/components/GlobalNav.js`

Add at the top of the component:

```javascript
import authService from '../services/authService';

// In component
const [currentUser, setCurrentUser] = useState(authService.getUser());

useEffect(() => {
  if (authService.isAuthenticated()) {
    setCurrentUser(authService.getUser());
  }
}, []);

// Hide/show based on role:
// For consumers: hide Dashboard, Try Sample
// Show only: Home, My Assessments

{currentUser?.role !== 'consumer' && (
  <NavLink to="/insights-dashboard">
    <FiBarChart2 size={18} />
    <span>Dashboard</span>
  </NavLink>
)}

{currentUser?.role === 'consumer' && (
  <NavLink to="/my-assessments">
    <FiFileText size={18} />
    <span>My Assessments</span>
  </NavLink>
)}

// Hide Try Sample for consumers
{currentUser?.role !== 'consumer' && (
  <button onClick={handleTrySampleAssessment}>
    Try Sample
  </button>
)}
```

### STEP 6: Create Author Dashboard (Optional - for managing assignments)

**Create new file:** `client/src/components/AuthorDashboard.js`
- List all assignments created by the author
- Show status of each (assigned, in_progress, submitted, released)
- Button to release results when status is "submitted"
- Button to assign new assessment

## 🔒 Security Features Implemented

1. **Session-based authentication** with bcrypt password hashing
2. **Role-based access control** (admin, author, consumer)
3. **Consumers can ONLY see their own assessments**
4. **Results only visible after author/admin releases them**
5. **Assignment tracking** with author-consumer linkage
6. **Email invitations** when assessments are assigned
7. **Notifications** for assessment submissions and releases

## 📧 Email Configuration (Optional)

Add to `.env` file:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@databricks.com
FRONTEND_URL=http://localhost:3000
```

## 🧪 Testing

### 1. Test Admin Login
```
Email: admin@databricks.com
Password: admin123
```

### 2. Create Test Users
Use admin account to create:
- Author user
- Consumer user

### 3. Test Workflow
1. Author logs in
2. Assigns assessment to consumer (email invitation sent)
3. Consumer logs in and sees assignment
4. Consumer completes assessment
5. Author gets notification, reviews, and releases results
6. Consumer can now view results

## Next Steps

1. ✅ Complete database setup
2. ✅ Integrate login button into HomePage
3. ✅ Create MyAssessments component
4. ✅ Update GlobalNav for role-based visibility
5. ⬜ Create Author Dashboard (optional)
6. ⬜ Test complete workflow
7. ⬜ Add more granular permissions as needed


