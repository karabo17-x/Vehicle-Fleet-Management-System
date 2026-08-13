package config
import{
	"os"
	"strconv"
	"time"
}

//config holds auth service needed at startup
type Config struct{
	Port string

	PrivateKeyPath string
	PublicKeyPath string

	//token time
	AccessTokenTTL time.Duration
	RefreshTokenTTL time.Duration

	// token issuer embedded, backend API expected
	Issuer string

	//rate limit for login endpoint
	RateLimitRequests int 
	RateLImitWindow time.Duration

	SeedUsersEnabled bool
}

func Load() Config{
	return Config{
		Port:              getEnv(),
		PrivateKeyPath:  getEnv(),
		PublicKeyPath:   getEnv(),
		AccessTokenTTL:  getEnvDuration(),
		RefreshTokenTTL: getEnvDuration(),
		Issuer:            getEnv(),
		RateLimitRequests: getEnvInt(),
		RateLimitWindow:   getEnvDuration(),
		SeedUsersEnabled:  getEnvBool(),
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

