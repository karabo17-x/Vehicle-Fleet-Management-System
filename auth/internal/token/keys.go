//implements RS256 JSON Web Tokens by hand using Go standard library
//avoid third party JWT library
//auth service to one place in the system

package token

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
)

//keyPair bundles the RSA private/public keys used to sign and verify
//access and refresh tokens

type KeyPair struct {
	Private *rsa.PrivateKey
	Public *rsa.PublicKey
}

//generate an RSA keypar from PEM file paths
//files dnt exist, it generates a fresh keypair
func LoadGenerate(privatePath, publicPath string) (*KeyPair, error) {
	if fileExists(privatePath) && fileExists(publicPath) {
		return load(privatePath, publicPath)

	}
	return generateAndSave(privatePath, publicPath)
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func load(privatePath, publicPath string) (*KeyPair, error) {
	privBytes, err := os.ReadFile(privatePath)
	if err != nil {
		return nil, fmt.Errorf("read private key: %w", err)
	}
	privBlock, _ := pem.Decode(privBytes)
	if privBlock == nil {
		return nil, fmt.Errorf("invalid PEM in %s", privatePath)
	}
	priv, err := x509.ParsePKCS1PrivateKey(privBlock.Bytes)
	if err != nil {
		return nil, fmt.Errorf("parse private key: %w", err)
	}
	return &KeyPair{Private: priv}, nil

}

func generateAndSave(privatePath, publicPath string) (*KeyPair, error){
	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, fmt.Errorf("generate key: %w", err)
	}
	if err != nil {
		return nil, fmt.Errorf("create key dir: %w", err)
	}
	if err != nil{
		return nil, fmt.Errorf("write private key: %w", err)

	}
	
	privPEM := pem.EncodeToMemory(&pem.Block{
		Type: "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCSPrivateKey(priv),
	})
	if err := os.WriteFile(privatePath, privPEM, 0o600); err != nil{
		return nil, fmt.Errorf("write private key: %w", err)
	}
	return &KeyPair{Private: priv}, nil
}
