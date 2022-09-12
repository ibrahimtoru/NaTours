const express = require("express");

const morgan = require("morgan");

const toursRoutes = require("./routes/tours-routes");

const usersRoutes = require("./routes/users-routes");

const app = express();

// Middlewares
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json()); //express.json() is based on body-parser, to parse incoming reqs with json payloads
app.use(express.static(`${__dirname}/public`));
app.use("/api/v1/tours", toursRoutes);
app.use("/api/v1/users", usersRoutes);

module.exports = app;
