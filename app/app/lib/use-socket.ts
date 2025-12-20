import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Get JWT token from cookies
    const getToken = () => {
      const cookies = document.cookie.split('; ');
      const jwtCookie = cookies.find((row) => row.startsWith('jwt='));
      return jwtCookie ? jwtCookie.split('=')[1] : null;
    };

    const token = getToken();
    if (!token) {
      console.log('No JWT token found, skipping socket connection');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

    console.log('Connecting to socket.io server at', apiUrl);
    const newSocket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket.io server');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from socket.io server:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('user-present', (data) => {
      console.log('Socket received user-present:', data);
    });

    newSocket.on('user-left', (data) => {
      console.log('Socket received user-left:', data);
    });

    newSocket.on('presence-update', (data) => {
      console.log('Socket received presence-update:', data);
    });

    setSocket(newSocket);

    return () => {
      console.log('Disconnecting socket');
      newSocket.disconnect();
    };
  }, []);

  return socket;
};
