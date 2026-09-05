from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Teacher Backend"
    API_V1_STR: str = "/api/v1"
    
    # Local Gemini web-to-api backend (OpenAI-compatible)
    GEMINI_API_KEY: str = "sk-gemini"
    DEFAULT_MODEL: str = "gemini-2.5-flash"
    LLM_BASE_URL: str = "http://127.0.0.1:8081/openai/v1"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: list[str] = ["*"]
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
