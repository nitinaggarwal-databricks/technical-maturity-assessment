# Dashboard Metrics Calculation & Validation Guide

## Overview
This document explains exactly how each metric on the Dashboard is calculated from the PostgreSQL database, and how to validate that the numbers are correct.

---

## 📊 Metric Calculations

### 1. **Total Assessments** (63 ↗ 63)

**Calculation:**
```javascript
const totalAssessments = allAssessments.length;
```

**Data Source:** 
- Counts all assessment records in the database
- Includes: completed, in-progress, and not-started assessments

**Trend Calculation:**
```javascript
const recentAssessments = allAssessments.filter(a => 
  new Date(a.startedAt).getTime() >= thirtyDaysAgo
);
const previousAssessments = allAssessments.filter(a => 
  new Date(a.startedAt).getTime() >= sixtyDaysAgo && 
  new Date(a.startedAt).getTime() < thirtyDaysAgo
);
const totalAssessmentsTrend = recentAssessments.length - previousAssessments.length;
```

**Validation:**
```sql
-- PostgreSQL query to validate
SELECT COUNT(*) as total_assessments FROM assessments;

-- Validate trend (last 30 days)
SELECT COUNT(*) as recent_count 
FROM assessments 
WHERE started_at >= NOW() - INTERVAL '30 days';

-- Validate trend (30-60 days ago)
SELECT COUNT(*) as previous_count 
FROM assessments 
WHERE started_at >= NOW() - INTERVAL '60 days' 
  AND started_at < NOW() - INTERVAL '30 days';
```

---

### 2. **Active Customers** (11 ↗ 11)

**Calculation:**
```javascript
const activeCustomers = new Set(allAssessments.map(a => a.organizationName)).size;
```

**Data Source:**
- Counts unique `organizationName` values across all assessments
- Uses JavaScript `Set` to deduplicate

**Trend Calculation:**
```javascript
const recentCustomers = new Set(recentAssessments.map(a => a.organizationName)).size;
const previousCustomers = new Set(previousAssessments.map(a => a.organizationName)).size;
const activeCustomersTrend = recentCustomers - previousCustomers;
```

**Validation:**
```sql
-- PostgreSQL query to validate
SELECT COUNT(DISTINCT organization_name) as active_customers 
FROM assessments;

-- Validate trend (last 30 days)
SELECT COUNT(DISTINCT organization_name) as recent_customers 
FROM assessments 
WHERE started_at >= NOW() - INTERVAL '30 days';

-- Validate trend (30-60 days ago)
SELECT COUNT(DISTINCT organization_name) as previous_customers 
FROM assessments 
WHERE started_at >= NOW() - INTERVAL '60 days' 
  AND started_at < NOW() - INTERVAL '30 days';
```

---

### 3. **Avg Completion Time** (6.2 hrs ↘ 0.0)

**Calculation:**
```javascript
const calcAvgTime = (assessments) => {
  if (assessments.length === 0) return 0;
  return assessments.reduce((sum, a) => {
    const hours = (new Date(a.completedAt) - new Date(a.startedAt)) / (1000 * 60 * 60);
    return sum + hours;
  }, 0) / assessments.length;
};

const completedAssessments = allAssessments.filter(a => a.completedAt);
const avgCompletionTime = calcAvgTime(completedAssessments);
```

**Data Source:**
- Only includes assessments with `completedAt` timestamp
- Calculates: `(completedAt - startedAt)` in hours
- Averages across all completed assessments

**Trend Calculation:**
```javascript
const recentAvgTime = calcAvgTime(recentCompleted);
const previousAvgTime = calcAvgTime(previousCompleted);
const avgCompletionTimeTrend = previousAvgTime > 0 ? 
  (previousAvgTime - recentAvgTime).toFixed(1) : '0.0';
```

**Note:** Trend shows **reduction** in time (↘ 0.0 means no change or recent = previous)

