// hand PBKDF2 rather than pulling
// golang.org/x/crypto/bycrpt, auth/ has zero external
// dependencies > it builds offline with nothing but standard
package password

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"hash"
	"strconv"
	"strings"
)

const iterations = 210_000
const keyLen = 32 //256-but derived key
const saltLen = 16

//hash returns encoded string
//verify can later re-derive the key with same parameters
func Hash(plaintext string) (string, error){
	salt := make([]byte, saltLen)
	if _, err := rand.Read(salt); err != nil{
		return "", fmt.Errorf("generate salt: %w", err)
	}
	derived := pbkdf2HMACSHA256([]byte(plaintext), salt, iterations, keyLen)

	encoded := fmt.Sprintf("pbkdf2-sha256$%d$%s$%s", iterations, base64.RawStdEncoding.EncodeToString(salt),base64.RawStdEncoding.EncodeToString(derived))
	return encoded, nil
}

//check plaintext match encoded hash
//re-derives the key using salt/iteration count
//hash and comapre in constant time to avoid timing attacks
func Verify(encoded, plaintext string) bool{
	parts := strings.Split(encoded, "$")
	if len(parts) != 4 || parts[0] != "pbkdf2-sha256"{
		return false
	}

	iters, err := strconv.Atoi(parts[1])
	if err != nil || iters <= 0 {
		return false
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[2])
	if err != nil {
		return false
	}

	want, err := base64.RawStdEncoding.DecodeString(parts[3])
	if err != nil {
		return false
	}

	got := pbkdf2HMACSHA256([]byte(plaintext), salt, iters, len(want))
	return subtle.ConstantTimeCompare(got, want) == 1
}

//pbkdf2HMACSHA256 implements PBKDF2(RFC 8018) using HMAC-SHA256
//pseudorandom function, self contained
//implementation rather depending on golang.org/x/crypto/pbkdf2
func pbkdf2HMACSHA256(password, salt[]byte, iterations, keyLen int)[]byte{
	prf := hmac.New(sha256.New, password)
	hashLen := prf.Size()
	numBlocks := (keyLen + hashLen - 1)/ hashLen

	var derived []byte
	for block := 1; block <= numBlocks; block++ {
		derived = append(derived, pbkdf2Block(prf, salt, iterations, block)...)
	}
	return derived[:keyLen]
}

func pbkdf2Block(prf hash.Hash, salt []byte, iterations, blockNum int) []byte{
	prf.Reset()
	prf.Write(salt)
	prf.Write([]byte{
		byte(blockNum >> 24), byte(blockNum >> 16), byte(blockNum >> 8), byte(blockNum),
	})
	u := prf.Sum(nil)
	result := make([]byte, len(u))
	copy(result, u)

	for i := 1; i < iterations; i++ {
		prf.Reset()
		prf.Write(u)
		u = prf.Sum(nil)
		for j := range result {
			result[j] ^= u[j]
		}
	}
	return result

}