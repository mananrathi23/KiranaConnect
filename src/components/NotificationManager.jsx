import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

let socket;

export default function NotificationManager() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    // Initialize socket connection
    socket = io('http://localhost:5001', {
      withCredentials: true,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      // Register this socket to the user
      socket.emit('register', user._id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // --- Listen for specific events ---

    socket.on('new_order', (data) => {
      toast.info(data.message, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    socket.on('order_status_update', (data) => {
      if (data.status === 'CANCELLED') {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
    });

    socket.on('batch_dispatched', (data) => {
      toast.success(data.message, {
        icon: '🚚',
      });
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [user]);

  // This component doesn't render any visible UI on its own
  return null;
}
