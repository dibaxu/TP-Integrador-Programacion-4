from pydantic import ConfigDict
from sqlmodel import SQLModel


class Schema(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True, allow_inf_nan=False)
