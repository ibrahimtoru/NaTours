const fs = require("fs");
const express = require("express");

const app = express();

app.use(express.json()); //express.json() is based on body-parser, to parse incoming reqs with json payloads

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res
    .status(200)
    .json({ status: "success", results: tours.length, data: { tours } });
};

const getTour = (req, res) => {
  const tourId = req.params.id * 1;
  const tour = tours.find((el) => el.id === tourId);
  if (!tour)
    return res.status(404).json({ status: "fail", message: "Invalid ID" });
  res
    .status(200)
    .json({ status: "success", results: tours.length, data: { tour } });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updatetour = (req, res) => {
  const tourId = req.params.id * 1;
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({ status: "fail", message: "Invalid ID" });
  const tour = tours.find((el) => el.id === tourId);
  res
    .status(200)
    .json({ status: "success", data: { tour: "Tour updated 😉" } });
};

const deleteTour = (req, res) => {
  const id = req.params.id * 1;
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({ status: "fail", message: "Invalid ID" });
  res.status(204).json({
    status: "success",
  });
};

app.route("/api/v1/tours").get(getAllTours).post(createTour);

app
  .route("/api/v1/tours/:id")
  .get(getTour)
  .patch(updatetour)
  .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
