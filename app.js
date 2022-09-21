const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/app-error");
const globalErrorHandler = require("./controllers/error-controller");
const toursRoutes = require("./routes/tours-routes");
const usersRoutes = require("./routes/users-routes");
const reviewRoutes = require("./routes/review-routes");

const app = express();

////// Middlewares //////
// set security Http header
app.use(helmet());

// Development logger
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// limit request from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, try again in an hour!",
});
app.use("/api", limiter);

//express.json()is a body parser based on body-parser, to parse incoming reqs with json payloads. parsing data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSql query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

//prevent param pollution should be placed in the end because it clears the query string.
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "difficulty",
      "price",
      "maxGroupSize",
    ],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// // Test Middlware
// app.use((req,res,next) => {
//   req.requestTime = new Date().toISOString()
//   next()
// })

// Routes
app.use("/api/v1/tours", toursRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/reviews", reviewRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`could not find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
