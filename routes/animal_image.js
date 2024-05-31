const express = require("express");
const router = express.Router();

const animalImageController = require("../controllers/animal_image").AnimalImageController;

router.get("/", animalImageController.listAnimalImages);
router.post("/:id", animalImageController.uploadAnimalImages);
router.delete("/:id", animalImageController.deleteAnimalImageById);

module.exports = router;
