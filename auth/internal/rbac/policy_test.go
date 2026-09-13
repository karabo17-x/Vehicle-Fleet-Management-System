package rbac

import "testing"

func TestAdminHasFullAccess(t *testing.T){
	if !Allowed("admin", "vehicle:write"){
		t.Error("admin should be allowed vehicle:write")
	}
	if !Allowed("admin", "anything:at-all"){
		t.Error("admin should be allowed any permission")
	}
}

func TestStaffCannotWriteVehicles(t * testing.T){
	if Allowed("staff", "vehicle:write"){
		t.Error("staff should not be allowed vehicle:write")
	}
	if !Allowed("staff", "vehicle:read"){
		t.Error("staff should be allowed vehicle:read")
	}
}

func TestUnknownRolesIsDenied(t *testing.T){
	if Allowed("intern", "vehicle:read"){
		t.Error("unrecongised role should never be allowed")
	}
	if IsValid("intern"){
		t.Error("'intern' should not be a valid role")
	}
}

