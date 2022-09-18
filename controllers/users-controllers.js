const User = require("../models/user-model");
const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");

const filterObj = (obj, ...allowedFields) => {
  const filtered = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) filtered[el] = obj[el];
  });

  return filtered;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(
      new AppError(
        'This route is not for password update. Please go to "updateMyPasswrod" to update your password',
        400
      )
    );

  const filteredBody = filterObj(req.body, "name", "email");
  const updateduser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updateduser,
    },
  });
});

exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet implemented" });
};

exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet implemented" });
};

exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet implemented" });
};

exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet implemented" });
};
