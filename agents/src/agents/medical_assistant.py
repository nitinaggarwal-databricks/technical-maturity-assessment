"""
Medical Assistant Agent - Example from the guide
Reads medical data, summarizes findings, and speaks results
"""
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from ..core import BaseAgent, AgentConfig, GraphBuilder
from ..utils import PromptLibrary


class MedicalReport(BaseModel):
    """Structured output for medical analysis"""
    key_findings: List[str] = Field(description="Critical findings from the analysis")
    detailed_analysis: str = Field(description="Detailed breakdown of observations")
    summary: str = Field(description="Plain-language summary")
    recommendations: List[str] = Field(description="Suggested next steps")
    urgency_level: str = Field(description="Urgency classification: routine, urgent, critical")


class MedicalAssistant(BaseAgent):
    """
    Medical Assistant Agent for analyzing medical data
    
    Role: Medical data analyst and report generator
    Goal: Analyze medical documents/images and provide clear, structured summaries
    Output: Structured medical reports following protocol
    
    Note: This is an AI assistant, not a replacement for medical professionals
    """
    
    def __init__(self, config: Optional[AgentConfig] = None):
        if config is None:
            config = AgentConfig(
                name="Medical Assistant",
                role="Medical assistant specialized in analyzing medical data",
                goal="Analyze medical documents and provide clear, structured summaries",
                system_prompt=PromptLibrary.medical_assistant_prompt(),
                temperature=0.3,  # Lower temperature for more consistent medical analysis
                model_name="gpt-4",
                output_schema=MedicalReport.model_json_schema(),
                use_memory=True,
                max_iterations=5
            )
        
        super().__init__(config)
    
    def format_input(self, user_input: str, **kwargs) -> Dict[str, Any]:
        """Format medical data input"""
        return {
            "input": user_input,
            "data_type": kwargs.get("data_type", "report"),
            "patient_context": kwargs.get("patient_context", {}),
            "specific_focus": kwargs.get("specific_focus", [])
        }
    
    def format_output(self, result: Any) -> Dict[str, Any]:
        """Format medical report output"""
        if isinstance(result, dict):
            return result
        
        # Parse result into structured format
        output = {
            "report": str(result),
            "disclaimer": "This analysis is provided by an AI assistant and should be reviewed by qualified healthcare professionals."
        }
        
        return output
    
    def analyze_report(self, report_text: str, focus_areas: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Analyze a medical report
        
        Args:
            report_text: The medical report text to analyze
            focus_areas: Optional specific areas to focus on
        
        Returns:
            Structured analysis results
        """
        prompt = f"Analyze the following medical report"
        
        if focus_areas:
            prompt += f" with focus on: {', '.join(focus_areas)}"
        
        prompt += f"\n\n{report_text}"
        
        result = self.run(prompt)
        return result


def create_medical_assistant(
    model_name: str = "gpt-4",
    include_vision: bool = False
) -> MedicalAssistant:
    """
    Factory function to create a medical assistant agent
    
    Args:
        model_name: Name of the LLM model to use
        include_vision: Whether to include vision capabilities (for X-rays, scans)
    
    Returns:
        Configured medical assistant agent
    """
    # Create agent
    agent = MedicalAssistant()
    
    # If vision is needed, use a model with vision capabilities
    if include_vision:
        agent.config.model_name = "gpt-4o"  # Use vision-capable model
    
    # Build simple graph (medical analysis doesn't typically need tools)
    builder = GraphBuilder(agent)
    builder.build_simple_agent_graph()
    builder.compile()
    
    return agent


# Example usage
if __name__ == "__main__":
    # Create medical assistant
    agent = create_medical_assistant()
    
    # Example medical report
    sample_report = """
    Patient: 45-year-old male
    Chief Complaint: Chest pain and shortness of breath
    
    Vital Signs:
    - BP: 145/95 mmHg
    - Heart Rate: 98 bpm
    - Temperature: 98.6°F
    
    Lab Results:
    - Troponin: 0.8 ng/mL (elevated)
    - CK-MB: 12 U/L (elevated)
    - D-dimer: Normal
    
    EKG: ST-segment elevation in leads II, III, aVF
    
    Chest X-ray: No acute findings, normal cardiac silhouette
    """
    
    # Analyze report
    result = agent.analyze_report(sample_report, focus_areas=["cardiac", "urgent findings"])
    
    print("Medical Analysis:")
    print("=" * 50)
    print(result.get("output", "No output"))

