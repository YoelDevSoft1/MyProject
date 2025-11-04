"""
SMD VITAL AI LangGraph Service - Simplified Version
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(
    title="SMD VITAL AI LangGraph Service",
    description="Servicio de IA médica con LangGraph para análisis y diagnóstico",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ai-langgraph"}

@app.get("/test")
async def test_endpoint():
    """Test endpoint"""
    return {"message": "Test endpoint working"}

@app.get("/ai/sessions")
async def get_all_sessions():
    """Get all AI sessions"""
    return {"sessions": [], "total": 0, "message": "AI sessions endpoint working"}

@app.get("/ai/sessions/{user_id}")
async def get_user_sessions(user_id: str):
    """Get user AI sessions"""
    return {"sessions": [], "total": 0, "user_id": user_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)