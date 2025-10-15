import os
import random
import uuid
import traceback
from flask import jsonify, send_file
from commands.genatrepdf import generate_pdf
from constants.enums import OrderStatus
from extensions import db
from models import FoodItem, Order, OrderItem, Receipt


class OrderCommands:
    
    # 🟢 Create Order
    @staticmethod
    def place_order(user_id, order_items):
        print(f"User ID received: {user_id}")

        if not user_id or not order_items:
            return jsonify({"error": "Missing required fields"}), 400

        # Create order with string UUID
        new_order = Order(
            id=str(uuid.uuid4()),
            user_id=user_id,
            total_price=sum(item["price"] * item["quantity"] for item in order_items),
            status=OrderStatus.PENDING.value
        )
        db.session.add(new_order)

        for item in order_items:
            food = FoodItem.query.filter_by(name=item["name"]).first()
            if not food:
                return jsonify({"error": f"Food item '{item['name']}' not found"}), 404
            
            order_item = OrderItem(
                order_id=new_order.id,
                food_id=food.id,
                quantity=item["quantity"]
            )
            db.session.add(order_item)

        db.session.commit()

        return jsonify({
            "id": new_order.id,
            "user_id": new_order.user_id,
            "total_price": new_order.total_price,
            "status": new_order.status,
            "order_items": [
                {
                    "name": food.name,
                    "price": food.price,
                    "quantity": item.quantity
                }
                for item in new_order.order_items
                for food in [FoodItem.query.get(item.food_id)]
            ]
        }), 201

    # 🟠 Update Order Status
    @staticmethod
    def update_order_status(order_id, status):
        order = Order.query.filter_by(id=order_id).first()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        if status not in [s.value for s in OrderStatus]:
            return jsonify({"error": "Invalid status"}), 400

        order.status = status
        db.session.commit()

        return jsonify({"message": "Order status updated successfully", "status": order.status})

    # 📤 Send Order
    @staticmethod
    def send_order(order_id):
        try:
            print(f"Received order_id: {order_id} ({type(order_id)})")  # Debug log

            order = Order.query.filter_by(id=order_id).first_or_404(description="Order not found")

            if order.status != OrderStatus.PENDING.value:
                return jsonify({"error": "Order is not in pending state"}), 400

            # Update status and generate receipt
            order.status = OrderStatus.SENT.value
            db.session.commit()

            receipt_id = str(uuid.uuid4())
            pdf_path = generate_pdf(order, receipt_id)

            receipt = Receipt(order_id=order.id, file_path=pdf_path)
            db.session.add(receipt)
            db.session.commit()

            return jsonify({"message": "Order sent successfully", "receipt_pdf": pdf_path}), 200

        except Exception as e:
            print("Error Traceback:", traceback.format_exc())
            return jsonify({"error": str(e)}), 500

    # 📥 Download Receipt by Order ID (Now returning order info instead of PDF)
    @staticmethod
    def download_receipt_by_order_id(order_id):
        try:
            order = Order.query.filter_by(id=order_id).first()
            if not order:
                return jsonify({"error": "Order not found"}), 404

            # Return order information instead of PDF
            receipt_info = {
                "receipt_id": str(uuid.uuid4()),  # Generate receipt ID dynamically
                "order_id": order.id,
                "total_price": order.total_price,
                "status": order.status,
                "items": [
                    {
                        "name": FoodItem.query.get(item.food_id).name,
                        "quantity": item.quantity,
                        "price": FoodItem.query.get(item.food_id).price
                    }
                    for item in order.order_items
                ]
            }
            return jsonify(receipt_info), 200

        except Exception as e:
            print("Error downloading receipt:", e)
            return jsonify({"error": "Receipt not found"}), 404

    # 📝 Get All Orders
    @staticmethod
    def get_all_orders():
        orders = Order.query.all()

        return jsonify([
            {
                "id": order.id,
                 "digit_id": str(random.randint(10000, 99999)),
                "user_id": order.user_id,
                "total_price": order.total_price,
                "status": order.status,
                "order_items": [
                    {
                        "name": food.name,
                        "price": food.price,
                        "quantity": item.quantity
                    }
                    for item in order.order_items
                    for food in [FoodItem.query.get(item.food_id)]
                ]
            }
            for order in orders
        ])
