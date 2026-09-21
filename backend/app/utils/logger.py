"shared logging setup"
import logging
import sys
from app.config import settings

_CONFIGURED = False

def _configure_root_logger() -> None:
    global _CONFIGURED
    if _CONFIGURED:
        return

    level = logging.DEBUG if settings.environment == "development" else logging.INFO
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s [%(name)]s %(message)s")

    )
    root = logging.getLogger()
    root.setLevel(level)
    root.addHandler(handler)
    _CONFIGURED = True

    def get_logger(name: str) -> logging.Logger:
        _configure_root_logger()
        return logging.getLogger(name)