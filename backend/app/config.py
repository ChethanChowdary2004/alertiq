from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str
    DEFAULT_USER_ID: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
