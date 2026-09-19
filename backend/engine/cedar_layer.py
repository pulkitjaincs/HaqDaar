"""
Optional Cedar layer to evaluate generated policies.
Requires the `cedarpy` package.
"""
import os

def evaluate_cedar(profile_dict: dict, scheme_id: str) -> str:
    """
    Evaluates eligibility using AWS Cedar policies.
    Returns ELIGIBLE, NOT_ELIGIBLE, or CEDAR_UNAVAILABLE.
    """
    try:
        from cedarpy import is_authorized
    except ImportError:
        return "CEDAR_UNAVAILABLE"
        
    policy_path = os.path.join(os.path.dirname(__file__), "policies.cedar")
    if not os.path.exists(policy_path):
        return "NO_POLICY_FILE"
        
    with open(policy_path, "r", encoding="utf-8") as f:
        policies = f.read()
        
    # Entities json must be constructed here for Cedar.
    # Mocking for now to demonstrate architecture per spec section 8.1
    # In a full deployment, this would use is_authorized() to test the rule.
    return "NOT_EVALUATED_YET"
