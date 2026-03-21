import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from dotenv import load_dotenv

def setup_cloudinary():
    """Initialize Cloudinary configuration from environment variables"""
    load_dotenv(override=True)
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
    
    if cloud_name and api_key and api_secret:
        cloudinary.config( 
          cloud_name = cloud_name, 
          api_key = api_key, 
          api_secret = api_secret,
          secure = True
        )
        return True
    return False

def upload_media(file: UploadFile, folder: str = "learnflow_lms"):
    """
    Upload a media file to Cloudinary and return the secure URL and resource type.
    """
    if not setup_cloudinary():
        raise HTTPException(status_code=500, detail="Cloudinary credentials are not configured. Admins must set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the .env file.")
        
    try:
        # Determine resource type based on content-type
        content_type = file.content_type or ""
        resource_type = "video" if content_type.startswith("video/") else "image"
        
        # Upload using cloudinary SDK
        result = cloudinary.uploader.upload(
            file.file, 
            folder=folder,
            resource_type=resource_type
        )
        
        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "format": result.get("format"),
            "resource_type": result.get("resource_type")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload media: {str(e)}")
