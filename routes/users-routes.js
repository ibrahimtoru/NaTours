const express = require("express");

const usersController = require("../controllers/users-controllers");
const authController = require("../controllers/auth-controller");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);
router.get("/me", usersController.getMe, usersController.getUser);
router.patch("/updateMyData", usersController.updateCurrentUser);
router.delete("/deleteMyAccount", usersController.deleteCurrentUser);

router.use(authController.restrictTo("admin"));

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
