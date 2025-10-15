import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, XCircle } from "lucide-react";
import { Button } from "@radix-ui/themes/components/button";

interface Order {
  digit_id: any;
  id: string;
  total_price: number;
  status: string;
  user_id: string;
  order_items: { name: string; quantity: number; price: number }[];
}

const UserOrders = ({ userId }: { userId: string | null }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrdersAndTables = async () => {
      try {
        const orderResponse = await axios.get("http://127.0.0.1:5000/orders");
        const tableResponse = await axios.get("http://127.0.0.1:5000/tables");

        const userOrders = orderResponse.data.filter((order: Order) => order.user_id === userId);
        setOrders(userOrders);
        setTables(tableResponse.data);
      } catch (error) {
        console.error("Failed to fetch orders or tables", error);
      }
    };
    fetchOrdersAndTables();
  }, [userId]);

  const generateReceiptHTML = (order: Order) => {
  const table = tables.find((table) => table.user_id === order.user_id);
  const tableNumber = table ? table.table_number : "N/A";

  return `
    <div class="max-w-2xl mx-auto p-6 bg-gradient-to-r from-teal-200 via-purple-200 to-pink-200 text-gray-800 rounded-lg shadow-lg">
      <div class="text-center mb-4">
        <h1 class="text-3xl font-semibold">BookMyBite</h1>
        <p class="text-lg">Delicious food at your fingertips!</p>
      </div>
      <h2 class="text-3xl font-semibold text-center mb-4">Receipt for Order #${order.digit_id}</h2>
      <p class="text-xl text-center mb-6">₹${order.total_price.toFixed(2)}</p>
      <p class="text-lg text-center mb-3">Table Number: ${tableNumber}</p>
      <h3 class="text-2xl font-semibold text-center mb-3">Items:</h3>
      <ul class="list-disc pl-6 space-y-2">
        ${order.order_items
          .map(
            (item) => `
          <li>
            ${item.name} - ${item.quantity} x ₹${item.price.toFixed(2)} = ₹${(item.quantity * item.price).toFixed(2)}
          </li>`
          )
          .join("")}
      </ul>
      <div class="mt-6">
        <p class="font-medium text-center ${order.status === "Pending" ? "text-yellow-400" : "text-green-500"}">
          Status: ${order.status}
        </p>
      </div>
      <div class="mt-6 text-center text-sm">
        <p>BookMyBite | Thank you for your order!</p>
      </div>
    </div>
  `;
};


  const printReceipt = () => {
    if (!selectedOrder) return;
    const receiptHTML = generateReceiptHTML(selectedOrder);

    const printWindow = window.open("", "_blank", "width=600,height=800");
    printWindow?.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .text-center { text-align: center; }
            .text-lg { font-size: 1.125rem; }
            .font-semibold { font-weight: 600; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .space-y-2 { margin-bottom: 0.5rem; }
            .mt-6 { margin-top: 1.5rem; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .bg-gradient-to-r { background: linear-gradient(to right, #a1c4fd, #c2e9fb); }
            .rounded-lg { border-radius: 0.5rem; }
            .shadow-lg { box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
            .list-disc { list-style-type: disc; }
            .pl-6 { padding-left: 1.5rem; }
          </style>
        </head>
        <body>
          ${receiptHTML}
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  const closeReceipt = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-teal-500 mb-6 animate__animated animate__fadeInUp">Your Orders</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          orders.map((order) => {
            const table = tables.find((table) => table.user_id === order.user_id);
            const tableNumber = table ? table.table_number : "N/A";

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-teal-100 via-purple-100 to-pink-100 text-gray-800 shadow-md rounded-lg p-6 hover:scale-105 transform transition-all duration-300"
              >
                <h3 className="font-semibold text-lg">{order.digit_id}</h3>
                <p className="text-gray-600">Total: ₹{order.total_price.toFixed(2)}</p>
                <p className={`text-sm font-medium ${order.status === "Pending" ? "text-yellow-400" : "text-green-500"}`}>
                  Status: {order.status}
                </p>
                <p className="text-sm text-gray-500">Table Number: {tableNumber}</p> {/* Table number display */}
                <div className="mt-4">
                  <h4 className="text-md font-semibold">Items:</h4>
                  <ul className="list-disc pl-5 text-gray-600">
                    {order.order_items.map((item, index) => (
                      <li key={index}>
                        {item.name} - {item.quantity} x ₹{item.price.toFixed(2)} = ₹{(item.quantity * item.price).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() => setSelectedOrder(order)}
                  className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md flex items-center hover:bg-teal-600 transition-all duration-300"
                >
                  <FileText className="mr-2" size={20} /> View Receipt
                </Button>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gradient-to-r from-teal-200 via-purple-200 to-pink-200 p-6 rounded-lg shadow-lg relative max-w-2xl w-full animate__animated animate__fadeInUp"
            >
              <button onClick={closeReceipt} className="absolute top-3 right-3 text-white hover:text-gray-300">
                <XCircle size={24} />
              </button>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Order Receipt</h3>
              <div className="h-96 overflow-auto border border-gray-300 p-2 text-gray-800">
                <h4 className="text-xl font-semibold mb-2">Order ID: {selectedOrder.digit_id}</h4>
                <p className="text-lg font-medium mb-4">Total: ₹{selectedOrder.total_price.toFixed(2)}</p>

                <h4 className="text-lg font-semibold mb-2">Items</h4>
                <ul className="list-disc pl-5 space-y-2">
                  {selectedOrder.order_items.map((item, index) => (
                    <li key={index}>
                      {item.name} - {item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <p className={`font-medium text-xl ${selectedOrder.status === "Pending" ? "text-yellow-400" : "text-green-500"}`}>
                    Status: {selectedOrder.status}
                  </p>
                </div>
              </div>

              <Button
                onClick={printReceipt}
                className="mt-6 px-4 py-2 bg-teal-500 text-white rounded-md flex items-center hover:bg-teal-600 transition-all duration-300"
              >
                Print Receipt
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserOrders;
