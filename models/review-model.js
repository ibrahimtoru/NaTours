const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Must enter your review. max length 100 chars."],
      minLength: [10, "A review must be at least 10 characters"],
      maxLength: [100, "A review must not exceed 100 characters"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be bewtween 1 and 5"],
      max: [5, "Rating must be bewtween 1 and 5"],
    },
    createdAt: { type: Date, default: Date.now() },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  /*   this.populate({
    path: "tour",
    select: "name",
  }).populate({
    path: "user",
    select: "name photo",
  });
 */
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

module.exports = mongoose.model("Review", reviewSchema);

//POST /tour/:id/reviews
//GET /tour/:id/reviews
//GET /tour/:id/reviews/:reviewId
