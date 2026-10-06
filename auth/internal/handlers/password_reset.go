package handlers

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"net/mail"
	"net/smtp"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/password"
)

const resetCodeTTL = 10 * time.Minute
const maxResetAttempts = 5

type resetCode struct {
	hash      string
	expiresAt time.Time
	attempts  int
}

// ResetCodes holds short-lived recovery codes. Codes are stored as password
// hashes and are deliberately invalidated when the auth process restarts.
type ResetCodes struct {
	mu    sync.Mutex
	codes map[string]resetCode
}

func NewResetCodes() *ResetCodes { return &ResetCodes{codes: make(map[string]resetCode)} }

type forgotPasswordRequest struct {
	Email string `json:"email"`
}

type completeResetRequest struct {
	Email       string `json:"email"`
	Code        string `json:"code"`
	NewPassword string `json:"new_password"`
}

const resetAcceptedMessage = "If an account exists for that email, a recovery code has been sent."

// ForgotPassword always returns the same response for known and unknown
// accounts, preventing email address enumeration.
func ForgotPassword(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			writeError(w, 405, "method not allowed")
			return
		}
		if d.ResetLimiter != nil && !d.ResetLimiter.Allow(clientIP(r)) {
			writeError(w, 429, "too many recovery requests; try again later")
			return
		}
		var req forgotPasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || !validEmail(req.Email) {
			writeError(w, 400, "valid email is required")
			return
		}
		email := strings.ToLower(strings.TrimSpace(req.Email))
		_, accountErr := d.Users.FindByEmail(email)
		code, err := newRecoveryCode()
		if err == nil {
			var hash string
			hash, err = password.Hash(code) // Do the same expensive work for unknown addresses.
			if err == nil && accountErr == nil {
				d.ResetCodes.mu.Lock()
				now := time.Now()
				for address, entry := range d.ResetCodes.codes {
					if now.After(entry.expiresAt) {
						delete(d.ResetCodes.codes, address)
					}
				}
				d.ResetCodes.codes[email] = resetCode{hash: hash, expiresAt: now.Add(resetCodeTTL)}
				d.ResetCodes.mu.Unlock()
				go func() {
					if sendErr := sendRecoveryEmail(d, email, code); sendErr != nil {
						log.Printf("auth: could not send password recovery email: %v", sendErr)
					}
				}()
			}
		}
		if err != nil {
			log.Printf("auth: could not create password recovery code: %v", err)
		}
		writeJSON(w, 202, map[string]string{"message": resetAcceptedMessage})
	}
}

// ResetPassword consumes a valid, unexpired recovery code exactly once.
func ResetPassword(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			writeError(w, 405, "method not allowed")
			return
		}
		if d.ResetLimiter != nil && !d.ResetLimiter.Allow(clientIP(r)) {
			writeError(w, 429, "too many recovery attempts; try again later")
			return
		}
		var req completeResetRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || !validEmail(req.Email) {
			writeError(w, 400, "email, code, and new password are required")
			return
		}
		if !validNewPassword(req.NewPassword) {
			writeError(w, 400, "new password must contain 12 to 128 characters")
			return
		}
		if !validRecoveryCode(req.Code) {
			writeError(w, 400, "invalid or expired recovery code")
			return
		}
		email := strings.ToLower(strings.TrimSpace(req.Email))
		d.ResetCodes.mu.Lock()
		entry, exists := d.ResetCodes.codes[email]
		if !exists || time.Now().After(entry.expiresAt) || entry.attempts >= maxResetAttempts {
			delete(d.ResetCodes.codes, email)
			d.ResetCodes.mu.Unlock()
			writeError(w, 400, "invalid or expired recovery code")
			return
		}
		entry.attempts++
		if !password.Verify(entry.hash, req.Code) {
			d.ResetCodes.codes[email] = entry
			d.ResetCodes.mu.Unlock()
			writeError(w, 400, "invalid or expired recovery code")
			return
		}
		delete(d.ResetCodes.codes, email)
		d.ResetCodes.mu.Unlock()
		if err := d.Users.UpdatePassword(email, req.NewPassword); err != nil {
			writeError(w, 400, "invalid or expired recovery code")
			return
		}
		writeJSON(w, 200, map[string]string{"message": "Password updated. Please sign in with your new password."})
	}
}

func validEmail(value string) bool {
	address, err := mail.ParseAddress(strings.TrimSpace(value))
	return err == nil && address.Address == strings.TrimSpace(value)
}

func validNewPassword(value string) bool {
	length := utf8.RuneCountInString(value)
	return length >= 12 && length <= 128
}

func validRecoveryCode(value string) bool {
	if len(value) != 6 {
		return false
	}
	for _, digit := range value {
		if digit < '0' || digit > '9' {
			return false
		}
	}
	return true
}

func newRecoveryCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

func sendRecoveryEmail(d Deps, recipient, code string) error {
	if d.SMTPHost == "" || d.SMTPFrom == "" {
		return fmt.Errorf("SMTP_HOST and SMTP_FROM must be configured")
	}
	from, err := mail.ParseAddress(d.SMTPFrom)
	if err != nil {
		return fmt.Errorf("invalid SMTP_FROM address: %w", err)
	}
	auth := smtp.Auth(nil)
	if d.SMTPUsername != "" {
		auth = smtp.PlainAuth("", d.SMTPUsername, d.SMTPPassword, d.SMTPHost)
	}
	message := []byte("To: " + recipient + "\r\n" +
		"From: " + from.String() + "\r\n" +
		"Subject: VFMS password recovery code\r\n" +
		"MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" +
		"Your VFMS password recovery code is " + code + ". It expires in 10 minutes. If you did not request this, ignore this email.\r\n")
	return smtp.SendMail(d.SMTPHost+":"+d.SMTPPort, auth, from.Address, []string{recipient}, message)
}
