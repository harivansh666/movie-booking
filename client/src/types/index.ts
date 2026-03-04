// Movie types from TMDB API
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  original_title: string;
  video: boolean;
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: Genre[];
  budget: number;
  revenue: number;
  status: string;
  tagline: string;
  homepage: string;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Auth types
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

// Booking types
export interface Seat {
  row: number;
  col: number;
  id: string; // e.g., "A1", "B5"
}

export interface Booking {
  id: number;
  showtimeId: number;
  movieTitle: string;
  moviePoster: string | null;
  startTime: string;
  hallNumber: number;
  seats: { row: string; col: number }[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface BookingState {
  bookings: Booking[];
  bookedSeats: Record<number, { row: string; col: number; id: string }[]>;
  isLoading: boolean;
  addBooking: (
    showtimeId: number,
    seats: { row: string; col: number }[],
  ) => Promise<{ success: boolean; error?: string }>;
  fetchMyBookings: () => Promise<void>;
  fetchShowtimeData: (
    movie: {
      tmdbId: number;
      title: string;
      posterPath: string | null;
      description: string | null;
    },
    startTime: string,
  ) => Promise<{ showtimeId: number; price: number } | null>;
  getBookedSeats: (
    showtimeId: number,
  ) => { row: string; col: number; id: string }[];
}

// Movie store types
export interface MovieStoreState {
  favorites: number[];
  toggleFavorite: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;
}

export type SortOption = "popularity" | "vote_average" | "release_date";
