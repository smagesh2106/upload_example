const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: "./uploads/animals/",
  filename: (req, file, cb) => {
    //cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    cb(null, "Animal-ID" + "-" + req.params.id + "-" + file.originalname);
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed file types
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// Initialize upload variable for multiple files
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

const uploadMiddleWare = (req, res, next) => {
  console.log("from middleware body = " + JSON.stringify(req.body));
  console.log("from middleware files = " + JSON.stringify(req.files));
  //upload.array("files", 25)(req, res, async (err) => {
  upload.any()(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ message: err });
    }
    if (req.files === undefined) {
      return res.status(400).send({ message: "No files selected!" });
    }
    try {
      const files = req.files.map((file) => ({
        name: file.filename,
        location: `/uploads/animals/${file.filename}`,
        //animalId: Number(req.params.id),
        animalId: Number(Result.id),
      }));

      const createdFiles = await prisma.animalImage.createMany({
        data: files,
      });

      res.send({
        message: "Files uploaded and database updated!",
        files: createdFiles,
      });
    } catch (dbError) {
      logger.error("Database error: " + dbError.message);
      res.status(400).send({ message: "Database error", error: dbError.message });
    }
  });
  next();
};

const animalController = require("../controllers/animal").AnimalController;

router.get("/", animalController.listAnimals);
router.get("/:id", animalController.getAnimalById);
router.post("/", uploadMiddleWare, animalController.createAnimal);
router.delete("/:id", animalController.deleteAnimalById);

module.exports = router;
