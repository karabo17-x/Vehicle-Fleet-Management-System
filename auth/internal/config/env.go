package config

import (
	"os"
	"strconv"
	"time"
)

//config holds auth service needed at startup
type Config struct{
	Port string
	//RSA keypair used to sign/veify JWTs
	PrivateKeyPath string
	PublicKeyPath string

	//token time
	AccessTokenTTL time.Duration
	RefreshTokenTTL time.Duration

	// token issuer embedded, backend API expected
	Issuer string

	//rate limit for login endpoint
	RateLimitRequests int 
	RateLimitWindow time.Duration

	SeedUsersEnabled bool
}

func Load() Config{
	return Config{
		Port:              getEnv("AUTH_PORT", "8081"),
		PrivateKeyPath:  getEnv("JWT_PRIVATE_KEY_PATH", "./keys/private.pem"),
		PublicKeyPath:   getEnv("JWT_PUBLIC_KEY_PATH", "./keys/public.pem"),
		AccessTokenTTL:  getEnvDuration("ACCESS_TOKEN_TTL", 15*time.Minute),
		RefreshTokenTTL: getEnvDuration("REFRESH_TOKEN_TTL",7*24*time.Hour),
		Issuer:            getEnv("JWT_ISSUER","auth"),
		RateLimitRequests: getEnvInt("RATE_LIMIT_REQUESTS", 5),
		RateLimitWindow:   getEnvDuration("RATE_LIMIT_WINDOW", time.Minute),
		SeedUsersEnabled:  getEnvBool("SEED_DEMO_USERS", true),
	}
}

func getEnv(key, fallback string) string{
	if v := os.Getenv(key); v != ""{
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int{
	if v := os.Getenv(key); v != ""{
		if n, err := strconv.Atoi(v); err == nil{
			return n
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool{
	if v := os.Getenv(key); v != ""{
		if b, err := strconv.ParseBool(v); err == nil{
			return b
		}
	}
	return fallback
}

func getEnvDuration(key string, fallback time.Duration) time.Duration{
	if v := os.Getenv(key); v != ""{
		if d, err := time.ParseDuration(v); err == nil{
			return d
		}
	}
	return fallback
}

