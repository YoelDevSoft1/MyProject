"""
SMD Vital - Utils Package
========================

Utilidades compartidas para el sistema SMD Vital.
"""

from .security import (
    encrypt_sensitive_data,
    decrypt_sensitive_data,
    hash_password,
    verify_password,
    generate_secure_token,
    mask_sensitive_data,
    validate_token_format,
    sanitize_input,
    safe_log_data
)

from .rate_limiter import (
    DistributedRateLimiter,
    rate_limit,
    GlobalRateLimiter,
    global_rate_limiter
)

from .service_discovery import (
    ServiceInstance,
    ServiceRegistry,
    service_registry
)

__all__ = [
    # Security
    'encrypt_sensitive_data',
    'decrypt_sensitive_data',
    'hash_password',
    'verify_password',
    'generate_secure_token',
    'mask_sensitive_data',
    'validate_token_format',
    'sanitize_input',
    'safe_log_data',
    
    # Rate Limiting
    'DistributedRateLimiter',
    'rate_limit',
    'GlobalRateLimiter',
    'global_rate_limiter',
    
    # Service Discovery
    'ServiceInstance',
    'ServiceRegistry',
    'service_registry'
]