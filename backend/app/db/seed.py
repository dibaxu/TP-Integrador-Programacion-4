"""python -m app.db.seed: carga inicial idempotente del TPI."""
from sqlmodel import select
from app.core.config import get_settings
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto


def main():
    create_all_tables()
    with UnitOfWork() as uow:
        session = uow.session
        if session.exec(select(Usuario).where(Usuario.username == 'admin')).first() is None:
            session.add(Usuario(username='admin', full_name='Administrador Food Store',
                email='admin@foodstore.com', hashed_password=hash_password('Admin1234!'), role='admin'))
        catalog = {
            'Hamburguesas': [('Clásica', 'Carne, queso, lechuga y tomate.', 6500),
                            ('Doble cheddar', 'Doble carne y queso cheddar.', 8500),
                            ('Vegetariana', 'Medallón de lentejas y vegetales.', 6200)],
            'Pizzas': [('Muzzarella', 'Salsa de tomate, muzzarella y aceitunas.', 9000),
                       ('Napolitana', 'Muzzarella, tomate y ajo.', 10500),
                       ('Fugazzeta', 'Muzzarella y cebolla.', 11000)],
            'Acompañamientos': [('Papas fritas', 'Porción de papas doradas.', 3500),
                                ('Aros de cebolla', 'Porción de aros crocantes.', 4000)],
        }
        for name, products in catalog.items():
            category = session.exec(select(Categoria).where(Categoria.nombre == name)).first()
            if category is None:
                category = Categoria(nombre=name, descripcion=f'Nuestra selección de {name.lower()}.')
                session.add(category)
                session.flush()
            for product_name, description, price in products:
                existing = session.exec(select(Producto).where(
                    Producto.nombre == product_name, Producto.categoria_id == category.id)).first()
                if existing is None:
                    session.add(Producto(nombre=product_name, descripcion=description, precio_base=price,
                        categoria_id=category.id, stock=20,
                        imagen_url=f'{get_settings().FRONTEND_ORIGIN.rstrip("/")}/comida.svg'))
    print('Seed completo: admin y catálogo disponibles; los registros existentes no se modifican.')


if __name__ == '__main__':
    main()
