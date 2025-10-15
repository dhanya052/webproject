import datetime
from flask import jsonify
from constants.enums import BookingStatus
from dto.tabelDto import TableDTO
from models import Table, TableBooking
import uuid
from dto.bookingDto import BookingDTO
from extensions import db

class BookingCommands:
    @staticmethod
    def create_booking(user_id, date, time, table_number):
        try:
            # Ensure user_id is in UUID string format
            user_id_bytes = str(uuid.UUID(user_id))  # Ensure user_id is a string representation of UUID

            # Check the number of bookings for the user
            existing_bookings = TableBooking.query.filter_by(user_id=user_id_bytes).count()
            if existing_bookings >= 10000000:
                return jsonify({"message": "User has reached the maximum booking limit of 10."}), 200

            # Validate and convert date format
            try:
                booking_date = datetime.datetime.strptime(date, "%d-%m-%Y").date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use DD-MM-YYYY."}), 400

            # Check if the table is available
            table = Table.query.filter_by(table_number=table_number).first()
            if not table:
                return jsonify({"error": "Table not found."}), 400

            if table.is_booked:
                return jsonify({"error": f"Table {table_number} is already booked for this date."}), 400

            # Create the booking
            new_booking = TableBooking(
                user_id=user_id_bytes,
                date=booking_date,
                time=time,
                status=BookingStatus.PENDING.value  # Use Enum for status
            )
            db.session.add(new_booking)
            db.session.commit()

            # Assign the table to the booking
            table.booking_id = new_booking.id
            table.user_id = user_id_bytes
            table.booking_date = booking_date
            table.booking_time = time
            table.booking_status = BookingStatus.PENDING.value
            table.is_booked = True
            db.session.commit()

            # Convert booking and table to DTOs
            booking_dto = BookingDTO(
                new_booking.id,
                new_booking.user_id,
                new_booking.date,
                new_booking.time,
                new_booking.status
            )

            table_dto = TableDTO(
                table.id, table.booking_id, table.user_id,
                table.table_number, table.booking_date, table.booking_time,
                table.booking_status, table.is_booked
            )

            return jsonify({
                "booking": booking_dto.to_dict(),
                "table": table_dto.to_dict()
            }), 201

        except KeyError as e:
            return jsonify({"error": f"Missing required field: {str(e)}"}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_all_bookings():
        try:
            bookings = TableBooking.query.all()
            # Return all bookings converted into DTOs
            return jsonify([BookingDTO(b.id, b.user_id, b.date, b.time, b.status).to_dict() for b in bookings]), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_all_bookings_by_user(user_id):
        try:
            # Validate user_id as a valid UUID
            try:
                uuid.UUID(user_id)  # Validate UUID format
            except ValueError:
                return {"error": "Invalid UUID format for user_id"}, 400  # Return data, not jsonify

            # Query the bookings for the provided user_id
            bookings = TableBooking.query.filter_by(user_id=user_id).all()

            # If no bookings are found for the user
            if not bookings:
                return {"message": "No bookings found for the given user_id."}, 404

            # Return the bookings in the response as DTOs (just return the data, not jsonify here)
            booking_data = [BookingDTO(b.id, b.user_id, b.date, b.time, b.status).to_dict() for b in bookings]
            return booking_data, 200 

        except Exception as e:
            return {"error": str(e)}, 500    

    @staticmethod
    def get_booking_by_id(booking_id):
        try:
            # Ensure booking_id is in string format, and attempt to convert it to UUID
            booking_id = str(booking_id)  # Convert booking_id to string to ensure proper comparison

            # Debugging print statement
            print(f"Attempting to retrieve booking with ID: {booking_id}")

            # Attempt to get the booking from the database by its UUID
            booking = TableBooking.query.get(booking_id)
            
            # Debugging print to check the result of the query
            print(f"Booking fetched: {booking}")

            if not booking:
                return jsonify({"error": "Booking not found"}), 404

            booking_dto = BookingDTO(
                booking.id,
                booking.user_id,
                booking.date,
                booking.time,
                booking.status
            )
            return jsonify(booking_dto.to_dict()), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def update_booking_status(booking_id, status):
        if status not in [e.value for e in BookingStatus]:  # Ensure valid status
            return jsonify({"error": "Invalid booking status"}), 400

        try:
            # Ensure booking_id is in string format
            booking_id = str(booking_id)
            booking = TableBooking.query.get(booking_id)
            if not booking:
                return jsonify({"error": "Booking not found"}), 404

            booking.status = status
            db.session.commit()

            booking_dto = BookingDTO(
                booking.id,
                booking.user_id,
                booking.date,
                booking.time,
                booking.status
            )
            return jsonify(booking_dto.to_dict()), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_booking(booking_id):
        try:
            # Ensure booking_id is in string format
            booking_id = str(booking_id)
            booking = TableBooking.query.get(booking_id)
            if not booking:
                return jsonify({"error": "Booking not found"}), 404

            db.session.delete(booking)
            db.session.commit()
            return jsonify({"message": "Booking deleted successfully"}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def assign_table(booking_id, table_number):
        try:
            # Ensure booking_id is in string format
            booking_id = str(booking_id)
            booking = TableBooking.query.get(booking_id)

            if not booking:
                return jsonify({"error": "Booking not found"}), 404

            # Find the table by table_number for the specified booking date
            table = Table.query.filter_by(table_number=table_number).first()

            if not table:
                return jsonify({"error": "Table not found for this booking on the specified date."}), 400

            # Check if the table is already booked
            if table.is_booked:
                return jsonify({
                    "message": f"Table {table_number} is already booked for this date."
                }), 400

            # If the table is not booked, assign it
            table.booking_id = booking.id
            table.user_id = booking.user_id
            table.booking_date = booking.date
            table.booking_time = booking.time
            table.booking_status = BookingStatus.CONFIRMED.value  # Update the table status to CONFIRMED
            table.is_booked = True  # Mark the table as booked

            # Update the booking's status to CONFIRMED as well
            booking.status = BookingStatus.CONFIRMED.value

            # Commit changes to the database
            db.session.commit()

            # Prepare and return the updated table and booking details
            table_dto = TableDTO(
                table.id, table.booking_id, table.user_id,
                table.table_number, table.booking_date, table.booking_time,
                table.booking_status, table.is_booked
            )

            booking_dto = BookingDTO(
                booking.id, booking.user_id, booking.date,
                booking.time, booking.status
            )

            return jsonify({
                "message": f"Table {table_number} successfully assigned to booking {booking_id}.",
                "table": table_dto.to_dict(),
                "booking": booking_dto.to_dict()
            }), 200

        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            return jsonify({"error": str(e)}), 500
