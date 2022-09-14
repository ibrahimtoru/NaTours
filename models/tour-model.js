const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      minLength: [10, "A tour name must be at least 10 characters"],
      maxLength: [40, "A tour name should not exceed 40 characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty level"],
      enum: {
        values: ["easy", "medium", "hard"],
        message:
          "Please provide a valid difficulty level, easy, medium or hard",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be bewtween 1 and 5"],
      max: [5, "Rating must be bewtween 1 and 5"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must hava a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message:
          "Discount ({VALUE}) can not be greater than the regular price ",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must hava a description summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must hava a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // select false will exclude it from response data
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
}); // virtual properties are not part of the database and cannot be queried on.

////// mongoose's middlewares ////
// 1) document middleware ⬇: runs before and only on .save() and .create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true }); // this refers to the currently processed document
  next();
});

/* // we have access to the saved doc as first arg here
tourSchema.post("save", (doc, next) => {
  console.log(doc);
  next();
});
 */

// 2) Query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

/* 
tourSchema.post(/^find/, (docs, next) => {
  console.log(docs);
  next();
});
 */
// 3) Aggregation Middleware
tourSchema.pre("aggregate", function (next) {
  // this refers to the aggregation here
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

module.exports = mongoose.model("Tour", tourSchema);
