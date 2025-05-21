import PersonInfo from "../models/PersonInfo.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const registerPerson = async (req, res) => {
  try {
    const { name, status, cam_id, category } = req.body;
    if (!name || !status || !cam_id) {
      return res.status(400).json({ error: "Name, Status, and Camera ID are required" });
    }

    let imageName = null;
    if (req.file) {
      const fileExt = path.extname(req.file.originalname).toLowerCase(); // Get file extension
      imageName = `${name}${fileExt}`;
      const imagePath = path.join(uploadDir, imageName);

      if (fileExt === ".jpeg" || fileExt === ".jpg") {
        // Just rename the file without converting
        fs.renameSync(req.file.path, imagePath);
      } else {
        // Convert non-JPEG files to JPEG
        await sharp(req.file.path).jpeg({ quality: 80 }).toFile(imagePath);
        fs.unlinkSync(req.file.path); // Delete original file after conversion
      }
    }

    const newPerson = new PersonInfo({
      name,
      cam_id,
      status,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      read_status: 0,
      category: category || null,
      image: imageName,
    });

    await newPerson.save();
    res.status(201).json({ message: "Person registered successfully", person: newPerson });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllPersons = async (req, res) => {
  try {
    const persons = await PersonInfo.find();
    res.status(200).json(persons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, cam_id, category } = req.body;
    const person = await PersonInfo.findById(id);
    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    let imageName = person.image;
    if (req.file) {
      imageName = `${name}.jpeg`;
      const imagePath = path.join(uploadDir, imageName);
      await sharp(req.file.path).jpeg({ quality: 80 }).toFile(imagePath);
      fs.unlinkSync(req.file.path);
    }

    person.name = name || person.name;
    person.status = status || person.status;
    person.cam_id = cam_id || person.cam_id;
    person.category = category || person.category;
    person.image = imageName;

    await person.save();
    res.status(200).json({ message: "Person updated successfully", person });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const person = await PersonInfo.findById(id);
    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    if (person.image) {
      const imagePath = path.join(uploadDir, person.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await PersonInfo.findByIdAndDelete(id);
    res.status(200).json({ message: "Person deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
