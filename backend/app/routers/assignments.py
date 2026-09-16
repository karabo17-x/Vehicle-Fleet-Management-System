#assignment endpoints feature 3 history/read
#assign/unassign write
#POST /vehicles{id}/assign, POST/ vehicle/{id}/unassign

from datetime import datetime 
from pydantic import BaseModel, ConfigDict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database  import get_db
from app.middleware.auth_guard import CurrentUser, get_current_user
from app.services.vehicle_service import VehicleSerice

router = APIRouter(prefix="/assignments", tags=["assignments"])
