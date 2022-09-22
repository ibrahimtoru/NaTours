const mongoose = require("mongoose");

const Tour = require("./tour-model");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Must enter your review. max length 100 chars."],
      minLength: [10, "A review must be at least 10 characters"],
      maxLength: [200, "A review must not exceed 100 characters"],
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

// to prevent user from posting multiple reviews we set the compund index of tour and user to unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

reviewSchema.statics.calcAverageRating = async function (tourId) {
  // "This" points to the model here.
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  // "This" points to the current review here.
  this.constructor.calcAverageRating(this.tour);

  // .post() does not have access to next()
});

// findByIdAndUpdate/delete use findOneAnd behind the scenes so we use findOneAnd ⬇
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); dos not work here becaus in post middlware query is already executed. so we store and access that here
  await this.r.constructor.calcAverageRating(this.r.tour);
});

module.exports = mongoose.model("Review", reviewSchema);
