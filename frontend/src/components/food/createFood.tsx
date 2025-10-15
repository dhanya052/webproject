import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateMenuItemForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [menuItem, setMenuItem] = useState(null);
  const [buttonText, setButtonText] = useState('Create Item');

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    const newMenuItem = {
      name,
      description,
      price: parseFloat(price),
      image_url: imageUrl,
      category,
    };

    try {
      const response = await axios.post('http://127.0.0.1:5000/menu/', newMenuItem);
      if (response.status === 201) {
        toast.success('Menu item created successfully!');
        setMenuItem(response.data); // Store the added item
        setButtonText('Item Added!'); // Change button text
        setTimeout(() => setButtonText('Create Item'), 2000); // Reset button text
toast.success('Menu item created successfully!');
        // Clear form fields
        setName('');
        setDescription('');
        setPrice('');
        setImageUrl('');
        setCategory('');
      }
    } catch (error) {
      toast.error('Error creating menu item!');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-4 text-center">Create New Menu Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              id="price"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              id="image_url"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              id="category"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
          >
            {buttonText}
          </button>
        </form>



      </motion.div>

      {/* Toast container to display notifications */}
      <ToastContainer />
    </div>
  );
};

export default CreateMenuItemForm;
