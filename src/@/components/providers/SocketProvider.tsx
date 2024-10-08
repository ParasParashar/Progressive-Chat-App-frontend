import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { User } from "../../../types/type";
import { useVideoCall } from "../../../hooks/useSidebarHook";

interface socketInterface {
  socket: Socket | null;
  onlineUsers: string[];
}

const SOCKET_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000"
    : import.meta.env.VITE_BACKEND_URL;

const SocketContext = createContext<socketInterface | undefined>(undefined);

export const SocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: authUser, isLoading } = useQuery<User>({
    queryKey: ["authUser"],
  });
  const { onOpen, onvideoData } = useVideoCall();
  const socketRef = useRef<Socket | null>(null);

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  useEffect(() => {
    if (!isLoading && authUser) {
      const socket = io(SOCKET_URL, {
        query: {
          userId: authUser?.id,
        },
      });
      socketRef.current = socket;
      //   handinling online user event
      socket.on("getOnlineUsers", (users: string[]) => {
        setOnlineUsers(users);
      });

      // handle video call accpet or reject
      socket.on("create:user:call", (data) => {
        onvideoData ? onvideoData(data) : undefined;
        onOpen();
      });
      //   cleanup socket up function
      return () => {
        socket.close();
        socketRef.current = null;
        socket.off("create:user:call");
      };
    } else if (!authUser && !isLoading) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    }
  }, [authUser, isLoading]);

  return (
    <SocketContext.Provider
      value={{ onlineUsers: onlineUsers, socket: socketRef.current }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) throw new Error("Socket error");
  return context;
};
