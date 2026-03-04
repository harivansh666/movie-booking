import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';
import { getImageUrl } from '@/services/tmdb';
import { useMovieStore } from '@/store/movieStore';
import type { Movie } from '@/types';

export default function MovieCard({ movie }: { movie: Movie }) {
  const { toggleFavorite, isFavorite } = useMovieStore();
  const fav = isFavorite(movie.id);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <Link to={`/movie/${movie.id}`}>
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="p-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{movie.title}</h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span>{movie.vote_average.toFixed(1)}</span>
            <span className="ml-auto">{movie.release_date?.slice(0, 4)}</span>
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); toggleFavorite(movie.id); }}
        className="absolute right-2 top-2 rounded-full bg-background/70 p-1.5 backdrop-blur-sm transition-colors hover:bg-background"
      >
        <Heart className={`h-4 w-4 ${fav ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
      </button>
    </motion.div>
  );
}
