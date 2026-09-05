from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Teacher Backend"
    API_V1_STR: str = "/api/v1"
    
    # Gemini
    GEMINI_API_KEY: str = ""
    DEFAULT_MODEL: str = "gemini-3.7-flash"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: list[str] = ["*"]
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
