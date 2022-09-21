const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  // loginAttemptsLeft: { type: Number, reuired: true, default: 5, select: false },
  // loginWaitTime: {
  //   type: Date,
  //   required: true,
  //   default: Date.now(),
  //   select: false,
  // },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Provide a password, at least 8 characters"],
    minlength: 8,
    select: false, // to exlude it from respond data.
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on create() and save()!!
      validator: function (cnfmPass) {
        return cnfmPass === this.password;
      },
      message: "Passwords do not match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Middlewares

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

userSchema.pre(/^find/, function (next) {
  // in query middleware "this" refers to the current query
  this.find({ active: { $ne: false } });
  next();
});

// creating instance method ⬇ instance method is available on the doc
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
