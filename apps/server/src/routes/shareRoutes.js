const express = require("express");
const { renderShareImage, getShare } = require("../controllers/shareController");

const router = express.Router();

router.post("/render", renderShareImage);
router.get("/:shareId", getShare);

module.exports = router;
