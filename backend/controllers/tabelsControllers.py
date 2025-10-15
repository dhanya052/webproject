from flask import Blueprint, request, jsonify
from commands.tabelCommands import TabelCommands

tables_bp = Blueprint("tables_bp", __name__)

@tables_bp.route("/", methods=["GET"])
def get_bookings():
    """Get all tables"""
    tables = TabelCommands.get_all_tables()
    return jsonify([t.to_dict() for t in tables])

@tables_bp.route("/<table_id>", methods=["GET"])
def get_table(table_id):
    """Get an individual table by ID"""
    table = TabelCommands.get_table_by_id(table_id)
    if not table:
        return jsonify({"error": "Table not found"}), 404
    return jsonify(table.to_dict())

@tables_bp.route("/create", methods=["POST"])
def create_table():
    """Create a new table"""
    data = request.get_json()
    table_number = data.get("table_number")
    if not table_number:
        return jsonify({"error": "Table number is required"}), 400
    
    table = TabelCommands.create_table(table_number)
    return jsonify(table.to_dict()), 201

@tables_bp.route("/free", methods=["GET"])
def get_free_tables():
    """Get all free tables"""
    tables = TabelCommands.get_free_tables()
    return jsonify([t.to_dict() for t in tables])

@tables_bp.route("/free/<table_id>", methods=["PUT"])
def free_table(table_id):
    """Free an individual table"""
    table = TabelCommands.free_table(table_id)
    if not table:
        return jsonify({"error": "Table not found"}), 404
    return jsonify(table.to_dict()), 200
