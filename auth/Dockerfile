 # --- build stage ---
FROM golang:1.22-alphine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOSlinux go build -o /out/auth ./cmd

# --- run stage ---
FROM alphine:3.19
RUN adduser -D -H appuser
WORKDIR /app
COPY --from=build /out/auth ./auth

# keys are genereated on first run and persisted via a mounted volume
# restart dont invalidate every issue token.
VOLUME ["/app/keys"]
ENV JWT_PRIVATE_KEY_PATH=/app/keys/private.pem
ENV JWT_PUBLIC_KEY_PATH=/app/keys/public.pem
ENV AUTH_PORT=8081
USER appuser
EXPOSE 8081
ENTRYPOINT ["./auth"]

