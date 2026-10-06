package store

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/password"
)

// ErrNotFound is returned when no user matches the given email
var ErrNotFound = errors.New("store: user not found")

// ErrAlreadyExist is returned by create when the email is taken
var ErrAlreadyExists = errors.New("store: user already exists")

// user is an authenticable account
type User struct {
	ID           string `json:"id"`
	Email        string `json:"email"`
	PasswordHash string `json:"password_hash"`
	Role         string `json:"role"`
	FullName     string `json:"full_name"`
}

// UserStore is a concurrency-safe account store backed by a private JSON file
// when created with NewPersistentUserStore.
type UserStore struct {
	mu       sync.RWMutex
	byID     map[string]*User
	byMail   map[string]*User
	seq      int
	dataFile string
}

// NewPersistentUserStore loads users from a private JSON file and persists
// every account or password change using an atomic file replacement.
func NewPersistentUserStore(path string) (*UserStore, error) {
	s := NewUserStore()
	s.dataFile = path
	if path == "" {
		return s, nil
	}
	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return s, nil
	}
	if err != nil {
		return nil, fmt.Errorf("read auth user store: %w", err)
	}
	var users []User
	if err := json.Unmarshal(data, &users); err != nil {
		return nil, fmt.Errorf("decode auth user store: %w", err)
	}
	for i := range users {
		u := users[i]
		u.Email = strings.ToLower(strings.TrimSpace(u.Email))
		s.byID[u.ID] = &u
		s.byMail[u.Email] = &u
		if seq, err := strconv.Atoi(strings.TrimPrefix(u.ID, "usr-")); err == nil && seq > s.seq {
			s.seq = seq
		}
	}
	return s, nil
}

// newUserStore returns an empty store
func NewUserStore() *UserStore {
	return &UserStore{
		byID:   make(map[string]*User),
		byMail: make(map[string]*User),
	}
}

// create adds a new user with a bcrpt hashed password
func (s *UserStore) Create(email, plaintextPassword, role, fullName string) (*User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	email = strings.ToLower(strings.TrimSpace(email))
	if _, exists := s.byMail[email]; exists {
		return nil, ErrAlreadyExists
	}

	hash, err := password.Hash(plaintextPassword)
	if err != nil {
		return nil, err
	}

	s.seq++
	u := &User{
		ID:           idFromSeq(s.seq),
		Email:        email,
		PasswordHash: hash,
		Role:         role,
		FullName:     fullName,
	}
	s.byID[u.ID] = u
	s.byMail[u.Email] = u
	if err := s.persistLocked(); err != nil {
		delete(s.byID, u.ID)
		delete(s.byMail, u.Email)
		s.seq--
		return nil, err
	}
	return u, nil
}

// findbyemail looks up a user by email address.
func (s *UserStore) FindByEmail(email string) (*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	u, ok := s.byMail[strings.ToLower(strings.TrimSpace(email))]
	if !ok {
		return nil, ErrNotFound
	}
	return u, nil
}

// findbyID look up user internal ID(used when refreshing)
// token to make the account still exists
func (s *UserStore) FindByID(id string) (*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	u, ok := s.byID[id]
	if !ok {
		return nil, ErrNotFound
	}
	return u, nil
}

// UpdatePassword replaces a user's password hash after a verified recovery flow.
func (s *UserStore) UpdatePassword(email, newPassword string) error {
	hash, err := password.Hash(newPassword)
	if err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	u, ok := s.byMail[strings.ToLower(strings.TrimSpace(email))]
	if !ok {
		return ErrNotFound
	}
	oldHash := u.PasswordHash
	u.PasswordHash = hash
	if err := s.persistLocked(); err != nil {
		u.PasswordHash = oldHash
		return err
	}
	return nil
}

func (s *UserStore) persistLocked() error {
	if s.dataFile == "" {
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(s.dataFile), 0o700); err != nil {
		return err
	}
	users := make([]User, 0, len(s.byID))
	for _, user := range s.byID {
		users = append(users, *user)
	}
	data, err := json.MarshalIndent(users, "", "  ")
	if err != nil {
		return err
	}
	tmp := s.dataFile + ".tmp"
	if err := os.WriteFile(tmp, data, 0o600); err != nil {
		return err
	}
	if err := os.Rename(tmp, s.dataFile); err != nil {
		_ = os.Remove(tmp)
		return err
	}
	return nil
}

func idFromSeq(seq int) string {
	const digits = "0123456789"
	//number ID
	buf := make([]byte, 4)
	for i := 3; i >= 0; i-- {
		buf[i] = digits[seq%10]
		seq /= 10
	}
	return "usr-" + string(buf)
}

// SeedDemoUsers for demo RBAC without the registration UI first
// dev-only seed data, never used outside local
func (s *UserStore) SeedDemoUsers() error {
	seeds := []struct {
		email, pass, role, name string
	}{
		{"admin@vfms.com", "Admin@12345", "admin", "Fleet Administrator"},
		{"manager@vfms.com", "Manager@12345", "manager", "Fleet Manager"},
		{"staff@vfms.com", "Staff@12345", "staff", "Fleet Staff"},
	}
	for _, u := range seeds {
		if _, err := s.Create(u.email, u.pass, u.role, u.name); err != nil && !errors.Is(err, ErrAlreadyExists) {
			return err
		}
	}
	return nil
}
