/**
 * session msnsgement: stores the token pair issued by the path
 * service(auth/internal/handlers/login.go) 
 * for logging in/out and reading the current user's role
 * tokens kept in localStorage
 */

const ACCESS_TOKEN_KEY = "vfms.access_token";
const REFRESH_TOKEN_KEY = "vfms.refresh_token";
const ROLE_KEY = "vfms.role";

export function getACCESS_TOKEN(){
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(){
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getRole(){
    return localStorage.getItem(ROLE_KEY);
}

export function isAuthenticated(){
    return Boolean(getAccessToken());
}

function storeTokenPair(payload){
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh_token);
    localStorage.setItem(ROLE_KEY, payload.role);
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
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY)
}

