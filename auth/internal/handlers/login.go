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
			return
		 }

		 access, refresh, err := issueTokenPair(d, u.ID, u.Email, u.Role)
		 if err != nil {
			writeError(w, http.StatusInternalServerError,"could not issue token")
			return
		 }

		 writeJSON(w, http.StatusOK, tokenResponse{
			AccessToken: access,
			RefreshToken: refresh,
			TokenTYpe: "Bearer",
			ExpiresIn: int64(d.AccessTokenTTL.seconds()),
			Role: u.Role,
		 })
	}
}

func issueTokenPair(d Deps, userID, email, role, role string)(accessToken, refreshToken string, err error){
	now := time.Now()

	access := token.Claims{
		Subject: userID,
		Email: email,
		Role: role,
		TokenType: "access",
		Issuer: d.Issuer,
		IssuedAt: now.Unix(),
		ExpiresAt: now.Add(d.AccessTokenTTL).Unix(),
	}
	refresh := token.Claims{
		Subject: userID,
		Email: email,
		Role: role,
		TokenType: "refresh",
		Issuer: d.Issuer,
		IssuedAt: now.Unix(),
		ExpiresAt: now.Add(d.RefreshTokenTTL).Unix(),
	}


}

func clientIP(r *http.Request) string {
	//behing a reverse proxy,  read X-forwarded-For
	//deployment RemoteAddr sufficient
	return r.RemoteAddr
}

func writeJSON(w http.ResponseWriter, status int, body any){
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)

}

func writeError(w http.ResponseWriter, status int, message string){
	writeJSON(w, status, map[string]string{"error": message})
}



