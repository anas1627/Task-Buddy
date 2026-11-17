import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastActivity, setLastActivity] = useState(null);

  useEffect(() => {
    // Socket.io connection pointing to proxy or host
    const socketInstance = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected:', socketInstance.id);
      setIsConnected(true);

      if (user?.id) {
        socketInstance.emit('join_user_room', user.id);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('⚡ Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection error (fallback mode active):', err.message);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // When user changes, update room membership
  useEffect(() => {
    if (socket && socket.connected && user?.id) {
      socket.emit('join_user_room', user.id);
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, lastActivity, setLastActivity }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
