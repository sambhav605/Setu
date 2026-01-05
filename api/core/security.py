import os
import json
from typing import Dict, Optional
from datetime import datetime, timedelta
from jwt import PyJWKClient, decode, InvalidTokenError, get_unverified_header
from fastapi import HTTPException, status
from api.core.config import settings


class SupabaseJWT:
    """Handle Supabase JWT token verification and user extraction."""

    def __init__(self, supabase_url: str):
        if not supabase_url:
            raise ValueError("SUPABASE_URL is not configured")
        
        self.supabase_url = supabase_url.rstrip('/')
        self.jwks_url = f"{self.supabase_url}/auth/v1/.well-known/jwks.json"
        self._jwk_client: Optional[PyJWKClient] = None
        print(f"[DEBUG] Initialized SupabaseJWT with URL: {self.supabase_url}")
        print(f"[DEBUG] JWKS URL: {self.jwks_url}")

    @property
    def jwk_client(self) -> PyJWKClient:
        """Lazily initialize and cache the JWK client."""
        if self._jwk_client is None:
            try:
                self._jwk_client = PyJWKClient(self.jwks_url)
                print("[DEBUG] PyJWKClient initialized successfully")
            except Exception as e:
                print(f"[ERROR] Failed to initialize PyJWKClient: {e}")
                raise
        return self._jwk_client

    def verify_token(self, token: str) -> Dict:
        """
        Verify a Supabase JWT token and return the payload.
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token payload
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            # First, decode without verification to see the header and payload
            unverified_header = get_unverified_header(token)
            print(f"[DEBUG] Token algorithm: {unverified_header.get('alg')}")
            print(f"[DEBUG] Token kid: {unverified_header.get('kid')}")
            
            # Get signing key from JWKS
            try:
                signing_key = self.jwk_client.get_signing_key_from_jwt(token)
                print(f"[DEBUG] Successfully retrieved signing key")
            except Exception as e:
                print(f"[ERROR] Failed to get signing key: {e}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Could not retrieve signing key: {str(e)}",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Decode and verify the token
            payload = decode(
                token,
                signing_key.key,
                algorithms=["RS256", "HS256", "ES256"],  # Support RS256, HS256, and ES256
                options={"verify_aud": False},
            )
            print("[DEBUG] Token verified successfully")
            return payload
            
        except InvalidTokenError as e:
            print(f"[ERROR] Invalid token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication credentials: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except HTTPException:
            raise
        except Exception as e:
            print(f"[ERROR] Token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def extract_user(self, payload: Dict) -> Dict:
        """
        Extract user information from token payload.
        
        Args:
            payload: Decoded JWT payload
            
        Returns:
            User object with id, email, role
        """
        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role") or payload.get("app_metadata", {}).get("role", "user"),
            "phone": payload.get("phone"),
            "user_metadata": payload.get("user_metadata", {}),
        }


# Initialize Supabase JWT handler
supabase_jwt = None
try:
    if settings.supabase_url:
        supabase_jwt = SupabaseJWT(settings.supabase_url)
    else:
        print("[WARNING] SUPABASE_URL not configured")
except Exception as e:
    print(f"[ERROR] Failed to initialize Supabase JWT: {e}")


def verify_supabase_token(token: str) -> Dict:
    """Verify and decode a Supabase JWT token."""
    if not supabase_jwt:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase not configured",
        )
    return supabase_jwt.verify_token(token)


def extract_user_from_token(payload: Dict) -> Dict:
    """Extract user info from token payload."""
    if not supabase_jwt:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase not configured",
        )
    user = supabase_jwt.extract_user(payload)
    if not user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    return user
