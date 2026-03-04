import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play,
  Info,
  ChevronRight,
  SlidersHorizontal,
  Ticket,
  Popcorn,
  Gift,
  Star,
  Clapperboard,
  Sparkles,
} from "lucide-react";
import {
  getNowPlaying,
  getUpcoming,
  getBackdropUrl,
  getGenres,
} from "@/services/tmdb";
import { Button } from "@/components/ui/button";
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
import type { Movie } from "@/types";

const PROMO_BANNERS = [
  {
    id: 1,
    icon: Ticket,
    title: "Flat 50% Off",
    description: "on your first booking!",
    color: "from-orange-500 to-pink-500",
    link: "/offers/first",
  },
  {
    id: 2,
    icon: Popcorn,
    title: "Bollywood Blockbusters",
    description: "Latest hits, now playing",
    color: "from-blue-600 to-cyan-500",
    link: "/movies?language=hi",
  },
  {
    id: 3,
    icon: Clapperboard,
    title: "Indian Drama Premiere",
    description: "Exclusive early access",
    color: "from-purple-600 to-indigo-600",
    link: "/movies/upcoming",
  },
  {
    id: 4,
    icon: Gift,
    title: "Weekend Vouchers",
    description: "Book now & win prizes",
    color: "from-emerald-500 to-teal-500",
    link: "/offers/weekend",
  },
  {
    id: 5,
    icon: Sparkles,
    title: "Membership Perks",
    description: "Double reward points",
    color: "from-amber-500 to-orange-500",
    link: "/membership",
  },
  {
    id: 6,
    icon: Star,
    title: "Fan Premieres",
    description: "Be the first to watch",
    color: "from-rose-500 to-red-500",
    link: "/movies/premieres",
  },
];

function PromoBanners() {
  return (
    <div className="relative mt-8 overflow-hidden bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 py-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />

      <div className="flex w-full overflow-hidden">
        <motion.div
          animate={{ x: [0, -1920] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
          whileHover={{ animationPlayState: "paused" }}
          className="flex gap-6 whitespace-nowrap"
        >
          {[...PROMO_BANNERS, ...PROMO_BANNERS].map((banner, index) => {
            const Icon = banner.icon;
            return (
              <Link
                key={`${banner.id}-${index}`}
                to={banner.link}
                className="group block w-[320px] shrink-0"
              >
                <div
                  className={`relative flex h-28 items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${banner.color} p-4 text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                      Limited Offer
                    </span>
                    <h3 className="text-lg font-bold leading-tight">
                      {banner.title}
                    </h3>
                    <p className="text-sm text-white/90">
                      {banner.description}
                    </p>
                  </div>
                  <Sparkles className="absolute right-2 top-2 h-5 w-5 text-white/30" />
                </div>
              </Link>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

function HeroSection({ movie }: { movie: Movie }) {
  const bg = getBackdropUrl(movie.backdrop_path);
  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {bg && (
        <img
          src={bg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto flex h-full max-w-7xl flex-col justify-end gap-4 px-4 pb-16"
      >
        <h1 className="max-w-2xl text-4xl font-bold leading-tight text-foreground md:text-6xl">
          {movie.title}
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground line-clamp-3 md:text-base">
          {movie.overview}
        </p>
        <div className="flex gap-3">
          <Button size="lg" asChild>
            <Link to={`/movie/${movie.id}`}>
              <Play className="mr-2 h-4 w-4" />
              Book Now
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to={`/movie/${movie.id}`}>
              <Info className="mr-2 h-4 w-4" />
              Details
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

function MovieSection({
  title,
  movies,
  loading,
  link,
}: {
  title: string;
  movies?: Movie[];
  loading: boolean;
  link: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to={link}>
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))
          : movies?.slice(0, 10).map((m) => <MovieCard key={m.id} movie={m} />)}
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: () => getGenres(),
  });

  // Filter for Indian movies (Hindi)
  const indianParams = { with_original_language: "hi", region: "IN" };

  const { data: nowPlaying, isLoading: npLoading } = useQuery({
    queryKey: ["nowPlaying", "indian"],
    queryFn: () => getNowPlaying(1, indianParams),
  });

  const { data: upcoming, isLoading: upLoading } = useQuery({
    queryKey: ["upcoming", "indian"],
    queryFn: () => getUpcoming(1, indianParams),
  });

  const hero = nowPlaying?.results?.[0];

  const handleGenreChange = (genreId: string) => {
    if (genreId === "all") navigate("/movies");
    else navigate(`/movies?genre=${genreId}`);
  };

  return (
    <PageTransition>
      {hero && <HeroSection movie={hero} />}
      {!hero && npLoading && (
        <div className="h-[70vh] animate-pulse bg-muted" />
      )}

      <PromoBanners />

      {/* Genre Filter */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-2">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            Quick Filter:
          </span>
          <Select onValueChange={handleGenreChange}>
            <SelectTrigger className="w-[180px] bg-card">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select Genre" />
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
        </div>
      </section>

      <MovieSection
        title="Now Playing in India"
        movies={nowPlaying?.results}
        loading={npLoading}
        link="/movies"
      />
      <MovieSection
        title="Upcoming Indian Releases"
        movies={upcoming?.results}
        loading={upLoading}
        link="/movies"
      />
    </PageTransition>
  );
}
