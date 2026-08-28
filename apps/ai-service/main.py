"""
FastAPI Microservice for CivicTrack AI Object Detection & Automated Escalation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from detection.preprocess import preprocess_image
from detection.yolo_model import run_civic_detection
from escalation.image_composer import compose_escalation_image

app = FastAPI(
    title="CivicTrack AI & CV Microservice",
    version="1.0.0",
    description="YOLOv8 Computer Vision Defect Detection & Escalation Image Engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DetectionRequest(BaseModel):
    image: str
    category_hint: Optional[str] = "pothole"

class EscalationRequest(BaseModel):
    photo_url: str
    complaint_number: str
    zone_name: str
    department: str
    days_elapsed: int

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "CivicTrack AI Microservice",
        "model": "YOLOv8n-Civic",
    }

@app.post("/ai/detect")
def detect_issue(request: DetectionRequest):
    try:
        preprocessed = preprocess_image(request.image)
        result = run_civic_detection(preprocessed, request.category_hint)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/generate-escalation-image")
def generate_escalation_poster(request: EscalationRequest):
    try:
        data_uri = compose_escalation_image(
            photo_url=request.photo_url,
            complaint_number=request.complaint_number,
            zone_name=request.zone_name,
            department=request.department,
            days_elapsed=request.days_elapsed
        )
        return {"success": True, "image_data_uri": data_uri}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
