package store

import (
	"errors"
	"sync"

	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/password"
)

//ErrNotFound is returned when no user matches the given email
var ErrNotFound = errors.New("store: user not found")

//ErrAlreadyExist is returned by create when the email is taken
var ErrAlreadyExists = errors.New("store: user already exists")

//user is an authenticable account
type User struct {
	ID	string
	Email	string
	PasswordHash	string
	Role	string
	FullName	string
}

//userStore is concurrency-safe in memory map key by email
type UserStore struct {
	mu	sync.RWMutex
	byID	map[string]*User
	byMail	map[string]*User
	seq	int
}

//newUserStore returns an empty store
func NewUserStore() *UserStore {
	return &UserStore{
		byID: make(map[string]*User),
		byMail: make(map[string]*User),

	}
}

//create adds a new user with a bcrpt hashed password
func(s *UserStore) Create(email, plaintextPassword, role, fullName string) (*User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.byMail[email]; exists {
		return nil, ErrAlreadyExists
	}

	hash, err := password.Hash(plaintextPassword)
	if err != nil {
		return nil, err
	}

	s.seq++
	u := &User{
		ID:	idFromSeq(s.seq),
		Email:	email,
		PasswordHash: hash,
		Role: role,
		FullName: fullName,	
	}
	s.byID[u.ID] = u
	s.byMail[u.Email] = u
	return u, nil
}

//findbyemail looks up a user by email address.
func(s *UserStore) FindByEmail(email string) (*User, error){
	s.mu.RLock()
	defer s.mu.RUnlock()

	u, ok := s.byMail[email]
	if !ok{
		return nil, ErrNotFound
	}
	return u, nil
}

//findbyID look up user internal ID(used when refreshing)
// token to make the account still exists
func(s *UserStore) FindByID(id string)(*User, error){
	s.mu.RLock()
	defer s.mu.RUnlock()

	u, ok := s.byID[id]
	if !ok{
		return nil, ErrNotFound
	}
	return u, nil
}

func idFromSeq(seq int) string{
	const digits = "0123456789"
	//number ID
	buf := make([]byte, 4)
	for i := 3; i >= 0; i--{
		buf[i] = digits[seq%10]
		seq /= 10
	}
	return "usr-" + string(buf)
}

//SeedDemoUsers for demo RBAC without the registration UI first
//dev-only seed data, never used outside local
func(s *UserStore) SeedDemoUsers() error{
	seeds := []struct {
		email, pass, role, name string
	}{
		{"admin@vfms.local", "Admin@12345", "admin", "Fleet Administrator"},
		{"manager@vfms.local", "Manager@12345", "manager", "Fleet Manager"},
		{"staff@vfms.local", "Staff@12345", "staff", "Fleet Staff"},
	}
	for _, u := range seeds{
		if _, err := s.Create(u.email, u.pass, u.role, u.name); err != nil && !errors.Is(err, ErrAlreadyExists){
			return err
		}
	}
	return nil
}