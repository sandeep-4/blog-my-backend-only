const express = require("express");

const router = express.Router();

const {
  createCategory,
  list,
  read,
  update,
  remove,
  getSubs,
} = require("../controller/category");
const { isAuthenticated, isAdmin } = require("../middlewares/auth");

router.post("/category", isAuthenticated, isAdmin, createCategory);
router.get("/categories", list);
router.get("/category/:slug", read);
router.put("/category/:slug", isAuthenticated, isAdmin, update);
router.delete("/category/:slug", isAuthenticated, isAdmin, remove);

router.get("/category/subs/:_id", getSubs);
module.exports = router;
