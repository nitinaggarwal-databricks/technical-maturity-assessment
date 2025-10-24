import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Professional Databricks brand colors
const COLORS = {
  primary: '#FF3621',      // Databricks Red
  secondary: '#00A972',    // Databricks Green
  accent: '#1B3139',       // Dark Blue
  text: '#2C2C2C',
  lightGray: '#F5F5F5',
  mediumGray: '#999999',
  darkGray: '#666666',
  white: '#FFFFFF',
  blue: '#3B82F6',
  green: '#10B981',
  orange: '#F59E0B',
  red: '#EF4444'
};

// Maturity level colors
const MATURITY_COLORS = {
  1: '#EF4444',
  2: '#F59E0B',
  3: '#FFAA00',
  4: '#10B981',
  5: '#00A972'
};

class ProfessionalPDFExporter {
  constructor(results, assessmentInfo) {
    this.doc = new jsPDF('p', 'pt', 'a4');
    this.results = results;
    this.assessmentInfo = assessmentInfo;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margin = 50;
    this.contentWidth = this.pageWidth - 2 * this.margin;
    this.currentPage = 1;
  }

  // Generate the complete report
  generate() {
    this.addCoverPage();
    this.addExecutiveSummary();
    this.addMaturityOverview();
    this.addCurrentVsFuture();
    this.addPillarDetails();
    this.addRecommendations();
    this.addRoadmap();
    this.addMethodology();
    
    // Add page numbers
    this.addPageNumbers();
    
    return this.doc;
  }

