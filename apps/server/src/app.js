import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import adminTemplateRoutes from "./routes/adminTemplateRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || true;

app.use(helmet());
app.use(morgan("dev"));
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/admin", adminTemplateRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
