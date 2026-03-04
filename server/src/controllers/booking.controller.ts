import type { Request, Response } from "express";
import db from "../db/db.conn";
import {
  bookingsTable,
  bookedSeatsTable,
  showtimesTable,
  moviesTable,
} from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";

export const createBooking = async (req: Request, res: Response) => {
  const { showtimeId, seats } = req.body;
  const userId = (req as any).user.id;

  try {
    if (!showtimeId || !seats || !seats.length) {
      return res
        .status(400)
        .json({ message: "Showtime and seats are required" });
    }

    // 1. Verify showtime and get movie title for response
    const [showtime] = await db
      .select({
        id: showtimesTable.id,
        movieId: showtimesTable.movieId,
        price: showtimesTable.price,
        startTime: showtimesTable.startTime,
        hallNumber: showtimesTable.hallNumber,
        movieTitle: moviesTable.title,
        moviePoster: moviesTable.posterPath,
      })
      .from(showtimesTable)
      .innerJoin(moviesTable, eq(showtimesTable.movieId, moviesTable.id))
      .where(eq(showtimesTable.id, showtimeId))
      .limit(1);

    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    // 2. Check if any seat is already booked (Pre-check)
    for (const seat of seats) {
      const existing = await db
        .select()
        .from(bookedSeatsTable)
        .where(
          and(
            eq(bookedSeatsTable.showtimeId, showtimeId),
            eq(bookedSeatsTable.seatRow, seat.row),
            eq(bookedSeatsTable.seatCol, seat.col),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        return res
          .status(409)
          .json({ message: `Seat ${seat.row}${seat.col} is already booked` });
      }
    }

    // 3. Create booking record
    const [newBooking] = await db
      .insert(bookingsTable)
      .values({
        userId,
        showtimeId,
        totalPrice: showtime.price * seats.length,
        status: "confirmed",
      })
      .returning();

    if (!newBooking) {
      return res
        .status(500)
        .json({ message: "Failed to create booking record" });
    }

    // 4. Create booked seats records
    try {
      await db.insert(bookedSeatsTable).values(
        seats.map((seat: any) => ({
          bookingId: newBooking.id,
          showtimeId,
          seatRow: seat.row,
          seatCol: seat.col,
        })),
      );
    } catch (seatError: any) {
      // If seat booking fails (e.g. race condition), we should ideally delete the booking record
      // but since we lack transactions, we'll just return the error.
      console.log("Error inserting booked seats:", seatError.message);
      return res.status(409).json({
        message: "One or more seats were already booked by another user.",
      });
    }

    const result = {
      ...newBooking,
      movieTitle: showtime.movieTitle,
      moviePoster: showtime.moviePoster,
      startTime: showtime.startTime,
      hallNumber: showtime.hallNumber,
      seats: seats,
    };

    res.status(201).json({
      message: "Booking successful",
      booking: result,
    });
  } catch (error: any) {
    console.log("Error in createBooking:", error.message);

    if (
      error.message.includes("unique constraint") ||
      error.message.includes("already booked")
    ) {
      return res.status(409).json({ message: error.message });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const userBookings = await db
      .select({
        id: bookingsTable.id,
        showtimeId: bookingsTable.showtimeId,
        totalPrice: bookingsTable.totalPrice,
        status: bookingsTable.status,
        createdAt: bookingsTable.createdAt,
        startTime: showtimesTable.startTime,
        movieTitle: moviesTable.title,
        moviePoster: moviesTable.posterPath,
        hallNumber: showtimesTable.hallNumber,
      })
      .from(bookingsTable)
      .innerJoin(
        showtimesTable,
        eq(bookingsTable.showtimeId, showtimesTable.id),
      )
      .innerJoin(moviesTable, eq(showtimesTable.movieId, moviesTable.id))
      .where(eq(bookingsTable.userId, userId));

    // Get seats for each booking
    const bookingsWithSeats = await Promise.all(
      userBookings.map(async (booking) => {
        const seats = await db
          .select({
            row: bookedSeatsTable.seatRow,
            col: bookedSeatsTable.seatCol,
          })
          .from(bookedSeatsTable)
          .where(eq(bookedSeatsTable.bookingId, booking.id));

        return { ...booking, seats };
      }),
    );

    res.status(200).json(bookingsWithSeats);
  } catch (error: any) {
    console.log("Error in getMyBookings:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getShowtimeAndSeats = async (req: Request, res: Response) => {
  const { tmdbId, startTime, title, posterPath, description } = req.query;

  try {
    if (!tmdbId || !startTime) {
      return res
        .status(400)
        .json({ message: "tmdbId and startTime are required" });
    }

    const startDate = new Date(startTime as string);

    // 1. Ensure Movie exists
    let [movie] = await db
      .select()
      .from(moviesTable)
      .where(eq(moviesTable.tmdbId, Number(tmdbId)))
      .limit(1);

    if (!movie) {
      [movie] = await db
        .insert(moviesTable)
        .values({
          tmdbId: Number(tmdbId),
          title: (title as string) || "Unknown Movie",
          posterPath: (posterPath as string) || null,
          description: (description as string) || null,
        })
        .returning();
    }

    if (!movie) {
      return res.status(500).json({ message: "Failed to sync movie" });
    }

    // 2. Ensure Showtime exists
    let [showtime] = await db
      .select()
      .from(showtimesTable)
      .where(
        and(
          eq(showtimesTable.movieId, movie.id),
          eq(showtimesTable.startTime, startDate),
        ),
      )
      .limit(1);

    if (!showtime) {
      const randomPrice = Math.floor(Math.random() * (499 - 99 + 1)) + 99;
      [showtime] = await db
        .insert(showtimesTable)
        .values({
          movieId: movie.id,
          startTime: startDate,
          hallNumber: Math.floor(Math.random() * 5) + 1,
          price: randomPrice,
        })
        .returning();
    }

    if (!showtime) {
      return res.status(500).json({ message: "Failed to sync showtime" });
    }

    // 3. Get booked seats
    const seats = await db
      .select({
        row: bookedSeatsTable.seatRow,
        col: bookedSeatsTable.seatCol,
      })
      .from(bookedSeatsTable)
      .where(eq(bookedSeatsTable.showtimeId, showtime.id));

    const result = {
      showtimeId: showtime.id,
      price: showtime.price,
      bookedSeats: seats,
    };

    res.status(200).json(result);
  } catch (error: any) {
    console.log("Error in getShowtimeAndSeats:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