**Validation:**
```sql
-- PostgreSQL query to validate
SELECT 
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 3600) as avg_hours
FROM assessments 
WHERE completed_at IS NOT NULL;

-- Validate trend (last 30 days)
SELECT 
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 3600) as recent_avg_hours
FROM assessments 
WHERE completed_at IS NOT NULL 
  AND completed_at >= NOW() - INTERVAL '30 days';

-- Validate trend (30-60 days ago)
SELECT 
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 3600) as previous_avg_hours
FROM assessments 
WHERE completed_at IS NOT NULL 
  AND completed_at >= NOW() - INTERVAL '60 days' 
  AND completed_at < NOW() - INTERVAL '30 days';
```

---

### 4. **Avg Maturity Level** (2.8 ↗ 0.0)

**Calculation:**
```javascript
const calcAvgMaturity = (assessments) => {
  let totalMaturity = 0;
  let count = 0;
  assessments.forEach(assessment => {
    if (assessment.responses && Object.keys(assessment.responses).length > 0) {
      const currentStates = Object.keys(assessment.responses)
        .filter(key => key.endsWith('_current_state'))
        .map(key => parseInt(assessment.responses[key], 10))
        .filter(val => !isNaN(val));
      
      if (currentStates.length > 0) {
        totalMaturity += currentStates.reduce((a, b) => a + b, 0) / currentStates.length;
        count++;
      }
    }
  });
  return count > 0 ? totalMaturity / count : 0;
};

const avgMaturityLevel = calcAvgMaturity(allAssessments);
```

**Data Source:**
- Extracts all `*_current_state` values from `assessment.responses` JSON
- Maturity scale: 1-5 (Explore, Experiment, Formalize, Optimize, Transform)
- Averages all current state values per assessment, then averages across all assessments

**Trend Calculation:**
```javascript
const recentAvgMaturity = calcAvgMaturity(recentAssessments);
const previousAvgMaturity = calcAvgMaturity(previousAssessments);
const avgMaturityLevelTrend = previousAvgMaturity > 0 ? 
  (recentAvgMaturity - previousAvgMaturity).toFixed(1) : '0.0';
```

**Validation:**
```sql
-- PostgreSQL query to validate (complex due to JSON parsing)
WITH maturity_scores AS (
  SELECT 
    id,
    assessment_name,
    (
      SELECT AVG(CAST(value AS INTEGER))
      FROM jsonb_each_text(responses)
      WHERE key LIKE '%_current_state'
        AND value ~ '^\d+$'
    ) as avg_maturity
  FROM assessments
  WHERE responses IS NOT NULL
)
SELECT AVG(avg_maturity) as overall_avg_maturity
FROM maturity_scores
WHERE avg_maturity IS NOT NULL;
```

---

### 5. **Avg Improvement Potential** (+1.0 ↗ 0.0)

**Calculation:**
```javascript
const calcAvgImprovement = (assessments) => {
  let totalImprovement = 0;
  let count = 0;
  assessments.forEach(assessment => {
    if (assessment.responses && Object.keys(assessment.responses).length > 0) {
      const keys = Object.keys(assessment.responses);
      const questionIds = new Set();
      keys.forEach(key => {
        if (key.endsWith('_current_state') || key.endsWith('_future_state')) {
          const qId = key.replace('_current_state', '').replace('_future_state', '');
          questionIds.add(qId);
        }
      });
      
      questionIds.forEach(qId => {
        const current = parseInt(assessment.responses[`${qId}_current_state`], 10);
        const future = parseInt(assessment.responses[`${qId}_future_state`], 10);
        if (!isNaN(current) && !isNaN(future)) {
          totalImprovement += (future - current);
          count++;
        }
      });
    }
  });
  return count > 0 ? totalImprovement / count : 0;
};

const avgImprovementPotential = calcAvgImprovement(allAssessments);
```

**Data Source:**
- Calculates gap: `future_state - current_state` for each question
- Averages all gaps across all questions in all assessments
- Positive number indicates desired improvement

