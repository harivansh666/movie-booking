CREATE TABLE "booked_seats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "booked_seats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"bookingId" integer NOT NULL,
	"showtimeId" integer NOT NULL,
	"seatRow" varchar(2) NOT NULL,
	"seatCol" integer NOT NULL,
	CONSTRAINT "booked_seats_showtimeId_seatRow_seatCol_unique" UNIQUE("showtimeId","seatRow","seatCol")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bookings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"showtimeId" integer NOT NULL,
	"totalPrice" integer NOT NULL,
	"status" varchar(50) DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "movies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"description" text,
	"posterPath" text,
	"duration" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "showtimes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "showtimes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"movieId" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"hallNumber" integer NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booked_seats" ADD CONSTRAINT "booked_seats_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booked_seats" ADD CONSTRAINT "booked_seats_showtimeId_showtimes_id_fk" FOREIGN KEY ("showtimeId") REFERENCES "public"."showtimes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_showtimeId_showtimes_id_fk" FOREIGN KEY ("showtimeId") REFERENCES "public"."showtimes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showtimes" ADD CONSTRAINT "showtimes_movieId_movies_id_fk" FOREIGN KEY ("movieId") REFERENCES "public"."movies"("id") ON DELETE no action ON UPDATE no action;