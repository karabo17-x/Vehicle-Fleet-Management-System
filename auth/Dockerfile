 # --- build stage ---
FROM golang:1.26.5-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN GOTOOLCHAIN=auto go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/auth ./cmd

# --- run stage ---
FROM alpine:3.19
RUN adduser -D -H appuser
WORKDIR /app
COPY --from=build /out/auth ./auth

# keys are generated on first run and persisted via a mounted volume
# restart does not invalidate every issued token.
VOLUME ["/app/keys", "/app/data"]
ENV JWT_PRIVATE_KEY_PATH=/app/keys/private.pem
ENV JWT_PUBLIC_KEY_PATH=/app/keys/public.pem
ENV AUTH_USER_STORE_PATH=/app/data/users.json
ENV AUTH_PORT=8081
USER appuser
EXPOSE 8081
ENTRYPOINT ["./auth"]
