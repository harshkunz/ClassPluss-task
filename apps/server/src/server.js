const app = require("./app");
const { connectDb } = require("./config/db");
const { loadEnv } = require("./config/env");

loadEnv();

const port = process.env.PORT || 5000;

async function startServer() {
  await connectDb(process.env.MONGODB_URI);

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
