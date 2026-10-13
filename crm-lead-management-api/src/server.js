import "dotenv/config";

import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`CRM API listening on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        try {
          await disconnectDB();
          process.exit(0);
        } catch (error) {
          console.error("Error during database shutdown:", error.message);
          process.exit(1);
        }
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start CRM API:", error.message);
    process.exitCode = 1;
  }
}

startServer();