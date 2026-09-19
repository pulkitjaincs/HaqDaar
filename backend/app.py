import json
import os
import traceback
from agent import Agent
from store import store
from models import Profile
from engine.criteria import evaluate_profile

agent = Agent()

def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(body)
    }

def handler(event, context):
    try:
        path = event.get('rawPath', '')
        method = event.get('requestContext', {}).get('http', {}).get('method', 'GET')
        
        if method == "OPTIONS":
            return build_response(200, {})
            
        if path == "/chat" and method == "POST":
            body = json.loads(event.get('body', '{}'))
            session_id = body.get('session_id')
            message = body.get('message', '')
            lang = body.get('lang', 'hi')
            
            session = store.get_session(session_id) or {}
            profile_data = session.get('profile', {})
            history = session.get('history', [])
            
            history.append({"role": "user", "content": message})
            
            agent_response = agent.chat(message, history, profile_data, lang)
            
            history.append({"role": "assistant", "content": agent_response["reply"]})
            history = history[-10:]
            
            new_session_id = store.save_session(
                session_id, 
                agent_response["profile"], 
                history, 
                lang
            )
            
            return build_response(200, {
                "session_id": new_session_id,
                "reply": agent_response.get("reply", ""),
                "profile": agent_response.get("profile", {}),
                "results": agent_response.get("results", [])
            })
            
        elif path == "/eligibility" and method == "POST":
            body = json.loads(event.get('body', '{}'))
            profile_data = body.get('profile', {})
            lang = body.get('lang', 'en')
            profile = Profile(**profile_data)
            results = evaluate_profile(profile, lang)
            return build_response(200, {
                "results": [r.model_dump() for r in results],
                "engine": "json",
                "catalog_version": "2026-09-20"
            })
            
        elif path == "/schemes" and method == "GET":
            with open(os.path.join(os.path.dirname(__file__), "catalog", "schemes.json"), encoding="utf-8") as f:
                schemes = json.load(f)
            return build_response(200, schemes)
            
        elif path == "/health" and method == "GET":
            return build_response(200, {"ok": True})
            
        else:
            return build_response(404, {"error": "not_found", "message": "Route not found"})
            
    except Exception as e:
        traceback.print_exc()
        return build_response(500, {"error": "internal_error", "message": str(e)})
