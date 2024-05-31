const express = require("express");
const router = express.Router();

router.use("/animal", require("./animal"));
router.use("/animal_image", require("./animal_image"));
module.exports = router;
