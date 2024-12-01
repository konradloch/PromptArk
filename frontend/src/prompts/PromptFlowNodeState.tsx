import { create } from 'zustand';

export const usePromptNodeStore = create((set) => ({
    tabValue: 0,
    setTabValue: (d: any) => set((state: any) => ({ tabValue: d })),
}));