import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Tạo socket connection
    const newSocket = io("http://localhost:3000", {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    setSocket(newSocket);

    // Cleanup khi unmount
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

// Hook để sử dụng socket
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
