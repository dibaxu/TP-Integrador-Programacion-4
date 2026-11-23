from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix='/admin/usuarios', tags=['Usuarios'])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get('', response_model=list[UserPublic])
def listar(admin: UserPublic = Depends(require_role(['admin'])),
           service: UsuarioService = Depends(get_usuario_service)):
    return service.listar()


@router.post('/{id}/activar', response_model=UserPublic)
def activar(id: int, admin: UserPublic = Depends(require_role(['admin'])),
            service: UsuarioService = Depends(get_usuario_service)):
    return service.cambiar_estado(id, False, admin.id)


@router.post('/{id}/desactivar', response_model=UserPublic)
def desactivar(id: int, admin: UserPublic = Depends(require_role(['admin'])),
               service: UsuarioService = Depends(get_usuario_service)):
    return service.cambiar_estado(id, True, admin.id)
