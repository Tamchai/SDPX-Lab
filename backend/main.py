from fastapi import FastAPI

app = FastAPI(title="Room Booking API")


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
