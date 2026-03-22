from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError
from app.database import (
    course_content_collection,
    user_progress_collection,
    audit_logs_collection,
)


# Create a new lesson for a course
def create_lesson(course_id: int, lesson_data: dict) -> str:
    existing_lessons = get_course_lessons(course_id)
    order = len(existing_lessons) + 1

    lesson_doc = {
        "course_id": course_id,
        "title": lesson_data["title"],
        "type": lesson_data.get("type", "video"),
        "duration": lesson_data["duration"],
        "content": lesson_data.get("content", ""),
        "notes": lesson_data.get("notes", ""),
        "order": order,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = course_content_collection.insert_one(lesson_doc)
    return str(result.inserted_id)


# Get all lessons for a course
def get_course_lessons(course_id: int) -> List[Dict[str, Any]]:
    lessons = course_content_collection.find({"course_id": course_id}).sort("order", 1)

    result = []
    for lesson in lessons:
        lesson["id"] = str(lesson.pop("_id"))
        result.append(lesson)

    return result


# Get a single lesson
def get_lesson(lesson_id: str) -> Optional[Dict[str, Any]]:
    try:
        lesson = course_content_collection.find_one({"_id": ObjectId(lesson_id)})
        if lesson:
            lesson["id"] = str(lesson.pop("_id"))
        return lesson
    except (InvalidId, PyMongoError):
        return None


# Update a lesson
def update_lesson(lesson_id: str, update_data: dict) -> bool:
    try:
        update_data["updated_at"] = datetime.now(timezone.utc)
        result = course_content_collection.update_one(
            {"_id": ObjectId(lesson_id)}, {"$set": update_data}
        )
        return result.modified_count > 0
    except (InvalidId, PyMongoError):
        return False


# Delete a lesson
def delete_lesson(lesson_id: str) -> bool:
    try:
        result = course_content_collection.delete_one({"_id": ObjectId(lesson_id)})
        return result.deleted_count > 0
    except (InvalidId, PyMongoError):
        return False


# Delete all lessons for a course
def delete_course_lessons(course_id: int) -> bool:
    result = course_content_collection.delete_many({"course_id": course_id})
    return result.deleted_count > 0


# Get user progress for a course
def get_user_progress(user_id: int, course_id: int) -> Dict[str, Any]:
    progress = user_progress_collection.find_one(
        {"user_id": user_id, "course_id": course_id}
    )

    if not progress:
        return {
            "user_id": user_id,
            "course_id": course_id,
            "completed_lessons": [],
            "total_lessons": len(get_course_lessons(course_id)),
            "progress_percentage": 0.0,
            "last_accessed": None,
            "total_seconds_spent": 0,
        }

    progress["id"] = str(progress.pop("_id"))

    total_lessons = len(get_course_lessons(course_id))
    completed_count = len(progress.get("completed_lessons", []))
    progress["total_lessons"] = total_lessons
    progress["progress_percentage"] = (
        (completed_count / total_lessons * 100) if total_lessons > 0 else 0
    )
    progress["total_seconds_spent"] = progress.get("total_seconds_spent", 0)

    return progress


# Update lesson progress
def update_lesson_progress(
    user_id: int, course_id: int, lesson_id: str, completed: bool
) -> Dict[str, Any]:
    progress = user_progress_collection.find_one(
        {"user_id": user_id, "course_id": course_id}
    )

    if progress:
        completed_lessons = set(progress.get("completed_lessons", []))

        if completed:
            completed_lessons.add(lesson_id)
        else:
            completed_lessons.discard(lesson_id)

        user_progress_collection.update_one(
            {"_id": progress["_id"]},
            {
                "$set": {
                    "completed_lessons": list(completed_lessons),
                    "last_accessed": datetime.now(timezone.utc),
                }
            },
        )
    else:
        completed_lessons = [lesson_id] if completed else []
        user_progress_collection.insert_one(
            {
                "user_id": user_id,
                "course_id": course_id,
                "completed_lessons": completed_lessons,
                "lesson_times": {},
                "total_seconds_spent": 0,
                "last_accessed": datetime.now(timezone.utc),
            }
        )

    return get_user_progress(user_id, course_id)


def log_time_spent(user_id: int, course_id: int, lesson_id: str, seconds: int) -> bool:
    progress = user_progress_collection.find_one({"user_id": user_id, "course_id": course_id})
    if not progress:
        user_progress_collection.insert_one({
            "user_id": user_id,
            "course_id": course_id,
            "completed_lessons": [],
            "lesson_times": {lesson_id: seconds},
            "total_seconds_spent": seconds,
            "last_accessed": datetime.now(timezone.utc)
        })
    else:
        lesson_times = progress.get("lesson_times", {})
        current_time = lesson_times.get(lesson_id, 0)
        lesson_times[lesson_id] = current_time + seconds

        user_progress_collection.update_one(
            {"_id": progress["_id"]},
            {
                "$set": {
                    "lesson_times": lesson_times,
                    "last_accessed": datetime.now(timezone.utc)
                },
                "$inc": {
                    "total_seconds_spent": seconds
                }
            }
        )
    return True


# Get all progress for a user
def get_user_all_progress(user_id: int) -> List[Dict[str, Any]]:
    progress_list = user_progress_collection.find({"user_id": user_id})

    result = []
    for progress in progress_list:
        progress["id"] = str(progress.pop("_id"))
        result.append(progress)

    return result


# Create audit log in MongoDB
def create_audit_log_mongo(log_data: dict) -> str:
    log_doc = {
        "user_id": log_data.get("user_id"),
        "action": log_data["action"],
        "resource_type": log_data.get("resource_type"),
        "resource_id": log_data.get("resource_id"),
        "details": log_data.get("details"),
        "ip_address": log_data.get("ip_address"),
        "user_agent": log_data.get("user_agent"),
        "created_at": datetime.now(timezone.utc),
    }

    result = audit_logs_collection.insert_one(log_doc)
    return str(result.inserted_id)


# Get audit logs with filters
def get_audit_logs(
    user_id: Optional[int] = None, action: Optional[str] = None, limit: int = 100
) -> List[Dict[str, Any]]:
    query = {}
    if user_id:
        query["user_id"] = user_id
    if action:
        query["action"] = action

    logs = audit_logs_collection.find(query).sort("created_at", -1).limit(limit)

    result = []
    for log in logs:
        log["id"] = str(log.pop("_id"))
        result.append(log)

    return result
