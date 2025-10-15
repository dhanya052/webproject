from dto.tabelDto import TableDTO
from models import Table
from extensions import db
import uuid
from flask import jsonify

class TabelCommands:
    @staticmethod
    def get_all_tables():
        tables = Table.query.all()
        return [TableDTO(
            b.id, b.booking_id, b.user_id, b.table_number, 
            b.booking_date, b.booking_time, b.booking_status, 
            b.is_booked
        ) for b in tables]

    @staticmethod
    def get_table_by_id(table_id):
        """Fetch a table by its UUID"""
        table = Table.query.filter_by(id=table_id).first()
        if not table:
            return None
        return TableDTO(
            table.id, table.booking_id, table.user_id, 
            table.table_number, table.booking_date, 
            table.booking_time, table.booking_status, 
            table.is_booked
        )

    @staticmethod
    def create_table(table_number):
        """Create a new table with a given table number"""
        new_table = Table(
            id=str(uuid.uuid4()),  # Store as string UUID
            table_number=table_number,
            booking_id=None,
            user_id=None,
            booking_date=None,
            booking_time=None,
            booking_status="AVAILABLE",
            is_booked=False
        )
        db.session.add(new_table)
        db.session.commit()
        return TableDTO(
            new_table.id, new_table.booking_id, new_table.user_id, 
            new_table.table_number, new_table.booking_date, 
            new_table.booking_time, new_table.booking_status, 
            new_table.is_booked
        )

    @staticmethod
    def get_free_tables():
        """Fetch all unbooked tables"""
        free_tables = Table.query.filter_by(is_booked=False).all()
        return [TableDTO(
            t.id, t.booking_id, t.user_id, t.table_number, 
            t.booking_date, t.booking_time, t.booking_status, 
            t.is_booked
        ) for t in free_tables]

    @staticmethod
    def free_table(table_id):
        """Mark an individual table as free (available)"""
        table = Table.query.filter_by(id=table_id).first()
        if not table:
            return None
        
        table.booking_id = None
        table.user_id = None
        table.booking_date = None
        table.booking_time = None
        table.booking_status = "AVAILABLE"
        table.is_booked = False
        
        db.session.commit()
        return TableDTO(
            table.id, table.booking_id, table.user_id, 
            table.table_number, table.booking_date, 
            table.booking_time, table.booking_status, 
            table.is_booked
        )
