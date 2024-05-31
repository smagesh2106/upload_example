const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma").prisma;
const logger = require("../lib/logger");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set storage engine
const storage = multer.diskStorage({
  destination: "./uploads/animals/",
  filename: (req, file, cb) => {
    //cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    cb(null, "Animal-ID" + "-" + req.params.id + "-" + file.originalname);
  },
});

// Initialize upload variable for multiple files
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
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

class AnimalImageController {
  //-----------------------------------
  //List All Animals
  //-----------------------------------
  static listAnimalImages = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { animalId } = Number(req.params.id);
      const oldAnimal = await prisma.animal.findUnique({
        where: { id: animalId },
      });

      if (!oldAnimal) {
        logger.error("Animal not found");
        return res.status(400).send("Animal NOT found.");
      }

      let images = await prisma.animalImage.findMany({
        where: {
          animalId: animalId,
        },
      });
      return res.status(200).send(JSON.stringify(images));
    } catch (err) {
      logger.error(err.message);
      return res.status(400).send({ error: err.message });
    }
  };

  //-----------------------------------
  //Create Animal
  //-----------------------------------
  static uploadAnimalImages = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const oldAnimal = await prisma.animal.findUnique({
        where: { id: Number(req.params.id) },
      });

      if (!oldAnimal) {
        logger.error("Animal NOT found");
        return res.status(400).send("Animal NOT found.");
      }

      upload.array("files", 25)(req, res, async (err) => {
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
            animalId: Number(req.params.id),
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
    } catch (err) {
      logger.error("Database error: " + err.message);
      res.status(400).json({ error: err.message });
    }
  };

  //-----------------------------------
  //Delete Animal by Id
  //-----------------------------------
  static deleteAnimalImageById = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const oldImage = await prisma.animalImage.findUnique({
        where: { id: Number(req.params.id) },
      });

      if (!oldImage) {
        logger.error("Image NOT found");
        return res.status(400).send("Image NOT found.");
      }
      fs.unlinkSync("." + oldImage.location);

      await prisma.animalImage.delete({
        where: { id: Number(req.params.id) },
      });
      return res.status(200).send("success");
    } catch (err) {
      logger.error(err.message);
      return res.status(400).send({ error: err.message });
    }
  };
}

module.exports = {
  AnimalImageController,
};
