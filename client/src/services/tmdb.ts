import axios from "axios";
import type {
  TMDBResponse,
  Movie,
  MovieDetails,
  Genre,
  CastMember,
  Video,
} from "@/types";

// TMDB API key — this is a public/publishable key
const API_KEY = "2dca580c2a14b55200e784d157207b4d";
const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE = "https://image.tmdb.org/t/p";

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY, language: "en-US" },
});

export const getImageUrl = (path: string | null, size = "w500") =>
  path ? `${IMAGE_BASE}/${size}${path}` : "/placeholder.svg";

export const getBackdropUrl = (path: string | null) =>
  path ? `${IMAGE_BASE}/original${path}` : null;

// Movie endpoints
export const getNowPlaying = (
  page = 1,
  extraParams: Record<string, string | number> = {},
) =>
  tmdb
    .get<
      TMDBResponse<Movie>
    >("/movie/now_playing", { params: { page, ...extraParams } })
    .then((r) => r.data);

export const getUpcoming = (
  page = 1,
  extraParams: Record<string, string | number> = {},
) =>
  tmdb
    .get<
      TMDBResponse<Movie>
    >("/movie/upcoming", { params: { page, ...extraParams } })
    .then((r) => r.data);

export const getPopular = (
  page = 1,
  extraParams: Record<string, string | number> = {},
) =>
  tmdb
    .get<
      TMDBResponse<Movie>
    >("/movie/popular", { params: { page, ...extraParams } })
    .then((r) => r.data);

export const getTopRated = (
  page = 1,
  extraParams: Record<string, string | number> = {},
) =>
  tmdb
    .get<
      TMDBResponse<Movie>
    >("/movie/top_rated", { params: { page, ...extraParams } })
    .then((r) => r.data);

export const getMovieDetails = (id: number) =>
  tmdb.get<MovieDetails>(`/movie/${id}`).then((r) => r.data);

export const getMovieCredits = (id: number) =>
  tmdb
    .get<{ cast: CastMember[] }>(`/movie/${id}/credits`)
    .then((r) => r.data.cast);

export const getMovieVideos = (id: number) =>
  tmdb
    .get<{ results: Video[] }>(`/movie/${id}/videos`)
    .then((r) => r.data.results);

export const searchMovies = (query: string, page = 1) =>
  tmdb
    .get<TMDBResponse<Movie>>("/search/movie", { params: { query, page } })
    .then((r) => r.data);

export const getGenres = () =>
  tmdb.get<{ genres: Genre[] }>("/genre/movie/list").then((r) => r.data.genres);

export const discoverMovies = (params: Record<string, string | number>) =>
  tmdb
    .get<TMDBResponse<Movie>>("/discover/movie", { params })
    .then((r) => r.data);

export default tmdb;
