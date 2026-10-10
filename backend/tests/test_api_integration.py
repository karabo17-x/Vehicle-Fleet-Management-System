from datetime import datetime, timedelta

import pytest


def vehicle_payload(registration="TST-001"):
    return {"registration_number": registration, "make": "Toyota", "model": "Corolla", "year": 2022}


def driver_payload(license_number="LIC-001"):
    return {
        "first_name": "Sam", "last_name": "Driver", "license_number": license_number,
        "license_expiry": (datetime.utcnow() + timedelta(days=365)).isoformat(),
        "email": "sam@example.com",
    }


def test_vehicle_crud_and_input_edges(client, auth_headers):
    manager = auth_headers("manager")
    created = client.post("/api/v1/vehicles", json=vehicle_payload(), headers=manager)
    assert created.status_code == 201
    vehicle_id = created.json()["id"]

    assert client.post("/api/v1/vehicles", json=vehicle_payload(), headers=manager).status_code == 409
    listed = client.get("/api/v1/vehicles?search=Toyota", headers=auth_headers("staff"))
    assert listed.status_code == 200 and listed.json()["total"] == 1
    assert client.get(f"/api/v1/vehicles/{vehicle_id}", headers=manager).status_code == 200
    updated = client.patch(f"/api/v1/vehicles/{vehicle_id}", json={"make": "Honda"}, headers=manager)
    assert updated.status_code == 200 and updated.json()["make"] == "Honda"
    assert client.patch(f"/api/v1/vehicles/{vehicle_id}", json={"year": 1800}, headers=manager).status_code == 422
    assert client.delete(f"/api/v1/vehicles/{vehicle_id}", headers=manager).status_code == 204
    assert client.get(f"/api/v1/vehicles/{vehicle_id}", headers=manager).status_code == 404
    assert client.get("/api/v1/vehicles/99999", headers=manager).status_code == 404


def test_driver_crud_and_sensitive_fields_are_role_limited(client, auth_headers):
    manager = auth_headers("manager")
    created = client.post("/api/v1/drivers", json=driver_payload(), headers=manager)
    assert created.status_code == 201
    driver_id = created.json()["id"]
    assert client.post("/api/v1/drivers", json=driver_payload(), headers=manager).status_code == 409

    staff = auth_headers("staff")
    detail = client.get(f"/api/v1/drivers/{driver_id}", headers=staff)
    assert detail.status_code == 200
    assert "license_number" not in detail.json()
    assert "license_expiry" not in detail.json()
    assert client.get(f"/api/v1/drivers/{driver_id}", headers=manager).json()["license_number"] == "LIC-001"

    updated = client.patch(f"/api/v1/drivers/{driver_id}", json={"first_name": "Alex"}, headers=manager)
    assert updated.status_code == 200 and updated.json()["first_name"] == "Alex"
    assert client.patch(f"/api/v1/drivers/{driver_id}", json={"license_number": "LIC-001"}, headers=manager).status_code == 200
    assert client.delete(f"/api/v1/drivers/{driver_id}", headers=manager).status_code == 204
    assert client.get(f"/api/v1/drivers/{driver_id}", headers=manager).status_code == 404


def test_rbac_for_crud_and_assignment_actions(client, auth_headers):
    staff = auth_headers("staff")
    assert client.post("/api/v1/vehicles", json=vehicle_payload(), headers=staff).status_code == 403
    assert client.post("/api/v1/drivers", json=driver_payload(), headers=staff).status_code == 403
    assert client.patch("/api/v1/vehicles/1", json={"make": "X"}, headers=staff).status_code == 403
    assert client.delete("/api/v1/drivers/1", headers=staff).status_code == 403

    admin = auth_headers("admin")
    assert client.post("/api/v1/vehicles", json=vehicle_payload(), headers=admin).status_code == 201
    assert client.post("/api/v1/drivers", json=driver_payload(), headers=admin).status_code == 201


def test_assignment_history_and_assignment_edge_cases(client, auth_headers):
    manager = auth_headers("manager")
    staff = auth_headers("staff")
    vehicle_id = client.post("/api/v1/vehicles", json=vehicle_payload(), headers=manager).json()["id"]
    driver_id = client.post("/api/v1/drivers", json=driver_payload(), headers=manager).json()["id"]

    assert client.post(f"/api/v1/vehicles/{vehicle_id}/assign", json={"driver_id": 9999}, headers=staff).status_code == 404
    assert client.post(f"/api/v1/vehicles/{vehicle_id}/assign", json={"driver_id": driver_id}, headers=staff).status_code == 200
    assert client.post(f"/api/v1/vehicles/{vehicle_id}/assign", json={"driver_id": driver_id}, headers=manager).status_code == 409

    history_url = f"/api/v1/assignments/vehicle/{vehicle_id}"
    first = client.get(history_url, headers=staff)
    assert first.status_code == 200 and len(first.json()) == 1
    assert first.json()[0]["is_active"] is True
    assert first.json()[0]["assigned_by"] == "user-1"

    assert client.post(f"/api/v1/vehicles/{vehicle_id}/unassign", headers=staff).status_code == 200
    assert client.post(f"/api/v1/vehicles/{vehicle_id}/unassign", headers=manager).status_code == 400
    closed = client.get(history_url, headers=manager).json()[0]
    assert closed["is_active"] is False
    assert closed["unassigned_at"] is not None
    assert closed["unassigned_by"] == "user-1"

    second_driver_id = client.post("/api/v1/drivers", json=driver_payload("LIC-002"), headers=manager).json()["id"]
    client.post(f"/api/v1/vehicles/{vehicle_id}/assign", json={"driver_id": second_driver_id}, headers=staff)
    history = client.get(history_url, headers=manager).json()
    assert len(history) == 2
    assert sum(row["is_active"] for row in history) == 1
    assert client.get("/api/v1/assignments/vehicle/9999", headers=manager).status_code == 404


def test_maintenance_create_list_get_and_delete_permissions(client, auth_headers):
    manager = auth_headers("manager")
    staff = auth_headers("staff")
    vehicle_id = client.post("/api/v1/vehicles", json=vehicle_payload(), headers=manager).json()["id"]
    payload = {
        "vehicle_id": vehicle_id, "service_date": datetime.utcnow().isoformat(),
        "description": "Oil change", "cost": 120.50,
    }
    created = client.post("/api/v1/maintenance", json=payload, headers=staff)
    assert created.status_code == 201
    record_id = created.json()["id"]
    assert created.json()["logged_by"] == "user-1"
    assert client.post("/api/v1/maintenance", json={**payload, "vehicle_id": 99999}, headers=staff).status_code == 404
    assert client.post("/api/v1/maintenance", json={**payload, "cost": -1}, headers=staff).status_code == 422
    assert client.get(f"/api/v1/maintenance/{record_id}", headers=staff).status_code == 200
    assert client.get(f"/api/v1/maintenance?vehicle_id={vehicle_id}", headers=staff).json()["total"] == 1
    assert client.delete(f"/api/v1/maintenance/{record_id}", headers=staff).status_code == 403
    assert client.delete(f"/api/v1/maintenance/{record_id}", headers=manager).status_code == 204
    assert client.get(f"/api/v1/maintenance/{record_id}", headers=manager).status_code == 404
    assert client.delete("/api/v1/maintenance/99999", headers=manager).status_code == 404


@pytest.mark.parametrize("endpoint", ["/api/v1/vehicles", "/api/v1/drivers", "/api/v1/maintenance"])
def test_protected_endpoints_require_auth(client, endpoint):
    assert client.get(endpoint).status_code == 401
