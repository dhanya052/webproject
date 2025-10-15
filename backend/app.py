from flask import Flask
from flask_cors import CORS
from extensions import db, migrate
from config import Config

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

db.init_app(app)
migrate.init_app(app, db)

# Import and register blueprints
from controllers.userController import user_bp
from controllers.bookingController import booking_bp
from controllers.tabelsControllers import tables_bp
from controllers.foodController import food_bp
from controllers.oderContoller import order_bp

app.register_blueprint(user_bp, url_prefix="/users")
app.register_blueprint(booking_bp, url_prefix="/bookings")
app.register_blueprint(tables_bp, url_prefix="/tables")
app.register_blueprint(food_bp,url_prefix="/menu")
app.register_blueprint(order_bp,url_prefix="/orders")

if __name__ == "__main__":
    app.url_map.strict_slashes = False
    app.run(debug=True)
    CORS(app)
    CORS(app, resources={r"/users/*": {"origins": "*"}})

