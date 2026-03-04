import { create } from "zustand";
import type { Booking, BookingState } from "@/types";
import { axiosInstance } from "@/lib/axios";

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  bookedSeats: {} as Record<number, { row: string; col: number; id: string }[]>,
  isLoading: false,

  fetchMyBookings: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/bookings/my-bookings");
      set({ bookings: res.data });
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchShowtimeData: async (movie, startTime) => {
    try {
      const res = await axiosInstance.get("/bookings/showtime", {
        params: {
          tmdbId: movie.tmdbId,
          startTime,
          title: movie.title,
          posterPath: movie.posterPath,
          description: movie.description,
        },
      });
      const { showtimeId, bookedSeats, price } = res.data;
      const seatsWithId = (bookedSeats || []).map((s: any) => ({
        ...s,
        id: `${s.row}${s.col}`,
      }));

      set((state) => ({
        bookedSeats: { ...state.bookedSeats, [showtimeId]: seatsWithId },
      }));

      return { showtimeId, price };
    } catch (error) {
      console.error("Error fetching showtime data:", error);
      return null;
    }
  },

  getBookedSeats: (showtimeId) => {
    return get().bookedSeats[showtimeId] || [];
  },

  addBooking: async (showtimeId, seats) => {
    try {
      const res = await axiosInstance.post("/bookings/", {
        showtimeId,
        seats,
      });
      set((state) => ({ bookings: [...state.bookings, res.data.booking] }));
      return { success: true };
    } catch (error: any) {
      console.error("Error creating booking:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Booking failed",
      };
    }
  },
}));
