import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface Table {
  table_number: number;
  booking_id: string | null;
  status: string;
  id: string;
}

interface Booking {
  id: string;
  date: string;
  time: string;
  status: string;
  user_id: string;
  tables: Table[];
}

const getUserFromStorage = () => {
  const userData = sessionStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

const BookingsView: React.FC = () => {
  const [user, setUser] = React.useState(getUserFromStorage());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [assignedTable, setAssignedTable] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    fetchBookings();
    fetchTables();
  }, [user]);

  const fetchBookings = async () => {
    let url = "http://127.0.0.1:5000/bookings";
    
    // If user is not admin, fetch only their bookings using their user_id
    if (user && user.role !== "admin") {
        console.log(user)
      url = `http://127.0.0.1:5000/bookings/user/${user.user_id}`;
    }
  
    try {
      const response = await axios.get(url);
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };
  

  const fetchTables = async () => {
    const response = await axios.get("http://127.0.0.1:5000/tables");
    setTables(response.data);
  };

  const assignTable = async (bookingId: string, tableNumber: number) => {
    await axios.post(`http://127.0.0.1:5000/bookings/${bookingId}/assign-table`, {
      table_number: tableNumber,
    });
    setAssignedTable(tableNumber); // Set the assigned table
    fetchBookings(); // Refresh the bookings list
    setIsModalVisible(false); // Close the modal after assigning
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-12">
      <h1 className="text-4xl font-bold text-center text-white mb-12">
        Manage Bookings
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            className={`bg-white text-black shadow-lg rounded-lg p-6 flex flex-col space-y-4 hover:scale-105 transition-all duration-300 ${
              booking.status === "Confirmed"
                ? "bg-green-100"
                : "bg-yellow-100"
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="text-lg font-semibold">Date: {booking.date}</div>
            <div className="text-lg">Time: {booking.time}</div>
            <div
              className={`text-lg font-medium ${
                booking.status === "Confirmed" ? "text-green-600" : "text-yellow-600"
              }`}
            >
             { booking.status}
            </div>

            {booking.status === "Pending" && !booking.tables.length &&  user && user.role === "admin" &&(
              <motion.button
                onClick={() => {
                  setSelectedBookingId(booking.id);
                  setIsModalVisible(true); // Open the modal when assigning a table
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg mt-4"
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Assign Table
              </motion.button>
            )}

            {booking.tables.length > 0 && (
              <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
                <div className="text-md font-semibold mb-2">Assigned Tables:</div>
                <ul className="space-y-3">
                  {booking.tables.map((table) => (
                    <li
                      key={table.id}
                      className={`text-sm py-2 px-4 rounded-lg transition-all duration-300 ${
                        table.status === "Confirmed"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : table.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Table {table.table_number}</span>
                        {/* <span>({table.status})</span> */}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Modal for Assigning Table */}
      <AnimatePresence>
        {isModalVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl p-8 shadow-lg w-96 max-h-96 overflow-y-auto z-60"
            >
              <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">
                Assign Table
              </h2>
              <div className="mb-6 text-lg text-gray-600">Select a table to assign:</div>

              <div className="flex flex-wrap gap-4 justify-center mb-6 overflow-x-auto">
                {tables.map((table) => (
                  <motion.button
                    key={table.id}
                    onClick={() => setSelectedTable(table.table_number)}
                    disabled={assignedTable === table.table_number}
                    className={`${
                      table.status === "Confirmed"
                        ? "bg-red-600 cursor-not-allowed"
                        : selectedTable === table.table_number
                        ? "bg-green-500"
                        : "bg-gray-300 hover:bg-blue-500"
                    } text-white font-semibold py-2 px-4 rounded-lg`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    Table {table.table_number}
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={() => setIsModalVisible(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={async () => {
                    if (selectedTable !== null) {
                      await assignTable(selectedBookingId!, selectedTable);
                      setSelectedTable(null);
                    }
                  }}
                  disabled={selectedTable === null}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Assign Table
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingsView;
