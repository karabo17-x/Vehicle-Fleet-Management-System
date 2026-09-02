// vfms identity/security, owns user credentials, issues RS256-signed JWTs
// fastAPi backend and frontend depend on this
package main

import (
	"log"
	"net/http"
	"time"

	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/config"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/handlers"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/ratelimit"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/token"
)

func main() {
	cfg := config.Load()

	keys, err := token.LoadOrGenerate(cfg.PrivateKeyPath, cfg.PublicKeyPath)
	if err != nil {
		log.Fatalf("auth: failed to load signing keys: %v", err)
	}

	deps := handlers.Deps{
		Keys:	&handlers.KeyProvider{Private: keys.Private, Public: keys.Public},
		Issuer:	cfg.Issuer,
		AccessTokenTTL:	cfg.AccessTokenTTL,
		RefreshTokenTTL: cfg.RefreshTokenTTL,
		LoginLimiter:ratelimit.New(cfg.RateLimitRequests, cfg.RateLimitWindow),
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", handlers.Health())
	mux.HandleFunc("/login", handlers.Login(deps))
	mux.HandleFunc("/refresh", handlers.Refresh(deps))
	mux.HandleFunc("/authorize", handlers.Authorize(deps))
	mux.HandleFunc("/.well-known/public-key.pem", handlers.PublicKey(deps, keys.PublicKeyPEM()))

	srv := &http.Server{
		Addr:	":" + cfg.Port,
		ReadTimeout:	5 * time.Second,
		WriteTimeout:	5 * time.Second,
		IdleTimeout:	60 * time.Second,
	}

	log.Printf("auth: listening on :%s (issuer=%s)", cfg.Port, cfg.Issuer)
	if err := srv.ListenAndServe(); err != nil{
		log.Fatalf("auth: server error: %v", err)
	}
}

//withLOgging logs method, path and periodfor every request
//useful during development
func withLogging(next http.Handler) http.Handler{
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}
