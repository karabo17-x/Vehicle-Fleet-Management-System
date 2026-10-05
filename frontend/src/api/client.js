/**
 * shared fetch wrapperr for FatAPI backend
 * backend/app/main.py... api_prefix
 * api.js module goes through this instead of calling fetch()
 * auth headers , error handling and token refresh
 */

import { getAccessToken, refreshSession, logout } from "../auth/session.js";

const API_PREFIX = "/api/v1";

// carries HTTP status
export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.message = message;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

async function parseErrorBody(response) {
    const contentType = response.headers.get("content-type") || "";
    try {
        const body = contentType.includes("application/json")
            ? await response.json()
            : await response.text();
        // FastAPI HTTPException(detail=...) shows up as {"detail": "..."}
        if (typeof body === "string") {
            const text = body.trim();
            return text ? `${text.slice(0, 300)} (HTTP ${response.status})` : `Request failed (${response.status})`;
        }
        const detail = body.detail || body.error;
        if (Array.isArray(detail)) {
            return detail.map((issue) => `${(issue.loc || []).join(".")}: ${issue.msg}`).join("; ");
        }
        return detail || `Request failed (${response.status})`;
    } catch {
        return `Request failed (${response.status})`;
    }
}

/**
 * makes one authenticated request. on 401 (expired access token)
 * transparently tries to refresh the session once and retries the request with new token
 */
export async function apiFetch(path, options = {}) {
    const doFetch = () => {
        const token = getAccessToken();
        return fetch(API_PREFIX + path, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
        });
    };

    let response = await doFetch();
    if (response.status === 401) {
        const refreshed = await refreshSession();
        if (refreshed) {
            response = await doFetch();
        } else {
            logout();
            window.location.hash = "#/login";
            throw new ApiError("Your session expired. Please log in again", 401);
        }
    }

    if (!response.ok) {
        throw new ApiError(await parseErrorBody(response), response.status);
    }
    if (response.status === 204) return null; // no body(DELETE)
    return response.json();
}

export function get(path) {
    return apiFetch(path, { method: "GET" });
}

export function post(path, body) {
    return apiFetch(path, { method: "POST", body: JSON.stringify(body) });
}

export function patch(path, body) {
    return apiFetch(path, { method: "PATCH", body: JSON.stringify(body) });
}

export function del(path) {
    return apiFetch(path, { method: "DELETE" });
}
