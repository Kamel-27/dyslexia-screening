import pytest
from fastapi.testclient import TestClient
from app.api import create_app
from app.config import settings

@pytest.fixture(scope="module")
def client():
    app = create_app()
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    """Test that the /health endpoint is responsive and returns ok status."""
    response = client.get("/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "ok"
    assert "version" in json_data

def test_predict_validation_errors(client):
    """Test validation errors for /v1/gamified/predict."""
    # Missing Age
    payload = {
        "session_id": "test-session-123",
        "Gender": 1,
        "Nativelang": 1,
        "Otherlang": 0
    }
    response = client.post("/v1/gamified/predict", json=payload)
    assert response.status_code == 400
    assert "Age must be provided" in response.json()["detail"]["message"]

    # Invalid Age
    payload["Age"] = 5  # Too young, supported is 7-17
    response = client.post("/v1/gamified/predict", json=payload)
    assert response.status_code == 400
    assert "Age must be between 7 and 17" in response.json()["detail"]["message"]

    # Invalid Gender
    payload["Age"] = 9
    payload["Gender"] = 3  # Must be 0 or 1
    response = client.post("/v1/gamified/predict", json=payload)
    assert response.status_code == 400
    assert "Gender must be 0 or 1" in response.json()["detail"]["message"]

def test_predict_success_g1(client):
    """Test successful prediction for Age Group G1 (7-8 years)."""
    # G1 questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 22, 23, 30]
    payload = {
        "session_id": "session-g1",
        "Age": 8,
        "Gender": 0,
        "Nativelang": 1,
        "Otherlang": 0
    }
    
    # Fill required G1 features
    questions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 22, 23, 30]
    for q in questions:
        payload[f"Clicks{q}"] = 3
        payload[f"Hits{q}"] = 2
        payload[f"Misses{q}"] = 1
        payload[f"Score{q}"] = 66.6
        payload[f"Accuracy{q}"] = 0.67
        payload[f"Missrate{q}"] = 0.33

    response = client.post("/v1/gamified/predict", json=payload)
    assert response.status_code == 200
    
    json_data = response.json()
    assert json_data["session_id"] == "session-g1"
    assert "probability" in json_data
    assert "prediction" in json_data
    assert json_data["prediction"] in ("Dyslexia Risk", "No Risk")
    assert json_data["age_group"] == "G1_7_8"
    assert "confidence" in json_data
    assert "model_version" in json_data

def test_predict_success_g2(client):
    """Test successful prediction for Age Group G2 (9-11 years)."""
    # G2 questions: [1..12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 26, 27, 28, 30]
    payload = {
        "session_id": "session-g2",
        "Age": 10,
        "Gender": 1,
        "Nativelang": 1,
        "Otherlang": 1
    }
    
    questions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 26, 27, 28, 30]
    for q in questions:
        payload[f"Clicks{q}"] = 2
        payload[f"Hits{q}"] = 2
        payload[f"Misses{q}"] = 0
        payload[f"Score{q}"] = 100.0
        payload[f"Accuracy{q}"] = 1.0
        payload[f"Missrate{q}"] = 0.0

    response = client.post("/v1/gamified/predict", json=payload)
    assert response.status_code == 200
    
    json_data = response.json()
    assert json_data["session_id"] == "session-g2"
    assert json_data["age_group"] == "G2_9_11"
    assert "probability" in json_data
    assert "prediction" in json_data

def test_predict_success_g3(client):
    """Test successful prediction for Age Group G3 (12-17 years)."""
    payload = {
        "session_id": "session-g3",
        "Age": 15,
        "Gender": 0,
        "Nativelang": 1,
        "Otherlang": 0
    }
    
    questions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 32]
    for q in questions:
        payload[f"Clicks{q}"] = 5
        payload[f"Hits{q}"] = 3
        payload[f"Misses{q}"] = 2
        payload[f"Score{q}"] = 60.0
        payload[f"Accuracy{q}"] = 0.6
        payload[f"Missrate{q}"] = 0.4

    response = client.post("/v1/gamified/predict", json=payload)
    assert response.status_code == 200
    
    json_data = response.json()
    assert json_data["session_id"] == "session-g3"
    assert json_data["age_group"] == "G3_12_17"
    assert "probability" in json_data