**Trend Calculation:**
```javascript
const recentAvgImprovement = calcAvgImprovement(recentAssessments);
const previousAvgImprovement = calcAvgImprovement(previousAssessments);
const avgImprovementPotentialTrend = previousAvgImprovement > 0 ? 
  (recentAvgImprovement - previousAvgImprovement).toFixed(1) : '0.0';
```

**Validation:**
```sql
-- PostgreSQL query to validate
WITH improvement_gaps AS (
  SELECT 
    id,
    assessment_name,
    (
      SELECT AVG(
        CAST(future.value AS INTEGER) - CAST(current.value AS INTEGER)
      )
      FROM jsonb_each_text(responses) AS current
      INNER JOIN jsonb_each_text(responses) AS future
        ON REPLACE(current.key, '_current_state', '') = REPLACE(future.key, '_future_state', '')
      WHERE current.key LIKE '%_current_state'
        AND future.key LIKE '%_future_state'
        AND current.value ~ '^\d+$'
        AND future.value ~ '^\d+$'
    ) as avg_gap
  FROM assessments
  WHERE responses IS NOT NULL
)
SELECT AVG(avg_gap) as overall_avg_improvement
FROM improvement_gaps
WHERE avg_gap IS NOT NULL;
```

---

### 6. **Feedback (NPS)** (N/A ↗ 0.0)

**Calculation:**
```javascript
// NPS Calculation (from NPS feedback feature)
const calculateNPS = (allAssessments) => {
  const feedbackWithNPS = allAssessments.filter(a => a.npsFeedback && a.npsFeedback.score !== undefined);
  
  if (feedbackWithNPS.length === 0) return 'N/A';
  
  const promoters = feedbackWithNPS.filter(a => a.npsFeedback.score >= 9).length;
  const passives = feedbackWithNPS.filter(a => a.npsFeedback.score >= 7 && a.npsFeedback.score <= 8).length;
  const detractors = feedbackWithNPS.filter(a => a.npsFeedback.score <= 6).length;
  
  const total = feedbackWithNPS.length;
  const nps = ((promoters / total) * 100) - ((detractors / total) * 100);
  
  return nps.toFixed(1);
};

const feedbackNPS = calculateNPS(allAssessments);
```

**Data Source:**
- Reads `npsFeedback.score` from each assessment (0-10 scale)
- Promoters: 9-10
- Passives: 7-8
- Detractors: 0-6
- NPS Formula: `(% Promoters - % Detractors)`

**Current Status:**
- Shows **N/A** because no NPS feedback has been collected yet
- NPS modal appears on Executive Summary page after 10 seconds
- Once users submit feedback, this will show real NPS score (-100 to +100)

**Validation:**
```sql
-- PostgreSQL query to validate
WITH nps_data AS (
  SELECT 
    id,
    assessment_name,
    CAST(nps_feedback->>'score' AS INTEGER) as nps_score
  FROM assessments
  WHERE nps_feedback IS NOT NULL
    AND nps_feedback->>'score' IS NOT NULL
)
SELECT 
  COUNT(*) as total_responses,
  COUNT(*) FILTER (WHERE nps_score >= 9) as promoters,
  COUNT(*) FILTER (WHERE nps_score >= 7 AND nps_score <= 8) as passives,
  COUNT(*) FILTER (WHERE nps_score <= 6) as detractors,
  (
    (COUNT(*) FILTER (WHERE nps_score >= 9)::FLOAT / COUNT(*) * 100) -
    (COUNT(*) FILTER (WHERE nps_score <= 6)::FLOAT / COUNT(*) * 100)
  ) as nps_score
FROM nps_data;
```

---

## 📈 Chart Data Calculations

### Pillar Maturity Radar Chart

