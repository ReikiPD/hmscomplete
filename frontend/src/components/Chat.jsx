import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Chat = ({ doctorId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { backendUrl, token, userData } = useContext(AppContext);

  if (!userData) {
    return <div>Loading...</div>;
  }

  const userId = userData._id;

  // Fetch messages when the component loads
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/user/get-messages`,
          { userId, doctorId }, // Kirim userId dan doctorId
          {
            headers: { token },
          }
        );

        if (data.success) {
          setMessages(data.messages);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching messages:", error.message);
        toast.error(error.message);
      }
    };

    fetchMessages();
  }, [userId, doctorId, backendUrl, token]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/send-message`,
        {
          senderId: userId,
          receiverId: doctorId,
          message: newMessage,
        },
        {
          headers: { token },
        }
      );

      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.chat]);
        setNewMessage("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen w-96 border border-gray-300 rounded overflow-hidden">
      <div className="bg-primary text-white py-2 px-4 text-center font-bold">
        Chat with Doctor
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 p-3 rounded max-w-2/3 ${
              msg.senderId === userId
                ? "bg-primary text-white self-end"
                : "bg-gray-200 text-black self-start"
            }`}
          >
            <p>{msg.message}</p>
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
    </div>
  );
};

export default Chat;
