import { create } from "zustand";
import type { AuthState } from "@/types";
import { axiosInstance } from "@/lib/axios";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      set({ user: res.data, isAuthenticated: true });
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (name, email, password) => {
    try {
      const res = await axiosInstance.post("/auth/signup", {
        name,
        email,
        password,
      });
      set({ user: res.data, isAuthenticated: true });
      return { success: true };
    } catch (error: any) {
      console.log("Error in signUp:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Something went wrong",
      };
    }
  },

  signIn: async (email, password) => {
    try {
      const res = await axiosInstance.post("/auth/signin", { email, password });
      set({ user: res.data, isAuthenticated: true });
      return { success: true };
    } catch (error: any) {
      console.log("Error in signIn:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Something went wrong",
      };
    }
  },

  signOut: async () => {
    try {
      await axiosInstance.post("/auth/signout");
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.log("Error in signOut:", error);
    }
  },
}));
