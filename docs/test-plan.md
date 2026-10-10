# VFMS Test Cases

Written by: VFMS development team
Run by: A tester other than the developer
Date: October 2026

Use the cases below to verify authentication, role access, fleet records, assignments, maintenance, reports, and the user interface. Fill in **Actual Output / Pass / Fail** during execution. Prepare the required test accounts and seeded records before running each case.

| Feature (Fx) | Test Case ID | Test Description | Input Data | Expected Output | Actual Output/Pass/Fail |
|---|---|---|---|---|---|
| #F1 Auth & RBAC | TCID1.1 | Log in with valid credentials | POST /login with a seeded email and the correct password | 200 OK; response contains access_token, refresh_token and role |  |
| #F1 Auth & RBAC | TCID1.2 | Log in with a wrong password | POST /login with a valid email and an incorrect password | 401 Unauthorized; generic message "invalid email or password" (does not reveal which field was wrong) |  |
| #F1 Auth & RBAC | TCID1.3 | Log in with an email that does not exist | POST /login with an email that is not in the system | 401 Unauthorized; same generic message as TCID1.2 (no user enumeration) |  |
| #F1 Auth & RBAC | TCID1.4 | Public signup always creates a staff account | POST /register with email, password (10+ characters) and full name | 201 Created; returned role is "staff", even if a role is sent in the request body |  |
| #F1 Auth & RBAC | TCID1.5 | Register with an email already in use | POST /register using an email that already has an account | 409 Conflict |  |
| #F1 Auth & RBAC | TCID1.6 | Register with a password that is too short | POST /register with a 6-character password | 400 Bad Request; account is not created |  |
| #F1 Auth & RBAC | TCID1.7 | Refresh an access token | POST /refresh with a valid refresh token | 200 OK; new access and refresh tokens issued; the old refresh token can no longer be used |  |
| #F1 Auth & RBAC | TCID1.8 | Call a protected route with an invalid or expired token | GET /api/v1/vehicles with a tampered or expired Bearer token | 401 Unauthorized |  |
| #F1 Auth & RBAC | TCID1.9 | Staff tries a manager-only action | POST /api/v1/vehicles with a valid staff token | 403 Forbidden (token is valid, but the role is not allowed) |  |
| #F1 Auth & RBAC | TCID1.10 | Repeated failed logins are rate limited | 6 or more rapid POST /login attempts with a wrong password from the same IP | Once the limit is reached: 429 Too Many Requests |  |
| #F2 Vehicles | TCID2.1 | Manager creates a vehicle | POST /api/v1/vehicles with registration number, make, model and year | 201 Created; full vehicle object returned with a generated id |  |
| #F2 Vehicles | TCID2.2 | Create a vehicle with a duplicate registration number | POST /api/v1/vehicles with a registration_number that already exists | 409 Conflict |  |
| #F2 Vehicles | TCID2.3 | Create a vehicle with an invalid year | POST /api/v1/vehicles with year 1800 (allowed range is 1950-2100) | 422 Unprocessable Entity |  |
| #F2 Vehicles | TCID2.4 | Staff tries to create a vehicle | POST /api/v1/vehicles with a staff token | 403 Forbidden |  |
| #F2 Vehicles | TCID2.5 | Search vehicles by registration number | GET /api/v1/vehicles?search=CA123 | 200 OK; only matching vehicles are returned |  |
| #F2 Vehicles | TCID2.6 | Partially update a vehicle | PATCH /api/v1/vehicles/{id} with only the status field | 200 OK; only status changes, all other fields stay the same |  |
| #F2 Vehicles | TCID2.7 | Manager deletes a vehicle | DELETE /api/v1/vehicles/{id} | 204 No Content; the vehicle no longer appears in the list |  |
| #F3 Drivers | TCID3.1 | Manager creates a driver | POST /api/v1/drivers with name, license_number and license_expiry | 201 Created; full driver object returned |  |
| #F3 Drivers | TCID3.2 | Create a driver with a duplicate licence number | POST /api/v1/drivers with a license_number that already exists | 409 Conflict |  |
| #F3 Drivers | TCID3.3 | Staff views the driver list | GET /api/v1/drivers with a staff token | 200 OK; license_number and license_expiry are NOT included in the returned drivers |  |
| #F3 Drivers | TCID3.4 | Manager views the driver list | GET /api/v1/drivers with a manager token | 200 OK; full driver details, including license_number |  |
| #F3 Drivers | TCID3.5 | Create a driver with an invalid email | POST /api/v1/drivers with email "not-an-email" | 422 Unprocessable Entity |  |
| #F3 Drivers | TCID3.6 | Manager deletes a driver | DELETE /api/v1/drivers/{id} | 204 No Content |  |
| #F4 / Assignment | TCID4.1 | Staff assigns a driver to a vehicle | POST /api/v1/vehicles/{id}/assign with an existing active driver_id and a staff token | 200 OK; the vehicle's current_driver_id is set and an assignment record is created |  |
| #F4 / Assignment | TCID4.2 | Assign a driver that does not exist | POST /api/v1/vehicles/{id}/assign with a driver_id that does not exist | 404 Not Found |  |
| #F4 / Assignment | TCID4.3 | Unassign a vehicle's current driver | POST /api/v1/vehicles/{id}/unassign (no body) | 200 OK; current_driver_id is cleared (null) |  |
| #F4 / Assignment | TCID4.4 | View a vehicle's assignment history | GET /api/v1/assignments/vehicle/{id} | 200 OK; list of all past and current assignments for that vehicle |  |
| #F4 / Assignment | TCID4.5 | Assignment records the authenticated user | Assign a driver using a valid token, then GET /api/v1/assignments/vehicle/{id} | The new record's assigned_by matches the authenticated user's identity |  |
| #F5 Maintenance | TCID5.1 | Staff logs a maintenance record | POST /api/v1/maintenance with vehicle_id, service_date, description, cost and a staff token | 201 Created; record saved and logged_by set to the caller's identity |  |
| #F5 Maintenance | TCID5.2 | Log maintenance for a vehicle that does not exist | POST /api/v1/maintenance with a vehicle_id that does not exist | 404 Not Found |  |
| #F5 Maintenance | TCID5.3 | Log maintenance with a negative cost | POST /api/v1/maintenance with cost -50 | 422 Unprocessable Entity |  |
| #F5 Maintenance | TCID5.4 | Filter maintenance records by vehicle | GET /api/v1/maintenance?vehicle_id={id} | 200 OK; only that vehicle's records are returned |  |
| #F5 Maintenance | TCID5.5 | Staff tries to delete a maintenance record | DELETE /api/v1/maintenance/{id} with a staff token | 403 Forbidden |  |
| #F6 / Reports | TCID6.1 | Manager views the fleet summary | GET /api/v1/reports/summary with a manager token | 200 OK; response contains total vehicles, total drivers, vehicle counts by status and total maintenance cost |  |
| #F6 / Reports | TCID6.2 | Staff views the fleet summary | GET /api/v1/reports/summary with a staff token | 200 OK; summary is returned to the authorised staff user |  |
| #F6 / Reports | TCID6.3 | Expiring documents report | GET /api/v1/reports/expiring-documents?days=30 | 200 OK; only vehicles and drivers whose insurance, roadworthy or licence expires within 30 days are listed |  |
| #F6 / Reports | TCID6.4 | View maintenance cost by vehicle | GET /api/v1/reports/maintenance-cost-by-vehicle with an authenticated token | 200 OK; one result per vehicle, with service count and total cost; results are ordered by vehicle ID |  |
| #F7 / Frontend | TCID7.1 | Log in through the UI with valid credentials | Enter a seeded email and the correct password on the login screen and click Login | Redirected to the dashboard; navigation bar and Log out button appear |  |
| #F7 / Frontend | TCID7.2 | Log in through the UI with invalid credentials | Enter a valid email and a wrong password | Error message shown on the login form; user stays on the login screen |  |
| #F7 / Frontend | TCID7.3 | Sign up through the UI | Fill in the signup form with a new email, full name and a password of 10+ characters | Account is created, the user is logged in and lands on the dashboard |  |
| #F7 / Frontend | TCID7.4 | Staff sees vehicle controls allowed by their role | Log in as staff and open the Vehicles page | Vehicle list is available; create, edit and delete controls are not shown |  |
| #F7 / Frontend | TCID7.5 | Staff cannot see a driver's licence number | Log in as staff and open the Drivers page | Licence number is not shown in the driver list |  |
| #F7 / Frontend | TCID7.6 | Manager can use vehicle management controls | Log in as manager and open the Vehicles page | Add, edit and delete controls are visible; valid changes are saved |  |
| #F7 / Frontend | TCID7.7 | Form validation blocks an incomplete submission | Submit the "Add vehicle" form with the registration field left empty | A validation message is shown; no request is sent to the backend |  |
| #F7 / Frontend | TCID7.8 | Assign a driver to a vehicle from the UI | Open a vehicle, choose a driver and click Assign | The vehicle shows the newly assigned driver without a full page reload |  |
| #F7 / Frontend | TCID7.9 | Expired session redirects to login | Let the access token expire (or clear it) and open a protected page | User is redirected to the login page instead of seeing a broken page |  |
| #F7 / Frontend | TCID7.10 | Logout clears the session | Click Log out on any page | Tokens are cleared and the user is sent to the login page; going back does not restore access |  |
| #F1 / Auth & RBAC | TCID1.11 | Unauthenticated user cannot access protected data | GET /api/v1/vehicles without an Authorization header | 401 Unauthorized; no vehicle data is returned |  |
| #F2 / Vehicles | TCID2.8 | View the vehicle list | GET /api/v1/vehicles with a valid token | 200 OK; response contains items, total, skip and limit |  |
| #F2 / Vehicles | TCID2.9 | View one vehicle's details | GET /api/v1/vehicles/{id} for an existing vehicle | 200 OK; response contains the requested vehicle details |  |
| #F2 / Vehicles | TCID2.10 | Filter vehicles by status | GET /api/v1/vehicles?status=available with a valid token | 200 OK; returned vehicles match the requested status and pagination metadata is present |  |
| #F2 / Vehicles | TCID2.11 | Reject access to a missing vehicle | GET /api/v1/vehicles/{id} for an ID that does not exist | 404 Not Found |  |
| #F3 / Drivers | TCID3.7 | Search drivers by name or licence number | GET /api/v1/drivers?search={existing name or licence number} with a manager token | 200 OK; only matching driver records are returned |  |
| #F3 / Drivers | TCID3.8 | Staff cannot retrieve a driver's licence number | GET /api/v1/drivers/{id} with a staff token | 200 OK; driver details are returned without license_number or license_expiry |  |
| #F3 / Drivers | TCID3.9 | Update a driver record | PATCH /api/v1/drivers/{id} with a manager token and a valid changed field | 200 OK; the changed field is saved and other fields remain unchanged |  |
| #F3 / Drivers | TCID3.10 | Reject access to a missing driver | GET /api/v1/drivers/{id} for an ID that does not exist | 404 Not Found |  |
| #F4 / Assignment | TCID4.6 | Prevent assignment when the vehicle already has a driver | Assign a second driver to a vehicle with an active assignment | 409 Conflict; the existing assignment remains unchanged |  |
| #F4 / Assignment | TCID4.7 | Prevent one driver from being assigned to two vehicles | Assign a driver who already has an active vehicle assignment to another vehicle | 409 Conflict; the second vehicle remains unassigned |  |
| #F4 / Assignment | TCID4.8 | Reject assignment of an inactive driver | Assign a driver whose status is inactive | 400 Bad Request; no assignment is created |  |
| #F4 / Assignment | TCID4.9 | Unassigning closes the assignment history record | Unassign a currently assigned vehicle, then GET its assignment history | 200 OK; vehicle has no current driver and the previous assignment has an unassigned date and user |  |
| #F5 / Maintenance | TCID5.6 | View maintenance history for a vehicle | GET /api/v1/maintenance?vehicle_id={id} with a valid token | 200 OK; matching records are returned in descending service-date order |  |
| #F5 / Maintenance | TCID5.7 | View an individual maintenance record | GET /api/v1/maintenance/{id} for an existing record | 200 OK; the requested maintenance record is returned |  |
| #F5 / Maintenance | TCID5.8 | Reject maintenance record with an invalid cost | POST /api/v1/maintenance with a negative cost and an authorised token | 422 Unprocessable Entity; the record is not saved |  |
| #F6 / Reports | TCID6.5 | View expiring document report | GET /api/v1/reports/expiring-documents?days=30 with a valid token | 200 OK; items include driver licences and vehicle insurance or roadworthy documents expiring on or before the cutoff, sorted by expiry date |  |
| #F7 / Frontend | TCID7.11 | Search vehicles from the UI | Enter an existing registration, make or model in the vehicle search field | Matching vehicles are shown; a term with no matches shows an empty-results message |  |
| #F7 / Frontend | TCID7.12 | Search drivers from the UI | Log in as manager and search using a driver's name or licence number | Matching driver records are shown; staff results omit licence details |  |
