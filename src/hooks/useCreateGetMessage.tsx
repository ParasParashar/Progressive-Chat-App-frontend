import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { MessageType, SidebarData, User, UserMessageType } from "../types/type";
import { useEffect } from "react";
import { useSocketContext } from "../@/components/providers/SocketProvider";
import AxiosBase from "../utils/axios";

export const useCreateMessage = () => {
  const { id } = useParams();
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (message: string) => {
      const res = await AxiosBase.post(`/api/messages/send/${id}`, { message });
      if (!res.data) throw new Error("Error in sending message");
      return res.data;
    },
  });

  const handleNewMessage = (data: MessageType) => {
    if (data.senderId === authUser?.id || data.senderId === id) {
      queryClient.setQueryData(
        ["getMessage", id],
        (oldConversations: UserMessageType[] | undefined) => {
          const messageDate = new Date(data.createdAt).toDateString();

          const updatedConversations = oldConversations?.map((conversation) => {
            if (conversation.date === messageDate) {
              return {
                ...conversation,
                messages: [...conversation.messages, data],
              };
            }
            return conversation;
          });

          if (
            !updatedConversations?.some((conv) => conv.date === messageDate)
          ) {
            updatedConversations?.push({
              date: messageDate,
              messages: [data],
            });
          }

          return updatedConversations;
        }
      );
    }
  };

  useEffect(() => {
    if (id && socket) {
      socket.on("new-message", handleNewMessage);

      return () => {
        socket.off("new-message");
      };
    }
  }, [id, queryClient, mutate, socket]);

  return {
    mutate,
    isPending,
  };
};
