import express from "express";
import multer from "multer";
import {
  registerPerson,
  getAllPersons,
  updatePerson,
  deletePerson,
} from "../controllers/personController.js";

const router = express.Router();

// Configure multer to store files temporarily
const upload = multer({ dest: "temp_uploads/" });

// Routes
router.post("/", upload.single("image"), registerPerson);
router.get("/", getAllPersons);
router.put("/:id", upload.single("image"), updatePerson); // Update person
router.delete("/:id", deletePerson); // Delete person

export default router;
