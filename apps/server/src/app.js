import path from "path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN || "*",
		credentials: true,
	})
);
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/templates", templateRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