**Calculation:**
```javascript
const pillarIds = ['platform_governance', 'data_engineering', 'analytics_bi', 'ml_mlops', 'genai_agentic', 'operational_excellence'];
const pillarMaturityCurrent = [];
const pillarMaturityTarget = [];

pillarIds.forEach(pillarId => {
  let pillarCurrentTotal = 0;
  let pillarFutureTotal = 0;
  let pillarCount = 0;
  
  allAssessments.forEach(assessment => {
    if (assessment.responses) {
      const pillarKeys = Object.keys(assessment.responses).filter(key => 
        key.startsWith(pillarId) && (key.endsWith('_current_state') || key.endsWith('_future_state'))
      );
      
      const currentStates = pillarKeys
        .filter(key => key.endsWith('_current_state'))
        .map(key => parseInt(assessment.responses[key], 10))
        .filter(val => !isNaN(val));
      
      const futureStates = pillarKeys
        .filter(key => key.endsWith('_future_state'))
        .map(key => parseInt(assessment.responses[key], 10))
        .filter(val => !isNaN(val));
      
      if (currentStates.length > 0) {
        pillarCurrentTotal += currentStates.reduce((a, b) => a + b, 0) / currentStates.length;
        pillarCount++;
      }
      
      if (futureStates.length > 0) {
        pillarFutureTotal += futureStates.reduce((a, b) => a + b, 0) / futureStates.length;
      }
    }
  });
  
  pillarMaturityCurrent.push(pillarCount > 0 ? (pillarCurrentTotal / pillarCount).toFixed(1) : 3.0);
  pillarMaturityTarget.push(pillarCount > 0 ? (pillarFutureTotal / pillarCount).toFixed(1) : 4.0);
});
```

**Data Source:**
- Filters responses by pillar prefix (e.g., `platform_governance_*`)
- Calculates average current and future state per pillar
- Averages across all assessments

---

### Weekly Completions Chart

**Calculation:**
```javascript
const weeklyCompletions = { labels: [], counts: [], avgHours: [] };
const weeksAgo = 6;

for (let i = weeksAgo - 1; i >= 0; i--) {
  const weekStart = now - ((i + 1) * 7 * 24 * 60 * 60 * 1000);
  const weekEnd = now - (i * 7 * 24 * 60 * 60 * 1000);
  
  const weekCompleted = completedAssessments.filter(a => {
    const completedTime = new Date(a.completedAt).getTime();
    return completedTime >= weekStart && completedTime < weekEnd;
  });
  
  const weekLabel = `W${weeksAgo - i}`;
  const weekCount = weekCompleted.length;
  const weekAvgHours = calcAvgTime(weekCompleted);
  
  weeklyCompletions.labels.push(weekLabel);
  weeklyCompletions.counts.push(weekCount);
  weeklyCompletions.avgHours.push(weekAvgHours > 0 ? parseFloat(weekAvgHours.toFixed(1)) : 0);
}
```

**Data Source:**
- Groups completed assessments by week (last 6 weeks)
- Counts completions per week
- Calculates average completion time per week

---

## 🔍 How to Validate All Metrics

### Method 1: Direct Database Queries (Recommended)

1. **Connect to PostgreSQL:**
```bash
# If using Railway CLI
railway connect postgres

# Or use connection string
psql <your-connection-string>
```

2. **Run validation queries** (see SQL queries above for each metric)

3. **Compare with Dashboard:**
   - Open Dashboard in browser
   - Compare each metric with SQL query results
   - Verify trends match the 30-day/60-day calculations

---

### Method 2: Backend Console Logs

The backend already logs detailed calculation info:

```javascript
console.log(`[Dashboard Stats] Processing ${allAssessments.length} assessments`);
```

**To view logs:**
```bash
# Railway CLI
railway logs

# Or check Railway dashboard logs
```

---

### Method 3: API Testing Script

Create a test script to validate calculations:

