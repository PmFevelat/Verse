from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Verve API"
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"

    # Firebase Service Account
    firebase_project_id: str
    firebase_private_key_id: str
    firebase_private_key: str
    firebase_client_email: str
    firebase_client_id: str


settings = Settings()
