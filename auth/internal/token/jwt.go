package token

import (
	"errors"
)

var (
	//ErrExpired returned by Verify when token exp claim passed
	ErrExpired = errors.New("token: expired")
	
	//errMalformed returned
	ErrMalformed = errors.New("token: malformed")

	//errBadSignature returned whenRS256 not verified
	ErrBadSignature = errors.New("token: signature verification failed")
)
