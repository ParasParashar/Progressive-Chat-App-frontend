import { IoVideocam } from "react-icons/io5";
import { Button } from "../ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useSocketContext } from "../providers/SocketProvider";
import { User } from "../../../types/type";

const VideoCallButton = () => {
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const { id: receiverId } = useParams();
  const { socket } = useSocketContext();
  const navigate = useNavigate();

  const roomId = [authUser?.id, receiverId]
    .sort((a, b) => (a! > b! ? 1 : -1))
    .join(":");

  console.log(roomId);

  const handleClick = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault;
      socket?.emit("room:join", {
        userId: authUser?.id as string,
        room: roomId,
      });
    },
    [socket, authUser?.id]
  );
  // clykh5xde00006ixdaatoboyc kartik
  // clyj07g4o00027a0vhtlah22s paras
  // 00000000022245677aaaabcccddeghhhijklllooosttvxxyyy kartik room
  // 0000000001122223466777aabccfghhjjlllmnoqrrstvwyyyz paras room
  const handleJoinRoom = useCallback(
    (data: any) => {
      navigate(`/room/${data.room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket?.on("room:join", handleJoinRoom);
    return () => {
      socket?.off("room:join", handleJoinRoom);
    };
  }, [socket]);

  return (
    <Button
      variant={"ghost"}
      onClick={handleClick}
      size={"icon"}
      className="text-blue-950 hover:text-blue-800 rounded-full"
    >
      <IoVideocam size={25} />
    </Button>
  );
};

export default VideoCallButton;
