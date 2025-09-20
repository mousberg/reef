from fastapi import FastAPI

app = FastAPI(title="Core Backend Service")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "core-backend-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
