from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, LargeBinary
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Document(Base):
    __tablename__ = 'documents'

    id = Column(Integer, primary_key=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    file_data = Column(LargeBinary, nullable=False)
    upload_time = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, nullable=True)  # For future user integration
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'file_type': self.file_type,
            'content_type': self.content_type,
            'upload_time': self.upload_time.isoformat(),
            'user_id': self.user_id
        } 