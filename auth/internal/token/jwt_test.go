package token

import (
	"crypto/rand"
	"crypto/rsa"
	"testing"
	"time"
)

func testKeyPair(t *testing.T) *rsa.PrivateKey {
	t.Helper()
	priv, err :=  rsa.GenerateKey(rand.Reader, 2048) 
	if err != nil {
		t.Fatalf("failed to generate test key: %v", err)
	}
	return priv
}

func TestSignAndVerifyRoundTrip(t *testing.T) {
	priv := testKeyPair(t)
	now := time.Now()

	claims := Claims{
		Subject: "usr-0001",
		Email: "admin@vfms.com",
		Role: "admin",
		TokenType: "access",
		Issuer: "vfms-auth",
		IssuedAt: now.Unix(),
		ExpiresAt: now.Add(15 * time.Minute).Unix(),
	}

	signed, err := Sign(claims, priv)
	if err != nil {
		t.Fatalf("sign returned error: %v", err)
	}

	got, err := Verify(signed, &priv.PublicKey)
	if err != nil {
		t.Fatalf("verify returned error: %v", err)

	}
	if got.Subject != claims.Subject || got.Role != claims.Role{
		t.Errorf("verify claims do not match originals: got %+v", got)
	}
}

func TestVerifyRejectsExpiredToken(t *testing.T) {
	priv := testKeyPair(t)
	past := time.Now().Add(-1 * time.Hour)

	claims := Claims{
		Subject: "usr-0001",
		TokenType: "access",
		IssuedAt: past.Unix(),
		ExpiresAt: past.Add(time.Minute).Unix(), // expired 59 minutes
	}
	signed, _ := Sign(claims, priv)

	if _, err := Verify(signed, &priv.PublicKey); err != ErrExpired{
		t.Errorf("expected ErrExpired, got %v", err)
	}
}

func TestVerifyRejectsTamperedSignature(t *testing.T){
	priv := testKeyPair(t)
	other := testKeyPair(t) // different key pair

	claims := Claims{Subject: "usr-0001", TokenType: "access", ExpiresAt: time.Now().Add(time.Hour).Unix()}
	signed, _ := Sign(claims, priv)

	if _, err := Verify(signed, &other.PublicKey); err != ErrBadSignature {
		t.Errorf("expected ErrBadSignature when verifying with the wrong public key, got %v", err)


	}
}

func TestIssuedAtAndExpiryUseUTCNow(t *testing.T) {
	before := time.Now().UTC()
	claims := Claims{
		Subject:   "usr-0001",
		Email:     "admin@vfms.com",
		Role:      "admin",
		TokenType: "access",
		Issuer:    "vfms-auth",
		IssuedAt:  before.Unix(),
		ExpiresAt: before.Add(15 * time.Minute).Unix(),
	}
	priv := testKeyPair(t)

	signed, err := Sign(claims, priv)
	if err != nil {
		t.Fatalf("sign returned error: %v", err)
	}

	got, err := Verify(signed, &priv.PublicKey)
	if err != nil {
		t.Fatalf("verify returned error: %v", err)
	}

	if got.IssuedAt != claims.IssuedAt || got.ExpiresAt != claims.ExpiresAt {
		t.Fatalf("unexpected claims after verify: got %+v want %+v", got, claims)
	}

	after := time.Now().UTC()
	if got.ExpiresAt < before.Add(14*time.Minute).Unix() || got.ExpiresAt > after.Add(15*time.Minute).Unix() {
		t.Fatalf("expiry was not created from the same current UTC window: got exp=%d before=%d after=%d", got.ExpiresAt, before.Unix(), after.Unix())
	}
}
