from sqlmodel import Session, SQLModel, create_engine

from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL, **(
    {'connect_args': {'check_same_thread': False}}
    if settings.DATABASE_URL.startswith('sqlite') else {'pool_pre_ping': True}
))


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)


def create_all_tables() -> None:
    from app.modules.usuarios import models
    from app.modules.categorias import models
    from app.modules.productos import models
    from app.modules.pedidos import models
    SQLModel.metadata.create_all(engine)
