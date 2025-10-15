from enum import Enum

class BookingStatus(Enum):
    AVAILABLE = "Available"
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    
    
class OrderStatus(Enum):
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    CANCELLED = "Cancelled"
    DELIVERED = "Delivered"
    SENT  ="Sent"  
