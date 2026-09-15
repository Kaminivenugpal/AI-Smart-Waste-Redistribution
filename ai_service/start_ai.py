import uvicorn
import sys
import os

if __name__ == "__main__":
    print("\n====================================================")
    print(" Starting AI Surplus Item Analysis FastAPI Service")
    print(" Running on http://localhost:8000")
    print("====================================================\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
