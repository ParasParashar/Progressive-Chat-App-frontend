import { BiSend } from "react-icons/bi";
import { Button } from "../ui/button";
import { memo, useEffect, useState } from "react";
import { useCreateMessage } from "../../../hooks/useCreateGetMessage";
import Emoji from "./Emoji";
import { useSocketContext } from "../providers/SocketProvider";
import { useQuery } from "@tanstack/react-query";
import { User } from "../../../types/type";
import { useParams } from "react-router-dom";
import { Textarea } from "../ui/textarea";
import toast from "react-hot-toast";

const MessageInput = memo(() => {
  const { id } = useParams();
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const { socket } = useSocketContext();
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState("");
  const { mutate, isPending } = useCreateMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() == "") {
      toast.error("Message can't be empty");
      return;
    }
    mutate(message);
    setMessage("");
    socket?.emit("stopTyping", { senderId: authUser?.id, receiverId: id });
  };
  const handleEmojiClick = (emojiObject: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit("typing", { senderId: authUser?.id, receiverId: id });
    }
    if (e.target.value === "") {
      setIsTyping(false);
      socket?.emit("stopTyping", { senderId: authUser?.id, receiverId: id });
    }
  };

  const handleKeyDonw = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // debouncing socket event
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket?.emit("stopTyping", { senderId: authUser?.id, receiverId: id });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [message, isTyping]);
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full  gap-x-1 flex items-center justify-center 
        border-sky-50 px-3  pb-1 gap-1 rounded-full
        bg-gradient-to-l from-sky-50 to-indigo-200 
        "
    >
      <Emoji onEmojiClick={handleEmojiClick} />
      <Textarea
        placeholder="Type your message"
        onChange={handleChange}
        value={message}
        className="text-xl bg-transparent  h-10 resize-none main-scrollbar w-full ring-0 focus-visible:ring-0   outline-none px-3   rounded-sm border-none"
        autoFocus
        required
        rows={1}
        onKeyDown={handleKeyDonw}
      />
      <Button
        size={"icon"}
        disabled={isPending}
        variant={"ghost"}
        className="group"
      >
        <BiSend size={30} className="text-blue-500 group-hover:text-blue-400" />
      </Button>
    </form>
  );
});

export default MessageInput;
