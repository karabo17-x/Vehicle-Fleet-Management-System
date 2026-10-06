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
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/store"
	"github/karabo17-x/Vehicle-Fleet-Management-System/auth/internal/token"
)

func main() {
	cfg := config.Load()

	keys, err := token.LoadOrGenerate(cfg.PrivateKeyPath, cfg.PublicKeyPath)
	if err != nil {
		log.Fatalf("auth: failed to load signing keys: %v", err)
	}

	users:= store.NewUserStore()
	if cfg.SeedUsersEnabled{
		if err := users.SeedDemoUsers(); err!= nil{
			log.Fatalf("auth: failed to seed demo users: %v", err)
		}
		log.Println("auth: seeded demo users(admin@vfms.com / manager@vfms.com / staff@vfms.com)")
	}

	deps := handlers.Deps{
		Keys:	&handlers.KeyProvider{Private: keys.Private, Public: keys.Public},
		Issuer:	cfg.Issuer,
		AccessTokenTTL:	cfg.AccessTokenTTL,
		RefreshTokenTTL: cfg.RefreshTokenTTL,
		LoginLimiter:	ratelimit.New(cfg.RateLimitRequests, cfg.RateLimitWindow),
		Users:	users,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", handlers.Health())
	mux.HandleFunc("/login", handlers.Login(deps))
	mux.HandleFunc("/refresh", handlers.Refresh(deps))
	mux.HandleFunc("/authorize", handlers.Authorize(deps))
	mux.HandleFunc("/.well-known/public-key.pem", handlers.PublicKey(deps, keys.PublicKeyPEM()))

	srv := &http.Server{
		Addr:	":" + cfg.Port,
		Handler: mux,
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

//withCORS allows the Vite dev server in production
//deployed frontend origin to call this service directly for login/refresh
func withCORS(next http.Handler) http.Handler{
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions{
			w.WriteHeader(http.StatusNoContent)
			return

		}
		next.ServeHTTP(w,r)
	})
}
