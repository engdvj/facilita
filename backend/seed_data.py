"""
Seed data for FACILITA CHVC application
Populates database with example data for testing
"""
from app import create_app, db
from app.models import User, Category, Link, Color, Schedule
from werkzeug.security import generate_password_hash


def create_seed_data():
    """Create seed data for the application"""
    
    app = create_app()
    
    with app.app_context():
        print("Creating seed data...")
        
        # Clear existing data (optional - comment out if you want to keep existing data)
        # db.drop_all()
        # db.create_all()
        
        # Create default colors
        colors_data = [
            ('Azul Oceano', '#0EA5E9', True),
            ('Verde Esmeralda', '#10B981', True),
            ('Roxo Místico', '#8B5CF6', True),
            ('Rosa Coral', '#EC4899', True),
            ('Dourado', '#F59E0B', True),
            ('Vermelho Rubi', '#EF4444', True),
            ('Índigo Profundo', '#6366F1', True),
            ('Turquesa', '#14B8A6', True),
            ('Laranja Vibrante', '#F97316', False),
            ('Lima', '#84CC16', False),
        ]
        
        print("Creating colors...")
        for name, value, is_default in colors_data:
            color = Color.query.filter_by(value=value).first()
            if not color:
                color = Color(
                    name=name,
                    value=value,
                    is_default=is_default,
                    is_active=True
                )
                color.save()
                print(f"✓ Created color: {name}")
        
        # Create categories
        categories_data = [
            ('Sistemas Hospitalares', 'Sistemas principais do hospital', '#0EA5E9', 'activity'),
            ('Recursos Humanos', 'Gestão de pessoal e colaboradores', '#10B981', 'users'),
            ('Financeiro', 'Sistemas financeiros e contábeis', '#F59E0B', 'dollar-sign'),
            ('Pacientes', 'Gestão de pacientes e prontuários', '#EC4899', 'user-heart'),
            ('Laboratório', 'Sistemas de laboratório', '#8B5CF6', 'flask'),
            ('Farmácia', 'Gestão farmacêutica', '#EF4444', 'pill'),
            ('TI e Suporte', 'Sistemas de TI e suporte técnico', '#6366F1', 'monitor'),
            ('Educação', 'Materiais educativos e treinamento', '#14B8A6', 'book-open'),
        ]
        
        print("Creating categories...")
        for name, description, color, icon in categories_data:
            category = Category.query.filter_by(name=name).first()
            if not category:
                category = Category(
                    name=name,
                    description=description,
                    color=color,
                    icon=icon,
                    admin_only=False,
                    is_active=True
                )
                category.save()
                print(f"✓ Created category: {name}")
        
        # Create admin user
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                name='Administrador do Sistema',
                username='admin',
                email='admin@facilita.chvc',
                is_admin=True,
                is_active=True,
                theme='dark'
            )
            admin.set_password('admin123')
            admin.save()
            print("✓ Created admin user (admin/admin123)")
        
        # Create test user
        user = User.query.filter_by(username='usuario').first()
        if not user:
            user = User(
                name='Usuário de Teste',
                username='usuario',
                email='usuario@facilita.chvc',
                is_admin=False,
                is_active=True,
                theme='dark'
            )
            user.set_password('123456')
            user.save()
            print("✓ Created test user (usuario/123456)")
        
        # Get categories for links
        sistemas_cat = Category.query.filter_by(name='Sistemas Hospitalares').first()
        rh_cat = Category.query.filter_by(name='Recursos Humanos').first()
        financeiro_cat = Category.query.filter_by(name='Financeiro').first()
        pacientes_cat = Category.query.filter_by(name='Pacientes').first()
        
        # Create example links
        links_data = [
            ('Sistema HIS', 'https://his.chvc.gov.br', 'Sistema Hospitalar Integrado', sistemas_cat.id, admin.id, '#0EA5E9'),
            ('Portal do Servidor', 'https://servidor.chvc.gov.br', 'Portal para servidores', rh_cat.id, admin.id, '#10B981'),
            ('Sistema Financeiro', 'https://financeiro.chvc.gov.br', 'Gestão financeira', financeiro_cat.id, admin.id, '#F59E0B'),
            ('Prontuário Eletrônico', 'https://prontuario.chvc.gov.br', 'Sistema de prontuários', pacientes_cat.id, admin.id, '#EC4899'),
            ('Agenda Médica', 'https://agenda.chvc.gov.br', 'Agendamento de consultas', pacientes_cat.id, user.id, '#8B5CF6'),
            ('SIGA Saúde', 'https://siga.chvc.gov.br', 'Sistema de Gestão', sistemas_cat.id, admin.id, '#EF4444'),
            ('Portal Transparência', 'https://transparencia.chvc.gov.br', 'Transparência pública', financeiro_cat.id, None, '#6366F1'),
            ('Ouvidoria', 'https://ouvidoria.chvc.gov.br', 'Ouvidoria do hospital', None, None, '#14B8A6'),
        ]
        
        print("Creating links...")
        for title, url, description, category_id, user_id, color in links_data:
            link = Link.query.filter_by(title=title).first()
            if not link:
                link = Link(
                    title=title,
                    url=url,
                    description=description,
                    category_id=category_id,
                    user_id=user_id,
                    color=color,
                    is_active=True,
                    click_count=0
                )
                link.save()
                print(f"✓ Created link: {title}")
        
        # Create example schedules/files
        schedules_data = [
            ('Manual do Sistema HIS', 'https://files.chvc.gov.br/manual-his.pdf', 'Manual completo do sistema HIS', sistemas_cat.id, admin.id, 'manual-his.pdf', 2048000),
            ('Escala de Plantões Janeiro', 'https://files.chvc.gov.br/escala-jan.xlsx', 'Escala de plantões do mês de janeiro', rh_cat.id, admin.id, 'escala-jan.xlsx', 512000),
            ('Protocolo de Atendimento COVID', 'https://files.chvc.gov.br/protocolo-covid.pdf', 'Protocolo para atendimento COVID-19', pacientes_cat.id, admin.id, 'protocolo-covid.pdf', 1024000),
        ]
        
        print("Creating schedules...")
        for title, file_url, description, category_id, user_id, file_name, file_size in schedules_data:
            schedule = Schedule.query.filter_by(title=title).first()
            if not schedule:
                schedule = Schedule(
                    title=title,
                    file_url=file_url,
                    description=description,
                    category_id=category_id,
                    user_id=user_id,
                    file_name=file_name,
                    file_size=file_size,
                    is_active=True,
                    download_count=0
                )
                schedule.save()
                print(f"✓ Created schedule: {title}")
        
        print("\n✅ Seed data created successfully!")
        print("\nLogin credentials:")
        print("Admin: admin / admin123")
        print("User: usuario / 123456")


if __name__ == "__main__":
    create_seed_data()