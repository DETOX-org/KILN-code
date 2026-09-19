import express from "express";
import healthRouter from "./routes/health.routes.js";
import problemRouter from "./routes/problem.routes.js";
import telemetryRouter from "./routes/telemetry.routes.js";

const app = express();

app.use(express.json());

// Enable CORS for local development and frontend client
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use("/api", healthRouter);
app.use("/api/problems", problemRouter);
app.use("/api", telemetryRouter);

export default app;