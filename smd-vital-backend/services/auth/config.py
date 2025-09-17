"""
SMD Vital - Authentication Service Configuration
===============================================

Configuración centralizada para el servicio de autenticación.
Maneja variables de entorno, configuración de base de datos, JWT, etc.
"""

from pydantic import BaseSettings, Field, validator
from typing import List, Optional
import secrets
from functools import lru_cache

class Settings(BaseSettings):
    """Configuración del servicio de autenticación"""
    
    # Aplicación
    APP_NAME: str = "SMD Vital Auth Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # Servidor
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8001, env="PORT")
    
    # CORS y Seguridad
    ALLOWED_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8000",
            "https://smdvitalbogota.com",
            "https://app.smdvitalbogota.com"
        ],
        env="ALLOWED_ORIGINS"
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["localhost", "127.0.0.1", "*.smdvitalbogota.com"],
        env="ALLOWED_HOSTS"
    )
    
    # Base de Datos
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://smdvital:password@localhost:5432/smdvital_auth",
        env="DATABASE_URL"
    )
    DATABASE_POOL_SIZE: int = Field(default=10, env="DATABASE_POOL_SIZE")
    DATABASE_MAX_OVERFLOW: int = Field(default=20, env="DATABASE_MAX_OVERFLOW")
    
    # Redis (Cache y Sesiones)
    REDIS_URL: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    
    # JWT Configuration
    JWT_SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32), env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=30, env="JWT_REFRESH_TOKEN_EXPIRE_DAYS")
    
    # Password Hashing
    PASSWORD_HASH_ALGORITHM: str = Field(default="bcrypt", env="PASSWORD_HASH_ALGORITHM")
    PASSWORD_HASH_ROUNDS: int = Field(default=12, env="PASSWORD_HASH_ROUNDS")
    
    # 2FA Configuration
    TWO_FA_CODE_LENGTH: int = Field(default=6, env="TWO_FA_CODE_LENGTH")
    TWO_FA_CODE_EXPIRE_MINUTES: int = Field(default=10, env="TWO_FA_CODE_EXPIRE_MINUTES")
    TWO_FA_MAX_ATTEMPTS: int = Field(default=3, env="TWO_FA_MAX_ATTEMPTS")
    
    # Email Configuration
    SMTP_HOST: str = Field(default="smtp.gmail.com", env="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USERNAME: str = Field(default="", env="SMTP_USERNAME")
    SMTP_PASSWORD: str = Field(default="", env="SMTP_PASSWORD")
    SMTP_USE_TLS: bool = Field(default=True, env="SMTP_USE_TLS")
    EMAIL_FROM: str = Field(default="noreply@smdvitalbogota.com", env="EMAIL_FROM")
    EMAIL_FROM_NAME: str = Field(default="SMD Vital Bogotá", env="EMAIL_FROM_NAME")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = Field(default=True, env="RATE_LIMIT_ENABLED")
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_PERIOD: int = Field(default=3600, env="RATE_LIMIT_PERIOD")  # 1 hora
    
    # Login Rate Limiting
    LOGIN_RATE_LIMIT_REQUESTS: int = Field(default=5, env="LOGIN_RATE_LIMIT_REQUESTS")
    LOGIN_RATE_LIMIT_PERIOD: int = Field(default=900, env="LOGIN_RATE_LIMIT_PERIOD")  # 15 minutos
    
    # Account Lockout
    MAX_LOGIN_ATTEMPTS: int = Field(default=5, env="MAX_LOGIN_ATTEMPTS")
    ACCOUNT_LOCKOUT_DURATION_MINUTES: int = Field(default=30, env="ACCOUNT_LOCKOUT_DURATION_MINUTES")
    
    # Session Management
    SESSION_TIMEOUT_MINUTES: int = Field(default=1440, env="SESSION_TIMEOUT_MINUTES")  # 24 horas
    MAX_SESSIONS_PER_USER: int = Field(default=5, env="MAX_SESSIONS_PER_USER")
    
    # Security Headers
    SECURITY_HEADERS_ENABLED: bool = Field(default=True, env="SECURITY_HEADERS_ENABLED")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    
    # Monitoring
    METRICS_ENABLED: bool = Field(default=True, env="METRICS_ENABLED")
    HEALTH_CHECK_INTERVAL: int = Field(default=30, env="HEALTH_CHECK_INTERVAL")
    
    # External Services
    USER_SERVICE_URL: str = Field(default="http://localhost:8002", env="USER_SERVICE_URL")
    NOTIFICATION_SERVICE_URL: str = Field(default="http://localhost:8004", env="NOTIFICATION_SERVICE_URL")
    
    # API Keys para servicios externos
    GOOGLE_CLIENT_ID: Optional[str] = Field(default=None, env="GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = Field(default=None, env="GOOGLE_CLIENT_SECRET")
    
    # WhatsApp Business API (para 2FA)
    WHATSAPP_TOKEN: Optional[str] = Field(default=None, env="WHATSAPP_TOKEN")
    WHATSAPP_PHONE_ID: Optional[str] = Field(default=None, env="WHATSAPP_PHONE_ID")
    
    # SMS Provider (Twilio)
    TWILIO_ACCOUNT_SID: Optional[str] = Field(default=None, env="TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: Optional[str] = Field(default=None, env="TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER: Optional[str] = Field(default=None, env="TWILIO_PHONE_NUMBER")
    
    @validator('ALLOWED_ORIGINS', pre=True)
    def parse_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    @validator('ALLOWED_HOSTS', pre=True)
    def parse_hosts(cls, v):
        """Parse allowed hosts from string or list"""
        if isinstance(v, str):
            return [host.strip() for host in v.split(',')]
        return v
    
    @validator('LOG_LEVEL')
    def validate_log_level(cls, v):
        """Validate log level"""
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f'Log level must be one of: {valid_levels}')
        return v.upper()
    
    @validator('ENVIRONMENT')
    def validate_environment(cls, v):
        """Validate environment"""
        valid_envs = ['development', 'testing', 'staging', 'production']
        if v.lower() not in valid_envs:
            raise ValueError(f'Environment must be one of: {valid_envs}')
        return v.lower()
    
    def get_database_config(self) -> dict:
        """Get database configuration"""
        return {
            "url": self.DATABASE_URL,
            "pool_size": self.DATABASE_POOL_SIZE,
            "max_overflow": self.DATABASE_MAX_OVERFLOW,
            "echo": self.DEBUG
        }
    
    def get_redis_config(self) -> dict:
        """Get Redis configuration"""
        config = {"url": self.REDIS_URL}
        if self.REDIS_PASSWORD:
            config["password"] = self.REDIS_PASSWORD
        return config
    
    def get_jwt_config(self) -> dict:
        """Get JWT configuration"""
        return {
            "secret_key": self.JWT_SECRET_KEY,
            "algorithm": self.JWT_ALGORITHM,
            "access_token_expire_minutes": self.JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
            "refresh_token_expire_days": self.JWT_REFRESH_TOKEN_EXPIRE_DAYS
        }
    
    def get_email_config(self) -> dict:
        """Get email configuration"""
        return {
            "host": self.SMTP_HOST,
            "port": self.SMTP_PORT,
            "username": self.SMTP_USERNAME,
            "password": self.SMTP_PASSWORD,
            "use_tls": self.SMTP_USE_TLS,
            "from_email": self.EMAIL_FROM,
            "from_name": self.EMAIL_FROM_NAME
        }
    
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT == "production"
    
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENVIRONMENT == "development"
    
    def is_testing(self) -> bool:
        """Check if running in testing"""
        return self.ENVIRONMENT == "testing"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Instance global de configuración
settings = get_settings()

# Configuraciones específicas por ambiente
class DevelopmentSettings(Settings):
    """Configuración para desarrollo"""
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    
class ProductionSettings(Settings):
    """Configuración para producción"""
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    RATE_LIMIT_ENABLED: bool = True
    SECURITY_HEADERS_ENABLED: bool = True

class TestingSettings(Settings):
    """Configuración para testing"""
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    DATABASE_URL: str = "postgresql+asyncpg://test:test@localhost:5432/test_smdvital"
    REDIS_URL: str = "redis://localhost:6379/1"

def get_settings_by_environment(env: str = None) -> Settings:
    """Get settings based on environment"""
    if env is None:
        env = settings.ENVIRONMENT
    
    if env == "production":
        return ProductionSettings()
    elif env == "testing":
        return TestingSettings()
    else:
        return DevelopmentSettings()
