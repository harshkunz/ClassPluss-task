const express = require("express");
const {
  listCategories,
  listTemplates,
  getTemplate,
} = require("../controllers/templateController");

const router = express.Router();

router.get("/categories", listCategories);
router.get("/", listTemplates);
router.get("/:id", getTemplate);

module.exports = router;
