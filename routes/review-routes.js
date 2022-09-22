const express = require("express");

const reviewController = require("../controllers/reviews-controllers");
const authController = require("../controllers/auth-controller");

const router = express.Router({ mergeParams: true });

// POST /tour/:tourId/reviews
// GET /tour/:tourId/reviews
// POST /reviews

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview
  );

module.exports = router;
