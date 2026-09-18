package token

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
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

//verify checks the signature and expiry a JWT and returns. its claims if valid
func Verify(tokenString string, pub *rsa.PublicKey)(*Claims, error){
	parts := strings.Split(tokenString, ".")
	if len(parts) != 3{
		return nil, ErrMalformed
	}

	signingInput := parts[0] + "." + parts[1]
	sig, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil{
		return nil, ErrMalformed
	}

	hashed := sha256.Sum256([]byte(signingInput))
	if err := rsa.VerifyPKCS1v15(pub, crypto.SHA256, hashed[:], sig); err != nil{
		return nil, ErrBadSignature
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil{
		return nil, ErrMalformed
	}

	var claims Claims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil{
		return nil, ErrMalformed
	}
	now := time.Now().UTC().Unix()
	if now > claims.ExpiresAt{
		return nil, ErrExpired
	}
	return &claims, nil

}

func b64(data []byte ) string{
	return base64.RawURLEncoding.EncodeToString(data)
}



