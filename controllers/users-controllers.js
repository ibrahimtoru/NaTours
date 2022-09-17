const User = require("../models/user-model");
const catchAsync = require("../utils/catch-async");

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

const createUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet implemented" });
};

const getUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet implemented" });
};

const updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet implemented" });
};

const deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet implemented" });
};

exports.getAllUsers = getAllUsers;
exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
