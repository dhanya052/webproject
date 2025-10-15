import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers } from "../api/useApi";
import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";

const UserList = () => {
  const { data: users, error, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    console.log("Editing user:", user);
  };

  // Function to call delete user API
  const deleteUser = async (userId: string) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:5000/users/${userId}`);
      console.log("User deleted:", response.data);
      
      // Invalidate the users query to refetch the list after deletion
      // queryClient.invalidateQueries(["users"]);
    } catch (error) {
      console.error("Error deleting user:");
    }
  };

  const handleDelete = (userId: string) => {
    deleteUser(userId);
    setIsModalOpen(false);  // Close the modal after deletion
  };

  const openDeleteModal = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) return <p className="text-center text-blue-500">Loading users...</p>;
  if (error) return <p className="text-center text-red-500">Error loading users</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">User List</h2>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {users?.map((user: any) => (
          <motion.div
            key={user.id}
            className="bg-blue-100 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center space-y-4">
              <p className="text-2xl font-semibold text-gray-800">{user.name}</p>
              <p className="text-gray-600">{user.email}</p>
              <div className="space-x-3">
                <button
                  onClick={() => handleEdit(user)}
                  className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(user)}
                  className="px-4 py-2 bg-white text-red-600 rounded-md hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal for Delete Confirmation */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
            <h3 className="text-xl font-semibold text-gray-800">Confirm Deletion</h3>
            <p className="mt-4 text-gray-600">
              Are you sure you want to delete {selectedUser?.name}?
            </p>
            <div className="mt-6 space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedUser?.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
