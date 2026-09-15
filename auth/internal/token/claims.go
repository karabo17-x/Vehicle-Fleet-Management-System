package token

//fileds embedded in access/refresh token
//python backend reads Subject, Role and TokenType
//verified payload make its own authorization
//struct is effectively the contract between two services

type Claims struct {
	Subject	string `json:"sub"`//user ID
	Email	string `json:"email"`
	Role	string `json"role"` //admin, manager, staff
	TokenType	string `json"token_type"` //access, refresh
	Issuer	string `json"iss"`
	IssuedAt	int64 `json"iat"`
	ExpiresAt	int64 `json"exp"`


}