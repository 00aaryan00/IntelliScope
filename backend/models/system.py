from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from db.base_class import Base

class SystemHealth(Base):
    __tablename__ = "system_health"
    
    component_name = Column(String, primary_key=True, index=True)
    status = Column(String, nullable=False) # 'healthy', 'error', 'running'
    message = Column(String, nullable=True)
    metrics = Column(JSON, nullable=True)
    last_run = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
