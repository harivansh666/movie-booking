import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { getMovieDetails } from '@/services/tmdb';
import MovieCard from '@/components/MovieCard';
import MovieCardSkeleton from '@/components/MovieCardSkeleton';
import PageTransition from '@/components/PageTransition';
import type { Movie } from '@/types';

export default function Favorites() {
  const { favorites } = useMovieStore();

  const { data: movies, isLoading } = useQuery({
    queryKey: ['favorites', favorites],
    queryFn: () => Promise.all(favorites.map(id => getMovieDetails(id))),
    enabled: favorites.length > 0,
  });

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-foreground">Favorites</h1>
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">No favorites yet</h2>
            <p className="text-muted-foreground">Click the heart icon on any movie to add it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {isLoading
              ? Array.from({ length: favorites.length }).map((_, i) => <MovieCardSkeleton key={i} />)
              : movies?.map(m => <MovieCard key={m.id} movie={m as Movie} />)}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
