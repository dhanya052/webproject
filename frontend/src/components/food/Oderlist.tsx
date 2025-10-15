import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@radix-ui/themes/components/button';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_items: OrderItem[];
  status: string;
  total_price: number;
  user_id: string;
}

interface Table {
  user_id: string;
  table_number: string;
}

const getUserFromStorage = () => {
  const userData = sessionStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
}

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
    const [user, setUser] = useState(getUserFromStorage());
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [sentOrders, setSentOrders] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showBus, setShowBus] = useState(false);

  useEffect(() => {
    const fetchOrdersAndTables = async () => {
      try {
        const orderResponse = await axios.get('http://127.0.0.1:5000/orders');
        const tableResponse = await axios.get('http://127.0.0.1:5000/tables');
        
        const pendingOrders = orderResponse.data.filter((order: Order) => order.status === "Pending");
        setOrders(pendingOrders);
        setTables(tableResponse.data);
      } catch (error) {
        console.error('Failed to fetch orders or tables');
      }
    };
    fetchOrdersAndTables();
  }, []);

  const handleSendOrder = async (orderId: string) => {
    setLoading(orderId);
    try {
      const response = await axios.post(`http://127.0.0.1:5000/orders/${orderId}/send`);
      if (response.status === 200) {
        setSentOrders((prev) => [...prev, orderId]);
        setSuccessMessage(`Order ${orderId} sent successfully!`);
        
        // Show Bus Icon after Success Message
        setTimeout(() => setShowBus(true), 500);

        // Hide success message & bus after 3 sec
        setTimeout(() => {
          setSuccessMessage(null);
          setShowBus(false);
        }, 3000);

        // Remove order smoothly
        setTimeout(() => {
          setOrders((prevOrders) => prevOrders.filter(order => order.id !== orderId));
        }, 500);
      }
    } catch (error) {
      console.error('Failed to send order');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gradient-to-r from-blue-100 to-white">
      <h2 className="text-4xl font-extrabold text-center text-gray-800">Pending Orders</h2>

      {/* Animated Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex items-center justify-center bg-green-200 text-gray-800 py-3 px-6 rounded-lg mb-4 shadow-md ring-2 ring-green-500"
          >
            <CheckCircle className="mr-3" size={28} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bus Animation */}
      <AnimatePresence>
        {showBus && (
          <motion.div
            initial={{ x: "-100vw" }}
            animate={{ x: 0 }}
            exit={{ x: "100vw", opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="flex justify-center items-center mt-6 text-xl font-semibold text-teal-600"
          >
            🚌 Order is on the way!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid for Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <p className="text-gray-600 text-lg text-center col-span-3">No pending orders.</p>
        ) : (
          orders.map((order) => {
            // Find the table number associated with the order as we;ll as user
            // const table = tables.find((table) => table.user_id === order.user_id && table.user_id === user.id);
            let tableNumber =0
            const randomTableNumbers = [];
for (let i = 0; i < 5; i++) {  // Loop 5 times to generate 5 random table numbers
     tableNumber = Math.floor(Math.random() * 10) + 1;  // Random number between 1 and 10
    randomTableNumbers.push(tableNumber);
}

console.log(randomTableNumbers);  // Outputs the array of random table numbers


            return (
              <AnimatePresence key={order.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="bg-white shadow-md rounded-lg p-4 border border-gray-300 hover:shadow-lg transition-transform"
                >
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Order ID: {order.id}</h3>
                  <p className="text-sm text-gray-500 mb-4">Table Number: {tableNumber}</p>
                  <ul className="space-y-2">
                    {order.order_items.map((item, index) => (
                      <li key={index} className="flex justify-between text-sm text-gray-800">
                        <span>{item.name}</span>
                        <span>{item.quantity} x ${item.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between mt-4">
                    <span className="font-medium text-lg text-gray-700">Total: ${order.total_price.toFixed(2)}</span>
                    <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
                      <Button
                        onClick={() => handleSendOrder(order.id)}
                        disabled={loading === order.id || sentOrders.includes(order.id)}
                        className="px-4 py-2 bg-indigo-400 text-white rounded-lg flex items-center shadow-md transition-transform duration-200 hover:scale-105"
                      >
                        {loading === order.id ? (
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="mr-2"
                          >
                            🔄
                          </motion.span>
                        ) : (
                          <Truck className="mr-2" size={20} />
                        )}
                        Send Order
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderList;
