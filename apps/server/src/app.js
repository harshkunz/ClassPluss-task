const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

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

app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
