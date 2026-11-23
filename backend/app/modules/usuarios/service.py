from fastapi import HTTPException

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(user) for user in uow.usuarios.get_all()]

    def cambiar_estado(self, identifier: int, disabled: bool, actor_id: int) -> UserPublic:
        with self.uow as uow:
            user = uow.usuarios.get_by_id(identifier, lock=True)
            if user is None:
                raise HTTPException(404, 'Usuario no encontrado')
            if disabled and identifier == actor_id:
                raise HTTPException(400, 'No podés desactivarte a vos mismo')
            user.disabled = disabled
            return UserPublic.model_validate(user)
