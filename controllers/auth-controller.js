const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user-model");
const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");
const sendEmail = require("../utils/email");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined; // remove password from the responseData

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new AppError("Invalid email or password", 404));

  if (
    user &&
    (await user.correctPassword(password, user.password)) &&
    user.loginWaitTime <= Date.now()
  ) {
    await User.findByIdAndUpdate(user.id, {
      loginAttemptsLeft: 5,
      loginWaitTime: Date.now(),
    });

    return createAndSendToken(user, 200, res);
  }
  if (user.loginWaitTime > Date.now()) {
    const waitTime = (user.loginWaitTime - Date.now()) / 60000;
    return next(
      new AppError(
        `Please wait ${waitTime.toFixed(1)} minutes before trying again.`,
        400
      )
    );
  }

  if (user.loginAttemptsLeft <= 0 && user.loginWaitTime < Date.now()) {
    await User.findByIdAndUpdate(user.id, {
      loginWaitTime: Date.now() + 900000,
      loginAttemptsLeft: 2,
    });
    return next(
      new AppError(
        "You have exceeded max login attempts please wait 15 minutes before trying again.",
        400
      )
    );
  }

  if (user && !(await user.correctPassword(password, user.password))) {
    await User.findByIdAndUpdate(user.id, { $inc: { loginAttemptsLeft: -1 } });
    return next(
      new AppError(
        `Invalid email or password. Login attempts left: ${user.loginAttemptsLeft}`,
        404
      )
    );
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    token = req.headers.authorization.split(" ")[1];

  if (!token) return next(new AppError("Please log in to get access."));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError("User with this token no longer exists.", 404));

  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError("Password was changed recently, please log in again", 401)
    );

  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You are not authorized to perform this operation.", 403)
      );

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("No user found with that email.", 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Want to reset your password? click the link
   ${resetURL}
   to proceed.
   If you have not requested to reset you password , please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to the email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. trya gain later", 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Token is invalid or expired", 400));

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new AppError("Your current password is wrong.", 401));

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();

  createAndSendToken(user, 200, res);
});
