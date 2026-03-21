import os
import sys
import urllib.request
from datetime import timedelta

os.chdir('/home/wachira/Documents/Kbc project/Kbc_Assessment/learnflow_app/backend')
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import User
from app.auth import create_access_token

def main():
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
    
    url = "http://localhost:8000/api/learner/stats"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status Code: {response.getcode()}")
            print("Headers:", response.info())
            print("Body:", response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code}")
        print("Body:", e.read().decode('utf-8'))
    except Exception as e:
        print("Request failed:", e)
        
if __name__ == "__main__":
    main()
