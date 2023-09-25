const express = require("express");
const router = express.Router();
const pageController = require("../page.controller/page.controller.js");

router.get("/",pageController.getMainPage);
router.get("/login", pageController.getLoginPage)
router.get("/register", pageController.getRegisterPage);
router.get("/logout", pageController.getLogoutPage);


router.post("/", pageController.postMainPage);
router.post("/register", pageController.postRegisterPage);




module.exports = router;