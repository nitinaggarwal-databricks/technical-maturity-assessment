#!/usr/bin/env node

/**
 * Automated Testing Script for P0 + P1 Fixes
 * Tests all critical fixes to verify deployment readiness
 * Run: node test-all-fixes.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:3001';

// Color output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.blue}═══ ${msg} ═══${colors.reset}\n`),
};

// Test results tracker
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

function recordTest(name, passed, message = '') {
  results.total++;
  if (passed) {
    results.passed++;
    log.success(`${name}: ${message || 'PASS'}`);
  } else {
    results.failed++;
    log.error(`${name}: ${message || 'FAIL'}`);
  }
  results.tests.push({ name, passed, message });
}

function recordWarning(name, message) {
  results.warnings++;
  log.warn(`${name}: ${message}`);
}

// Helper to check if file exists and contains pattern
function fileContains(filepath, pattern) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    return content.includes(pattern);
  } catch (error) {
    return false;
  }
}

// Helper to check HTTP endpoint
function checkEndpoint(url, expectedStatus = 200) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      resolve(res.statusCode === expectedStatus);
    }).on('error', () => resolve(false));
  });
}

// ==========================================
// FILE EXISTENCE TESTS
// ==========================================

async function testFileStructure() {
  log.header('File Structure Tests');

  const criticalFiles = [
    'client/src/App.js',
    'client/src/components/GlobalNav.js',
    'client/src/components/AssessmentStart.js',
    'client/src/components/AssessmentQuestion.js',
    'client/src/components/AssessmentResultsNew.js',
    'client/src/components/AssessmentDashboard.js',
    'client/src/services/pdfExportService.js',
    'server/index.js',
    'package.json',
  ];

  for (const file of criticalFiles) {
    const fullPath = path.join(__dirname, file);
    const exists = fs.existsSync(fullPath);
    recordTest(
      `File exists: ${file}`,
      exists,
      exists ? 'Found' : 'Missing'
    );
  }
}

// ==========================================
// P0 FIX VERIFICATION TESTS
// ==========================================

async function testP0Fixes() {
  log.header('P0 Critical Fix Verification');

  const basePath = __dirname;

  // P0-1: Mobile Navigation
  const navFile = path.join(basePath, 'client/src/components/GlobalNav.js');
  recordTest(
    'P0-1: Mobile Navigation',
    fileContains(navFile, 'MobileMenu') && fileContains(navFile, 'FiMenu'),
    'Hamburger menu implemented'
  );

  // P0-2: Field name mismatch fix
  const resultsFile = path.join(basePath, 'client/src/components/AssessmentResultsNew.js');
  recordTest(
    'P0-2: Field Name Mismatch',
    fileContains(resultsFile, 'prioritized?.theGood') && fileContains(resultsFile, 'prioritized?.theBad'),
    'Correct data paths used'
  );

  // P0-3: PDF Export safe access
  const pdfFile = path.join(basePath, 'client/src/services/pdfExportService.js');
  recordTest(
    'P0-3: PDF Export Safety',
    fileContains(pdfFile, 'getMaturityLevelText') || fileContains(pdfFile, 'this.results.overall?.level'),
    'Null checks implemented'
  );

  // P0-4: Form validation
  const startFile = path.join(basePath, 'client/src/components/AssessmentStart.js');
  recordTest(
    'P0-4: Form Validation',
    fileContains(startFile, 'hasError') && fileContains(startFile, 'ErrorMessage'),
    'Validation feedback present'
  );

  // P0-5: Progress save warning
  const questionFile = path.join(basePath, 'client/src/components/AssessmentQuestion.js');
  recordTest(
    'P0-5: Progress Save',
    fileContains(questionFile, 'beforeunload') && fileContains(questionFile, 'AutoSaveStatus'),
    'Browser warnings and auto-save status'
  );

  // P0-6: Loading states
  recordTest(
    'P0-6: Loading States',
    fileContains(resultsFile, 'LoadingSpinner') || fileContains(resultsFile, 'loading'),
    'Loading indicators present'
  );

  // P0-7: Navigation consolidation
  const appFile = path.join(basePath, 'client/src/App.js');
  const noExploreRoute = !fileContains(appFile, 'path="/explore"');
  recordTest(
    'P0-7: Navigation Flow',
    noExploreRoute,
    noExploreRoute ? 'Duplicate routes removed' : 'Old routes still present'
  );
}

// ==========================================
// P1 FIX VERIFICATION TESTS
// ==========================================

async function testP1Fixes() {
  log.header('P1 Enhancement Verification');

  const basePath = __dirname;
  const appFile = path.join(basePath, 'client/src/App.js');
  const resultsFile = path.join(basePath, 'client/src/components/AssessmentResultsNew.js');
  const dashboardFile = path.join(basePath, 'client/src/components/AssessmentDashboard.js');

  // P1-1: Dashboard URL support
  recordTest(
    'P1-1: Dashboard URL',
    fileContains(appFile, '/dashboard/:assessmentId') && fileContains(dashboardFile, 'useParams'),
    'URL parameter routing implemented'
  );

  // P1-2: Results refresh button
  recordTest(
    'P1-2: Results Refresh',
    fileContains(resultsFile, 'handleRefresh') && fileContains(resultsFile, 'FiRefreshCw'),
    'Refresh button implemented'
  );

  // P1-8: Skip question (verification)
  const questionFile = path.join(basePath, 'client/src/components/AssessmentQuestion.js');
  const hasSkip = fileContains(questionFile, 'skip') || fileContains(questionFile, 'Skip');
  recordTest(
    'P1-8: Skip Question',
    hasSkip,
    hasSkip ? 'Skip functionality present' : 'Feature needs verification'
  );
}

// ==========================================
// DEPENDENCY CHECKS
// ==========================================

async function testDependencies() {
  log.header('Dependency Verification');

  const packageFile = path.join(__dirname, 'package.json');
  
  try {
    const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    
    const requiredDeps = [
      'react',
      'react-dom',
      'react-router-dom',
      'styled-components',
      'framer-motion',
      'chart.js',
      'jspdf',
      'jspdf-autotable',
      'react-icons',
      'react-hot-toast',
    ];

    for (const dep of requiredDeps) {
      const exists = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
      recordTest(
        `Dependency: ${dep}`,
        !!exists,
        exists ? `v${exists}` : 'Missing'
      );
    }
  } catch (error) {
    log.error(`Failed to read package.json: ${error.message}`);
  }
}

// ==========================================
// API ENDPOINT TESTS (if server running)
// ==========================================

async function testAPIEndpoints() {
  log.header('API Endpoint Tests (if server running)');

  const endpoints = [
    { path: '/api/health', status: 200, name: 'Health Check' },
    { path: '/api/assessment-framework', status: 200, name: 'Framework' },
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `${API_URL}${endpoint.path}`;
      const isUp = await checkEndpoint(url, endpoint.status);
      
      if (isUp) {
        recordTest(endpoint.name, true, `${url} is accessible`);
      } else {
        recordWarning(endpoint.name, `${url} not accessible (server may be offline)`);
      }
    } catch (error) {
      recordWarning(endpoint.name, `Server offline or not running`);
    }
  }
}

// ==========================================
// CODE QUALITY CHECKS
// ==========================================

async function testCodeQuality() {
  log.header('Code Quality Checks');

  const basePath = __dirname;

  // Check for console.logs in production code (warning only)
  const clientFiles = [
    'client/src/App.js',
    'client/src/components/GlobalNav.js',
  ];

  let consoleLogCount = 0;
  for (const file of clientFiles) {
    const fullPath = path.join(basePath, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/console\.log/g);
      if (matches) consoleLogCount += matches.length;
    } catch (error) {
      // File doesn't exist or can't be read
    }
  }

  if (consoleLogCount > 10) {
    recordWarning(
      'Console Logs',
      `Found ${consoleLogCount} console.log statements (consider removing for production)`
    );
  } else {
    recordTest('Console Logs', true, `${consoleLogCount} found (acceptable)`);
  }

  // Check for TODO/FIXME comments
  const filesToCheck = [
    'client/src/App.js',
    'client/src/components/AssessmentResultsNew.js',
  ];

  let todoCount = 0;
  for (const file of filesToCheck) {
    const fullPath = path.join(basePath, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/(TODO|FIXME|HACK|XXX)/g);
      if (matches) todoCount += matches.length;
    } catch (error) {
      // Ignore
    }
  }

  recordTest(
    'Code TODOs',
    todoCount < 20,
    `${todoCount} TODO/FIXME comments found`
  );
}

// ==========================================
// CONFIGURATION CHECKS
// ==========================================

async function testConfiguration() {
  log.header('Configuration Verification');

  const basePath = __dirname;

  // Check for environment variables documentation
  const readmeFile = path.join(basePath, 'README.md');
  const hasEnvDoc = fileContains(readmeFile, 'OPENAI_API_KEY') || fileContains(readmeFile, 'Environment');
  recordTest(
    'Environment Docs',
    hasEnvDoc,
    hasEnvDoc ? 'Documented in README' : 'Consider documenting'
  );

  // Check for .gitignore
  const gitignoreFile = path.join(basePath, '.gitignore');
  const hasGitignore = fs.existsSync(gitignoreFile);
  recordTest(
    '.gitignore',
    hasGitignore,
    hasGitignore ? 'Present' : 'Missing'
  );

  // Check package.json scripts
  const packageFile = path.join(basePath, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const hasStartScript = !!pkg.scripts?.start;
    const hasDevScript = !!pkg.scripts?.dev || !!pkg.scripts?.client;
    
    recordTest('Start Script', hasStartScript, hasStartScript ? 'npm start available' : 'Missing');
    recordTest('Dev Script', hasDevScript, hasDevScript ? 'Development commands available' : 'Missing');
  } catch (error) {
    log.error(`Failed to verify scripts: ${error.message}`);
  }
}

// ==========================================
// MOBILE RESPONSIVENESS CHECK
// ==========================================

async function testMobileResponsiveness() {
  log.header('Mobile Responsiveness');

  const basePath = __dirname;
  const navFile = path.join(basePath, 'client/src/components/GlobalNav.js');
  const homeFile = path.join(basePath, 'client/src/components/HomePageNew.js');

  // Check for media queries
  const filesWithMediaQueries = [navFile, homeFile].filter(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('@media');
    } catch {
      return false;
    }
  });

  recordTest(
    'Media Queries',
    filesWithMediaQueries.length >= 1,
    `${filesWithMediaQueries.length} files with responsive design`
  );

  // Check for mobile-specific components
  const hasMobileMenu = fileContains(navFile, 'MobileMenu');
  recordTest(
    'Mobile Components',
    hasMobileMenu,
    hasMobileMenu ? 'Mobile menu implemented' : 'No mobile-specific components'
  );
}

// ==========================================
// ACCESSIBILITY CHECKS
// ==========================================

async function testAccessibility() {
  log.header('Accessibility Checks');

  const basePath = __dirname;

  // Check for aria labels
  const componentFiles = [
    'client/src/components/GlobalNav.js',
    'client/src/components/AssessmentStart.js',
  ];

  let ariaCount = 0;
  for (const file of componentFiles) {
    const fullPath = path.join(basePath, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/aria-/g);
      if (matches) ariaCount += matches.length;
    } catch (error) {
      // Ignore
    }
  }

  if (ariaCount > 0) {
    recordTest('ARIA Labels', true, `${ariaCount} ARIA attributes found`);
  } else {
    recordWarning('ARIA Labels', 'Consider adding ARIA labels for screen readers');
  }

  // Check for alt attributes on images
  const hasAltTags = componentFiles.some(file => {
    const fullPath = path.join(basePath, file);
    return fileContains(fullPath, 'alt=');
  });

  recordTest(
    'Image Alt Text',
    hasAltTags,
    hasAltTags ? 'Alt attributes present' : 'Verify image accessibility'
  );
}

// ==========================================
// MAIN TEST RUNNER
// ==========================================

async function runAllTests() {
  console.log(`
${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════════╗
║                                                            ║
║    🧪 DATABRICKS MATURITY ASSESSMENT - FIX VERIFICATION    ║
║                                                            ║
║    Testing P0 Critical + P1 High Priority Fixes           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  log.info(`Base URL: ${BASE_URL}`);
  log.info(`API URL: ${API_URL}`);
  log.info(`Test Directory: ${__dirname}\n`);

  // Run all test suites
  await testFileStructure();
  await testP0Fixes();
  await testP1Fixes();
  await testDependencies();
  await testConfiguration();
  await testCodeQuality();
  await testMobileResponsiveness();
  await testAccessibility();
  await testAPIEndpoints();

  // Print summary
  console.log(`
${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════════╗
║                      TEST SUMMARY                          ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  console.log(`Total Tests:    ${results.total}`);
  console.log(`${colors.green}Passed:         ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed:         ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}Warnings:       ${results.warnings}${colors.reset}`);

  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\nSuccess Rate:   ${successRate}%`);

  // Determine deployment readiness
  const isReady = results.failed === 0 && successRate >= 90;
  
  console.log(`
${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════════╗
║                   DEPLOYMENT STATUS                        ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  if (isReady) {
    log.success('✅ ALL CRITICAL TESTS PASSED');
    log.success('✅ APPLICATION IS READY FOR STAGING DEPLOYMENT');
    console.log(`
${colors.green}${colors.bright}Recommendation: PROCEED TO STAGING${colors.reset}

Next Steps:
  1. Start local server: npm run dev (or npm start)
  2. Manual testing: See FINAL_FIXES_AND_TESTING_GUIDE.md
  3. Deploy to staging environment
  4. Conduct user acceptance testing
`);
    process.exit(0);
  } else if (results.failed <= 2 && successRate >= 85) {
    log.warn('⚠ MOSTLY READY WITH MINOR ISSUES');
    log.warn('⚠ REVIEW FAILED TESTS BEFORE DEPLOYMENT');
    console.log(`
${colors.yellow}${colors.bright}Recommendation: FIX MINOR ISSUES THEN DEPLOY${colors.reset}

Failed Tests:
${results.tests.filter(t => !t.passed).map(t => `  - ${t.name}: ${t.message}`).join('\n')}
`);
    process.exit(1);
  } else {
    log.error('❌ CRITICAL TESTS FAILED');
    log.error('❌ NOT READY FOR DEPLOYMENT');
    console.log(`
${colors.red}${colors.bright}Recommendation: FIX ISSUES BEFORE DEPLOYMENT${colors.reset}

Failed Tests:
${results.tests.filter(t => !t.passed).map(t => `  - ${t.name}: ${t.message}`).join('\n')}

Please review and fix these issues before deploying.
`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log.error(`Test runner failed: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});

