// defines roles VFMS uses
package rbac

type Role string
const (
	Admin	Role = "admin"
	Manager	Role = "manager"
	Staff 	Role = "staff"
)

//validates lists every role the system recognises
var ValidRoles = map[Role]bool{
	Admin:	true,
	Manager:	true,
	Staff:	true,
}

//isValid report whether the given string is a recognized role
func IsValid(role string) bool{
	return ValidRoles[Role(role)]
}

//permissions maps each role to resource
//authorize introspection endpoint and mirrored in the Python backend own RBAC
var permissions = map[Role]map[string]bool{
	Admin:{
		"*":true, // full access, user/role management
	},
	Manager:{
		"vehicle:read":	true,
		"vehicle:write":	true,
		"driver:read":	true,
		"driver:write":	true,
		"assignment:read":	true,
		"assignment:write":	true,
		"maintenance:read":	true,
		"maintenance:write":	true,
		"report:read":	true,
	},
	Staff:{
		"vehicle:read":	true,
		"driver:read":	true,
		"assignment:read":	true,
		"maintenance:read":	true,
		"maintenance:write": true, //staff can log service events
		"report:read":	false,
	},
}

//allowed reports whether role may perform action
func Allowed(role, permission string) bool{
	rolePerms, ok := permissions[Role(role)]
	if !ok{
		return false
	}
	if rolePerms["*"]{
		return true
	}
	return rolePerms[permission]
}
