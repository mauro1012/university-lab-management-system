const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const healthRouter = require("./health");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", routes);
app.use("/health", healthRouter);

// Middleware de errores (SIEMPRE al final)
app.use(errorMiddleware);

module.exports = app;
