const express = require("express");

const toursController = require("../controllers/tours-controllers");
const authController = require("../controllers/auth-controller");
const reviewRoutes = require("./review-routes");

const router = express.Router();

router.route("/tours-stats").get(toursController.getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    toursController.getMonthlyPlan
  );

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(toursController.getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(toursController.getDistance);

router.use("/:tourId/reviews", reviewRoutes);

router
  .route("/top-5-cheap")
  .get(toursController.aliasTopTours, toursController.getAllTours);

router
  .route("/")
  .get(toursController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    toursController.createTour
  );

router
  .route("/:id")
  .get(toursController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    toursController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    toursController.deleteTour
  );

module.exports = router;
