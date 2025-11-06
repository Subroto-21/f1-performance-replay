from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    CACHE_DIR: str = "./cache"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]


settings = Settings()
