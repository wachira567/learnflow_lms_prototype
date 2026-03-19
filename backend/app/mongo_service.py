from pymongo import MongoClient
from typing import Optional, List, Dict, Any
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_HOST = os.getenv("MONGO_HOST", "localhost")
MONGO_PORT = int(os.getenv("MONGO_PORT", "27017"))
MONGO_DB = os.getenv("MONGO_DB", "learnflow_content")

client = MongoClient(MONGO_HOST, MONGO_PORT)
db = client[MONGO_DB]


def get_db():
    return db


lessons_collection = db["lessons"]
progress_collection = db["progress"]
audit_logs_collection = db["audit_logs"]


def create_lesson(course_id: int, lesson_data: Dict[str, Any]) -> str:
    lesson_data["course_id"] = course_id
    lesson_data["created_at"] = datetime.utcnow()
    lesson_data["updated_at"] = datetime.utcnow()
    result = lessons_collection.insert_one(lesson_data)
    return str(result.inserted_id)


def get_lessons_by_course(course_id: int) -> List[Dict[str, Any]]:
    lessons = list(lessons_collection.find({"course_id": course_id}).sort("order", 1))
    for lesson in lessons:
        lesson["id"] = str(lesson.pop("_id"))
    return lessons


def get_lesson(lesson_id: str) -> Optional[Dict[str, Any]]:
    lesson = lessons_collection.find_one({"_id": lesson_id})
    if lesson:
        lesson["id"] = str(lesson.pop("_id"))
    return lesson


def update_lesson(lesson_id: str, lesson_data: Dict[str, Any]) -> bool:
    lesson_data["updated_at"] = datetime.utcnow()
    result = lessons_collection.update_one(
        {"_id": lesson_id},
        {"$set": lesson_data}
    )
    return result.modified_count > 0


def delete_lesson(lesson_id: str) -> bool:
    result = lessons_collection.delete_one({"_id": lesson_id})
    return result.deleted_count > 0


def get_user_progress(user_id: int, course_id: int) -> List[Dict[str, Any]]:
    progress = list(progress_collection.find({
        "user_id": user_id,
        "course_id": course_id
    }))
    for p in progress:
        p["lesson_id"] = p.pop("_id")
    return progress


def update_user_progress(user_id: int, course_id: int, lesson_id: str, completed: bool) -> bool:
    progress_record = {
        "user_id": user_id,
        "course_id": course_id,
        "lesson_id": lesson_id,
        "completed": completed,
        "completed_at": datetime.utcnow() if completed else None,
        "updated_at": datetime.utcnow()
    }
    result = progress_collection.update_one(
        {"user_id": user_id, "course_id": course_id, "lesson_id": lesson_id},
        {"$set": progress_record},
        upsert=True
    )
    return result.acknowledged


def get_lesson_progress(user_id: int, course_id: int, lesson_id: str) -> Optional[Dict[str, Any]]:
    progress = progress_collection.find_one({
        "user_id": user_id,
        "course_id": course_id,
        "lesson_id": lesson_id
    })
    if progress:
        progress["lesson_id"] = str(progress.pop("_id"))
    return progress


def log_audit_event(user_id: int, action: str, details: Dict[str, Any]):
    audit_record = {
        "user_id": user_id,
        "action": action,
        "details": details,
        "timestamp": datetime.utcnow()
    }
    audit_logs_collection.insert_one(audit_record)


def get_audit_logs(limit: int = 100, action: Optional[str] = None) -> List[Dict[str, Any]]:
    query = {}
    if action:
        query["action"] = action
    logs = list(audit_logs_collection.find(query).sort("timestamp", -1).limit(limit))
    for log in logs:
        log["id"] = str(log.pop("_id"))
    return logs
