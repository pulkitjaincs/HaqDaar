import os
import json
import boto3
from typing import Dict, Any, List
from models import Profile, Household, Member
from engine.criteria import evaluate_profile, next_question
import demo_data

class Agent:
    def __init__(self):
        self.client = boto3.client("bedrock-runtime", region_name=os.environ.get("AWS_REGION", "us-east-1"))
        self.model_id = "anthropic.claude-3-haiku-20240307-v1:0"
        
        self.system_prompt = """You are Haqdaar, a helpful assistant helping an Indian family discover government schemes.
Your task is to:
1. Extract any newly provided facts about the household or its members from the user's message.
2. Ask the user the NEXT QUESTION naturally in the language they are speaking.

You MUST respond strictly in the following JSON format:
{
  "profile_update": {
    "household": {
      "state": "Rajasthan", // or null
      "area_type": "rural", // rural or urban
      "annual_income_inr": 120000,
      "ration_card": "bpl", // none, apl, bpl, aay
      "has_pucca_house": false,
      "has_lpg_connection": false,
      "owns_agri_land": true
    },
    "members": [
      {
        "id": "m1", // Use 'm1', 'm2' etc. for members.
        "relation": "self", // relation to the user
        "name": "Sita",
        "age": 34,
        "gender": "female",
        "occupation": "farmer",
        "is_income_tax_payer": false,
        "has_bank_account": true,
        "is_govt_employee_or_pensioner": false
      }
    ]
  },
  "reply": "Your natural language response here."
}

Do not include any text outside the JSON block.
- For `profile_update`, ONLY include fields that the user explicitly mentioned or that can be confidently inferred. Do not include nulls if a field is not mentioned, just omit it.
- Never invent facts.
- The `NEXT QUESTION` to ask is provided to you in the context below. Ask it politely.
"""

    def _call_bedrock(self, prompt: str, system: str) -> str:
        try:
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "system": system,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt}
                        ]
                    }
                ],
                "temperature": 0.0
            })
            response = self.client.invoke_model(
                modelId=self.model_id,
                body=body,
                accept="application/json",
                contentType="application/json"
            )
            response_body = json.loads(response.get("body").read())
            return response_body.get("content")[0].get("text")
        except Exception as e:
            print(f"Bedrock Error: {e}")
            return '{"profile_update": {}, "reply": "I am experiencing technical difficulties. Please try again later."}'

    def chat(self, message: str, history: List[Dict], profile_data: Dict, lang: str) -> Dict[str, Any]:
        profile = Profile(**profile_data) if profile_data else Profile(household=Household(), members=[])
        
        # Determine next best question
        nxt = next_question(profile)
        next_q_text = ""
        if nxt:
            next_q_text = nxt["question_en"] if lang == "en" else nxt["question_hi"]
            
        prompt = f"""
Current Profile state:
{profile.model_dump_json(indent=2)}

User's message: "{message}"

The next question you MUST ask the user is: "{next_q_text}"
If there is no next question (e.g. all facts are gathered), then tell them you are calculating their results.

Language to reply in: {"Hindi" if lang == "hi" else "English"}
"""
        
        response_text = self._call_bedrock(prompt, self.system_prompt)
        
        try:
            # Claude sometimes wraps JSON in ```json blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
                
            parsed = json.loads(response_text)
            updates = parsed.get("profile_update", {})
            reply = parsed.get("reply", "I am calculating your results now.")
            
            # Apply household updates
            hh_updates = updates.get("household", {})
            for k, v in hh_updates.items():
                if hasattr(profile.household, k) and v is not None:
                    setattr(profile.household, k, v)
                    
            # Apply member updates
            members_updates = updates.get("members", [])
            for m_up in members_updates:
                m_id = m_up.get("id")
                if not m_id:
                    continue
                existing = next((m for m in profile.members if m.id == m_id), None)
                if not existing:
                    existing = Member(id=m_id, relation=m_up.get("relation", "other"))
                    profile.members.append(existing)
                
                for k, v in m_up.items():
                    if hasattr(existing, k) and v is not None and k != "id":
                        setattr(existing, k, v)
                        
        except Exception as e:
            print(f"JSON Parsing Error: {e}")
            reply = "I didn't quite catch that. Could you repeat?"
            
        results = evaluate_profile(profile, lang=lang)
        
        return {
            "reply": reply,
            "profile": profile.model_dump(),
            "results": [r.model_dump() for r in results]
        }
