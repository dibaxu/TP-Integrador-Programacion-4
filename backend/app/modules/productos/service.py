from app.core.errors import DomainError
from app.modules.categorias.service import CategoriaService
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate, ProductoRead, ProductoStockUpdate, ProductoUpdate, ProductosPaginados,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(DomainError):
    status_code = 404


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    @staticmethod
    def active(uow, identifier: int, lock: bool = False) -> Producto:
        product = uow.productos.get_by_id(identifier, lock=lock)
        if product is None or not product.activo:
            raise ProductoNoEncontrado('Producto no encontrado')
        return product

    def listar(self, skip: int, limit: int, search: str | None,
               categoria_id: int | None, disponible: bool | None) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def obtener(self, identifier: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self.active(uow, identifier))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            CategoriaService.active(uow, data.categoria_id, True)
            product = uow.productos.add(Producto(**data.model_dump()))
            return ProductoRead.model_validate(product)

    def actualizar(self, identifier: int, data: ProductoUpdate | ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            product = self.active(uow, identifier, True)
            changes = data.model_dump(exclude_unset=True)
            if 'categoria_id' in changes and changes['categoria_id'] != product.categoria_id:
                CategoriaService.active(uow, changes['categoria_id'], True)
            product.sqlmodel_update(changes)            
            if 'categoria_id' in changes:
                uow.session.expire(product, ['categoria'])
            return ProductoRead.model_validate(product)

    def eliminar(self, identifier: int) -> None:
        with self.uow as uow:
            self.active(uow, identifier, True).activo = False
