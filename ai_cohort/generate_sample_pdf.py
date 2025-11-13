"""
Generate a sample PDF report with financial data
This creates a realistic annual report PDF that the agent can analyze
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
import os

def create_annual_report():
    """Create a sample annual report PDF"""
    
    # Create data directory
    os.makedirs('data', exist_ok=True)
    
    # Create PDF
    pdf_path = 'data/annual_report_2023.pdf'
    doc = SimpleDocTemplate(pdf_path, pagesize=letter,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Center', alignment=TA_CENTER))
    styles.add(ParagraphStyle(name='Right', alignment=TA_RIGHT))
    
    title_style = styles['Heading1']
    title_style.alignment = TA_CENTER
    
    # Title Page
    elements.append(Spacer(1, 2*inch))
    elements.append(Paragraph("TechCorp Industries", title_style))
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph("Annual Financial Report", styles['Heading2']))
    elements.append(Paragraph("Fiscal Year 2023", styles['Heading2']))
    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph("Building Tomorrow's Technology Today", styles['Center']))
    
    elements.append(PageBreak())
    
    # Executive Summary
    elements.append(Paragraph("Executive Summary", styles['Heading1']))
    elements.append(Spacer(1, 0.2*inch))
    
    summary_text = """
    TechCorp Industries experienced exceptional growth in fiscal year 2023, demonstrating 
    our continued commitment to innovation and customer satisfaction. Our strategic initiatives 
    in product development and market expansion have yielded significant results.
    
    <br/><br/>
    
    <b>Key Highlights:</b>
    <br/>
    • Total Revenue increased by 28% year-over-year to $42.5 million
    <br/>
    • Gross Profit Margin improved to 58%, up from 54% in 2022
    <br/>
    • Net Income reached $8.9 million, representing a 35% increase
    <br/>
    • Customer base grew by 42% to over 5,000 active customers
    <br/>
    • Successfully launched 15 new products across three categories
    """
    
    elements.append(Paragraph(summary_text, styles['Normal']))
    elements.append(Spacer(1, 0.3*inch))
    
    # Financial Performance Overview
    elements.append(Paragraph("Financial Performance Overview", styles['Heading2']))
    elements.append(Spacer(1, 0.2*inch))
    
    overview_text = """
    Our financial performance in 2023 reflects strong operational execution and market demand 
    for our innovative product portfolio. Total revenue of $42.5 million represents robust 
    growth across all business segments and geographic regions.
    
    <br/><br/>
    
    The Electronics segment led growth with $28.4 million in revenue (67% of total), followed 
    by Furniture at $9.4 million (22%), and Accessories at $4.7 million (11%). Regional 
    performance showed balanced growth, with the West region generating $11.2 million, 
    followed closely by the Central region at $9.8 million.
    """
    
    elements.append(Paragraph(overview_text, styles['Normal']))
    elements.append(Spacer(1, 0.3*inch))
    
    # Revenue by Quarter Table
    elements.append(Paragraph("Quarterly Revenue Breakdown", styles['Heading2']))
    elements.append(Spacer(1, 0.2*inch))
    
    quarterly_data = [
        ['Quarter', 'Revenue (Millions)', 'Growth %', 'Net Income (Millions)'],
        ['Q1 2023', '$9.2', '22%', '$1.8'],
        ['Q2 2023', '$9.8', '25%', '$2.0'],
        ['Q3 2023', '$10.1', '27%', '$2.1'],
        ['Q4 2023', '$13.4', '35%', '$3.0'],
        ['Total 2023', '$42.5', '28%', '$8.9'],
    ]
    
    quarter_table = Table(quarterly_data, colWidths=[1.5*inch, 1.8*inch, 1.2*inch, 1.8*inch])
    quarter_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, -1), (-1, -1), colors.beige),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(quarter_table)
    elements.append(Spacer(1, 0.3*inch))
    
    quarterly_text = """
    Our quarterly performance shows consistent growth momentum throughout the year, with Q4 
    demonstrating exceptional strength driven by seasonal demand and successful product launches. 
    The 35% year-over-year growth in Q4 significantly exceeded market expectations and positions 
    us well for continued expansion in 2024.
    """
    
    elements.append(Paragraph(quarterly_text, styles['Normal']))
    
    elements.append(PageBreak())
    
    # Revenue by Segment
    elements.append(Paragraph("Revenue by Business Segment", styles['Heading2']))
    elements.append(Spacer(1, 0.2*inch))
    
    segment_data = [
        ['Segment', '2023 Revenue', '2022 Revenue', 'Growth', '% of Total'],
        ['Electronics', '$28.4M', '$21.8M', '30%', '67%'],
        ['Furniture', '$9.4M', '$7.2M', '31%', '22%'],
        ['Accessories', '$4.7M', '$4.2M', '12%', '11%'],
        ['Total', '$42.5M', '$33.2M', '28%', '100%'],
    ]
    
    segment_table = Table(segment_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1*inch, 1.2*inch])
    segment_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, -1), (-1, -1), colors.beige),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(segment_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Key Financial Metrics
    elements.append(Paragraph("Key Financial Metrics", styles['Heading2']))
    elements.append(Spacer(1, 0.2*inch))
    
    metrics_data = [
        ['Metric', '2023', '2022', 'Change'],
        ['Total Revenue', '$42.5M', '$33.2M', '+28%'],
        ['Gross Profit', '$24.7M', '$17.9M', '+38%'],
        ['Gross Margin', '58%', '54%', '+4 pts'],
        ['Operating Income', '$11.2M', '$8.1M', '+38%'],
        ['Net Income', '$8.9M', '$6.6M', '+35%'],
        ['Net Margin', '21%', '20%', '+1 pt'],
        ['Total Assets', '$52.3M', '$41.2M', '+27%'],
        ['Shareholders Equity', '$38.7M', '$29.8M', '+30%'],
    ]
    
    metrics_table = Table(metrics_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(metrics_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Regional Performance
    elements.append(Paragraph("Regional Performance", styles['Heading2']))
    elements.append(Spacer(1, 0.2*inch))
    
    regional_text = """
    Our geographic expansion strategy delivered strong results across all regions. The West 
    region led with $11.2 million in revenue, benefiting from our expanded presence in major 
    tech hubs. The Central region showed remarkable growth at $9.8 million, while North, 
    South, and East regions contributed $8.9M, $6.7M, and $5.9M respectively.
    
    <br/><br/>
    
    Regional performance metrics:
    <br/>
    • West: $11.2M (26% of total) - 32% YoY growth
    <br/>
    • Central: $9.8M (23% of total) - 29% YoY growth
    <br/>
    • North: $8.9M (21% of total) - 26% YoY growth
    <br/>
    • South: $6.7M (16% of total) - 24% YoY growth
    <br/>
    • East: $5.9M (14% of total) - 25% YoY growth
    """
    
    elements.append(Paragraph(regional_text, styles['Normal']))
    
    elements.append(PageBreak())
    
    # Future Outlook
    elements.append(Paragraph("2024 Outlook and Strategic Priorities", styles['Heading2']))
    elements.append(Spacer(1, 0.2*inch))
    
    outlook_text = """
    Looking ahead to 2024, we are well-positioned to build on our momentum with several 
    strategic initiatives:
    
    <br/><br/>
    
    <b>Revenue Growth Target:</b> We project 25-30% revenue growth to $53-55 million, 
    driven by new product launches and geographic expansion.
    
    <br/><br/>
    
    <b>Product Innovation:</b> Investment in R&D will increase by 40% to accelerate 
    our product development pipeline. We plan to launch 20+ new products across all segments.
    
    <br/><br/>
    
    <b>Market Expansion:</b> Entrance into international markets, beginning with Canada 
    and select European markets in Q2 2024.
    
    <br/><br/>
    
    <b>Operational Excellence:</b> Implementation of advanced analytics and automation 
    to improve efficiency and customer experience.
    
    <br/><br/>
    
    We remain committed to delivering value to our stakeholders while maintaining our 
    focus on sustainable growth and innovation leadership.
    """
    
    elements.append(Paragraph(outlook_text, styles['Normal']))
    
    # Build PDF
    doc.build(elements)
    print(f"✓ Created annual_report_2023.pdf")
    print(f"  Location: {pdf_path}")
    print(f"  The PDF contains:")
    print(f"    - Executive summary")
    print(f"    - Quarterly revenue: Q1($9.2M), Q2($9.8M), Q3($10.1M), Q4($13.4M)")
    print(f"    - Total 2023 revenue: $42.5M")
    print(f"    - Segment breakdown: Electronics(67%), Furniture(22%), Accessories(11%)")
    print(f"    - Regional performance data")
    print(f"    - Key financial metrics")

if __name__ == "__main__":
    create_annual_report()

