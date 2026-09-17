import express from "express";
import healthRouter from "./routes/health.routes.js";
import problemRouter from "./routes/problem.routes.js";

const app = express();

app.use(express.json());

app.use("/api", healthRouter);
app.use("/api/problems", problemRouter);

export default app;