from sqlalchemy.exc import IntegrityError
from app.core.errors import DomainError
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(DomainError):
    status_code = 404


class NombreDuplicado(DomainError):
    status_code = 409


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_active()]

    @staticmethod
    def active(uow, identifier: int, lock: bool = False) -> Categoria:
        category = uow.categorias.get_by_id(identifier, lock=lock)
        if category is None or not category.activo:
            raise CategoriaNoEncontrada('Categoría no encontrada')
        return category

    def obtener(self, identifier: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self.active(uow, identifier))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        try:
            with self.uow as uow:
                if uow.categorias.get_by_nombre(data.nombre):
                    raise NombreDuplicado('Ya existe una categoría con ese nombre')
                category = uow.categorias.add(Categoria(**data.model_dump()))
                return CategoriaRead.model_validate(category)
        except IntegrityError as error:
            raise NombreDuplicado('Ya existe una categoría con ese nombre') from error

    def actualizar(self, identifier: int, data: CategoriaUpdate) -> CategoriaRead:
        try:
            with self.uow as uow:
                category = self.active(uow, identifier, True)
                if data.nombre is not None:
                    existing = uow.categorias.get_by_nombre(data.nombre)
                    if existing and existing.id != identifier:
                        raise NombreDuplicado('Ya existe una categoría con ese nombre')
                category.sqlmodel_update(data.model_dump(exclude_unset=True))
                return CategoriaRead.model_validate(category)
        except IntegrityError as error:
            raise NombreDuplicado('Ya existe una categoría con ese nombre') from error

    def eliminar(self, identifier: int) -> None:
        with self.uow as uow:
            self.active(uow, identifier, True).activo = False
