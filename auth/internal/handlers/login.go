package handlers

import (
	"crypto/rsa"
	"encoding/json"
	"net/http"
	"time"

	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/password"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/ratelimit"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/store"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/token"
)

// deps bundles everything a handler needs. keeps handlers testable in isolation
type Deps struct {
	Users	*store.UserStore
	Keys	*KeyProvider
	Issuer	string
	AccessTokenTTL	time.Duration
	RefreshTokenTTL	time.Duration
	LoginLimiter	*ratelimit.Limiter
}

//keyProvider exposes the RSA handlers
//decoupling handlers from token package loading
type KeyProvider struct {
	Private *rsa.PrivateKey
	Public	*rsa.PublicKey
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
//user store , on access, issues short lived access token , refresh token too
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
			TokenType: "Bearer",
			ExpiresIn: int64(d.AccessTokenTTL.Seconds()),
			Role: u.Role,
		 })
	}
}

func issueTokenPair(d Deps, userID, email, role string)(accessToken, refreshToken string, err error){
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

	accessToken, err = token.Sign(refresh, d.Keys.Private)
	if err != nil {
		return "", "", err
	}
	refreshToken, err = token.Sign(refresh, d.Keys.Private)
	if err != nil {
		return "", "", err
	}
	return accessToken, refreshToken, nil


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



