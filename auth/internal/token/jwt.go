package token

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
)

var (
	//ErrExpired returned by Verify when token exp claim passed
	ErrExpired = errors.New("token: expired")
	
	//errMalformed returned
	ErrMalformed = errors.New("token: malformed")

	//errBadSignature returned whenRS256 not verified
	ErrBadSignature = errors.New("token: signature verification failed")
)

type header struct {
	Alg string `json:"alg"`
	Typ string `json:"typ"`
}

//sign builds and signs JWT(header.payload.signature) with RS256 private key
func Sign(claims Claims, priv *rsa.PrivateKey) (string, error) {
	h := header{Alg: "RS256", Typ: "JWT"}

	headerJSON, err := json.Marshal(h)
	if err != nil{
		return "", err
	}
	payloadJSON, err := json.Marshal(claims)
	if err != nil{
		return "", err
	}

	signingInput := b64(headerJSON) + "." + b64(payloadJSON)

	hashed := sha256.Sum256([]byte(signingInput))
	sig, err := rsa.SignPKCS1v15(rand.Reader, priv, crypto.SHA256, hashed[:])
	if err != nil {
		return "", fmt.Errorf("sign token: %w", err)
	}
	return signingInput + "." + b64(sig), nil

}



