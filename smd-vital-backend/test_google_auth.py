#!/usr/bin/env python3
"""
Test Google Auth Endpoint
Simple test endpoint for Google OAuth
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import jwt
import datetime

app = FastAPI(title="Test Google Auth")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Test Google Auth Service"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "test-google-auth"}

@app.post("/api/auth/google")
async def google_auth(google_data: dict):
    """Simple Google OAuth endpoint for testing"""
    try:
        print(f"Received Google data: {google_data}")
        
        # Extract basic data
        google_id = google_data.get("googleId", "unknown")
        email = google_data.get("email", "test@example.com")
        name = google_data.get("name", "Test User")
        
        # Generate simple JWT token
        payload = {
            'user_id': google_id,
            'email': email,
            'name': name,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            'iat': datetime.datetime.utcnow()
        }
        
        secret_key = "test_secret_key_2024"
        access_token = jwt.encode(payload, secret_key, algorithm='HS256')
        
        return {
            "message": "Google authentication successful",
            "token": access_token,
            "refresh_token": f"refresh_{google_id}",
            "token_type": "bearer",
            "user": {
                "id": google_id,
                "email": email,
                "name": name,
                "role": "user",
                "email_verified": True
            }
        }
        
    except Exception as e:
        print(f"Error in Google auth: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
