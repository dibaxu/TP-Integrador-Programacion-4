from sqlmodel import Field
from pydantic import model_validator
from app.core.schemas import Schema


class CategoriaCreate(Schema):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = ''


class CategoriaUpdate(Schema):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None

    @model_validator(mode='after')
    def reject_null(self):
        if any(getattr(self, key) is None for key in self.model_fields_set):
            raise ValueError('Los campos enviados no pueden ser nulos')
        return self


class CategoriaRead(CategoriaCreate):
    id: int
    activo: bool
