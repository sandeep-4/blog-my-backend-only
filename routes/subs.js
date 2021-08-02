const express = require("express");
const router = express.Router();

const { create, read, list, update, remove } = require("../controller/subs");
const { isAuthenticated, isAdmin } = require("../middlewares/auth");

router.post("/sub", isAuthenticated, isAdmin, create);
router.get("/subs", list);
router.get("/sub/:slug", read);
router.put("/sub/:slug", isAuthenticated, isAdmin, update);
router.delete("/sub/:slug", isAuthenticated, isAdmin, remove);

module.exports = router;
