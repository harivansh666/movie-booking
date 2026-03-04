import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar, Heart, Play } from 'lucide-react';
import { getMovieDetails, getMovieCredits, getMovieVideos, getImageUrl, getBackdropUrl } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMovieStore } from '@/store/movieStore';
import PageTransition from '@/components/PageTransition';

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const { toggleFavorite, isFavorite } = useMovieStore();
  const fav = isFavorite(movieId);

  const { data: movie, isLoading } = useQuery({ queryKey: ['movie', movieId], queryFn: () => getMovieDetails(movieId), enabled: !!movieId });
  const { data: cast } = useQuery({ queryKey: ['credits', movieId], queryFn: () => getMovieCredits(movieId), enabled: !!movieId });
  const { data: videos } = useQuery({ queryKey: ['videos', movieId], queryFn: () => getMovieVideos(movieId), enabled: !!movieId });

  const trailer = videos?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-[60vh] w-full rounded-xl" />
        <Skeleton className="mt-6 h-8 w-1/2" />
        <Skeleton className="mt-4 h-20 w-full" />
      </div>
    );
  }

  if (!movie) return <p className="py-20 text-center text-muted-foreground">Movie not found.</p>;

  const bg = getBackdropUrl(movie.backdrop_path);

  return (
    <PageTransition>
      {/* Backdrop */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        {bg && <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="mx-auto -mt-40 max-w-7xl px-4 relative z-10">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Poster */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="shrink-0">
            <img
              src={getImageUrl(movie.poster_path)}
              alt={movie.title}
              className="w-64 rounded-xl shadow-2xl border border-border"
            />
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">{movie.title}</h1>
            {movie.tagline && <p className="mt-1 text-muted-foreground italic">"{movie.tagline}"</p>}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />{movie.vote_average.toFixed(1)}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{movie.runtime} min</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{movie.release_date}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {movie.genres.map(g => <Badge key={g.id} variant="secondary">{g.name}</Badge>)}
            </div>

            <p className="mt-6 leading-relaxed text-foreground">{movie.overview}</p>

            <div className="mt-6 flex gap-3">
              <Button size="lg" asChild>
                <Link to={`/booking/${movie.id}`}><Play className="mr-2 h-4 w-4" />Book Now</Link>
              </Button>
              <Button size="lg" variant="outline" onClick={() => toggleFavorite(movie.id)}>
                <Heart className={`mr-2 h-4 w-4 ${fav ? 'fill-red-500 text-red-500' : ''}`} />
                {fav ? 'Favorited' : 'Favorite'}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Trailer */}
        {trailer && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Trailer</h2>
            <div className="aspect-video overflow-hidden rounded-xl border border-border">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </section>
        )}

        {/* Cast */}
        {cast && cast.length > 0 && (
          <section className="mt-12 pb-12">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {cast.slice(0, 12).map(c => (
                <div key={c.id} className="shrink-0 w-28 text-center">
                  <img
                    src={getImageUrl(c.profile_path, 'w185')}
                    alt={c.name}
                    loading="lazy"
                    className="mx-auto h-28 w-28 rounded-full object-cover border border-border"
                  />
                  <p className="mt-2 text-xs font-medium text-foreground line-clamp-1">{c.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  );
}
