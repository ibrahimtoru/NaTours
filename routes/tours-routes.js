const express = require("express");

const toursController = require("../controllers/tours-controllers");

const router = express.Router();

router
  .route("/top-5-cheap")
  .get(toursController.aliasTopTours, toursController.getAllTours);

router
  .route("/")
  .get(toursController.getAllTours)
  .post(toursController.createTour);

router
  .route("/:id")
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour);

module.exports = router;
