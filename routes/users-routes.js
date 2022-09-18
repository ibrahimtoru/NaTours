const express = require("express");

const usersController = require("../controllers/users-controllers");
const authController = require("../controllers/auth-controller");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.patch(
  "/updateMyData",
  authController.protect,
  usersController.updateCurrentUser
);

router.delete(
  "/deleteMyAccount",
  authController.protect,
  usersController.deleteCurrentUser
);

router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createUser);

router
  .route("/:id")
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
