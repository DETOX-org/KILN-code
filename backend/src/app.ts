import express from "express";
import path from "node:path";
import fs from "node:fs";
import healthRouter from "./routes/health.routes.js";
import problemRouter from "./routes/problem.routes.js";
import submissionRouter from "./routes/submission.routes.js";
import adminRouter from "./routes/admin.routes.js";
import contestRouter from "./routes/contest.routes.js";
import telemetryRouter from "./routes/telemetry.routes.js";
import sessionRouter from "./routes/session.routes.js";

const app = express();

app.use(express.json());

// Enable CORS for local development and frontend client
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-role"
  );
  if (_req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Mount API Routes
app.use("/api", healthRouter);
app.use("/api", telemetryRouter);
app.use("/api/problems", problemRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api/admin", adminRouter);
app.use("/api/contests", contestRouter);
app.use("/api/sessions", sessionRouter);

// Mount Static Frontend
const possibleFrontendDirs = [
  path.resolve(process.cwd(), "frontend"),
  path.resolve(process.cwd(), "../frontend")
];

for (const dir of possibleFrontendDirs) {
  if (fs.existsSync(dir) && fs.existsSync(path.join(dir, "index.html"))) {
    app.use(express.static(dir));
    app.get("/", (_req, res) => {
      res.sendFile(path.join(dir, "index.html"));
    });
    break;
  }
}

export default app;
