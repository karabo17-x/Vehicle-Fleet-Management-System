from fastapi import APIRouter, Depends
from app.middleware.auth_guard import get_current_user, CurrentUser

router = APIRouter()

@router.get("/me")
def me(user: CurrentUser = Depends(get_current_user)):
    """Return authenticated user's minimal info (role, id, email).

    Frontend should use this endpoint to derive authoritative role
    information from a verified token rather than trusting localStorage.
    """
    return {"id": user.id, "email": user.email, "role": user.role}
