import {
  integer,
  pgTable,
  varchar,
  timestamp,
  text,
  unique,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const moviesTable = pgTable("movies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tmdbId: integer("tmdb_id").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  posterPath: text("poster_path"),
  duration: integer("duration"), // in minutes, optional
});

export const showtimesTable = pgTable("showtimes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  movieId: integer("movie_id")
    .notNull()
    .references(() => moviesTable.id),
  startTime: timestamp("start_time").notNull(),
  hallNumber: integer("hall_number").notNull(),
  price: integer("price").notNull(),
});

export const bookingsTable = pgTable("bookings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  showtimeId: integer("showtime_id")
    .notNull()
    .references(() => showtimesTable.id),
  totalPrice: integer("total_price").notNull(),
  status: varchar("status", { length: 50 }).default("confirmed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookedSeatsTable = pgTable(
  "booked_seats",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => bookingsTable.id),
    showtimeId: integer("showtime_id")
      .notNull()
      .references(() => showtimesTable.id),
    seatRow: varchar("seat_row", { length: 2 }).notNull(),
    seatCol: integer("seat_col").notNull(),
  },
  (t) => ({
    unq: unique().on(t.showtimeId, t.seatRow, t.seatCol),
  }),
);

export const savedMoviesTable = pgTable("saved_movies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  movieId: integer("movie_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  posterPath: text("poster_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
