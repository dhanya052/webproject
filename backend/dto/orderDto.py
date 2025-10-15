class OrderDTO:
    def __init__(self, id, user_id, total_price, status, order_items):
        self.id = id
        self.user_id = user_id
        self.total_price = total_price
        self.status = status
        self.order_items = [item.to_dict() for item in order_items]
    
    def to_dict(self):
        return self.__dict__