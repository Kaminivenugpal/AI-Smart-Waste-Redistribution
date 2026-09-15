"""
============================================================
AI SMART WASTE REDISTRIBUTION PLATFORM
Module 1: FastAPI AI Microservice (ai_service/main.py)
============================================================
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from model import SurplusItemAnalyzer
import uvicorn

app = FastAPI(
    title="AI Surplus Item Analysis Microservice",
    description="Provides AI-driven category prediction, condition assessment, priority scoring, and food shelf-life estimation.",
    version="1.0.0"
)

# Enable CORS for Spring Boot & React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    name: str
    description: str
    category: str
    quantity: str
    location: str

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Surplus Item Analysis Engine",
        "module": "Module 1"
    }

@app.get("/health")
def health_check():
    return {"status": "HEALTHY"}

@app.post("/analyze")
async def analyze_item(
    name: str = Form(...),
    description: str = Form(""),
    category: str = Form(...),
    quantity: str = Form("1"),
    location: str = Form(""),
    file: Optional[UploadFile] = File(None)
):
    """
    Receives surplus item details and optional image, runs AI analysis,
    and returns structured prediction metrics.
    """
    try:
        image_name = file.filename if file else None
        
        result = SurplusItemAnalyzer.analyze(
            name=name,
            description=description,
            category=category,
            quantity=quantity,
            location=location,
            image_filename=image_name
        )
        return {
            "status": "SUCCESS",
            "analysis": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis Failed: {str(e)}")

@app.post("/analyze-json")
def analyze_item_json(request: AnalysisRequest):
    """
    JSON endpoint for pure API calls without multipart image data.
    """
    try:
        result = SurplusItemAnalyzer.analyze(
            name=request.name,
            description=request.description,
            category=request.category,
            quantity=request.quantity,
            location=request.location
        )
        return {
            "status": "SUCCESS",
            "analysis": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis Failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
