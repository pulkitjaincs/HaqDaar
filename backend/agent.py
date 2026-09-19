import os
import re
from typing import Dict, Any, List
from models import Profile, Household, Member
from engine.criteria import evaluate_profile, next_question
import demo_data

class MockAgent:
    def chat(self, message: str, history: List[Dict], profile_data: Dict, lang: str) -> Dict[str, Any]:
        profile = Profile(**profile_data) if profile_data else Profile(household=Household(), members=[])
        
        message_lower = message.lower()
        turn_idx = len(history) // 2  # Each user-assistant pair is 2 messages. If history is empty, turn 0.

        # DEMO OVERRIDE: Scenario A matching
        # If it looks like Scenario A's first prompt, run the script.
        if "farmer in rajasthan" in message_lower or "किसान" in message_lower:
            # We are in Scenario A
            script = demo_data.SCENARIO_A["turns"]
            # Safely get current turn
            curr_turn = script[turn_idx] if turn_idx < len(script) else script[-1]
            
            # Apply profile updates
            updates = curr_turn["profile_update"]
            if "state" in updates.get("household", {}):
                profile.household.state = updates["household"]["state"]
            if "owns_agri_land" in updates.get("household", {}):
                profile.household.owns_agri_land = updates["household"]["owns_agri_land"]
            if "ration_card" in updates.get("household", {}):
                profile.household.ration_card = updates["household"]["ration_card"]
            if "annual_income_inr" in updates.get("household", {}):
                profile.household.annual_income_inr = updates["household"]["annual_income_inr"]
                
            # Merge members
            for m_up in updates.get("members", []):
                m_id = m_up["id"]
                existing = next((m for m in profile.members if m.id == m_id), None)
                if not existing:
                    existing = Member(id=m_id, relation=m_up.get("relation", "other"))
                    profile.members.append(existing)
                for k, v in m_up.items():
                    if k not in ["id", "relation"]:
                        setattr(existing, k, v)
            
            # Check if we should return results
            is_final_turn = turn_idx >= len(script) - 1
            if is_final_turn:
                results = [r.model_dump() for r in evaluate_profile(profile, lang)]
                return {
                    "reply": curr_turn[f"reply_{lang}"],
                    "profile": profile.model_dump(),
                    "missing_fields": [],
                    "results": results
                }
            else:
                return {
                    "reply": curr_turn[f"reply_{lang}"],
                    "profile": profile.model_dump(),
                    "missing_fields": [],
                    "results": None
                }

        # BASIC NLP OVERRIDE (For arbitrary messages outside Scenario A)
        if not profile.members:
            profile.members.append(Member(id="m1", relation="self", name="User"))
            
        m0 = profile.members[0]
        
        # Simple regex extractors
        age_match = re.search(r'(\d+)\s*(years|yr|साल|age|am)', message_lower)
        if age_match:
            m0.age = int(age_match.group(1))
            
        if "farmer" in message_lower or "kheti" in message_lower or "किसान" in message_lower:
            m0.occupation = "farmer"
            profile.household.owns_agri_land = True
            
        if "vendor" in message_lower or "वेंडर" in message_lower:
            m0.occupation = "street_vendor"
            
        if "salaried" in message_lower or "engineer" in message_lower or "वेतन" in message_lower:
            m0.occupation = "salaried"
            
        if "tax" in message_lower or "टैक्स" in message_lower:
            m0.is_income_tax_payer = True
            
        if "bank" in message_lower or "बैंक" in message_lower:
            if "no" in message_lower or "नहीं" in message_lower:
                m0.has_bank_account = False
            else:
                m0.has_bank_account = True
                
        if "rajasthan" in message_lower or "राजस्थान" in message_lower:
            profile.household.state = "Rajasthan"
        if "delhi" in message_lower or "दिल्ली" in message_lower:
            profile.household.state = "Delhi"
            profile.household.area_type = "urban"

        # Determine next question
        q = next_question(profile)
        if turn_idx >= 3 or not q:
            # Done asking, run engine
            results = [r.model_dump() for r in evaluate_profile(profile, lang)]
            reply = "Here are your results." if lang == "en" else "यहाँ आपके परिणाम हैं।"
            return {
                "reply": reply,
                "profile": profile.model_dump(),
                "missing_fields": [],
                "results": results
            }
        else:
            # Ask next question
            reply = q["question_en"] if lang == "en" else q["question_hi"]
            return {
                "reply": reply,
                "profile": profile.model_dump(),
                "missing_fields": [q["field"]],
                "results": None
            }

def get_agent():
    return MockAgent()
