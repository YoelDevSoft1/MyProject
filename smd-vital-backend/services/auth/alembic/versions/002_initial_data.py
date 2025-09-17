"""Insert initial data for roles and permissions

Revision ID: 002
Revises: 001
Create Date: 2025-01-12 00:01:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid
from datetime import datetime

# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create connection to execute raw SQL
    connection = op.get_bind()
    
    # Insert initial roles
    roles = [
        {
            'id': str(uuid.uuid4()),
            'name': 'admin',
            'display_name': 'Administrador',
            'description': 'Administrador del sistema con todos los permisos',
            'is_system_role': True,
            'is_active': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'doctor',
            'display_name': 'Doctor',
            'description': 'Profesional médico',
            'is_system_role': True,
            'is_active': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'nurse',
            'display_name': 'Enfermero/a',
            'description': 'Profesional de enfermería',
            'is_system_role': True,
            'is_active': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'patient',
            'display_name': 'Paciente',
            'description': 'Usuario paciente del sistema',
            'is_system_role': True,
            'is_active': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'receptionist',
            'display_name': 'Recepcionista',
            'description': 'Personal de recepción y atención al cliente',
            'is_system_role': True,
            'is_active': True,
            'created_at': datetime.utcnow()
        }
    ]
    
    # Insert roles
    for role in roles:
        connection.execute(
            sa.text("""
                INSERT INTO roles (id, name, display_name, description, is_system_role, is_active, created_at)
                VALUES (:id, :name, :display_name, :description, :is_system_role, :is_active, :created_at)
            """),
            role
        )
    
    # Insert initial permissions
    permissions = [
        # Auth permissions
        {'name': 'auth.users.create', 'display_name': 'Crear usuarios', 'category': 'auth', 'resource': 'users', 'action': 'create'},
        {'name': 'auth.users.read', 'display_name': 'Ver usuarios', 'category': 'auth', 'resource': 'users', 'action': 'read'},
        {'name': 'auth.users.update', 'display_name': 'Actualizar usuarios', 'category': 'auth', 'resource': 'users', 'action': 'update'},
        {'name': 'auth.users.delete', 'display_name': 'Eliminar usuarios', 'category': 'auth', 'resource': 'users', 'action': 'delete'},
        {'name': 'auth.roles.manage', 'display_name': 'Gestionar roles', 'category': 'auth', 'resource': 'roles', 'action': 'manage'},
        {'name': 'auth.permissions.manage', 'display_name': 'Gestionar permisos', 'category': 'auth', 'resource': 'permissions', 'action': 'manage'},
        
        # Appointments permissions
        {'name': 'appointments.create', 'display_name': 'Crear citas', 'category': 'appointments', 'resource': 'appointments', 'action': 'create'},
        {'name': 'appointments.read', 'display_name': 'Ver citas', 'category': 'appointments', 'resource': 'appointments', 'action': 'read'},
        {'name': 'appointments.update', 'display_name': 'Actualizar citas', 'category': 'appointments', 'resource': 'appointments', 'action': 'update'},
        {'name': 'appointments.delete', 'display_name': 'Cancelar citas', 'category': 'appointments', 'resource': 'appointments', 'action': 'delete'},
        {'name': 'appointments.assign', 'display_name': 'Asignar profesionales', 'category': 'appointments', 'resource': 'appointments', 'action': 'assign'},
        {'name': 'appointments.manage_all', 'display_name': 'Gestionar todas las citas', 'category': 'appointments', 'resource': 'appointments', 'action': 'manage_all'},
        
        # Medical Records permissions
        {'name': 'medical_records.create', 'display_name': 'Crear registros médicos', 'category': 'medical_records', 'resource': 'medical_records', 'action': 'create'},
        {'name': 'medical_records.read', 'display_name': 'Ver registros médicos', 'category': 'medical_records', 'resource': 'medical_records', 'action': 'read'},
        {'name': 'medical_records.update', 'display_name': 'Actualizar registros médicos', 'category': 'medical_records', 'resource': 'medical_records', 'action': 'update'},
        {'name': 'medical_records.delete', 'display_name': 'Eliminar registros médicos', 'category': 'medical_records', 'resource': 'medical_records', 'action': 'delete'},
        {'name': 'medical_records.access_all', 'display_name': 'Acceder a todos los registros', 'category': 'medical_records', 'resource': 'medical_records', 'action': 'access_all'},
        
        # Payments permissions
        {'name': 'payments.create', 'display_name': 'Crear pagos', 'category': 'payments', 'resource': 'payments', 'action': 'create'},
        {'name': 'payments.read', 'display_name': 'Ver pagos', 'category': 'payments', 'resource': 'payments', 'action': 'read'},
        {'name': 'payments.refund', 'display_name': 'Realizar reembolsos', 'category': 'payments', 'resource': 'payments', 'action': 'refund'},
        {'name': 'payments.manage_all', 'display_name': 'Gestionar todos los pagos', 'category': 'payments', 'resource': 'payments', 'action': 'manage_all'},
        {'name': 'invoices.create', 'display_name': 'Crear facturas', 'category': 'payments', 'resource': 'invoices', 'action': 'create'},
        {'name': 'invoices.send', 'display_name': 'Enviar facturas', 'category': 'payments', 'resource': 'invoices', 'action': 'send'},
        
        # Notifications permissions
        {'name': 'notifications.send', 'display_name': 'Enviar notificaciones', 'category': 'notifications', 'resource': 'notifications', 'action': 'send'},
        {'name': 'notifications.manage_templates', 'display_name': 'Gestionar templates', 'category': 'notifications', 'resource': 'templates', 'action': 'manage'},
        {'name': 'notifications.bulk_send', 'display_name': 'Envío masivo', 'category': 'notifications', 'resource': 'notifications', 'action': 'bulk_send'},
        
        # System permissions
        {'name': 'system.statistics', 'display_name': 'Ver estadísticas', 'category': 'system', 'resource': 'statistics', 'action': 'read'},
        {'name': 'system.configuration', 'display_name': 'Configurar sistema', 'category': 'system', 'resource': 'configuration', 'action': 'manage'},
        {'name': 'system.audit_logs', 'display_name': 'Ver logs de auditoría', 'category': 'system', 'resource': 'audit_logs', 'action': 'read'},
    ]
    
    # Insert permissions
    for perm in permissions:
        perm_id = str(uuid.uuid4())
        connection.execute(
            sa.text("""
                INSERT INTO permissions (id, name, display_name, description, category, resource, action, is_system_permission, is_active, created_at)
                VALUES (:id, :name, :display_name, :description, :category, :resource, :action, :is_system_permission, :is_active, :created_at)
            """),
            {
                'id': perm_id,
                'name': perm['name'],
                'display_name': perm['display_name'],
                'description': f"Permiso para {perm['display_name'].lower()}",
                'category': perm['category'],
                'resource': perm['resource'],
                'action': perm['action'],
                'is_system_permission': True,
                'is_active': True,
                'created_at': datetime.utcnow()
            }
        )
    
    # Assign permissions to roles
    
    # Get role IDs
    admin_role = connection.execute(sa.text("SELECT id FROM roles WHERE name = 'admin'")).fetchone()[0]
    doctor_role = connection.execute(sa.text("SELECT id FROM roles WHERE name = 'doctor'")).fetchone()[0]
    nurse_role = connection.execute(sa.text("SELECT id FROM roles WHERE name = 'nurse'")).fetchone()[0]
    patient_role = connection.execute(sa.text("SELECT id FROM roles WHERE name = 'patient'")).fetchone()[0]
    receptionist_role = connection.execute(sa.text("SELECT id FROM roles WHERE name = 'receptionist'")).fetchone()[0]
    
    # Admin gets all permissions
    all_permissions = connection.execute(sa.text("SELECT id FROM permissions")).fetchall()
    for perm in all_permissions:
        connection.execute(
            sa.text("""
                INSERT INTO role_permissions (role_id, permission_id, assigned_at)
                VALUES (:role_id, :permission_id, :assigned_at)
            """),
            {
                'role_id': admin_role,
                'permission_id': perm[0],
                'assigned_at': datetime.utcnow()
            }
        )
    
    # Doctor permissions
    doctor_permissions = [
        'appointments.create', 'appointments.read', 'appointments.update',
        'medical_records.create', 'medical_records.read', 'medical_records.update',
        'payments.read', 'invoices.create',
        'notifications.send'
    ]
    
    for perm_name in doctor_permissions:
        perm_id = connection.execute(sa.text("SELECT id FROM permissions WHERE name = :name"), {'name': perm_name}).fetchone()[0]
        connection.execute(
            sa.text("""
                INSERT INTO role_permissions (role_id, permission_id, assigned_at)
                VALUES (:role_id, :permission_id, :assigned_at)
            """),
            {
                'role_id': doctor_role,
                'permission_id': perm_id,
                'assigned_at': datetime.utcnow()
            }
        )
    
    # Nurse permissions
    nurse_permissions = [
        'appointments.read', 'appointments.update',
        'medical_records.read', 'medical_records.update',
        'payments.read'
    ]
    
    for perm_name in nurse_permissions:
        perm_id = connection.execute(sa.text("SELECT id FROM permissions WHERE name = :name"), {'name': perm_name}).fetchone()[0]
        connection.execute(
            sa.text("""
                INSERT INTO role_permissions (role_id, permission_id, assigned_at)
                VALUES (:role_id, :permission_id, :assigned_at)
            """),
            {
                'role_id': nurse_role,
                'permission_id': perm_id,
                'assigned_at': datetime.utcnow()
            }
        )
    
    # Patient permissions
    patient_permissions = [
        'appointments.create', 'appointments.read',
        'medical_records.read',
        'payments.create', 'payments.read'
    ]
    
    for perm_name in patient_permissions:
        perm_id = connection.execute(sa.text("SELECT id FROM permissions WHERE name = :name"), {'name': perm_name}).fetchone()[0]
        connection.execute(
            sa.text("""
                INSERT INTO role_permissions (role_id, permission_id, assigned_at)
                VALUES (:role_id, :permission_id, :assigned_at)
            """),
            {
                'role_id': patient_role,
                'permission_id': perm_id,
                'assigned_at': datetime.utcnow()
            }
        )
    
    # Receptionist permissions
    receptionist_permissions = [
        'appointments.create', 'appointments.read', 'appointments.update', 'appointments.assign',
        'payments.read', 'invoices.create', 'invoices.send'
    ]
    
    for perm_name in receptionist_permissions:
        perm_id = connection.execute(sa.text("SELECT id FROM permissions WHERE name = :name"), {'name': perm_name}).fetchone()[0]
        connection.execute(
            sa.text("""
                INSERT INTO role_permissions (role_id, permission_id, assigned_at)
                VALUES (:role_id, :permission_id, :assigned_at)
            """),
            {
                'role_id': receptionist_role,
                'permission_id': perm_id,
                'assigned_at': datetime.utcnow()
            }
        )


def downgrade() -> None:
    # Remove all role-permission associations
    op.execute("DELETE FROM role_permissions")
    
    # Remove all permissions
    op.execute("DELETE FROM permissions")
    
    # Remove all roles
    op.execute("DELETE FROM roles")

