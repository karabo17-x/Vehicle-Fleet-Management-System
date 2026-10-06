package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"unicode/utf8"

	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/rbac"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/store"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/token"
)

type createUserRequest struct {
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

// CreateUser allows an authenticated administrator to provision an account.
// Public self-registration is intentionally not enabled.
func CreateUser(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		header := strings.SplitN(r.Header.Get("Authorization"), " ", 2)
		if len(header) != 2 || !strings.EqualFold(header[0], "Bearer") {
			writeError(w, http.StatusUnauthorized, "valid admin access token required")
			return
		}
		claims, err := token.Verify(header[1], d.Keys.Public)
		if err != nil || claims.TokenType != "access" || claims.Issuer != d.Issuer {
			writeError(w, http.StatusUnauthorized, "valid admin access token required")
			return
		}
		if claims.Role != "admin" {
			writeError(w, http.StatusForbidden, "administrator role required")
			return
		}
		var req createUserRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || !validEmail(req.Email) {
			writeError(w, http.StatusBadRequest, "valid email, full_name, password, and role are required")
			return
		}
		req.Email = strings.ToLower(strings.TrimSpace(req.Email))
		req.FullName = strings.TrimSpace(req.FullName)
		if utf8.RuneCountInString(req.FullName) == 0 || utf8.RuneCountInString(req.FullName) > 100 || !validNewPassword(req.Password) || !rbac.IsValid(req.Role) {
			writeError(w, http.StatusBadRequest, "full_name must be 1–100 characters, password 12–128 characters, and role must be admin, manager, or staff")
			return
		}
		user, err := d.Users.Create(req.Email, req.Password, req.Role, req.FullName)
		if err != nil {
			if errors.Is(err, store.ErrAlreadyExists) {
				writeError(w, http.StatusConflict, "email is already registered")
				return
			}
			writeError(w, http.StatusInternalServerError, "could not create user")
			return
		}
		writeJSON(w, http.StatusCreated, map[string]string{
			"id":        user.ID,
			"email":     user.Email,
			"full_name": user.FullName,
			"role":      user.Role,
		})
	}
}
