const express = require("express");
const router = express.Router();

//controllers
const { createOrUpdateUser, currentUser } = require("../controller/firebase");

//middlwares
const { authCheck, adminCheck } = require("../middlewares/firebase");

router.get("/firebaes", (req, res) => {
  res.json("Hello");
});

router.post("/create-or-update-user", authCheck, createOrUpdateUser);
router.post("/fb/current-user", authCheck, currentUser);
router.post("/fb/current-admin", authCheck, adminCheck, currentUser);

module.exports = router;
