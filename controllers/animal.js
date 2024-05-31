const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma").prisma;
const logger = require("../lib/logger");
//const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set storage engine
/*
const storage = multer.diskStorage({
  //destination: "./uploads/animals/",
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
  dest: "./uploads/animals/",
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
*/
class AnimalController {
  //-----------------------------------
  //List All Animals
  //-----------------------------------
  static listAnimals = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { name } = req.query;
      let animals;
      if (name) {
        animals = await prisma.animal.findMany({
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
          include: { images: true },
        });
      } else {
        animals = await prisma.animal.findMany({ include: { images: true } });
      }
      return res.status(200).send(JSON.stringify(animals));
    } catch (err) {
      logger.error(err.message);
      return res.status(400).send({ error: err.message });
    }
  };

  //-----------------------------------
  //Get Animal by Id
  //-----------------------------------
  static getAnimalById = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const animal = await prisma.animal.findUnique({
        where: { id: Number(req.params.id) },
        include: { images: true },
      });
      if (animal) {
        return res.status(200).send(JSON.stringify(animal));
      } else {
        return res.status(400).send({ error: "Animal not found" });
      }
    } catch (err) {
      logger.error(err.message);
      return res.status(400).send({ error: err.message });
    }
  };

  //-----------------------------------
  //Create Animal
  //-----------------------------------
  static createAnimal = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    console.log(req.body);
    console.log(req.files);

    const { name } = req.body;
    res.status(201).json({ success: "animal created." + name });
    /*
    try {
      const { name } = req.body;
      const oldAnimal = await prisma.animal.findUnique({
        where: { name: name },
      });
      if (oldAnimal) {
        logger.error("Animal name already exists");
        return res.status(409).send({ error: "Animal already exists." });
      }
      let animal = {
        name,
      };
      const Result = await prisma.animal.create({ data: animal });
      //res.status(201).json({ success: "animal created." + JSON.stringify(Result) });

      //----------------
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
      //----------------
    } catch (err) {
      logger.error(err.message);
      res.status(400).json({ error: err.message });
    }
    */
  };

  //-----------------------------------
  //Delete Animal by Id
  //<FIXME> delete files first, check if id exists
  //-----------------------------------
  static deleteAnimalById = async (req, res) => {
    res.setHeader("Content-Type", "application/json");

    const animal = await prisma.animal.findUnique({
      where: { id: Number(req.params.id) },
      include: { images: true },
    });
    if (animal && animal.images) {
      animal.images.forEach((animal) => {
        fs.unlinkSync("." + animal.location);
      });
    } else {
      return res.status(400).send({ error: "Animal not found" });
    }

    //Remove the table entry.
    try {
      await prisma.animal.delete({
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
  AnimalController,
};
