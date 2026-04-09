import "dotenv/config";
import db from "../src/db/db.conn";
import { usersTable } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email address.");
    console.error("Usage: npm run make-admin <email>");
    process.exit(1);
  }

  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (user.length === 0) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    await db
      .update(usersTable)
      .set({ role: "admin" })
      .where(eq(usersTable.email, email));

    console.log(`Successfully updated ${email} to admin role!`);
    console.log("You can now securely log in to the admin dashboard.");
    process.exit(0);
  } catch (error) {
    console.error("Error updating user:", error);
    process.exit(1);
  }
}

makeAdmin();
