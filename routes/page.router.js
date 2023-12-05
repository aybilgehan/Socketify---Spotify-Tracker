const express = require("express");
const router = express.Router();
const pageController = require("../page.controller/page.controller.js");
const middleware = require("../middlewares/mw.js");


router.get("/", pageController.getMainPage);
router.get("/dashboard", middleware.checkUserLoggedIn, pageController.getDashboardPage);
router.get("/login", middleware.checkUserNotLoggedIn, pageController.getLoginPage)
router.get("/register", middleware.checkUserNotLoggedIn, pageController.getRegisterPage);
router.get("/logout", middleware.checkUserLoggedIn, pageController.getLogoutPage);
router.get("/track/:trackID", pageController.getTrackPage)

router.get("/callback", pageController.getCallbackPage);
router.get("/refreshURL", middleware.checkUserLoggedIn, middleware.checkSpotifyConnected, pageController.refreshURL);

router.post("/register", pageController.postRegisterPage);
router.post("/login", pageController.postLoginPage);
router.post("/auth", middleware.checkUserLoggedIn, middleware.checkSpotifyNotConnected, pageController.postSpotifyCredentials ,pageController.getAuthPage);





module.exports = router;