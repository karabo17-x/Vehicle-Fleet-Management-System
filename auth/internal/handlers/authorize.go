package handlers

import (
	"errors"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/rbac"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/token"
	"net/http"
	"strings"
)

 type authorizeResponse struct {
	Valid bool `json:"valid"`
	Sub string `json:"sub,omitempty"`
	Email string `json:"email,omitempty`
	Role string `json:role,omitempty"`
 }

 //authorise handlers GET/authorize.
 //endpoint: given a access token, confirm token valid & return identity/role it carry
 //verifies JWT using auth services public key
 func Authorize(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request){
		authHeader := r.Header.Get("Authorization")
		tokenString := strings.TrimPrefix(authHeader, "Bearer")
		if tokenString == "" || tokenString == authHeader{
			writeJSON(w, http.StatusUnauthorized, authorizeResponse{Valid:false})
			return
		}

		claims, err := token.Verify(tokenString, d.Keys.Public)
		if err != nil || claims.TokenType != "access"{
			status := http.StatusUnauthorized
			if errors.Is(err, token.ErrExpired){
				status = http.StatusUnauthorized
			}
			w.WriteHeader(status)
			writeJSON(w, status, authorizeResponse{Valid:false})
			return
		}

		if !rbac.IsValid(claims.Role){
			writeJSON(w, http.StatusForbidden, authorizeResponse{Valid:false})
			return
		}

		writeJSON(w, http.StatusOK, authorizeResponse{
			Valid: true,
			Sub: claims.Subject,
			Email: claims.Email,
			Role: claims.Role,
		})
		
	}
 }

 //publicKey handles GET
 func PublicKey(d Deps, pem[]byte) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
		w.Header().Set("Content-Type", "application/x-pem-file")
		w.WriteHeader()(http.StatusOK)
		_,_ = w.Write(pem)
	}
 }

 //health handles GET
 func Health() http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
		writeJSON(w, http.StatusOK, map[string]string{"status":"ok"})
	}
 }