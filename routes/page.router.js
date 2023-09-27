const express = require("express");
const router = express.Router();
const pageController = require("../page.controller/page.controller.js");
const middleware = require("../middlewares/mw.js");

router.get("/", middleware.checkUserLoggedIn, pageController.getMainPage);
router.get("/login", middleware.checkUserNotLoggedIn, pageController.getLoginPage)
router.get("/register", middleware.checkUserNotLoggedIn, pageController.getRegisterPage);
router.get("/logout", middleware.checkUserLoggedIn, pageController.getLogoutPage);
router.get("/track", middleware.checkUserLoggedIn, middleware.checkSpotifyConnected, pageController.getTrackPage);

router.get("/auth", middleware.checkUserLoggedIn, middleware.checkSpotifyNotConnected, pageController.getAuthPage);
router.get("/callback", pageController.getCallbackPage);

router.post("/", pageController.postMainPage);
router.post("/register", pageController.postRegisterPage);
router.post("/login", pageController.postLoginPage);
router.post("/set", middleware.checkUserLoggedIn, pageController.postSetOption);




module.exports = router;