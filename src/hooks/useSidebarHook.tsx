import { create } from "zustand";

type videoCallDataType = {
  room: string;
  userId: string;
  fullname: string;
  receiverId: string;
};

type props = {
  isOpen: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onClose: () => void;
  onvideoData?: (videoCallDataType: videoCallDataType | undefined) => void;
  videoData?: videoCallDataType;
};

export const useGroupInfoHook = create<props>((set) => ({
  isOpen: false,
  onToggle: () => set((state) => ({ isOpen: !state.isOpen })),
  onClose: () => set(() => ({ isOpen: false })),
  onOpen: () => set(() => ({ isOpen: true })),
}));

export const useVideoCall = create<props>((set) => ({
  isOpen: false,
  onOpen: () => set(() => ({ isOpen: true })),
  onClose: () => set(() => ({ isOpen: false })),
  onToggle: () => set((state) => ({ isOpen: !state.isOpen })),
  onvideoData: (data: videoCallDataType | undefined) =>
    set(() => ({ videoData: data })),
}));

const useSidebarHook = create<props>((set) => ({
  isOpen: false,
  onToggle: () => set((state) => ({ isOpen: !state.isOpen })),
  onClose: () => set(() => ({ isOpen: false })),
  onOpen: () => set(() => ({ isOpen: true })),
}));

export default useSidebarHook;
