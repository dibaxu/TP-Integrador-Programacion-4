from pydantic import HttpUrl, TypeAdapter, field_validator, model_validator
from sqlmodel import Field
from app.core.schemas import Schema
from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(Schema):
    nombre: str = Field(min_length=1)
    descripcion: str = ''
    precio_base: float = Field(ge=0)
    imagen_url: str = ''
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int = Field(ge=1)

    @field_validator('imagen_url')
    @classmethod
    def validate_url(cls, value: str) -> str:
        if value:
            TypeAdapter(HttpUrl).validate_python(value)
        return value


class ProductoUpdate(Schema):
    nombre: str | None = Field(default=None, min_length=1)
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = Field(default=None, ge=1)

    @field_validator('imagen_url')
    @classmethod
    def validate_url(cls, value: str | None) -> str | None:
        if value:
            TypeAdapter(HttpUrl).validate_python(value)
        return value

    @model_validator(mode='after')
    def reject_null(self):
        if any(getattr(self, key) is None for key in self.model_fields_set):
            raise ValueError('Los campos enviados no pueden ser nulos')
        return self


class ProductoStockUpdate(Schema):
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None

    @model_validator(mode='after')
    def validate_changes(self):
        if not self.model_fields_set or any(getattr(self, k) is None for k in self.model_fields_set):
            raise ValueError('Enviá stock o disponible con un valor válido')
        return self


class ProductoRead(ProductoCreate):
    id: int
    activo: bool
    categoria: CategoriaRead


class ProductosPaginados(Schema):
    total: int
    items: list[ProductoRead]
