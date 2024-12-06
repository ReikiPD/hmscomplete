import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext.jsx";
import { toast } from "react-toastify"; // For error notifications

const DoctorChat = () => {
  const [messages, setMessages] = useState([]); // Messages for the selected patient
  const [newMessage, setNewMessage] = useState(""); // New message input field
  const [selectedPatientId, setSelectedPatientId] = useState(null); // Selected patient for chat
  const [unreadMessages, setUnreadMessages] = useState({}); // Store unread message status for each patient
  const { backendUrl, dToken, users, profileData } = useContext(DoctorContext); // Access dToken and users from DoctorContext

  const doctorId = profileData._id;

  // Fetch messages for the selected patient
  useEffect(() => {
    if (!selectedPatientId) return; // Only fetch messages if a patient is selected

    const fetchMessages = async () => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/doctor/getMessage`,
          { userId: selectedPatientId }, // Fetch messages for the selected patient
          {
            headers: { dToken },
          }
        );

        if (data.success) {
          setMessages(data.messages); // Set messages for the selected patient

          // Check if there are unread messages and update the unreadMessages state
          const unreadCount = data.messages.filter(msg => !msg.isRead).length;
          setUnreadMessages(prev => ({
            ...prev,
            [selectedPatientId]: unreadCount, // Set unread message count for this patient
          }));
        } else {
          toast.error(data.message); // Display error message if unsuccessful
        }
      } catch (error) {
        console.error("Error fetching messages:", error.message);
        toast.error(error.message); // Display error message if the request fails
      }
    };

    fetchMessages();
  }, [selectedPatientId, backendUrl, dToken]); // Fetch messages when the selected patient changes

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return; // Don't send empty messages

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/sendMessage`,
        {
          senderId: doctorId, // Doctor sending the message
          receiverId: selectedPatientId, // Patient receiving the message
          message: newMessage,
        },
        {
          headers: { dToken }, // Use dToken for authentication
        }
      );

      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.chat]); // Add new message to the list
        setNewMessage(""); // Clear the input field

        // Increment unread messages for the selected patient
        setUnreadMessages((prev) => ({
          ...prev,
          [selectedPatientId]: (prev[selectedPatientId] || 0) + 1, // Increment unread count
        }));
      } else {
        toast.error(data.message); // Display error message if unsuccessful
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
      toast.error(error.message); // Display error message if the request fails
    }
  };

  // Handle selecting a patient from the list
  const handlePatientSelect = (patientId) => {
    setSelectedPatientId(patientId); // Set the selected patient's ID

    // Reset unread count for the selected patient when the chat is opened
    setUnreadMessages(prev => ({
      ...prev,
      [patientId]: 0, // Reset unread message count for this patient
    }));
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 w-1/4 border-r">
        <div className="bg-primary text-white py-2 px-4 text-center font-bold">
          Patients List
        </div>
        <div className="p-4">
          {users.length === 0 ? (
            <p>No patients available</p>
          ) : (
            <ul>
              {users.map((user) => {
                // Get unread message count for each patient
                const unreadCount = unreadMessages[user._id] || 0;
                return (
                  <li
                    key={user._id}
                    className="cursor-pointer mb-2"
                    onClick={() => handlePatientSelect(user._id)} // Set the selected patient
                  >
                    <div className="flex items-center">
                      <span
                        className={`${
                          unreadCount > 0 ? "font-bold text-red-500" : "font-normal"
                        }`}
                      >
                        {user.name}
                      </span>
                      {unreadCount > 0 && (
                        <span className="ml-2 text-xs text-red-500">
                          
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="bg-primary text-white py-2 px-4 text-center font-bold">
          {selectedPatientId ? "Chat with Patient" : "Select a patient to start chatting"}
        </div>

        {selectedPatientId && (
          <>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 p-3 rounded max-w-2/3 ${
                    msg.senderId === doctorId
                      ? "bg-primary text-white self-end"
                      : "bg-gray-200 text-black self-start"
                  }`}
                >
                  <p>{msg.message}</p>
                  <span className="block text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex p-4 border-t border-gray-300">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded mr-2"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-primary text-white rounded"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorChat;