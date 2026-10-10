from datetime import datetime, timedelta

import pytest
from fastapi import HTTPException

from app.models.assignment import Assignment
from app.models.driver import Driver, DriverStatus
from app.models.vehicle import Vehicle
from app.services.driver_service import DriverService
from app.services.vehicle_service import VehicleService


def vehicle_data(registration):
    return {"registration_number": registration, "make": "Toyota", "model": "Corolla", "year": 2021}


def driver_data(license_number, status=DriverStatus.ACTIVE):
    return {
        "first_name": "Taylor", "last_name": "Driver", "license_number": license_number,
        "license_expiry": datetime.utcnow() + timedelta(days=300), "status": status,
    }


def test_vehicle_service_crud_duplicate_and_missing(db_session):
    service = VehicleService(db_session)
    vehicle = service.create(vehicle_data("UNIT-1"), "manager-1", "manager")
    assert service.get_or_404(vehicle.id).registration_number == "UNIT-1"
    assert service.list(search="UNIT-1")[1] == 1
    with pytest.raises(HTTPException) as duplicate:
        service.create(vehicle_data("UNIT-1"), "manager-1", "manager")
    assert duplicate.value.status_code == 409

    service.update(vehicle.id, {"make": "Honda"}, "manager-1", "manager")
    assert service.get_or_404(vehicle.id).make == "Honda"
    service.delete(vehicle.id, "manager-1", "manager")
    with pytest.raises(HTTPException) as missing:
        service.get_or_404(vehicle.id)
    assert missing.value.status_code == 404


def test_driver_service_crud_duplicate_and_missing(db_session):
    service = DriverService(db_session)
    driver = service.create(driver_data("UNIT-LIC-1"), "manager-1", "manager")
    assert service.get_or_404(driver.id).license_number == "UNIT-LIC-1"
    assert service.list(search="UNIT-LIC-1")[1] == 1
    with pytest.raises(HTTPException) as duplicate:
        service.create(driver_data("UNIT-LIC-1"), "manager-1", "manager")
    assert duplicate.value.status_code == 409

    service.update(driver.id, {"first_name": "Jordan"}, "manager-1", "manager")
    assert service.get_or_404(driver.id).first_name == "Jordan"
    service.delete(driver.id, "manager-1", "manager")
    with pytest.raises(HTTPException) as missing:
        service.get_or_404(driver.id)
    assert missing.value.status_code == 404


def test_assignment_service_preconditions_and_history(db_session):
    vehicles = VehicleService(db_session)
    vehicle = vehicles.create(vehicle_data("UNIT-2"), "manager-1", "manager")
    active_driver = DriverService(db_session).create(driver_data("UNIT-LIC-2"), "manager-1", "manager")
    inactive_driver = DriverService(db_session).create(
        driver_data("UNIT-LIC-3", DriverStatus.SUSPENDED), "manager-1", "manager"
    )

    with pytest.raises(HTTPException) as missing_driver:
        vehicles.assign_driver(vehicle.id, 99999, "staff-1", "staff")
    assert missing_driver.value.status_code == 404
    with pytest.raises(HTTPException) as inactive:
        vehicles.assign_driver(vehicle.id, inactive_driver.id, "staff-1", "staff")
    assert inactive.value.status_code == 400

    vehicles.assign_driver(vehicle.id, active_driver.id, "staff-1", "staff")
    with pytest.raises(HTTPException) as already_assigned:
        vehicles.assign_driver(vehicle.id, active_driver.id, "staff-1", "staff")
    assert already_assigned.value.status_code == 409
    with pytest.raises(HTTPException) as still_occupied:
        vehicles.assign_driver(vehicle.id, inactive_driver.id, "staff-1", "staff")
    assert still_occupied.value.status_code == 409

    with pytest.raises(HTTPException) as no_assignment:
        vehicles.unassign_driver(99999, "staff-1", "staff")
    assert no_assignment.value.status_code == 404
    vehicles.unassign_driver(vehicle.id, "staff-2", "staff")
    assert vehicle.current_driver_id is None
    history = vehicles.assignment_history(vehicle.id)
    assert len(history) == 1
    assert isinstance(history[0], Assignment)
    assert history[0].assigned_by == "staff-1"
    assert history[0].unassigned_by == "staff-2"
    assert history[0].is_active is False

    with pytest.raises(HTTPException) as empty_unassign:
        vehicles.unassign_driver(vehicle.id, "staff-2", "staff")
    assert empty_unassign.value.status_code == 400


def test_assignment_history_for_unknown_vehicle_is_404(db_session):
    with pytest.raises(HTTPException) as missing:
        VehicleService(db_session).assignment_history(98765)
    assert missing.value.status_code == 404
