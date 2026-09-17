const dns = require("dns");
const dotenv = require("dotenv");

dotenv.config();

// --------------------------------------------------
// Local DNS Fix
// --------------------------------------------------
// Some Windows / Cisco DNS configurations route
// Node DNS queries through 127.0.0.1, which can
// block MongoDB Atlas SRV lookups.
//
// Render will use its own DNS in production.

if (
  process.env.NODE_ENV !==
  "production"
) {
  dns.setServers([
    "8.8.8.8",
    "1.1.1.1",
  ]);
}

const app = require("./app");
const connectDB = require("./config/db");

const PORT =
  process.env.PORT || 5000;

const NODE_ENV =
  process.env.NODE_ENV ||
  "development";

const CLIENT_URL =
  process.env.CLIENT_URL ||
  "http://localhost:5173";

const validateEnvironment =
  () => {
    const requiredVariables = [
      "MONGO_URI",
      "JWT_SECRET",
    ];

    const missingVariables =
      requiredVariables.filter(
        (variable) =>
          !process.env[
            variable
          ],
      );

    if (
      missingVariables.length >
      0
    ) {
      throw new Error(
        `Missing required environment variables: ${missingVariables.join(
          ", ",
        )}`,
      );
    }
  };

const startServer =
  async () => {
    try {
      validateEnvironment();

      await connectDB();

      const server =
        app.listen(
          PORT,
          () => {
            console.log(
              `Server running on port ${PORT}`,
            );

            console.log(
              `Environment: ${NODE_ENV}`,
            );

            console.log(
              `Allowed frontend: ${CLIENT_URL}`,
            );
          },
        );

      const shutdown = (
        signal,
      ) => {
        console.log(
          `${signal} received. Shutting down server...`,
        );

        server.close(
          () => {
            console.log(
              "HTTP server closed.",
            );

            process.exit(0);
          },
        );
      };

      process.on(
        "SIGTERM",
        () =>
          shutdown(
            "SIGTERM",
          ),
      );

      process.on(
        "SIGINT",
        () =>
          shutdown(
            "SIGINT",
          ),
      );
    } catch (error) {
      console.error(
        "Failed to start server:",
        error.message,
      );

      process.exit(1);
    }
  };

startServer();