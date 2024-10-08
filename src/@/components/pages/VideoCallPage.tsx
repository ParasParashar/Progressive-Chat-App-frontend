import { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";
import { useSocketContext } from "../providers/SocketProvider";
import peer from "../../../utils/webrtcservice";
import { IoCall } from "react-icons/io5";
import { ImPhoneHangUp } from "react-icons/im";
import { Button } from "../ui/button";
import { useVideoCall } from "../../../hooks/useSidebarHook";
import toast from "react-hot-toast";

const VideoCallPage = () => {
  const navigate = useNavigate();
  const { id: roomId } = useParams();
  const { socket } = useSocketContext();
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStarted, setCallStarted] = useState<boolean>(false);
  const { onvideoData } = useVideoCall();

  const handleUserJoined = useCallback(({ userId, socketId }: any) => {
    setRemoteSocketId(socketId);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    for (const track of stream.getTracks()) {
      peer.peer.addTrack(track, stream);
    }
    const offer = await peer.getOffer();
    socket?.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({
      from,
      offer,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      for (const track of stream.getTracks()) {
        peer.peer.addTrack(track, stream);
      }
      const ans = await peer.getAnswer(offer);
      socket?.emit("call:accepted", { to: from, ans });
      setCallStarted(true);
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    async ({
      from,
      ans,
    }: {
      from?: string;
      ans: RTCSessionDescriptionInit;
    }) => {
      await peer.setLocalDescription(ans);
      setCallStarted(true);
    },
    []
  );
  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket?.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }: any) => {
      const ans = await peer.getAnswer(offer);
      socket?.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }: any) => {
    await peer.setLocalDescription(ans);
  }, []);

  const handleEndCall = useCallback(async () => {
    console.log("work call dis");
    socket?.emit("call:disconnected", { to: remoteSocketId, room: roomId });

    if (myStream) {
      const tracks = myStream.getTracks();
      for (const track of tracks) {
        track.enabled = false; // Disable the track first
      }
      setMyStream(null);
    }

    peer.peer.close();
    setRemoteStream(null);
    setRemoteSocketId(null);
    navigate("/");
    toast.success("Call  disconnected");
    onvideoData ? onvideoData(undefined) : null;
    // location reload to reload the video so camera and audio close permanently
    location.reload();
  }, [myStream, remoteSocketId, socket, navigate]);

  const handleCallRejected = useCallback(
    async ({ room }: any) => {
      if (room === roomId) {
        console.log("same room call rejected");

        if (myStream) {
          const tracks = myStream.getTracks();
          for (const track of tracks) {
            track.enabled = false; // Disable the track first
          }
          setMyStream(null);
        }

        peer.peer.close();
        setRemoteStream(null);
        setRemoteSocketId(null);
        toast.success("Call rejected");
        navigate("/");
        onvideoData ? onvideoData(undefined) : null;
        // location reload to reload the video so camera and audio close permanently
        location.reload();
      }
    },
    [navigate, myStream, roomId]
  );

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);
    socket?.on("incomming:call", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:nego:needed", handleNegoNeedIncoming);
    socket?.on("peer:nego:final", handleNegoNeedFinal);
    socket?.on("call:disconnected", handleEndCall);
    socket?.on("call:rejected", handleCallRejected);
    return () => {
      socket?.off("user:joined", handleUserJoined);
      socket?.off("incomming:call", handleIncomingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:nego:needed", handleNegoNeedIncoming);
      socket?.off("peer:nego:final", handleNegoNeedFinal);
      socket?.off("call:disconnected", handleEndCall);
      socket?.off("call:rejected", handleCallRejected);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
    handleEndCall,
  ]);

  useEffect(() => {
    handleCallUser();
  }, [remoteSocketId, socket]);

  return (
    <main className="flex flex-col bg-neutral-900 w-full h-screen gap-1 text-gray-50 overflow-hidden relative">
      <h4 className="text-lg text-white text-center font-light">
        {remoteSocketId
          ? `Connected ${callStarted && "to the call"}`
          : "No one in room"}
      </h4>
      <section className="bottom-0 left-0 absolute">
        <ReactPlayer
          playing
          height="40%"
          width="40%"
          url={myStream}
          className="rounded-full object-cover"
        />
      </section>
      <div className="w-full flex items-center justify-center gap-x-3 fixed bottom-3 z-50">
        {remoteSocketId && (
          <Button
            variant="ghost"
            size={"icon"}
            onClick={handleCallUser}
            className=" rounded-full size-10 p-2 md:p-0 md:size-20 lg:size-[120px] backdrop-blur-2xl hover:bg-indigo-50/20 border border-muted-foreground "
          >
            <IoCall size={60} color="red" />
          </Button>
        )}

        <Button
          variant="ghost"
          size={"icon"}
          onClick={handleEndCall}
          className=" rounded-full size-10 p-2 md:p-0 md:size-20 lg:size-[120px] backdrop-blur-xl hover:bg-indigo-50/20 border border-red-500"
        >
          <ImPhoneHangUp size={35} color="red" />
        </Button>
      </div>
      {remoteStream ? (
        <section className="w-full h-full flex-col gap-2 flex items-center justify-center object-fill">
          <h1 className="text-center font-light">Other user's Stream</h1>
          <ReactPlayer
            playing
            height="100%"
            width="100%"
            url={remoteStream}
            className="object-fill"
          />
        </section>
      ) : (
        remoteSocketId && (
          <section className="w-full h-full flex-col gap-2 flex items-center justify-center object-fill">
            <h1 className="text-center font-light">User turned off video</h1>
          </section>
        )
      )}
    </main>
  );
};

export default VideoCallPage;
