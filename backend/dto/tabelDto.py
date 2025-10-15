import uuid
from constants.enums import BookingStatus

class TableDTO:
    def __init__(self, id=None, booking_id=None, user_id=None, table_number=None, booking_date=None, booking_time=None, booking_status=None, booked=None):
        self.id = self.generate_uuid() if id is None else self.convert_uuid(id)
        self.user_id = self.convert_uuid(user_id) if user_id else None
        self.booking_id = self.convert_uuid(booking_id) if booking_id else None
        self.booking_date = booking_date.isoformat() if booking_date else None
        self.time = booking_time.strftime("%H:%M:%S") if booking_time else None
        self.status = booking_status.value if isinstance(booking_status, BookingStatus) else booking_status
        self.table_number = table_number
        self.booked = booked

    @staticmethod
    def generate_uuid():
        return str(uuid.uuid4())

    def convert_uuid(self, value):
        # Assuming this method is used to convert the UUID string to a proper UUID object or something similar
        return str(value)  # Modify this if you want to return the UUID as an actual object instead

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "booking_id": self.booking_id,
            "date": self.booking_date,
            "time": self.time,
            "status": self.status,  # Now always a string
            "table_number": self.table_number,
            "booked": self.booked
        }
