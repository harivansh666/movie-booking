import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";
import { Check, Ticket } from "lucide-react";
import { getMovieDetails, getImageUrl } from "@/services/tmdb";
import { useBookingStore } from "@/store/bookingStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";
import type { Seat } from "@/types";

const TIMES = ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM", "10:00 PM"];
const ROWS = "ABCDEFGHIJ".split("");
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);
// Removed hardcoded SEAT_PRICE

export default function Booking() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { addBooking, getBookedSeats, fetchShowtimeData } = useBookingStore();

  const { data: movie } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: !!movieId,
  });

  const dates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)),
    [],
  );
  const [selectedDate, setSelectedDate] = useState(
    format(dates[0], "yyyy-MM-dd"),
  );
  const [selectedTime, setSelectedTime] = useState(TIMES[0]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentShowtimeId, setCurrentShowtimeId] = useState<number | null>(
    null,
  );
  const [isLoadingShowtime, setIsLoadingShowtime] = useState(false);
  const [price, setPrice] = useState<number>(0);

  const formatTimeTo24h = (time12h: string) => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  useEffect(() => {
    if (movie && selectedDate && selectedTime) {
      const fetch = async () => {
        setIsLoadingShowtime(true);
        const res = await fetchShowtimeData(
          {
            tmdbId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
            description: movie.overview,
          },
          `${selectedDate} ${formatTimeTo24h(selectedTime)}`,
        );
        if (res) {
          const { showtimeId, price: showtimePrice } = res;
          setCurrentShowtimeId(showtimeId);
          setPrice(showtimePrice);
        } else {
          setCurrentShowtimeId(null);
          setPrice(0);
        }
        setIsLoadingShowtime(false);
      };
      fetch();
    }
  }, [movie, selectedDate, selectedTime, fetchShowtimeData]);

  const bookedSeats = useMemo(
    () => (currentShowtimeId ? getBookedSeats(currentShowtimeId) : []),
    [currentShowtimeId, getBookedSeats],
  );

  const isSeatBooked = (row: string, col: number) =>
    bookedSeats.some((s) => s.id === `${row}${col}`);

  const isSeatSelected = (row: string, col: number) =>
    selectedSeats.some((s) => s.id === `${row}${col}`);

  const toggleSeat = (row: string, col: number) => {
    const id = `${row}${col}`;
    if (isSeatBooked(row, col)) return;
    setSelectedSeats((prev) =>
      prev.some((s) => s.id === id)
        ? prev.filter((s) => s.id !== id)
        : [...prev, { row: ROWS.indexOf(row), col, id }],
    );
  };

  const totalPrice = selectedSeats.length * price;

  const handleConfirm = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book.",
        variant: "destructive",
      });
      return;
    }

    if (!currentShowtimeId) {
      toast({
        title: "Error",
        description: "Could not initialize booking. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const result = await addBooking(
      currentShowtimeId,
      selectedSeats.map((s) => ({ row: ROWS[s.row], col: s.col })),
    );

    if (result.success) {
      setShowConfirm(false);
      setShowSuccess(true);
      setSelectedSeats([]);
    } else {
      toast({
        title: "Booking Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {movie && (
          <div className="mb-8 flex items-center gap-4">
            <img
              src={getImageUrl(movie.poster_path, "w154")}
              alt={movie.title}
              className="w-16 rounded-lg border border-border"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {movie.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Select date, time & seats
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Date */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map((d) => {
                    const ds = format(d, "yyyy-MM-dd");
                    return (
                      <button
                        key={ds}
                        onClick={() => {
                          setSelectedDate(ds);
                          setSelectedSeats([]);
                        }}
                        className={`shrink-0 rounded-lg border px-4 py-2 text-center transition-colors ${ds === selectedDate ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}
                      >
                        <div className="text-xs font-medium">
                          {format(d, "EEE")}
                        </div>
                        <div className="text-lg font-bold">
                          {format(d, "d")}
                        </div>
                        <div className="text-xs">{format(d, "MMM")}</div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {TIMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setSelectedTime(t);
                        setSelectedSeats([]);
                      }}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${t === selectedTime ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Seat Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Seats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 mx-auto w-3/4 rounded-t-xl border border-border bg-muted py-1 text-center text-xs text-muted-foreground">
                  SCREEN
                </div>
                <div className="space-y-1.5">
                  {ROWS.map((row) => (
                    <div
                      key={row}
                      className="flex items-center justify-center gap-1.5"
                    >
                      <span className="w-6 text-xs font-medium text-muted-foreground">
                        {row}
                      </span>
                      {COLS.map((col) => {
                        const booked = isSeatBooked(row, col);
                        const selected = isSeatSelected(row, col);
                        return (
                          <button
                            key={col}
                            disabled={booked}
                            onClick={() => toggleSeat(row, col)}
                            className={`h-7 w-7 rounded-md text-xs font-medium transition-all ${
                              booked
                                ? "bg-red-500/20 text-red-500 border-red-500/30 cursor-not-allowed"
                                : selected
                                  ? "bg-primary text-primary-foreground scale-110"
                                  : "border border-border hover:border-primary hover:bg-accent"
                            }`}
                          >
                            {col}
                          </button>
                        );
                      })}
                      <span className="w-6 text-xs font-medium text-muted-foreground">
                        {row}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center gap-6 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded border border-border" />{" "}
                    Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded bg-primary" /> Selected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded bg-red-500/20 border border-red-500/30" />{" "}
                    Booked
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground">{selectedDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-foreground">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="text-foreground">
                    {selectedSeats.length > 0
                      ? selectedSeats.map((s) => s.id).join(", ")
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per seat</span>
                  <span className="text-foreground">₹{price}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{selectedSeats.length * price}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={
                    selectedSeats.length === 0 ||
                    isLoadingShowtime ||
                    !currentShowtimeId
                  }
                  onClick={() => setShowConfirm(true)}
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  {isLoadingShowtime ? "Initializing..." : "Confirm Booking"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Movie:</span>{" "}
              {movie?.title}
            </p>
            <p>
              <span className="text-muted-foreground">Date:</span>{" "}
              {selectedDate}
            </p>
            <p>
              <span className="text-muted-foreground">Time:</span>{" "}
              {selectedTime}
            </p>
            <p>
              <span className="text-muted-foreground">Seats:</span>{" "}
              {selectedSeats.map((s) => s.id).join(", ")}
            </p>
            <p className="text-lg font-bold">
              Total: ₹{selectedSeats.length * price}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm & Pay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={showSuccess}
        onOpenChange={(v) => {
          setShowSuccess(v);
          if (!v) navigate("/bookings");
        }}
      >
        <DialogContent className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
              <Check className="h-10 w-10 text-green-500" />
            </div>
          </motion.div>
          <DialogTitle>Booking Confirmed!</DialogTitle>
          <p className="text-muted-foreground">
            Your tickets have been booked successfully. Enjoy the movie!
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setShowSuccess(false);
              navigate("/bookings");
            }}
          >
            View My Bookings
          </Button>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
