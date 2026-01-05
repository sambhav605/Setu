from typing import Dict
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from api.core.security import verify_supabase_token, extract_user_from_token


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict:
    """
    Dependency to get the current authenticated user from Supabase JWT token.
    
    Raises:
        HTTPException: If token is invalid or missing
        
    Returns:
        User dictionary with id, email, role, etc.
    """
    token = credentials.credentials
    payload = verify_supabase_token(token)
    user = extract_user_from_token(payload)
    return user


async def get_current_admin(user: Dict = Depends(get_current_user)) -> Dict:
    """
    Dependency to ensure current user has admin role.
    
    Raises:
        HTTPException: If user is not an admin
        
    Returns:
        User dictionary
    """
    if user.get("role") not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access this resource",
        )
    return user
