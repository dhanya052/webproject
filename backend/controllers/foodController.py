from flask import Blueprint, jsonify, request
from commands.foodCommands import FoodCommands

food_bp = Blueprint("food_bp", __name__)

@food_bp.route("/", methods=["POST"])
def add_food():
    data = request.json
    if not all(k in data for k in ("name", "description", "price", "image_url", "category")):
        return jsonify({"message": "Missing required fields"}), 400
    food_dto = FoodCommands.add_food_item(data["name"], data["description"], data["price"], data["image_url"], data["category"])
    return jsonify(food_dto.to_dict()), 201

@food_bp.route("/", methods=["GET"])
def get_all_food():
    category = request.args.get("category")  # Get 'category' from query parameters
    food_items = FoodCommands.get_all_food_items(category)
    return jsonify([item.to_dict() for item in food_items]), 200

@food_bp.route("/categories", methods=["GET"])
def get_all_categories():
    categories = FoodCommands.get_all_categories()
    return jsonify({"categories": categories}), 200
