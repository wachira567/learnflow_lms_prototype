import os
import sys

# Change working directory so imports work
os.chdir('/home/wachira/Documents/Kbc project/Kbc_Assessment/learnflow_app/backend')
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import User
from app.main import get_learner_stats

def main():
    db = SessionLocal()
    try:
        user = db.query(User).first()
        if not user:
            print("No users found in database.")
            return

        print(f"Testing stats for user: {user.email}")
        stats = get_learner_stats(current_user=user, db=db)
        print("Success!")
        print(stats)
    except Exception as e:
        import traceback
        print("Encountered error:")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
