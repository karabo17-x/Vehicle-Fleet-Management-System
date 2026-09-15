package handlers

import (
	"encoding/json"
	"errors"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/token"
	"net/http"
)

type refreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

//refresh handles POST/refresh, verifies refresh token still valid
//issue new access token and rotates refresh token

func Refresh(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request){
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		var req refreshRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request")
			return
		}
		 claims, err := token.Verify(req.RefreshToken, d.Keys.Public)
		 if err != nil {
			status := http.StatusUnauthorized
			msg := "invalid refresh token"
			if errors.Is(err, token.ErrExpired) {
				msg = "refresh token expired, please log in again"
			}
			writeError(w, status, msg)
			return
		 }
		 
		 if claims.TokenType != "refresh" {
			writeError(w, http.StatusUnauthorized, "not a refresh toekn")
			return
		 }

		 //confirm account exist
		 u, err := d.Users.FindByID(claims.Subject)
		 if err != nil {
			writeError(w, http.StatusUnauthorized, "account no longer exists")
		 }

		 access, refresh, err := issueTokenPair(d, u.ID, u.Email, u.Role)
		 if err != nil {
			writeError(w, http.StatusInternalServerError, "could not issue token")
			return 
		 }

		 writeJSON(w, http.StatusOK, tokenResponse{
			AccessToken: access,
			RefreshToekn: refresh,
			TokenType: "Bearer",
			ExpiresIn: int64(d.AccessTokenTTL.Seconds()),
			
		 })

	}
}