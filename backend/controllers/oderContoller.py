import uuid
import traceback
from flask import Blueprint, request, jsonify, send_file
from commands.orderCommands import OrderCommands
from dto.orderDto import OrderDTO

order_bp = Blueprint("order_bp", __name__)

# 🟢 Create Order
@order_bp.route("/", methods=["POST"])
def place_order():
    data = request.json
    if not data.get("user_id") or not data.get("order_items"):
        return jsonify({"message": "Missing required fields"}), 400

    response = OrderCommands.place_order(data["user_id"], data["order_items"])
    return response

# 📝 Get All Orders
@order_bp.route("/", methods=["GET"])
def get_orders():
    return OrderCommands.get_all_orders()

# 🔍 Get Individual Order
@order_bp.route("/<string:order_id>", methods=["GET"])
def get_individual_order(order_id):
    try:
        uuid.UUID(order_id)  # Validate UUID format
        return OrderCommands.get_order_by_id(order_id)
    except ValueError:
        return jsonify({"error": "Invalid UUID format"}), 400

# 🟠 Update Order Status
@order_bp.route("/<string:order_id>", methods=["PUT"])
def update_order_status(order_id):
    data = request.json
    status = data.get("status")
    if not status:
        return jsonify({"message": "Status required"}), 400

    return OrderCommands.update_order_status(order_id, status)

# ❌ Delete Order
@order_bp.route("/<string:order_id>", methods=["DELETE"])
def delete_order(order_id):
    return OrderCommands.delorder(order_id)

# 📤 Send Order
@order_bp.route("/<string:order_id>/send", methods=["POST"])
def send_order(order_id):
    return OrderCommands.send_order(order_id)

# 📥 Download Receipt
@order_bp.route("/<string:order_id>/receipt", methods=["GET"])
def download_receipt(order_id):
    return OrderCommands.download_receipt_by_order_id(order_id)