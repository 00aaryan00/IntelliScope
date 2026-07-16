from sqlalchemy.orm import declarative_base

# This is the base class that all our database models will inherit from.
# It tells SQLAlchemy that any class inheriting from this is a database table.
Base = declarative_base()
