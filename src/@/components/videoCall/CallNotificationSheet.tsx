import { MdAddIcCall, MdCallEnd } from "react-icons/md";
import { useVideoCall } from "../../../hooks/useSidebarHook";
import UserAvatar from "../shared/UserAvatart";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { useNavigate } from "react-router-dom";
import { useSocketContext } from "../providers/SocketProvider";
import { useCallback, useEffect } from "react";

const CallNotificationSheet = () => {
  const { isOpen, videoData, onClose, onvideoData } = useVideoCall();
  const { socket } = useSocketContext();
  const navigate = useNavigate();

  const handleAccept = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate(`/room/${videoData?.room}`);
    socket?.emit("room:join", {
      userId: videoData?.receiverId,
      room: videoData?.room,
    });
    onClose();
  };
  const handleReject = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClose();
    onvideoData ? onvideoData(undefined) : null;
    socket?.emit("call:rejected", {
      userId: videoData?.receiverId,
      room: videoData?.room,
      receiverId: videoData?.receiverId,
    });
  };

  // close the notification sheet when user cut the call
  const handleEndCall = useCallback(() => {
    onClose();
    if (onvideoData) {
      onvideoData(undefined);
    }
  }, [onClose, onvideoData]);

  useEffect(() => {
    socket?.on("call:disconnected", handleEndCall);
    return () => {
      socket?.off("call:disconnected", handleEndCall);
    };
  }, [socket, handleEndCall]);

  return (
    <Sheet open={isOpen}>
      <SheetContent side={"top"} className="px-4 py-2">
        <SheetHeader>
          <SheetTitle className="flex  items-center gap-2 text text-muted-foreground ">
            <UserAvatar name={videoData?.fullname} type="group" />
            <span className="text-black">
              {videoData?.fullname.toLocaleUpperCase()}
            </span>{" "}
            is video calling you
          </SheetTitle>
          <SheetDescription className="flex items-center justify-between ">
            <Button
              onClick={handleAccept}
              size={"lg"}
              variant={"ghost"}
              className="bg-sky-100 "
            >
              <MdAddIcCall size={30} color="blue" />
            </Button>
            <span className="text-lg">Accept or reject</span>
            <Button onClick={handleReject} variant={"destructive"} size={"lg"}>
              <MdCallEnd size={30} />
            </Button>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default CallNotificationSheet;
