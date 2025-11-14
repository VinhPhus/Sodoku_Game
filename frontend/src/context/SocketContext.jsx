import React, { createContext, useContext, useEffect, useState, useRef } from "react";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const listenersRef = useRef({});

  useEffect(() => {
    let userId = null;

    const connect = (userIdParam) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return; // Đã kết nối rồi
      }

      // ===== SỬA DÒNG NÀY =====
      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/game/${userIdParam || 'guest_' + Date.now()}`;
      // ========================

      console.log("Connecting to:", wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        wsRef.current = ws;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received:", data);

          // Gọi listeners tương ứng với event
          const eventType = data.event;
          if (eventType && listenersRef.current[eventType]) {
            listenersRef.current[eventType].forEach(callback => callback(data));
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        wsRef.current = null;

        // Tự động reconnect sau 3 giây
        reconnectTimeoutRef.current = setTimeout(() => {
          if (userId) {
            connect(userId);
          }
        }, 3000);
      };

      return ws;
    };

    // Socket wrapper object
    const socketWrapper = {
      // Phương thức emit để gửi message
      emit: (event, data) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const message = { event, ...data };
          console.log("Sending:", message);
          wsRef.current.send(JSON.stringify(message));
        } else {
          console.warn("WebSocket not connected. Cannot emit:", event);
        }
      },

      // Phương thức on để đăng ký listener
      on: (event, callback) => {
        if (!listenersRef.current[event]) {
          listenersRef.current[event] = [];
        }
        listenersRef.current[event].push(callback);
      },

      // Phương thức off để xóa listener
      off: (event, callback) => {
        if (listenersRef.current[event]) {
          if (callback) {
            listenersRef.current[event] = listenersRef.current[event].filter(cb => cb !== callback);
          } else {
            delete listenersRef.current[event];
          }
        }
      },

      // Phương thức connect với userId
      connect: (userIdParam, username) => {
        userId = userIdParam;
        const ws = connect(userIdParam);

        // Gửi message đầu tiên chứa username
        ws.addEventListener('open', () => {
          console.log("Sending initial username message:", username);
          ws.send(JSON.stringify({ username }));

          // Sau khi gửi username, yêu cầu danh sách người chơi
          setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              console.log("Requesting online players list");
              ws.send(JSON.stringify({ event: 'getOnlinePlayers' }));
            }
          }, 100);
        }, { once: true });
      },

      // Kiểm tra kết nối
      get connected() {
        return isConnected;
      },

      // Disconnect
      disconnect: () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        setIsConnected(false);
      }
    };

    setSocket(socketWrapper);

    // Cleanup khi unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook để sử dụng socket
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};