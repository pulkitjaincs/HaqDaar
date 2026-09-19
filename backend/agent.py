import os
import json
from models import Profile, Household, Member
from engine.criteria import evaluate_profile

class MockAgent:
    def chat(self, message, history, profile_data, lang):
        profile = Profile(**profile_data) if profile_data else Profile()
        
        # Simple heuristics to update profile based on message
        message_lower = message.lower()
        
        if not profile.members:
            profile.members.append(Member(id="m1", relation="self", name="User"))
            
        if "farmer" in message_lower or "किसान" in message:
            profile.members[0].occupation = "farmer"
            profile.household.owns_agri_land = True
        if "vendor" in message_lower or "वेंडर" in message:
            profile.members[0].occupation = "street_vendor"
            profile.household.owns_agri_land = False
        if "rajasthan" in message_lower or "राजस्थान" in message:
            profile.household.state = "Rajasthan"
        
        # Default mock behavior
        results = None
        missing_fields = ["age", "has_bank_account", "hh_annual_income_inr"]
        reply = "Got it. Can you tell me your age and if you have a bank account?" if lang == "en" else "समझ गया। क्या आप मुझे अपनी आयु बता सकते हैं और क्या आपके पास बैंक खाता है?"
        
        if len(history) >= 2:
            # Second turn, let's just trigger results
            profile.members[0].age = 34
            profile.members[0].has_bank_account = True
            profile.household.annual_income_inr = 120000
            
            if len(profile.members) == 1 and ("farmer" in message_lower or "किसान" in message):
                # Add a few more family members for demo
                profile.members.append(Member(id="m2", relation="husband", name="Ramesh", age=38, occupation="farmer", has_bank_account=True, is_income_tax_payer=False))
                profile.members.append(Member(id="m3", relation="daughter", name="Priya", age=7, gender="female"))
                profile.members.append(Member(id="m4", relation="mother-in-law", name="MIL", age=68, gender="female", has_bank_account=True))
                profile.members[0].gender = "female"
                profile.household.ration_card = "bpl"
                profile.household.has_lpg_connection = False
            
            results = [r.model_dump() for r in evaluate_profile(profile, lang)]
            missing_fields = []
            reply = "Here are your eligibility results." if lang == "en" else "यहाँ आपके पात्रता परिणाम हैं।"
            
        return {
            "reply": reply,
            "profile": profile.model_dump(),
            "missing_fields": missing_fields,
            "results": results
        }

def get_agent():
    return MockAgent()
