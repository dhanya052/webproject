import uuid
import os
from flask import send_file
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit
from models import FoodItem  # Ensure FoodItem is imported

# Directory to store generated PDFs
PDF_DIR = "receipts"
os.makedirs(PDF_DIR, exist_ok=True)

def generate_pdf(order, receipt_id):
    """Generate a user-friendly PDF for the order receipt with header, address, and footer."""
    
    # ✅ Use receipt_id as a string instead of converting to bytes
    pdf_path = os.path.join(PDF_DIR, f"{receipt_id}.pdf")

    c = canvas.Canvas(pdf_path, pagesize=letter)

    # 🏷️ Restaurant Name Header
    restaurant_name = "🍽️ Thank you for ordering from Gourmet Delight!"
    hotel_address = "📍 123 Foodie Lane, Flavor Town, FT 56789"
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(120, 780, restaurant_name)

    c.setFont("Helvetica", 12)
    c.drawString(160, 760, hotel_address)

    # 🧾 Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(220, 730, "Order Receipt")

    c.setFont("Helvetica", 12)
    c.drawString(50, 690, f"Receipt ID: {receipt_id}")  # ✅ Use directly
    c.drawString(50, 670, f"Order ID: {order.id}")
    c.drawString(50, 650, f"Total Price: ${order.total_price:.2f}")
    c.drawString(50, 630, f"Status: {order.status}")

    # Draw a separator line
    c.line(50, 610, 550, 610)

    # 🥘 Order Items
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 590, "Order Items:")
    y_position = 570

    for item in order.order_items:
        food = FoodItem.query.get(item.food_id)  # Fetch the actual food item
        food_name = food.name if food else "Unknown Food"

        c.setFont("Helvetica", 11)
        text = f"{food_name} (Qty: {item.quantity})"
        lines = simpleSplit(text, "Helvetica", 11, 500)  # Wrap text if too long

        for line in lines:
            c.drawString(50, y_position, line)
            y_position -= 20  # Move down for the next line

    # ✨ Footer Message
    footer_text = "We appreciate your business! Enjoy your meal. 🍽️"
    c.setFont("Helvetica-Oblique", 12)
    c.drawString(150, 50, footer_text)  # Positioning it at the bottom

    # Save the PDF
    c.save()
    return pdf_path
