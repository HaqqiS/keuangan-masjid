import { create } from "zustand";

interface createPengajuanState {
  isOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
}
export const useCreatePengajuanStore = create<createPengajuanState>((set) => ({
  isOpen: false,
  openForm: () => set({ isOpen: true }),
  closeForm: () => set({ isOpen: false }),
}));
