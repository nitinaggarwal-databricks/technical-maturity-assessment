/**
 * Script to generate test data for Dashboard testing
 * This will create multiple sample assessments with varied completion levels and dates
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const NUM_ASSESSMENTS = 15; // Generate 15 assessments for good dashboard data

// Sample organization names
const organizations = [
  'Acme Corporation',
  'TechCorp Industries',
  'Global Finance Inc',
  'Healthcare Systems LLC',
  'Retail Dynamics',
  'Manufacturing Solutions',
  'Energy Innovations',
  'Telecom Networks',
  'Insurance Group',
  'Media Entertainment',
  'Transportation Services',
  'Education Platform',
  'Real Estate Holdings',
  'Pharmaceutical Research',
  'Automotive Systems'
];

// Sample industries
const industries = [
  'Financial Services',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Technology',
  'Energy',
  'Telecommunications',
  'Insurance',
  'Media & Entertainment',
  'Transportation',
  'Education',
  'Real Estate',
  'Pharmaceuticals',
  'Automotive',
  'Consumer Goods'
];

// Sample email domains
const emailDomains = [
  'acme.com',
  'techcorp.com',
  'globalfinance.com',
  'healthsys.com',
  'retaildynamics.com',
  'mfgsolutions.com',
  'energyinno.com',
  'telecomnet.com',
  'insuregrp.com',
  'mediaent.com',
  'transports.com',
  'eduplatform.com',
  'realestate.com',
  'pharmaresearch.com',
  'autosys.com'
];

// Completion levels
const completionLevels = ['full', 'partial', 'minimal'];

// Function to generate random date in the past N days
function randomDateInPast(daysAgo) {
  const now = Date.now();
  const randomDays = Math.floor(Math.random() * daysAgo);
  return new Date(now - (randomDays * 24 * 60 * 60 * 1000));
}

// Function to generate sample assessment
async function generateSampleAssessment(index) {
  try {
    const org = organizations[index];
    const industry = industries[index];
    const emailDomain = emailDomains[index];
    
    // Vary completion levels
    let completionLevel;
    if (index < 5) {
      completionLevel = 'full'; // First 5 are full
    } else if (index < 10) {
      completionLevel = 'partial'; // Next 5 are partial
    } else {
      completionLevel = 'minimal'; // Last 5 are minimal
    }
    
    // Vary dates - spread over last 60 days
    const daysAgo = 60;
    
    console.log(`\n[${index + 1}/${NUM_ASSESSMENTS}] Generating ${completionLevel} assessment for ${org}...`);
    
    const response = await axios.post(`${API_BASE_URL}/assessment/generate-sample`, {
      completionLevel,
      organizationName: org,
      industry,
      contactEmail: `admin@${emailDomain}`,
      assessmentName: `${org} - Technical Maturity Assessment`
    });
    
    if (response.data.success) {
      const assessmentId = response.data.assessment?.id;
      console.log(`✅ Created assessment: ${assessmentId}`);
      console.log(`   Organization: ${org}`);
      console.log(`   Industry: ${industry}`);
      console.log(`   Completion: ${completionLevel}`);
      console.log(`   Progress: ${response.data.assessment?.completedCategories?.length || 0}/6 pillars`);
      
      return {
        success: true,
        assessmentId,
        org,
        completionLevel
      };
    } else {
      console.error(`❌ Failed to create assessment for ${org}`);
      return { success: false, org };
    }
  } catch (error) {
    console.error(`❌ Error generating assessment ${index + 1}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main function
async function generateAllAssessments() {
  console.log('='.repeat(80));
  console.log('GENERATING TEST DATA FOR DASHBOARD');
  console.log('='.repeat(80));
  console.log(`API URL: ${API_BASE_URL}`);
  console.log(`Number of assessments: ${NUM_ASSESSMENTS}`);
  console.log('='.repeat(80));
  
  const results = [];
  
  // Generate assessments sequentially to avoid overwhelming the server
  for (let i = 0; i < NUM_ASSESSMENTS; i++) {
    const result = await generateSampleAssessment(i);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('GENERATION COMPLETE');
  console.log('='.repeat(80));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successfully created: ${successful} assessments`);
  console.log(`❌ Failed: ${failed} assessments`);
  
  console.log('\n📊 BREAKDOWN BY COMPLETION LEVEL:');
  console.log(`   Full (5): ${results.filter(r => r.success && r.completionLevel === 'full').length}`);
  console.log(`   Partial (5): ${results.filter(r => r.success && r.completionLevel === 'partial').length}`);
  console.log(`   Minimal (5): ${results.filter(r => r.success && r.completionLevel === 'minimal').length}`);
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Navigate to the Dashboard: http://localhost:3000/insights-dashboard');
  console.log('2. Or on Railway: https://web-production-76e27.up.railway.app/insights-dashboard');
  console.log('3. Refresh the page to see updated metrics');
  console.log('4. All KPIs, charts, and tables should now show real data');
  console.log('='.repeat(80));
}

// Run the script
generateAllAssessments().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});



