const User = require("../models/user-model");
const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");
const factory = require("./handler-factory");

const filterObj = (obj, ...allowedFields) => {
  const filtered = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) filtered[el] = obj[el];
  });

  return filtered;
};

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
  res.status(500).json({
    status: "error",
    message: "This route is not defined. Please use /signup instead.",
  });
};

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

// password cannot be updated with this ⬇
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
