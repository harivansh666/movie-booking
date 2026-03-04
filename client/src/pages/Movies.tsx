import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { getGenres, discoverMovies, searchMovies } from "@/services/tmdb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MovieCard from "@/components/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import PageTransition from "@/components/PageTransition";
import type { SortOption } from "@/types";

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialGenre = searchParams.get("genre") || "all";

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [genre, setGenre] = useState<string>(initialGenre);
  const [sort, setSort] = useState<SortOption>("popularity");
  const [page, setPage] = useState(1);

  // Sync from URL on mount or URL change
  useEffect(() => {
    const s = searchParams.get("search") || "";
    const g = searchParams.get("genre") || "all";
    if (s !== search) {
      setSearch(s);
      setDebouncedSearch(s);
    }
    if (g !== genre) setGenre(g);
  }, [searchParams]);

  // Debounce search and update URL
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setSearchParams((prev) => {
        if (search) prev.set("search", search);
        else prev.delete("search");
        return prev;
      });
    }, 400);
    return () => clearTimeout(t);
  }, [search, setSearchParams]);

  // Update URL on genre change
  useEffect(() => {
    setSearchParams((prev) => {
      if (genre !== "all") prev.set("genre", genre);
      else prev.delete("genre");
      return prev;
    });
  }, [genre, setSearchParams]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genre, sort]);

  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["movies", debouncedSearch, genre, sort, page],
    queryFn: () => {
      if (debouncedSearch) return searchMovies(debouncedSearch, page);
      const params: Record<string, string | number> = {
        sort_by: `${sort}.desc`,
        page,
      };
      if (genre !== "all") params.with_genres = genre;
      return discoverMovies(params);
    },
  });

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-foreground">Movies</h1>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-[160px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres?.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popular</SelectItem>
              <SelectItem value="vote_average">Rating</SelectItem>
              <SelectItem value="release_date">Release Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {isLoading
            ? Array.from({ length: 20 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))
            : data?.results.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
        {data?.results.length === 0 && !isLoading && (
          <p className="py-20 text-center text-muted-foreground">
            No movies found.
          </p>
        )}

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.min(data.total_pages, 500)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.min(data.total_pages, 500)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
