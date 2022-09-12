const express = require("express");

const toursController = require("../controllers/tours-controllers");

const router = express.Router();

router.param("id", toursController.checkId);

router
  .route("/")
  .get(toursController.getAllTours)
  .post(toursController.checkBody, toursController.createTour);

router
  .route("/:id")
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour);

module.exports = router;
