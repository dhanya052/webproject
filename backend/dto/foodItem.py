class FoodItemDTO:
    def __init__(self, id, name, description, price, image_url, category):  # Added category
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.image_url = image_url
        self.category = category  # Added category

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "image_url": self.image_url,
            "category": self.category  # Added category
        }
