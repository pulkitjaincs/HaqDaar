import os
import time
import uuid
import boto3

class SessionStore:
    def __init__(self):
        self.mock_mode = os.environ.get("MOCK_LLM", "1") == "1"
        self.sessions = {}
        if not self.mock_mode:
            self.dynamodb = boto3.resource('dynamodb')
            self.table_name = os.environ.get('SESSIONS_TABLE', 'haqdaar-sessions')
            self.table = self.dynamodb.Table(self.table_name)

    def get_session(self, session_id):
        if not session_id:
            return None
        
        if self.mock_mode:
            return self.sessions.get(session_id)
        
        try:
            response = self.table.get_item(Key={'session_id': session_id})
            return response.get('Item')
        except Exception as e:
            print(f"Error getting session: {e}")
            return None

    def save_session(self, session_id, profile, history, lang):
        if not session_id:
            session_id = str(uuid.uuid4())
            
        ttl = int(time.time()) + 86400  # 24 hours
        item = {
            'session_id': session_id,
            'profile': profile,
            'history': history,
            'lang': lang,
            'updated_at': int(time.time()),
            'ttl': ttl
        }
        
        if self.mock_mode:
            self.sessions[session_id] = item
        else:
            try:
                self.table.put_item(Item=item)
            except Exception as e:
                print(f"Error saving session: {e}")
                
        return session_id

store = SessionStore()
