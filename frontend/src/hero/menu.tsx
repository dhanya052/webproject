import React, { useState } from "react";
import { motion } from "framer-motion";

// Define the menu data types
interface MenuItem {
  name: string;
  description: string;
  price: string;
  image: string;
}

interface MenuData {
  Starters: MenuItem[];
  MainCourse: MenuItem[];
  Desserts: MenuItem[];
}

// Define the menu data
const menuData: MenuData = {
  Starters: [
    {
      name: "Spring Rolls",
      description: "Crispy vegetable rolls served with tangy sauce.",
      price: "₹5.99",
      image: "https://media.istockphoto.com/id/1070157508/photo/deep-fried-spring-rolls.jpg?s=2048x2048&w=is&k=20&c=9d4bXJIVjN6IZUhQ2AKeWxdTlAORh0WBeyK2jCt_ttw=",
    },
    {
      name: "Paneer Tikka",
      description: "Grilled cottage cheese cubes marinated with spices.",
      price: "₹7.99",
      image: "https://media.istockphoto.com/id/1186759790/photo/paneer-tikka-at-skewers-in-black-bowl-at-dark-slate-background-paneer-tikka-is-an-indian.jpg?s=612x612&w=0&k=20&c=cITToqM1KEnrixXjoLhEciqP24SxdKtW3QXykq-W5OE=",
    },
    {
      name: "Stuffed Mushrooms",
      description: "Juicy mushrooms filled with cheese and herbs.",
      price: "₹6.49",
      image: "https://media.istockphoto.com/id/617387012/photo/stuffed-mushrooms.jpg?s=612x612&w=0&k=20&c=Cll-0KVTO4cXOLH_3TNacHbmyt8uPaicecMQ-AWWOJw=",
    },
  ],
  MainCourse: [
    {
      name: "Veg Biryani",
      description: "Aromatic basmati rice cooked with fresh vegetables.",
      price: "₹10.99",
      image: "https://media.istockphoto.com/id/1539949431/photo/top-view-of-veg-biryani-with-paneer-and-cashew-in-it.jpg?s=1024x1024&w=is&k=20&c=PGbUCY0Ty-XsKoXbq0w6RGm5SdiieixNiABzdQmGo_s=",
    },
    {
      name: "Paneer Butter Masala",
      description: "Soft paneer cubes in rich buttery tomato gravy.",
      price: "₹11.99",
      image: "https://media.istockphoto.com/id/1305516603/photo/shahi-paneer-or-paneer-kadai.jpg?s=612x612&w=0&k=20&c=V5xD4I1ciIjtyoH0FzuNeFnAl7oV9RJAoNs52X6pgE4=",
    },
    {
      name: "Dal Makhani",
      description: "Slow-cooked black lentils in creamy sauce.",
      price: "₹9.49",
      image: "https://media.istockphoto.com/id/1170374665/photo/dal-makhani-at-dark-background.jpg?s=612x612&w=0&k=20&c=M1mrKkJ1SVdWTrn6p6-BHQ-1dPpY6G_D8jF0Fog60Fc="},
  ],
  Desserts: [
    {
      name: "Gulab Jamun",
      description: "Soft and juicy sweet dumplings soaked in syrup.",
      price: "$4.99",
      image: "https://media.istockphoto.com/id/1217449542/photo/indian-traditional-sweet-gulab-jamun-on-black-table.jpg?s=612x612&w=0&k=20&c=wLlLTqpfQjWti7GcivDdu8gEaIzNDw7UIDy8YWQy3cY=",
    },
    {
      name: "Rasmalai",
      description: "Spongy cheese balls immersed in creamy milk.",
      price: "$5.99",
      image: "https://media.istockphoto.com/id/697442766/photo/angoori-rasmalai-or-anguri-ras-malai-is-an-indian-dessert-made-from-cottage-cheese-which-is.jpg?s=612x612&w=0&k=20&c=btdHxdz7BAuSBq2g4-_ZBOyYZzcQwXWNXfbWwB_s5OE=",
    },
    {
      name: "Kesar Pista Kulfi",
      description: "Saffron and pistachio flavored traditional ice cream.",
      price: "$4.49",
      image: "https://media.istockphoto.com/id/657076158/photo/rajwari-or-rajwadi-sweet-kesar-badam-pista-kulfi-or-ice-cream-candy.jpg?s=612x612&w=0&k=20&c=p0eXjjHOxAawVv32t9a5WOWBEGT-XNMXxbiwtWg1Qs4=",
    },
  ],
};

const Menu = () => {
  // Type the activeCategory state as one of the keys of menuData
  const [activeCategory, setActiveCategory] = useState<keyof MenuData>("Starters");

  const handleCategoryChange = (category: keyof MenuData) => {
    setActiveCategory(category);
  };

  return (
    <section className="min-h-screen bg-gradient-to-r from-teal-100 to-yellow-50 py-12 px-6 font-poppins">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          🍃 Welcome to Book My Bite
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <p className="text-center text-gray-500 text-lg mb-10">
          Discover hand-crafted vegetarian delights made fresh, just for you!
        </p>
      </motion.div>

      <div className="flex justify-center gap-6 mb-12 flex-wrap">
        {Object.keys(menuData).map((category) => (
          <motion.button
            key={category}
            onClick={() => handleCategoryChange(category as keyof MenuData)}
            className={`px-5 py-2 rounded-full text-base font-medium transition-all duration-300 ${
              activeCategory === category
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

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10"
        key={activeCategory}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {menuData[activeCategory].map((item, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg p-5 shadow-md hover:shadow-xl transition-transform transform hover:scale-105"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {item.name}
            </h2>
            <p className="text-sm text-gray-500 mb-4">{item.description}</p>
            <p className="text-lg font-bold text-teal-600">{item.price}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Menu;
