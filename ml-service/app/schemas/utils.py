from enum import Enum
from pydantic import BaseModel, ConfigDict


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])
