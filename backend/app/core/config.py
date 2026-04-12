from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Verve API"
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"

    # Firebase
    firebase_project_id: str
    firebase_private_key_id: str
    firebase_private_key: str
    firebase_client_email: str
    firebase_client_id: str

    class Config:
        env_file = ".env"


settings = Settings()
