import "@radix-ui/themes/styles.css";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationMenuDemo from "./navbar/Navbar";
import HeroSection from "./hero/herosection";
import UserList from "./components/useList";
import FindFood from "./components/food/FindFood";
import OrderList from "./components/food/Oderlist";
import UserOrders from "./components/food/UserOrders";
import TableView from "./components/tables/tableview";
import BookingsView from "./components/bookings/Bookings";
import React from "react";
import Menu from "./hero/menu";
import CreateMenuItemForm from "./components/food/createFood";

export default function App() {

  const getUserFromStorage = () => {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };
  const [user, setUser] = React.useState(getUserFromStorage());  

  return (
    <Router>
      <NavigationMenuDemo />

      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/manage-users" element={<UserList />} />
        <Route path="/find-food" element={<FindFood />} />
        <Route path="/pending_orders" element={<OrderList />} />
        <Route path="/old" element={<UserOrders userId={user?.user_id} />} />
        <Route path="/tables" element={<TableView />} />
        <Route path="/bookings" element={<BookingsView />} />
        <Route path="/menus" element={<Menu/>} />
        <Route path="/create" element={<CreateMenuItemForm/>}/>
      </Routes>
    </Router>
  );
}
