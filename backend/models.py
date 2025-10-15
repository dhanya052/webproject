import uuid
from sqlalchemy import Column, String, Float, Integer, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql import func
from app import db
from sqlalchemy import Enum as SQLAlchemyEnum
from constants.enums import BookingStatus

# Generate UUID as a string
def generate_uuid():
    return str(uuid.uuid4())

class BaseModel(db.Model):
    """Base model to handle UUID ID fields"""
    __abstract__ = True
    id = Column(String(36), primary_key=True, default=generate_uuid, unique=True, nullable=False)

class User(BaseModel):
    __tablename__ = 'users'  # Explicit table name
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), default="user") 

    bookings = relationship('TableBooking', backref='user', lazy=True)
    orders = relationship('Order', backref='user', lazy=True)

    def is_admin(self):
        return self.role == "admin"

class TableBooking(BaseModel):
    __tablename__ = 'table_bookings'
    user_id = Column(String(36), ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    status = Column(String(50), default="Pending")
    tables = relationship('Table', backref='booking', lazy=True)

class Table(BaseModel):
    __tablename__ = 'tables'
    booking_id = Column(String(36), ForeignKey('table_bookings.id', ondelete="SET NULL"), nullable=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    table_number = Column(Integer, nullable=False)
    booking_date = Column(Date, nullable=True)
    booking_time = Column(Time, nullable=True)
    booking_status = Column(SQLAlchemyEnum(BookingStatus), default=BookingStatus.AVAILABLE.value, nullable=False) 
    is_booked = Column(db.Boolean, default=False)

class FoodItem(BaseModel):
    __tablename__ = 'food_items'
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    image_url = Column(String(255), nullable=True)
    category = Column(String(50), nullable=False)

class Order(BaseModel):
    __tablename__ = 'orders'
    user_id = Column(String(36), ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(50), default="Pending")
    order_items = relationship('OrderItem', backref='order', lazy=True)

class OrderItem(BaseModel):
    __tablename__ = 'order_items'
    order_id = Column(String(36), ForeignKey('orders.id', ondelete="CASCADE"), nullable=False)
    food_id = Column(String(36), ForeignKey('food_items.id', ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)

class Receipt(BaseModel):
    __tablename__ = 'receipts'
    order_id = Column(String(36), ForeignKey('orders.id', ondelete="CASCADE"), nullable=False)
    file_path = Column(String(255), nullable=False)
    created_at = Column(db.DateTime, default=func.current_timestamp())
