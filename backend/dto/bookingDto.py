from constants.enums import BookingStatus

class BookingDTO:
    def __init__(self, id, user_id, date, time, status, tables=None):
        # Assuming id and user_id are already strings (not bytes), no need to convert them
        self.id = id
        self.user_id = user_id
        self.date = date.isoformat() if date else None  # Ensure date is in ISO format
        self.time = time.strftime("%H:%M:%S") if time else None  # Ensure time is in correct format
        self.status = status.value if isinstance(status, BookingStatus) else status  # Ensure status is a string
        self.tables = [
            {
                "id": table.id,  # Assuming table.id is already a string (UUID)
                "table_number": table.table_number,
                "booking_date": table.booking_date.isoformat() if table.booking_date else None,
                "booking_time": table.booking_time.strftime("%H:%M:%S") if table.booking_time else None,
                "booking_status": table.booking_status.value if isinstance(table.booking_status, BookingStatus) else str(table.booking_status),
            }
            for table in (tables or [])  # Handle case where tables may be None
        ]

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date": self.date,
            "time": self.time,
            "status": self.status,
            "tables": self.tables
        }
