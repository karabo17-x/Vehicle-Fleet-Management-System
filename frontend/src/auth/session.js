/**
 * session msnsgement: stores the token pair issued by the path
 * service(auth/internal/handlers/login.go) 
 * for logging in/out and reading the current user's role
 * tokens kept in localStorage
 */

const ACCESS_TOKEN_KEY = "vfms.access_token";
const REFRESH_TOKEN_KEY = "vfms.refresh_token";
const ROLE_KEY = "vfms.role";

function readStorageValue(key) {
    try {
        return sessionStorage.getItem(key) ?? localStorage.getItem(key);
    } catch {
        return localStorage.getItem(key);
    }
}

function writeStorageValue(key, value) {
    try {
        sessionStorage.setItem(key, value);
    } catch {
        // ignore storage errors in private browsing / locked down browser modes
    }
    try {
        localStorage.setItem(key, value);
    } catch {
        // ignore storage errors in private browsing / locked down browser modes
    }
}

function clearStorageValue(key) {
    try {
        sessionStorage.removeItem(key);
    } catch {}
    try {
        localStorage.removeItem(key);
    } catch {}
}

export function getAccessToken(){
    return readStorageValue(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(){
    return readStorageValue(REFRESH_TOKEN_KEY);
}

export function getRole(){
    return readStorageValue(ROLE_KEY);
}

export function isAuthenticated(){
    return Boolean(getAccessToken());
}

function storeTokenPair(payload){
    writeStorageValue(ACCESS_TOKEN_KEY, payload.access_token);
    writeStorageValue(REFRESH_TOKEN_KEY, payload.refresh_token);
    writeStorageValue(ROLE_KEY, payload.role);
}

/**
 * Fetch authoritative role from backend /me endpoint and store it locally.
 * Returns true on success, false otherwise.
 */
export async function refreshRoleFromServer(){
    const token = getAccessToken();
    if(!token) return false;
    try{
        const resp = await fetch('/api/v1/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(!resp.ok) return false;
        const body = await resp.json();
        if(body.role) localStorage.setItem(ROLE_KEY, body.role);
        return true;
    }catch(e){
        return false;
    }
}
/**
 * logs in against Go auth service
 */

export async function login(email, password){
    const response = await fetch("/auth/login",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
    });

    if(!response.ok){
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Login failed. Check your email and password");
    }
    const payload = await response.json();
    storeTokenPair(payload);
    return payload;
}

export async function register(fullName, email, password){
    const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password }),
    });

    if(!response.ok){
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Registration failed.");
    }

    const payload = await response.json();
    storeTokenPair(payload);
    return payload;
}

/**
 * exchange the refresh token for new access/refresh pair
 * used by api/client.js when request comes back 401(token expired)
 * returns true on success, false if refresh not valid(caller force a logout)
 */

export async function refreshSession(){
    const refreshToken = getRefreshToken();
    if(!refreshToken) return false;

    const response = await fetch("/auth/refresh", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({refresh_token: refreshToken}),
    });
    if(!response.ok){
        return false;
    }

    const payload = await response.json();
    storeTokenPair(payload);
    return true;
}
export function logout(){
    clearStorageValue(ACCESS_TOKEN_KEY);
    clearStorageValue(REFRESH_TOKEN_KEY);
    clearStorageValue(ROLE_KEY);
}

