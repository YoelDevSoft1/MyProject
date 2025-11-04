from fastapi import FastAPI

app = FastAPI()

@app.get("/test")
async def test():
    return {"message": "Test working"}

@app.get("/ai/sessions")
async def get_sessions():
    return {"sessions": [], "total": 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8009)
