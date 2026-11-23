from sqlmodel import Session, func, select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def search(self, skip: int, limit: int, search: str | None,
               categoria_id: int | None, disponible: bool | None):
        statement = select(Producto).where(Producto.activo == True)
        if search:
            statement = statement.where(Producto.nombre.ilike(f'%{search}%'))
        if categoria_id is not None:
            statement = statement.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            statement = statement.where(Producto.disponible == disponible)
        total = self.session.exec(select(func.count()).select_from(statement.subquery())).one()
        items = self.session.exec(statement.order_by(Producto.id).offset(skip).limit(limit)).all()
        return total, items
