import os
import sys
from datetime import timedelta

os.chdir('/home/wachira/Documents/Kbc project/Kbc_Assessment/learnflow_app/backend')
sys.path.append(os.getcwd())

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User
from app.auth import create_access_token

def main():
    client = TestClient(app, raise_server_exceptions=True)
    db = SessionLocal()
    user = db.query(User).first()
    if not user:
        print("No user found")
        return

    token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role.value},
        expires_delta=timedelta(minutes=60)
    )

    print(f"Testing stats endpoint with token for user: {user.email}")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = client.get("/api/learner/stats", headers=headers)
        print(f"Status Code: {response.status_code}")
        print("Body:", response.text)
    except Exception as e:
        import traceback
        traceback.print_exc()
        
if __name__ == "__main__":
    main()
