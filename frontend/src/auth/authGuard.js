/**
 * check the backend does (get_current_user vs require_roles(...)
 * in backend/app/middleware/auth_guard.py)
 */

import { isAuthenticated, getRole } from "./session.js";
/**
 * returns true if the current session is allowed to view a route 
 * if not, redirects to login page and returns false
 */

export function requireAuth(){
    if(isAuthenticated()) return true;
    window.location.hash = "#/login";
    return false;
}

/**
 * returns true if the current sessions role is in roles
 * user isnt logged in, redirects login
 */

export function requireRole(...roles){
    if(!requireAuth()) return false;

    const role = getRole();
    if(role === "admin" || roles.includes(role)) return true;

    window.location.hash = "#/dashboard";
    return false;
}