from pathlib import Path
from typing import List
import tomllib

from pydantic_settings import BaseSettings, SettingsConfigDict


def _load_project_metadata() -> dict[str, str]:
    pyproject_path = Path(__file__).resolve().parent.parent / "pyproject.toml"
    fallback = {
        "name": "DysTest Gamified ML Service",
        "version": "2.0.0",
        "description": "ML service for dyslexia risk prediction from gamified cognitive test interactions",
    }

    try:
        with open(pyproject_path, "rb") as f:
            data = tomllib.load(f)
        project = data.get("project", {})
        dystest_tool = data.get("tool", {}).get("dystest", {})
        return {
            "name": str(
                dystest_tool.get("app_name", project.get("name", fallback["name"]))
            ),
            "version": str(project.get("version", fallback["version"])),
            "description": str(project.get("description", fallback["description"])),
        }
    except (FileNotFoundError, tomllib.TOMLDecodeError):
        return fallback


PROJECT_METADATA = _load_project_metadata()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    APP_NAME: str = PROJECT_METADATA["name"]
    APP_VERSION: str = PROJECT_METADATA["version"]
    APP_DESCRIPTION: str = PROJECT_METADATA["description"]
    DEBUG: bool = False

    HOST: str = "0.0.0.0"
    PORT: int = 8001

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    MODELS_DIR: Path = BASE_DIR / "models"

    # Gamified test model paths
    GAMIFIED_MODELS_DIR: Path = MODELS_DIR / "gamified"
    GAMIFIED_CONFIG_PATH: Path = GAMIFIED_MODELS_DIR / "question_config.json"

    # Risk classification thresholds (used for health check display only)
    LOW_RISK_THRESHOLD: float = 0.33
    HIGH_RISK_THRESHOLD: float = 0.66


settings = Settings()


def validate_model_files() -> None:
    required_files = {
        "Gamified config": settings.GAMIFIED_CONFIG_PATH,
    }

    # Also verify at least one model file exists in the gamified directory
    if settings.GAMIFIED_MODELS_DIR.exists():
        pkl_files = list(settings.GAMIFIED_MODELS_DIR.glob("*.pkl")) + \
                    list(settings.GAMIFIED_MODELS_DIR.glob("*.joblib"))
        if not pkl_files:
            required_files["Gamified models (*.pkl / *.joblib)"] = (
                settings.GAMIFIED_MODELS_DIR / "<no model files found>"
            )

    missing_files = []
    for name, path in required_files.items():
        if not path.exists():
            missing_files.append(f"{name}: {path}")

    if missing_files:
        raise FileNotFoundError(
            "Missing required model files:\n"
            + "\n".join(f"  - {f}" for f in missing_files)
        )
