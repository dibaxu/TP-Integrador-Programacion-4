from fastapi import APIRouter, Depends, HTTPException, Response
from app.core.deps import require_role
from app.core.errors import DomainError
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaService
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix='/categorias', tags=['Categorías'])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get('', response_model=list[CategoriaRead])
def listar(service: CategoriaService = Depends(get_categoria_service)):
    return service.listar()


@router.get('/{id}', response_model=CategoriaRead)
def obtener(id: int, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.obtener(id)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.post('', response_model=CategoriaRead, status_code=201,
             dependencies=[Depends(require_role(['admin']))])
def crear(data: CategoriaCreate, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.crear(data)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.put('/{id}', response_model=CategoriaRead, dependencies=[Depends(require_role(['admin']))])
def actualizar(id: int, data: CategoriaUpdate, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.actualizar(id, data)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.delete('/{id}', status_code=204, dependencies=[Depends(require_role(['admin']))])
def eliminar(id: int, service: CategoriaService = Depends(get_categoria_service)):
    try:
        service.eliminar(id)
        return Response(status_code=204)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error
