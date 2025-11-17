# Databricks Technical Maturity Assessment - User Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Complete User Workflows](#complete-user-workflows)
5. [Key Features by Role](#key-features-by-role)
6. [Navigation Guide](#navigation-guide)
7. [Reports & Analytics](#reports--analytics)
8. [Tips & Best Practices](#tips--best-practices)

---

## Overview

The Databricks Technical Maturity Assessment is a comprehensive tool designed to evaluate your organization's data analytics maturity across 6 key pillars:

- 🏗️ **Platform & Governance** - Infrastructure, security, and compliance
- 📊 **Data Engineering** - Ingestion, transformation, and quality
- 🤖 **Machine Learning** - ML lifecycle and model management
- 🧠 **GenAI & Advanced Analytics** - AI capabilities and innovation
- 👥 **Enablement & Adoption** - Training and organizational readiness
- 📈 **Business Value & Strategy** - ROI and strategic alignment

---

## Getting Started

### First Time Login

1. **Navigate to the application** (Railway URL or localhost:3000)
2. **Click "Login"** in the top right corner
3. **Enter your credentials**:
   - Email and password provided by your administrator
   - OR use test credentials (see below)

### Test Accounts

For testing purposes, three accounts are available:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Admin** | admin@test.com | admin123 | Full system access, user management |
| **Author** | author@test.com | author123 | Create and assign assessments |
| **Consumer** | consumer@test.com | consumer123 | Take assessments and view results |

---

## User Roles & Permissions

### 👑 Admin
**Full system access with all capabilities**

✅ **Can do:**
- Everything Authors and Consumers can do
- Manage users (create, edit, delete)
- View all assessments across the organization
- Assign assessments to any user
- Access admin-only features (Question Manager, Feedback Dashboard)
- Switch roles to test Author/Consumer experiences
- Export/import assessments via Excel
- View assessment history and audit trails

### ✍️ Author
**Assessment creators and managers**

✅ **Can do:**
- Create new assessments
- Assign assessments to consumers
- View and edit their own assessments
- Access all reports for their assessments
- Clone existing assessments
- Delete their own assessments

❌ **Cannot do:**
- Manage users
- Access admin features
- View other authors' assessments

### 👤 Consumer
**Assessment takers**

✅ **Can do:**
- Take assigned assessments
- View their own assessment results
- Access all reports for their assessments
- Continue incomplete assessments
- Provide feedback

❌ **Cannot do:**
- Create or assign assessments
- Manage users
- Access admin features
- View other users' assessments

---

## Complete User Workflows

### 🎯 Workflow 1: Admin Creates & Assigns Assessment

**Step 1: Create a New Assessment**
1. Click **"Dashboard"** in the top navigation
2. Click **"+ New Assessment"** button
3. Fill in the assessment details:
   - **Assessment Name**: e.g., "Q4 2025 Maturity Review"
   - **Organization Name**: Your company name
   - **Industry**: Select from dropdown
   - **Company Size**: Select employee count range
   - **Region**: Geographic location
4. Click **"Create Assessment"**

**Step 2: Assign to a Consumer**
1. From the Dashboard, find your new assessment
2. Click the **"Assign"** icon (person with plus sign)
3. In the assignment modal:
   - **Select existing consumer** from dropdown OR
   - **Create new consumer** by entering:
     - First Name
     - Last Name
     - Email
     - Organization
4. Click **"Assign Assessment"**
5. Consumer receives access to the assessment

**Step 3: Monitor Progress**
1. Go to **"Dashboard"** to see all assessments
2. View progress percentage for each assessment
3. Click **"View Report"** to see results (available when progress > 0%)

---

### 📝 Workflow 2: Consumer Takes Assessment

**Step 1: Access Your Assessment**
1. Log in with your consumer credentials
2. Click **"Assessments"** → **"My Assessments"**
3. You'll see all assessments assigned to you
4. Click **"Continue Assessment"** or **"Start Assessment"**

**Step 2: Navigate Through Pillars**
1. Assessment is organized into **6 pillars**
2. Each pillar has **10 questions** (60 total)
3. Click on a pillar to begin (e.g., "Platform & Governance")

**Step 3: Answer Questions**
For each question, you'll provide:

1. **Current State** (Required)
   - Select maturity level: Level 1 (Ad-hoc) → Level 5 (Optimized)
   - Describes where you are today

2. **Future State** (Required)
   - Select target maturity level
   - Describes where you want to be in 12-18 months

3. **Technical Pain Points** (Optional)
   - Select applicable challenges
   - Examples: "Manual processes", "Scalability issues", "Security gaps"

4. **Business Pain Points** (Optional)
   - Select business impacts
   - Examples: "High costs", "Slow time-to-market", "Compliance risks"

5. **Notes** (Optional)
   - Add context, specific examples, or additional details
   - Very helpful for generating tailored recommendations

**Step 4: Navigate Between Questions**
- Use **"Previous"** and **"Next"** buttons
- Or click question numbers (circles) at the top
- **"Skip"** button to skip a question
- Progress auto-saves

**Step 5: Complete the Assessment**
1. Answer all questions across all 6 pillars
2. You can complete pillars in any order
3. Green checkmarks indicate completed pillars
4. Click **"View Results"** when ready

---

### 📊 Workflow 3: Viewing & Understanding Reports

Once an assessment has progress > 0%, multiple reports become available:

#### **1. Maturity Report (Main Results Page)**

**Access**: Click **"View Report"** from Dashboard

**What you'll see:**
- **Overall Maturity Score**: Your current level (1.0 - 5.0)
- **Target Maturity**: Where you want to be
- **Improvement Potential**: Gap to close
- **Pillar Breakdown**: Scores for each of 6 pillars
- **Recommendations**: AI-generated next steps for each pillar
- **Next Steps**: Specific actions to take

**Key Actions:**
- **"Executive Command Center"**: High-level executive summary
- **"Industry Benchmarks"**: Compare to industry peers
- **"Edit Assessment"**: Modify your responses
- **"History"**: View all changes and audit trail
- **"Refresh"**: Regenerate recommendations
- **"Export Excel"**: Download for offline analysis
- **"Slideshow"**: Present results in slideshow mode

#### **2. Executive Command Center**

**Access**: Click **"Executive Command Center"** from Maturity Report

**What you'll see:**
- **Executive Dashboard**: Key metrics at a glance
- **Top 3 Strategic Imperatives**: Priority actions
- **Strategic Roadmap**: 3-phase implementation plan
  - Phase 1: Foundation (0-6 months)
  - Phase 2: Acceleration (6-12 months)
  - Phase 3: Optimization (12-18 months)
- **ROI Calculator**: Financial impact projections
- **Risk Heatmap**: Risk assessment by pillar
- **Business Impact Metrics**: 6 key business outcomes

**Key Actions:**
- **"Slideshow"**: Present to executives
- **"Full Report"**: Return to detailed report
- **"Industry Benchmarks"**: View competitive position

#### **3. Industry Benchmarks**

**Access**: Click **"Industry Benchmarks"** from Maturity Report or Executive Command Center

**What you'll see:**
- **Executive Summary**: Your position vs. industry
- **Competitive Position**: Percentile ranking
- **Detailed Pillar Analysis**: 6 pillar comparisons
- **Competitive Vulnerabilities**: Areas of weakness
- **Strategic Recommendations**: Actions to improve position
- **Methodology**: How benchmarks are calculated

**Key Actions:**
- **"Slideshow"**: Present benchmarking insights
- **"Full Report"**: Return to main report

#### **4. Deep Dive (Technical Details)**

**Access**: Click **"Deep Dive"** in top navigation (when in an assessment)

**What you'll see:**
- **Strategic Objectives**: High-level goals
- **Category Structure**: Detailed breakdown of all dimensions
- **Technical Success Plan**: 2-phase technical roadmap
- **Engagement & Enablement Plan**: Training and adoption strategy
- **Analysis & Actions**: Detailed recommendations by pillar
- **Maturity Matrices**: Visual maturity assessment for each pillar

**Key Actions:**
- **"Slideshow"**: Present technical details

#### **5. Insights Dashboard (Analytics)**

**Access**: Click **"Dashboard"** in top navigation

**What you'll see:**
- **Total Assessments**: Count across organization
- **Completed**: Number of finished assessments
- **Avg Maturity Score**: Organization-wide average
- **Avg Completion Time**: Time to complete assessments
- **Industry Breakdown**: Assessments by industry
- **Top Performers**: Highest-scoring assessments
- **Pillar Performance**: Average scores by pillar
- **Key Trends**: Patterns across assessments
- **Common Focus Areas**: Most frequently addressed areas
- **Industry Insights**: Sector-specific analysis
- **Maturity Distribution**: Score distribution histogram

**Key Actions:**
- **"Slideshow"**: Present dashboard insights

---

### 🔄 Workflow 4: Editing & Updating Assessments

**Option A: Edit via Web Interface**
1. Open your assessment
2. Navigate to any question
3. **Admins only**: See **Edit** and **Delete** icons on questions
4. Click **Edit** icon (pencil)
5. Modify question text, options, or pain points
6. Click **Save** (checkmark icon)
7. Reports automatically regenerate

**Option B: Edit via Excel (Bulk Updates)**
1. From Dashboard, click **Excel** icon (download) on an assessment
2. Excel file downloads with all questions and responses
3. **Edit in Excel**:
   - Modify notes (Column N)
   - Update current/future states
   - Change pain point selections
   - **Do NOT edit Columns A-C** (Pillar, Dimension, Question) - these are identifiers
4. Save the Excel file
5. Click **Import** icon (upload) on the same assessment
6. Select your edited Excel file
7. Changes are imported and reports regenerate

---

### 📜 Workflow 5: Viewing Assessment History

**Access**: Click **"History"** button from Maturity Report

**What you'll see:**
- **Timeline**: Chronological list of all changes
- **Event Types**:
  - ✅ Pillar Completed
  - 📝 Response Updated
  - 📊 Assessment Started
  - 🔄 Assessment Refreshed
  - 📥 Excel Imported
  - ✏️ Question Edited
  - 🗑️ Question Deleted

**For each event:**
- **Timestamp**: When it happened
- **User**: Who made the change
- **Changes Made**: Specific details (before → after)
- **Impact Analysis**: What reports were affected and how
- **Snapshots**: Before and after state

**Use Cases:**
- Audit trail for compliance
- Track progress over time
- Understand what changed and why
- Rollback if needed (future feature)

---

### 🎨 Workflow 6: Using Slideshow Mode

**Purpose**: Present results in a professional, full-screen slideshow format

**How to Use:**
1. Navigate to any report page:
   - Maturity Report
   - Executive Command Center
   - Industry Benchmarks
   - Deep Dive
   - Insights Dashboard
2. Click the **"Slideshow"** button (purple, top right)
3. Slideshow starts full-screen

**Navigation:**
- **Arrow Keys**: Left/Right to navigate slides
- **On-screen Arrows**: Click left/right arrows (appear on hover)
- **Escape Key**: Exit slideshow
- **Exit Button**: Click X in top right (appears on hover)
- **Slide Counter**: Bottom right shows current slide (e.g., "1 / 20")

**Print to PDF:**
1. In slideshow mode, hover to reveal controls
2. Click **"Print"** button (green, top right)
3. PDF generates with all slides
4. Each slide = 1 page in PDF
5. Save or print the PDF

---

### 🎯 Workflow 7: Admin-Only Features

#### **A. User Management**

**Access**: Admin dropdown → **"User Management"**

**Actions:**
- **View all users**: See complete user list
- **Create new user**: Click "+ Add User"
- **Edit user**: Click edit icon
- **Delete user**: Click delete icon
- **Filter by role**: Admin, Author, Consumer

#### **B. Question Manager**

**Access**: Admin dropdown → **"Question Manager"**

**Purpose**: Create custom questions for specific assessments

**Actions:**
1. **Create Custom Question**:
   - Click "+ Add New Question"
   - Enter question text
   - Select pillar (Platform, Data Engineering, ML, etc.)
   - Define maturity levels (Current/Future State options)
   - Add technical pain points
   - Add business pain points
   - Add notes placeholder text
   - Preview how it will appear to users
   - Click "Create Question"

2. **Generate Sample Question**:
   - Click "Sample Question" for any pillar
   - System generates a fully-formed example question
   - Edit as needed
   - Save to question bank

3. **Assign to Assessments**:
   - Click "View Assignments" on a question
   - Select which assessments should include this question
   - Choose pillar placement
   - Save assignments

4. **Edit/Delete Questions**:
   - Click edit icon to modify
   - Click delete icon to remove (hard delete)

#### **C. Feedback Dashboard**

**Access**: Admin dropdown → **"View All Feedback"**

**What you'll see:**
- **Overall Score**: Combined feedback score
- **Response Analytics**: Charts showing Yes/Neutral/No responses
- **Individual Feedback**: Detailed user submissions
- **Free-text Comments**: User feedback in their own words

**Purpose**: Monitor user satisfaction and identify improvement areas

#### **D. Role Switching (Testing)**

**Access**: Admin dropdown → **"Switch to Author"** or **"Switch to Consumer"**

**Purpose**: Test the application from other user perspectives

**How it works:**
1. Click "Switch to Author" or "Switch to Consumer"
2. Your session switches to that role
3. You see exactly what that role sees
4. Click "Switch Back to Admin" to return

---

### 💬 Workflow 8: Using the AI Chatbot

**Access**: Bottom right corner of any page (purple chat icon)

**Purpose**: Get instant help and guidance

**What it can do:**
- Answer questions about the assessment
- Explain maturity levels
- Provide guidance on pain points
- Suggest best practices
- Help interpret results
- Advise on next steps

**How to use:**
1. Click the chat icon
2. Type your question
3. AI responds with contextual help
4. All conversations are saved to your profile

**Example questions:**
- "What does Level 3 maturity mean?"
- "How should I interpret my ML score?"
- "What are quick wins for Platform & Governance?"
- "How do I improve my benchmarking position?"

---

### 📝 Workflow 9: Providing Feedback

**Access**: Admin dropdown → **"Give Feedback"**

**Purpose**: Help improve the tool

**What you'll provide:**
1. **Your Information**:
   - Name
   - Email
   - Company

2. **6 Feedback Questions** (5 objective + 1 free-text):
   - Yes/No/Neutral responses
   - Final question: Open-ended feedback

3. Submit and done!

---

## Key Features by Role

### 🎯 Admin Features

| Feature | Location | Purpose |
|---------|----------|---------|
| User Management | Admin → User Management | Create, edit, delete users |
| Question Manager | Admin → Question Manager | Custom questions for assessments |
| Feedback Dashboard | Admin → View All Feedback | Monitor user satisfaction |
| Role Switching | Admin → Switch to [Role] | Test other user experiences |
| All Assessments View | Dashboard | See organization-wide assessments |
| Excel Export/Import | Dashboard → Icons | Bulk data management |
| Assessment History | Maturity Report → History | Audit trail and change tracking |
| Question Edit/Delete | Assessment Questions | Inline editing of questions |

### ✍️ Author Features

| Feature | Location | Purpose |
|---------|----------|---------|
| Create Assessment | Dashboard → + New Assessment | Start new assessments |
| Assign Assessment | Dashboard → Assign Icon | Give assessments to consumers |
| My Assessments | Assessments → My Assessments | View your assessments |
| Clone Assessment | Dashboard → Clone Icon | Duplicate existing assessments |
| All Reports | Maturity Report → Buttons | Access all analytics |
| Slideshow Mode | Any Report → Slideshow | Present results |

### 👤 Consumer Features

| Feature | Location | Purpose |
|---------|----------|---------|
| My Assessments | Assessments → My Assessments | View assigned assessments |
| Take Assessment | Assessment → Start/Continue | Answer questions |
| View Results | Dashboard → View Report | See maturity scores |
| All Reports | Maturity Report → Buttons | Access all analytics |
| Slideshow Mode | Any Report → Slideshow | Present results |
| Give Feedback | Admin → Give Feedback | Provide tool feedback |
| AI Chatbot | Bottom right icon | Get instant help |

---

## Navigation Guide

### Top Navigation Bar

| Item | Available To | Purpose |
|------|--------------|---------|
| **Home** | All | Return to homepage |
| **Overview** | All | Learn about the assessment |
| **How It Works** | All | Understand the methodology |
| **Framework** | All | View assessment framework |
| **Deep Dive** | All (in assessment) | Technical details |
| **Dashboard** | All | Analytics and assessment list |
| **Assessments** | All | Access assessments dropdown |
| **Assignments** | Admin, Author | Manage assignments |
| **Admin** | Based on role | User dropdown menu |

### Assessments Dropdown

| Item | Available To | Purpose |
|------|--------------|---------|
| **My Assessments** | All | Your assigned assessments |
| **All Assessments** | Admin | Organization-wide view |
| **New Assessment** | Admin, Author | Create new assessment |

### Admin Dropdown

| Item | Available To | Purpose |
|------|--------------|---------|
| **Switch to Author** | Admin | Test author experience |
| **Switch to Consumer** | Admin | Test consumer experience |
| **Switch Back to Admin** | Admin (in test mode) | Return to admin |
| **User Management** | Admin | Manage users |
| **Question Manager** | Admin | Custom questions |
| **Give Feedback** | All | Provide feedback |
| **View All Feedback** | Admin | See all feedback |
| **Change Password** | All | Update password |
| **Logout** | All | Sign out |
| **[Email]** | All | Shows current user |

---

## Reports & Analytics

### Report Comparison

| Report | Best For | Key Insights |
|--------|----------|--------------|
| **Maturity Report** | Detailed analysis | Pillar scores, recommendations, next steps |
| **Executive Command Center** | C-suite presentations | Strategic roadmap, ROI, business impact |
| **Industry Benchmarks** | Competitive analysis | Percentile ranking, vulnerabilities, positioning |
| **Deep Dive** | Technical teams | Technical roadmap, maturity matrices, detailed actions |
| **Insights Dashboard** | Portfolio view | Organization-wide trends, patterns, analytics |

### When to Use Each Report

**Maturity Report**: 
- First stop after completing assessment
- Detailed understanding of scores
- Specific recommendations

**Executive Command Center**:
- Board presentations
- Executive buy-in
- Strategic planning sessions
- Budget justification

**Industry Benchmarks**:
- Competitive positioning
- Market analysis
- Identifying gaps vs. peers
- Setting realistic targets

**Deep Dive**:
- Technical planning
- Implementation roadmaps
- Team workshops
- Detailed action planning

**Insights Dashboard**:
- Portfolio management
- Trend analysis
- Cross-organization comparisons
- Identifying patterns

---

## Tips & Best Practices

### 📝 For Taking Assessments

1. **Be Honest**: Accurate responses lead to better recommendations
2. **Use Notes**: Add context for more tailored insights
3. **Select Pain Points**: Helps prioritize recommendations
4. **Save Progress**: Assessment auto-saves, but click "Save" to be sure
5. **Complete Pillars**: Finish entire pillars for best results
6. **Set Realistic Targets**: Future state should be achievable in 12-18 months
7. **Involve Stakeholders**: Get input from different teams
8. **Take Your Time**: Quality over speed

### 📊 For Reviewing Results

1. **Start with Executive Command Center**: Get the big picture
2. **Dive into Details**: Use Maturity Report for specifics
3. **Compare to Industry**: Use Benchmarks to set context
4. **Print to PDF**: Use slideshow print feature for offline review
5. **Track Changes**: Use History to see progress over time
6. **Regenerate Reports**: Click "Refresh" after making changes
7. **Export to Excel**: For custom analysis or sharing

### 🎯 For Admins

1. **Create Test Assessments**: Practice before rolling out
2. **Use Role Switching**: Test from user perspectives
3. **Monitor Feedback**: Check feedback dashboard regularly
4. **Customize Questions**: Add organization-specific questions
5. **Review History**: Audit trail for compliance
6. **Export Data**: Regular backups via Excel
7. **Train Users**: Share this guide with your team

### ✍️ For Authors

1. **Descriptive Names**: Use clear assessment names (e.g., "Q4 2025 - Finance Dept")
2. **Accurate Metadata**: Fill in industry, size, region correctly
3. **Clone for Efficiency**: Duplicate similar assessments
4. **Monitor Progress**: Check dashboard regularly
5. **Follow Up**: Reach out to consumers if progress stalls

### 👤 For Consumers

1. **Ask for Help**: Use the AI chatbot for guidance
2. **Collaborate**: Discuss questions with your team
3. **Be Specific in Notes**: More detail = better recommendations
4. **Review Results**: Don't just complete and forget
5. **Share Insights**: Present results to stakeholders
6. **Provide Feedback**: Help improve the tool

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| **Next Question** | Right Arrow (in assessment) |
| **Previous Question** | Left Arrow (in assessment) |
| **Next Slide** | Right Arrow (in slideshow) |
| **Previous Slide** | Left Arrow (in slideshow) |
| **Exit Slideshow** | Escape |
| **Open Chatbot** | (Click icon - no shortcut) |

---

## Troubleshooting

### Common Issues

**"I can't see my assessment"**
- Check you're logged in with the correct account
- Verify the assessment was assigned to your email
- Contact your admin

**"My changes aren't saving"**
- Check your internet connection
- Try clicking "Save" explicitly
- Refresh the page and try again

**"Reports aren't updating"**
- Click the "Refresh" button on the report
- Clear browser cache (Cmd/Ctrl + Shift + R)
- Contact support if issue persists

**"Excel import failed"**
- Ensure you didn't modify columns A-C (Pillar, Dimension, Question)
- Check file format is .xlsx
- Verify no special characters in cells

**"Slideshow is blank"**
- Hard refresh the page (Cmd/Ctrl + Shift + R)
- Try a different browser
- Check if assessment has sufficient data

---

## Support & Contact

For technical support or questions:
- **Use the AI Chatbot**: Bottom right corner
- **Provide Feedback**: Admin → Give Feedback
- **Contact Admin**: Reach out to your organization's admin
- **Email Support**: nitin.aggarwal@databricks.com

---

## Version Information

**Current Version**: 2.2.0  
**Last Updated**: November 17, 2025  
**Key Features Added**:
- Floating slideshow buttons
- Enhanced impact analysis
- Inline question editing
- Excel export/import
- Assessment history tracking
- Custom questions
- AI chatbot
- Feedback system

---

**🎉 You're all set! Start your maturity assessment journey today!**