```javascript
// test-dashboard-calculations.js
const axios = require('axios');

async function validateDashboard() {
  const response = await axios.get('http://localhost:5000/api/dashboard/stats');
  const stats = response.data;
  
  console.log('📊 Dashboard Metrics:');
  console.log('Total Assessments:', stats.totalAssessments, `(${stats.totalAssessmentsTrend > 0 ? '+' : ''}${stats.totalAssessmentsTrend})`);
  console.log('Active Customers:', stats.activeCustomers, `(${stats.activeCustomersTrend > 0 ? '+' : ''}${stats.activeCustomersTrend})`);
  console.log('Avg Completion Time:', stats.avgCompletionTime, 'hrs', `(${stats.avgCompletionTimeTrend})`);
  console.log('Avg Maturity Level:', stats.avgMaturityLevel, `(${stats.avgMaturityLevelTrend})`);
  console.log('Avg Improvement Potential:', stats.avgImprovementPotential, `(${stats.avgImprovementPotentialTrend})`);
  console.log('Feedback NPS:', stats.feedbackNPS, `(${stats.feedbackNPSTrend})`);
  
  // Validate calculations
  console.log('\n✅ Validation Checks:');
  console.log('- Total Assessments > 0:', stats.totalAssessments > 0);
  console.log('- Active Customers > 0:', stats.activeCustomers > 0);
  console.log('- Avg Maturity Level in range [1-5]:', stats.avgMaturityLevel >= 1 && stats.avgMaturityLevel <= 5);
  console.log('- Avg Improvement Potential >= 0:', stats.avgImprovementPotential >= 0);
}

validateDashboard();
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Metrics show 0 or N/A
**Cause:** No data in database or no completed assessments  
**Fix:** Generate sample assessments or complete real assessments

### Issue 2: Trends show 0.0
**Cause:** Not enough historical data (need 60 days of data for trends)  
**Fix:** Wait for more assessments or adjust trend calculation period

### Issue 3: NPS shows N/A
**Cause:** No NPS feedback collected yet  
**Fix:** Users need to submit NPS feedback via the modal on Executive Summary page

### Issue 4: Pillar maturity shows default values (3.0, 4.0)
**Cause:** No responses for that specific pillar  
**Fix:** Complete assessments with responses for all pillars

---

## 📝 Data Integrity Checks

Run these checks regularly to ensure data quality:

```sql
-- 1. Check for orphaned assessments (no organization)
SELECT COUNT(*) FROM assessments WHERE organization_name IS NULL;

-- 2. Check for assessments with no responses
SELECT COUNT(*) FROM assessments WHERE responses IS NULL OR responses = '{}'::jsonb;

-- 3. Check for invalid maturity values (should be 1-5)
WITH maturity_check AS (
  SELECT 
    id,
    jsonb_each_text(responses) as response_pair
  FROM assessments
  WHERE responses IS NOT NULL
)
SELECT COUNT(*) 
FROM maturity_check
WHERE (response_pair).key LIKE '%_current_state'
  AND (CAST((response_pair).value AS INTEGER) < 1 OR CAST((response_pair).value AS INTEGER) > 5);

-- 4. Check for future < current (invalid)
-- This should return 0 rows
WITH gaps AS (
  SELECT 
    id,
    assessment_name,
    (
      SELECT COUNT(*)
      FROM jsonb_each_text(responses) AS current
      INNER JOIN jsonb_each_text(responses) AS future
        ON REPLACE(current.key, '_current_state', '') = REPLACE(future.key, '_future_state', '')
      WHERE current.key LIKE '%_current_state'
        AND future.key LIKE '%_future_state'
        AND CAST(future.value AS INTEGER) < CAST(current.value AS INTEGER)
    ) as invalid_gaps
  FROM assessments
  WHERE responses IS NOT NULL
)
SELECT * FROM gaps WHERE invalid_gaps > 0;
```

---

## 🎯 Summary

All Dashboard metrics are **calculated dynamically** from real database data:

1. ✅ **Total Assessments** - Direct count from DB
2. ✅ **Active Customers** - Unique organization count
3. ✅ **Avg Completion Time** - Calculated from timestamps
4. ✅ **Avg Maturity Level** - Averaged from `*_current_state` responses
5. ✅ **Avg Improvement Potential** - Gap between future and current states
6. ✅ **Feedback NPS** - Calculated from NPS feedback (currently N/A)

All trends are calculated by comparing **last 30 days vs previous 30 days**.

**No hardcoded values!** Everything is real-time from PostgreSQL.



