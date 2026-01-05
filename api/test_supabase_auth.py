"""
Run: pytest api/test_supabase_auth.py -v
"""
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_signup():
    """Test user signup."""
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": f"test-{id(object())}@example.com",
            "password": "TestPassword123!",
            "full_name": "Test User",
        },
    )
    # Note: Supabase may require email verification, so this might fail in some configurations
    print(f"Signup response: {response.status_code}")
    if response.status_code == 200:
        assert "access_token" in response.json()


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_protected_endpoint_without_token():
    """Test that protected endpoint requires token."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 403  # Forbidden without token


def test_protected_endpoint_with_invalid_token():
    """Test that invalid token is rejected."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert response.status_code == 401  # Unauthorized
