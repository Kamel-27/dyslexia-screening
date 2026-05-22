import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings, validate_model_files
from app.services import (
    GamifiedPredictor,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    validate_model_files()

    app.state.gamified_predictor = GamifiedPredictor(
        config_path=str(settings.GAMIFIED_CONFIG_PATH),
        model_dir=str(settings.GAMIFIED_MODELS_DIR)
    )

    logger.info(f"Service ready on http://{settings.HOST}:{settings.PORT}")

    yield
