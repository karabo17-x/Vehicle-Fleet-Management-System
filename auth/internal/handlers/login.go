package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/password"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/ratelimit"
)

type Deps struct {
	Issuer	string
	AccessTokenTTL	time.Duration
	RefreshTokenTTL	time.Duration
	LoginLimiter	*ratelimit.Limiter
}

type loginRequest struct {
	Email string `json:"email"`
	Password string `json:"password"`
}

type tokenResponse struct {
	AccessToken string `json:"access_token"`
	RefreshToekn string `json:"refresh_token"`
	TokenType string `json:"token_type"`
	ExpiresIn int64 `json:"expires_in"`
	Role string `json:"role"`
}

//login handles POST/login, validate credentials 
func Login(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request){
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		 clientKey := clientIP(r)
		 if !d.LoginLimiter.Allow(clientKey){
			writeError(w, http.StatusTooManyRequests, "too many attempts, try again later")
			return
		 }

		 var req loginRequest
		 if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "Invalid request")
			return
		 }
		 
		 u, err := d.Users.FindByEmail(req.Email)
		 if err != nil || !password.Verify(u.PasswordHash, req.Password){
			//same error for "no such user" and "wrong password"
			//dnt leak which emails are registered
			writeError(w, http.StatusUnauthorized, "Invalid email or password")
			
		 }
	}
}


