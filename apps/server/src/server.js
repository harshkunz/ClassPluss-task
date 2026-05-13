import app from "./app.js";
import { connectDb } from "./config/db.js";
import { loadEnv } from "./config/env.js";

loadEnv();

const port = process.env.PORT || 5000;

async function start() {
  await connectDb(process.env.MONGODB_URI);

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
