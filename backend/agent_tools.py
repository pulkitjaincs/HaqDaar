"""
Agent tools definitions for Strands/Bedrock.
Currently stubbed for local execution.
"""
from typing import Dict, List, Optional
from models import Profile

# Stub for Strands @tool decorator
def tool(func):
    return func

@tool
def update_profile(household: Optional[Dict] = None, members: Optional[List[Dict]] = None) -> Dict:
    """Merge new facts into the family profile. Never overwrites known values with null."""
    return {"status": "success"}

@tool  
def run_eligibility() -> Dict:
    """Run the deterministic eligibility engine over the current profile."""
    return {"status": "success"}

@tool
def get_next_question() -> Dict:
    """Get the single most valuable question to ask next."""
    return {"status": "success"}

@tool
def get_scheme_details(scheme_id: str) -> Dict:
    """Get detailed information about a specific scheme."""
    return {"status": "success"}