  // Add header to pages (except cover)
  addHeader() {
    // Databricks logo placeholder (text-based)
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DATABRICKS', this.margin, 30);
    
    // Document title
    this.doc.setFontSize(8);
    this.doc.setTextColor(COLORS.darkGray);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Technical Maturity Assessment Report', this.pageWidth - this.margin, 30, { align: 'right' });
    
    // Divider line
    this.doc.setDrawColor(COLORS.mediumGray);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 40, this.pageWidth - this.margin, 40);
  }

  // Add footer with page numbers
  addPageNumbers() {
    const totalPages = this.doc.internal.getNumberOfPages();
    
    for (let i = 2; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(COLORS.mediumGray);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Page ${i} of ${totalPages}`,
        this.pageWidth / 2,
        this.pageHeight - 20,
        { align: 'center' }
      );
      
      // Confidential footer
      this.doc.text(
        'Confidential - For Internal Use Only',
        this.margin,
        this.pageHeight - 20
      );
      
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      this.doc.text(
        date,
        this.pageWidth - this.margin,
        this.pageHeight - 20,
        { align: 'right' }
      );
    }
  }

  // Cover Page
  addCoverPage() {
    // Background accent
    this.doc.setFillColor(COLORS.primary);
    this.doc.rect(0, 0, this.pageWidth, 200, 'F');
    
    // Main title
    this.doc.setTextColor(COLORS.white);
    this.doc.setFontSize(36);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Databricks', this.pageWidth / 2, 100, { align: 'center' });
    
    this.doc.setFontSize(28);
    this.doc.text('Technical Maturity', this.pageWidth / 2, 140, { align: 'center' });
    this.doc.text('Assessment Report', this.pageWidth / 2, 175, { align: 'center' });
    
    // Organization details
    this.doc.setFillColor(COLORS.lightGray);
    this.doc.rect(this.margin, 250, this.contentWidth, 150, 'F');
    
    this.doc.setTextColor(COLORS.text);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    
    let yPos = 280;
    const details = [
      ['Organization:', this.assessmentInfo.organizationName || 'Not Specified'],
      ['Assessment Date:', new Date(this.assessmentInfo.startedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
      ['Completion:', `${this.assessmentInfo.completionPercentage}% (${this.assessmentInfo.questionsAnswered}/${this.assessmentInfo.totalQuestions} questions)`],
      ['Overall Maturity:', `Level ${this.results.overall?.currentScore || 0}/5 - ${this.results.overall?.level?.level || 'Not Assessed'}`]
    ];
    
    details.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, this.margin + 20, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, this.margin + 150, yPos);
      yPos += 25;
    });
    
    // Executive summary box
    yPos = 450;
    this.doc.setFillColor(COLORS.accent);
    this.doc.rect(this.margin, yPos, this.contentWidth, 100, 'F');
    
    this.doc.setTextColor(COLORS.white);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('At a Glance', this.pageWidth / 2, yPos + 30, { align: 'center' });
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const summaryText = (this.results.summary || this.results.executiveSummary?.summary || 'Assessment in progress').substring(0, 200) + '...';
    const summaryLines = this.doc.splitTextToSize(summaryText, this.contentWidth - 40);
    this.doc.text(summaryLines, this.pageWidth / 2, yPos + 55, { align: 'center', maxWidth: this.contentWidth - 40 });
    
    // Footer
    this.doc.setTextColor(COLORS.mediumGray);
    this.doc.setFontSize(9);
    this.doc.text('Prepared by Data & AI Technical Maturity Assessment Platform', this.pageWidth / 2, this.pageHeight - 30, { align: 'center' });
  }

  // Executive Summary
  addExecutiveSummary() {
    this.doc.addPage();
    this.addHeader();
    
    let yPos = 60;
    
    // Section title
    this.addSectionTitle('Executive Summary', yPos);
    yPos += 50;
    
    // Key findings box
    this.doc.setFillColor(COLORS.lightGray);
    this.doc.rect(this.margin, yPos, this.contentWidth, 100, 'F');
    
    this.doc.setTextColor(COLORS.text);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Key Findings', this.margin + 15, yPos + 25);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const keyPoints = [
      `• Overall maturity level: ${this.results.overall?.level?.level || 'Not Assessed'} (${this.results.overall?.currentScore || 0}/5)`,
      `• ${this.assessmentInfo.completedPillars}/${this.assessmentInfo.totalPillars} pillars completed`,
      `• ${this.assessmentInfo.questionsAnswered} questions answered across ${this.assessmentInfo.pillarsWithResponses} pillar areas`,
      `• ${this.results.prioritizedActions?.length || 0} priority actions identified`
    ];
    
    yPos += 45;
    keyPoints.forEach(point => {
      this.doc.text(point, this.margin + 15, yPos);
      yPos += 20;
    });
    
    yPos += 30;
    
    // Summary text
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    const summaryLines = this.doc.splitTextToSize(this.results.summary, this.contentWidth);
    this.doc.text(summaryLines, this.margin, yPos);
    yPos += summaryLines.length * 15 + 30;
    
    // Maturity distribution
    if (yPos + 200 > this.pageHeight - 60) {
      this.doc.addPage();
      this.addHeader();
      yPos = 60;
    }
    
    this.addSubsectionTitle('Pillar Maturity Distribution', yPos);
    yPos += 30;
    
    // Create a table of pillar scores
    const pillarData = [];
    Object.keys(this.results.categoryDetails).forEach(pillarId => {
      const pillar = this.results.categoryDetails[pillarId];
      pillarData.push([
        pillar.name,
        `${pillar.currentScore || 0}/5`,
        `${pillar.futureScore || 0}/5`,
        pillar.level?.level || 'Not Assessed',
        pillar.isPartial ? '🔄 In Progress' : '✓ Complete'
      ]);
    });
    
    autoTable(this.doc, {
      startY: yPos,
      head: [['Pillar', 'Current', 'Future Vision', 'Maturity Level', 'Status']],
      body: pillarData,
      margin: { left: this.margin, right: this.margin },
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.accent,
        textColor: COLORS.white,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: COLORS.text
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray
      }
    });
  }

  // Maturity Overview with visualization
  addMaturityOverview() {
    this.doc.addPage();
    this.addHeader();
    
    let yPos = 60;
    
    this.addSectionTitle('Maturity Overview', yPos);
    yPos += 50;
    
    // Overall score visualization
    const scoreX = this.pageWidth / 2 - 100;
    const scoreY = yPos;
    const scoreRadius = 80;
    const overallScore = this.results.overall?.currentScore || 0;
    
    // Draw circular score indicator
    this.doc.setFillColor(MATURITY_COLORS[overallScore] || COLORS.mediumGray);
    this.doc.circle(scoreX + 100, scoreY + 80, scoreRadius, 'F');
    
    // Score text
    this.doc.setTextColor(COLORS.white);
    this.doc.setFontSize(48);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(overallScore.toString(), scoreX + 100, scoreY + 90, { align: 'center' });
    
    this.doc.setFontSize(16);
    this.doc.text('out of 5', scoreX + 100, scoreY + 110, { align: 'center' });
    
    // Maturity level description
    yPos = scoreY + 180;
    this.doc.setTextColor(COLORS.text);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.results.overall?.level?.level || 'Not Assessed', this.pageWidth / 2, yPos, { align: 'center' });
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.results.overall?.level?.description || 'Assessment in progress', this.pageWidth / 2, yPos + 25, { align: 'center' });
    
    yPos += 60;
    
    // Maturity levels reference
    this.addSubsectionTitle('Maturity Levels Framework', yPos);
    yPos += 30;
    
    const levelData = [
      ['Level 1', 'Initial', 'Ad-hoc processes, limited capabilities'],
      ['Level 2', 'Repeatable', 'Some processes defined, basic capabilities'],
      ['Level 3', 'Defined', 'Structured approach with established processes'],
      ['Level 4', 'Managed', 'Quantitatively managed, advanced capabilities'],
      ['Level 5', 'Optimizing', 'Continuous improvement, innovation-driven']
    ];
    
    autoTable(this.doc, {
      startY: yPos,
      head: [['Level', 'Name', 'Description']],
      body: levelData,
      margin: { left: this.margin, right: this.margin },
      theme: 'plain',
      headStyles: {
        fillColor: COLORS.accent,
        textColor: COLORS.white,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: COLORS.text
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 100, fontStyle: 'bold' },
        2: { cellWidth: 'auto' }
      }
    });
  }

  // Current vs Future State Analysis
  addCurrentVsFuture() {
    this.doc.addPage();
    this.addHeader();
    
    let yPos = 60;
    
    this.addSectionTitle('Current vs Future State Analysis', yPos);
    yPos += 50;
    
    // Gap analysis intro
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.text);
    const introText = 'This analysis compares your current capabilities against your future vision, highlighting areas for improvement and investment.';
    const introLines = this.doc.splitTextToSize(introText, this.contentWidth);
    this.doc.text(introLines, this.margin, yPos);
    yPos += introLines.length * 12 + 25;
    
    // Create comparison table
    const comparisonData = [];
    Object.keys(this.results.categoryDetails).forEach(pillarId => {
      const pillar = this.results.categoryDetails[pillarId];
      const currentScore = pillar.currentScore || 0;
      const futureScore = pillar.futureScore || 0;
      const gap = futureScore - currentScore;
      const gapText = gap > 0 ? `+${gap}` : gap.toString();
      const priority = gap >= 2 ? 'High' : gap >= 1 ? 'Medium' : 'Low';
      
      comparisonData.push([
        pillar.name || 'Unknown',
        currentScore.toString(),
        futureScore.toString(),
        gapText,
        priority
      ]);
    });
    
    autoTable(this.doc, {
      startY: yPos,
      head: [['Pillar', 'Current', 'Future Vision', 'Gap', 'Priority']],
      body: comparisonData,
      margin: { left: this.margin, right: this.margin },
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.accent,
        textColor: COLORS.white,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: COLORS.text
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 70, halign: 'center' },
        2: { cellWidth: 70, halign: 'center' },
        3: { cellWidth: 60, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 80, halign: 'center' }
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray
      },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === 'body') {
          const priority = data.cell.raw;
          if (priority === 'High') {
            data.cell.styles.textColor = COLORS.red;
            data.cell.styles.fontStyle = 'bold';
          } else if (priority === 'Medium') {
            data.cell.styles.textColor = COLORS.orange;
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = COLORS.green;
          }
        }
      }
    });
  }

  // Detailed Pillar Analysis
  addPillarDetails() {
    Object.keys(this.results.categoryDetails).forEach((pillarId, index) => {
      const pillar = this.results.categoryDetails[pillarId];
      
      this.doc.addPage();
      this.addHeader();
      
      let yPos = 60;
      
      // Pillar title
      this.addSectionTitle(`Pillar ${index + 1}: ${pillar.name}`, yPos);
      yPos += 40;
      
      // Score indicators
      const leftX = this.margin + 50;
      const rightX = this.pageWidth - this.margin - 150;
      
      // Current Score
      this.doc.setFillColor(COLORS.blue);
      this.doc.circle(leftX, yPos + 30, 40, 'F');
      this.doc.setTextColor(COLORS.white);
      this.doc.setFontSize(24);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text((pillar.currentScore || 0).toString(), leftX, yPos + 37, { align: 'center' });
      
      this.doc.setTextColor(COLORS.text);
      this.doc.setFontSize(11);
      this.doc.text('Current State', leftX, yPos + 70, { align: 'center' });
      
      // Future Score
      this.doc.setFillColor(COLORS.green);
      this.doc.circle(rightX, yPos + 30, 40, 'F');
      this.doc.setTextColor(COLORS.white);
      this.doc.setFontSize(24);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text((pillar.futureScore || 0).toString(), rightX, yPos + 37, { align: 'center' });
      
      this.doc.setTextColor(COLORS.text);
      this.doc.setFontSize(11);
      this.doc.text('Future Vision', rightX, yPos + 70, { align: 'center' });
      
      yPos += 100;
      
      // Pillar description
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const descLines = this.doc.splitTextToSize(pillar.description || 'No description available', this.contentWidth);
      this.doc.text(descLines, this.margin, yPos);
      yPos += descLines.length * 12 + 25;
      
      // Maturity level
      this.doc.setFillColor(COLORS.lightGray);
      this.doc.rect(this.margin, yPos, this.contentWidth, 40, 'F');
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Maturity Level:', this.margin + 15, yPos + 25);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${pillar.level?.level || 'Not Assessed'} - ${pillar.level?.description || 'Assessment in progress'}`, this.margin + 120, yPos + 25);
      
      yPos += 60;
      
      // Recommendations for this pillar
      if (this.results.recommendations && this.results.recommendations[pillarId]) {
        const rec = this.results.recommendations[pillarId];
        
        this.addSubsectionTitle('Recommendations', yPos);
        yPos += 25;
        
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(COLORS.primary);
        const recTitle = this.doc.splitTextToSize(rec.title || 'Optimization Recommendations', this.contentWidth - 30);
        this.doc.text(recTitle, this.margin + 15, yPos + 20);
        
        yPos += recTitle.length * 14 + 10;
        
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(COLORS.text);
        const recDesc = this.doc.splitTextToSize(rec.description || '', this.contentWidth - 30);
        this.doc.text(recDesc, this.margin + 15, yPos + 10);
      }
    });
  }

  // Priority Recommendations
  addRecommendations() {
    this.doc.addPage();
    this.addHeader();
    
    let yPos = 60;
    
    this.addSectionTitle('Priority Recommendations', yPos);
    yPos += 50;
    
    // Quick wins
    if (this.results.quickWins && this.results.quickWins.length > 0) {
      this.addSubsectionTitle('Quick Wins', yPos);
      yPos += 25;
      
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(COLORS.text);
      
      this.results.quickWins.slice(0, 3).forEach((win, index) => {
        this.doc.setFillColor(COLORS.green);
        this.doc.circle(this.margin + 8, yPos + 5, 6, 'F');
        
        this.doc.setTextColor(COLORS.white);
        this.doc.setFontSize(7);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text((index + 1).toString(), this.margin + 8, yPos + 7, { align: 'center' });
        
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(COLORS.text);
        const winLines = this.doc.splitTextToSize(win, this.contentWidth - 30);
        this.doc.text(winLines, this.margin + 20, yPos + 8);
        yPos += Math.max(winLines.length * 12, 20);
      });
      
      yPos += 20;
    }
    
    // Priority actions
    if (this.results.prioritizedActions && this.results.prioritizedActions.length > 0) {
      if (yPos + 100 > this.pageHeight - 60) {
        this.doc.addPage();
        this.addHeader();
        yPos = 60;
      }
      
      this.addSubsectionTitle('Priority Actions', yPos);
      yPos += 30;
      
      const actionData = this.results.prioritizedActions.slice(0, 10).map((action, index) => [
        (index + 1).toString(),
        action.category || 'General',
        action.action || action.title || 'Action item',
        action.priority || 'Medium'
      ]);
      
      autoTable(this.doc, {
        startY: yPos,
        head: [['#', 'Area', 'Action', 'Priority']],
        body: actionData,
        margin: { left: this.margin, right: this.margin },
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.accent,
          textColor: COLORS.white,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: COLORS.text
        },
        columnStyles: {
          0: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 100 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 70, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: COLORS.lightGray
        },
        didParseCell: (data) => {
          if (data.column.index === 3 && data.section === 'body') {
            const priority = data.cell.raw;
            if (priority === 'high' || priority === 'High') {
              data.cell.styles.textColor = COLORS.red;
              data.cell.styles.fontStyle = 'bold';
            } else if (priority === 'medium' || priority === 'Medium') {
              data.cell.styles.textColor = COLORS.orange;
            }
          }
        }
      });
    }
  }

  // Implementation Roadmap
  addRoadmap() {
    this.doc.addPage();
    this.addHeader();
    
    let yPos = 60;
    
    this.addSectionTitle('Implementation Roadmap', yPos);
    yPos += 50;
    
    const roadmapPhases = [
      { title: 'Immediate (0-3 months)', items: this.results.roadmap?.immediate || [], color: COLORS.red },
      { title: 'Short-term (3-6 months)', items: this.results.roadmap?.shortTerm || [], color: COLORS.orange },
      { title: 'Long-term (6-12 months)', items: this.results.roadmap?.longTerm || [], color: COLORS.green }
    ];
    
    roadmapPhases.forEach((phase, phaseIndex) => {
      if (yPos + 80 > this.pageHeight - 60) {
        this.doc.addPage();
        this.addHeader();
        yPos = 60;
      }
      
      // Phase header
      this.doc.setFillColor(phase.color);
      this.doc.rect(this.margin, yPos, this.contentWidth, 30, 'F');
      
      this.doc.setTextColor(COLORS.white);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(phase.title, this.margin + 15, yPos + 20);
      
      yPos += 40;
      
      // Phase items
      if (phase.items.length > 0) {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(COLORS.text);
        
        phase.items.slice(0, 5).forEach((item, index) => {
          if (yPos + 20 > this.pageHeight - 60) {
            this.doc.addPage();
            this.addHeader();
            yPos = 60;
          }
          
          this.doc.setFillColor(phase.color);
          this.doc.circle(this.margin + 8, yPos + 5, 4, 'F');
          
          const itemText = typeof item === 'string' ? item : item.action || item.title || 'Action item';
          const itemLines = this.doc.splitTextToSize(itemText, this.contentWidth - 30);
          this.doc.text(itemLines, this.margin + 20, yPos + 8);
          yPos += Math.max(itemLines.length * 12, 18);
        });
      } else {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'italic');
        this.doc.setTextColor(COLORS.mediumGray);
        this.doc.text('No specific actions identified for this phase', this.margin + 15, yPos);
        yPos += 15;
      }
      
      yPos += 25;
    });
  }

  // Methodology and Appendix
  addMethodology() {
    this.doc.addPage();
    this.addHeader();
    
    let yPos = 60;
    
    this.addSectionTitle('Methodology', yPos);
    yPos += 50;
    
    // Assessment approach
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.text);
    
    const methodologyText = `This assessment evaluates your organization's Databricks technical maturity across six key pillars. Each pillar contains multiple dimensions with specific questions designed to assess current capabilities and future aspirations.

The maturity framework uses a 5-level scale:
• Level 1 (Initial): Ad-hoc processes, limited capabilities
• Level 2 (Repeatable): Some processes defined, basic capabilities
• Level 3 (Defined): Structured approach with established processes
• Level 4 (Managed): Quantitatively managed, advanced capabilities
• Level 5 (Optimizing): Continuous improvement, innovation-driven

Scores are calculated based on your responses across four perspectives:
• Current State: Your existing capabilities
• Future Vision: Your desired target state
• Technical Pain Points: Technical challenges identified
• Business Pain Points: Business impact areas

The overall maturity score is a weighted average across all completed pillars, with each pillar weighted by its number of questions. Recommendations are generated based on capability gaps, pain points, and industry best practices.`;
    
    const methodLines = this.doc.splitTextToSize(methodologyText, this.contentWidth);
    this.doc.text(methodLines, this.margin, yPos);
    yPos += methodLines.length * 12 + 30;
    
    // Assessment statistics
    if (yPos + 150 > this.pageHeight - 60) {
      this.doc.addPage();
      this.addHeader();
      yPos = 60;
    }
    
    this.addSubsectionTitle('Assessment Statistics', yPos);
    yPos += 30;
    
    const statsData = [
      ['Total Questions', (this.assessmentInfo.totalQuestions || 0).toString()],
      ['Questions Answered', (this.assessmentInfo.questionsAnswered || 0).toString()],
      ['Completion Percentage', `${this.assessmentInfo.completionPercentage || 0}%`],
      ['Pillars Assessed', `${this.assessmentInfo.pillarsWithResponses || 0}/${this.assessmentInfo.totalPillars || 6}`],
      ['Pillars Completed', `${this.assessmentInfo.completedPillars || 0}/${this.assessmentInfo.totalPillars || 6}`],
      ['Overall Maturity Score', `${this.results.overall?.currentScore || 0}/5`],
      ['Assessment Date', new Date(this.assessmentInfo.startedAt || Date.now()).toLocaleDateString()]
    ];
    
    autoTable(this.doc, {
      startY: yPos,
      body: statsData,
      margin: { left: this.margin, right: this.margin },
      theme: 'plain',
      bodyStyles: {
        fontSize: 10,
        textColor: COLORS.text
      },
      columnStyles: {
        0: { cellWidth: 200, fontStyle: 'bold', fillColor: COLORS.lightGray },
        1: { cellWidth: 'auto', halign: 'right' }
      }
    });
  }

  // Helper methods
  addSectionTitle(title, yPos) {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text(title, this.margin, yPos);
    
    // Underline
    this.doc.setDrawColor(COLORS.primary);
    this.doc.setLineWidth(2);
    this.doc.line(this.margin, yPos + 5, this.margin + 150, yPos + 5);
  }

  addSubsectionTitle(title, yPos) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.accent);
    this.doc.text(title, this.margin, yPos);
  }
}

// Export function
export const generateProfessionalReport = (results, assessmentInfo) => {
  try {
    const exporter = new ProfessionalPDFExporter(results, assessmentInfo);
    const doc = exporter.generate();
    
    // Generate filename
    const date = new Date().toISOString().split('T')[0];
    const orgName = (assessmentInfo.organizationName || 'Organization').replace(/[^a-z0-9]/gi, '_');
    const filename = `Databricks_Maturity_Assessment_${orgName}_${date}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return { success: false, error: error.message };
  }
};

export default { generateProfessionalReport };

