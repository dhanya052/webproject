from dto.foodItem import FoodItemDTO
from extensions import db
from models import FoodItem

class FoodCommands:
    @staticmethod
    def add_food_item(name, description, price, image_url, category):
        new_food = FoodItem(
            name=name,
            description=description,
            price=price,
            image_url=image_url,
            category=category
        )
        db.session.add(new_food)
        db.session.commit()
        return FoodItemDTO(new_food.id, new_food.name, new_food.description, new_food.price, new_food.image_url, new_food.category)

    @staticmethod
    def get_all_food_items(category=None):
        query = FoodItem.query
        if category:
            query = query.filter(FoodItem.category == category)
        food_items = query.all()
        return [FoodItemDTO(item.id, item.name, item.description, item.price, item.image_url, item.category) for item in food_items]

    @staticmethod
    def get_all_categories():
        categories = db.session.query(FoodItem.category).distinct().all()
        return [category[0] for category in categories]  # Extract category names
