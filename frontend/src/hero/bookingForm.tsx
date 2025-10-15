import * as React from "react";
import { Button } from "@radix-ui/themes";
import dayjs from "dayjs"; // Import dayjs
import { toast, ToastContainer } from "react-toastify"; // Import toast from react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import the styles for the toast
// import "./BookingForm.css"; // Import styles

const BookingForm = () => {
  const getUserFromStorage = () => {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  const [user, setUser] = React.useState<any | null>(null);
  const [selectedDate, setSelectedDate] = React.useState("2021-04-01"); // Initial date in 'YYYY-MM-DD' format
  const [selectedTime, setSelectedTime] = React.useState("06:30 PM");
  const [loading, setLoading] = React.useState(false); // Loading state for submit

  // Fetch user data on mount
  React.useEffect(() => {
    const userData = getUserFromStorage();
    setUser(userData);
  }, []);

  // Get today's date and calculate the max date (7 days from today)
  const today = dayjs().format("YYYY-MM-DD");
  const maxDate = dayjs().add(7, "day").format("YYYY-MM-DD");

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to book a table.");
      return;
    }

    const user_id = user?.user_id;
    const formattedDate = dayjs(selectedDate).format("DD-MM-YYYY"); // Format date to 'DD-MM-YYYY'

    const bookingData = {
      user_id: user_id,
      date: formattedDate,
      time: selectedTime,
    };

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("Failed to make the booking");
      }

      const data = await response.json();
      
      // Show a brief success toast
      toast.success("Booking Received!");

      // Display the longer detailed message on the screen
      setBookingMessage(
        `Your booking has been received! Your booking will be confirmed in a few minutes. Please check the 'Bookings' tab for the status.\nDate: ${formattedDate}\nTime: ${selectedTime}`
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("There was an error making the booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [bookingMessage, setBookingMessage] = React.useState(""); // State for the long booking message

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Book A Table</h2>

        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center gap-6">
          <div className="flex gap-6 items-center">
            {/* Date Picker */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                min={today} // Restrict date to today and later
                max={maxDate} // Restrict date to a week from today
              />
            </div>

            {/* Time Picker */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="button"
            className="bg-orange-400 text-white font-semibold px-6 py-2 rounded-full hover:bg-orange-500 transition"
            onClick={handleSubmit}
            disabled={loading} // Disable the button while loading
          >
            {loading ? "Booking..." : "Book a Table"}
          </Button>
        </div>

        {/* Displaying the long booking message */}
        {bookingMessage && (
          <div className="mt-6 p-4 rounded-lg bg-green-100 text-green-700 font-semibold text-center">
            {bookingMessage}
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
};

export default BookingForm;
