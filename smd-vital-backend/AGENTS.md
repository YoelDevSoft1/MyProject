# Repository Guidelines

## Estructura del Proyecto
- Código principal en `services/` (FastAPI por microservicio) y `main.py` como gateway.
- Configuración central en `config/`, incluidas claves de entorno y ajustes de seguridad.
- Pruebas automatizadas en `tests/` y scripts auxiliares en `scripts/` (por ejemplo `scripts/setup-databases.py`).
- Documentación técnica en `docs/` y dashboards en `grafana-dashboards/` y `kibana-dashboards/`.

## Comandos de Desarrollo y Pruebas
- `pip install -r requirements.txt` prepara el entorno base; use `requirements-simple.txt` para despliegues ligeros.
- `docker-compose.dev.yml` levanta stack completo en modo desarrollo: `docker compose -f docker-compose.dev.yml up --build`.
- `python run_tests.py` ejecuta suite estándar; `pytest` aplica la configuración avanzada de `pytest.ini`.
- `./start.sh` arranca servicios mínimos; use `start-backend.sh` para entorno completo con tareas de monitoreo.

## Estilo de Código y Convenciones
- Python 3.11+, con `black` y `isort` sugeridos: `black services/ shared/` y `isort services/ shared/`.
- Mantenga tipado opcional con `typing` o `pydantic` y respete indentación de 4 espacios.
- Use snake_case para funciones y variables, PascalCase para clases, y nombres de módulos descriptivos por dominio (`auth_service`, `medical_records`).

## Guías de Pruebas
- Pruebas con `pytest`; clasifique usando marcadores (`@pytest.mark.integration`, `@pytest.mark.security`) definidos en `pytest.ini`.
- Genere reportes de cobertura con `pytest --cov=services` y revise `htmlcov/index.html`.
- Incluya fixtures en `conftest.py` y nombre archivos como `test_<contexto>.py` (ej. `test_role_based_access.py`).

## Commits y Pull Requests
- El historial actual carece de convenciones; adopte formato Conventional Commits (`feat:`, `fix:`, `chore:`) con un imperativo corto.
- Describa PRs con resumen funcional, pasos de prueba reproducibles y referencias a issues. Adjunte capturas si afectan APIs o dashboards.
- Verifique que `pytest` y `docker compose -f docker-compose.dev.yml up` ejecuten sin errores antes de solicitar revisión.

## Seguridad y Configuración
- Mantenga `.env` fuera del control de versiones; parta de `env.example` y cifre secretos sensibles.
- Revise guías en `docs/security/` y scripts de endurecimiento (`implement-security-improvements.sh`, `run_security_tests.py`) antes de despliegues.
- Para nuevos agentes o automatizaciones, documente credenciales temporales y políticas de rotación en la carpeta `config/`.
