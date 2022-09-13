const Tour = require("../models/tour-model");

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage.price";
  req.query.fields = "name, price, ratingsAverage, summary, difficulty";
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // Build query
    // 1.1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1.2) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(
      queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );

    let query = Tour.find(queryStr);

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // 3) Field limiting / projecting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // e.g page=2&limit=10, 1-10 on page 1, 11-20 on page 2...
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error("Page does not exists.");
    }

    // Execute Query
    const tours = await query;
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: `could not fetch the tours. ${error.message}`,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({ status: "success", data: { tour } });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: `could not fetch the tour. ${error.message}`,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({ status: "fail", message: `Invalid request: ${error.message}` });
  }
  // const newTour = new Tour({})
  // newTour.save()
  // // Tour.create() does the same as above
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true /* to return the modified document */,
      runValidators: true,
    });
    res.status(200).json({ status: "success", data: { tour: updatedTour } });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Could not update the tour. ${error.message}` });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Could not delete the tour. ${error.message}` });
  }
};
