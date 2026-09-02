from fastapi import FastAPI

from app.database import Base, engine
from app.models import vehicle, driver, maintenance  # noqa: F401 — registers tables before create_all
from app.routers.vehicles import router as vehicles_router
from app.routers.drivers import router as drivers_router
from app.routers.maintenance import router as maintenance_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vehicle Fleet Management System API")

app.include_router(vehicles_router)
app.include_router(drivers_router)
app.include_router(maintenance_router)


@app.get("/")
def root():
    return {"message": "Vehicle Fleet Management System API is running"}
