const { findByIdAndDelete } = require("../models/tour-model");
const Tour = require("../models/tour-model");

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
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
