import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Card } from "@radix-ui/themes/components/card";
import { Button } from "@radix-ui/themes/components/button";
import { ScrollArea } from "@radix-ui/themes/components/scroll-area";
import { CheckCircle, Utensils } from "lucide-react"; // Replaced Truck with Utensils
import * as Tabs from "@radix-ui/react-tabs";
import { groupBy } from "lodash";

const questions = [
  "🍔 Craving Something Delicious?",
  "🍕 Looking for Your Favorite Dish?",
  "🍜 Hungry? We've Got You Covered!",
];

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

interface CartItem extends FoodItem {
  quantity: number;
}

const FindFood = () => {
  const getUserFromStorage = () => {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  const [user, setUser] = useState(getUserFromStorage());
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [groupedMenu, setGroupedMenu] = useState<Record<string, FoodItem[]>>({});

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/menu")
      .then((response) => {
        const groupedData = groupBy(response.data, "category");
        setGroupedMenu(groupedData);
        setMenu(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch menu. Please try again later.");
        setLoading(false);
      });

    const interval = setInterval(() => {
      setQuestionIndex((prev) => (prev + 1) % questions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const addToCart = (item: FoodItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const checkout = async () => {
    if (!user) {
      alert("Please login before proceeding to checkout.");
      return;
    }

    if (cart.length === 0) return;

    setProcessingOrder(true);

    const orderData = {
      user_id: user.user_id,
      order_items: cart.map(({ name, price, quantity }) => ({
        name,
        price,
        quantity,
      })),
    };

    try {
      await axios.post("http://127.0.0.1:5000/orders/", orderData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setProcessingOrder(false);
      setOrderPlaced(true);
      setCart([]);
    } catch (error) {
      setProcessingOrder(false);
      console.error("Checkout failed:", error);
    }
  };

  const filteredMenu = selectedCategory
    ? groupedMenu[selectedCategory] || []
    : menu;

  return (
    <div className="min-h-screen flex flex-col items-center text-gray-800 p-6 bg-gray-100">
      {/* Animated Heading */}
      <motion.h1
        className="text-4xl font-extrabold text-center mb-6"
        key={questionIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        style={{
          background: "linear-gradient(90deg, #ff7eb3, #ff758c, #ffae42)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {questions[questionIndex]}
      </motion.h1>

      {/* Category Tabs */}
      <Tabs.Root defaultValue="all" onValueChange={setSelectedCategory}>
        <Tabs.List className="flex space-x-6 mb-8">
          <div className="flex justify-center gap-6 mb-12 flex-wrap">
            {Object.keys(groupedMenu).map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-base font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-teal-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-teal-100"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </Tabs.List>
      </Tabs.Root>

      {/* Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Food Menu Section */}
        <div className="col-span-2">
          <ScrollArea className="max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredMenu.map((item) => (
                <motion.div
                  key={item.id}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="shadow-lg bg-white rounded-lg p-4 flex flex-col items-center text-black">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600 text-sm text-center">{item.description}</p>
                    <p className="text-lg font-bold text-gray-800 mt-2">₹{item.price.toFixed(2)}</p>
                    <Button
                      className="bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg px-4 py-2 mt-3"
                      onClick={() => addToCart(item)}
                    >
                      + Add to Cart
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cart Section */}
        <div className="sticky top-6 bg-white p-5 rounded-lg shadow-lg h-fit border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🛒 Your Cart</h2>

          {/* Checkout Animation */}
          {orderPlaced ? (
            <motion.div
              className="flex flex-col items-center text-center mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
              <p className="text-lg font-semibold text-gray-800">
                Order Placed Successfully! 🎉
              </p>
              <motion.div
                className="mt-4"
                initial={{ x: -50 }}
                animate={{ x: 50 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <Utensils className="text-teal-600 w-12 h-12" />
    
              </motion.div>
              <motion.a
                href="http://localhost:5173/tables"
                className="text-teal-600 font-bold underline mt-4 hover:text-teal-800"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Click here to book a table
              </motion.a>
            </motion.div>
          ) : cart.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <>
              <ul className="text-gray-800 space-y-2 mb-4">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-700 font-medium">{item.name}</span>
                    <span>x{item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      className="text-red-500 text-xs"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="text-lg font-bold text-gray-800 mb-4">
                Total: ₹
                {cart
                  .reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                  )
                  .toFixed(2)}
              </div>
              <Button
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg px-4 py-2 w-full"
                onClick={checkout}
                disabled={processingOrder}
              >
                {processingOrder ? "Processing..." : "Proceed to Checkout"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindFood;
