// import PersonInfo from "../models/PersonInfo.js";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import sharp from "sharp";

// // Define __dirname for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const uploadDir = path.join(__dirname, "../../uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// export const registerPerson = async (req, res) => {
//   try {
//     const { name, status, cam_id, category } = req.body;
//     if (!name || !status || !cam_id) {
//       return res.status(400).json({ error: "Name, Status, and Camera ID are required" });
//     }

//     let imageName = null;
//     if (req.file) {
//       const fileExt = path.extname(req.file.originalname).toLowerCase(); // Get file extension
//       imageName = `${name}${fileExt}`;
//       const imagePath = path.join(uploadDir, imageName);

//       if (fileExt === ".jpeg" || fileExt === ".jpg") {
//         // Just rename the file without converting
//         fs.renameSync(req.file.path, imagePath);
//       } else {
//         // Convert non-JPEG files to JPEG
//         await sharp(req.file.path).jpeg({ quality: 80 }).toFile(imagePath);
//         fs.unlinkSync(req.file.path); // Delete original file after conversion
//       }
//     }

//     const newPerson = new PersonInfo({
//       name,
//       cam_id,
//       status,
//       color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
//       read_status: 0,
//       category: category || null,
//       image: imageName,
//     });

//     await newPerson.save();
//     res.status(201).json({ message: "Person registered successfully", person: newPerson });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getAllPersons = async (req, res) => {
//   try {
//     const persons = await PersonInfo.find();
//     res.status(200).json(persons);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const updatePerson = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, status, cam_id, category } = req.body;
//     const person = await PersonInfo.findById(id);
//     if (!person) {
//       return res.status(404).json({ error: "Person not found" });
//     }

//     let imageName = person.image;
//     if (req.file) {
//       imageName = `${name}.jpeg`;
//       const imagePath = path.join(uploadDir, imageName);
//       await sharp(req.file.path).jpeg({ quality: 80 }).toFile(imagePath);
//       fs.unlinkSync(req.file.path);
//     }

//     person.name = name || person.name;
//     person.status = status || person.status;
//     person.cam_id = cam_id || person.cam_id;
//     person.category = category || person.category;
//     person.image = imageName;

//     await person.save();
//     res.status(200).json({ message: "Person updated successfully", person });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const deletePerson = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const person = await PersonInfo.findById(id);
//     if (!person) {
//       return res.status(404).json({ error: "Person not found" });
//     }

//     if (person.image) {
//       const imagePath = path.join(uploadDir, person.image);
//       if (fs.existsSync(imagePath)) {
//         fs.unlinkSync(imagePath);
//       }
//     }

//     await PersonInfo.findByIdAndDelete(id);
//     res.status(200).json({ message: "Person deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
import PersonInfo from "../models/PersonInfo.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { exec } from "child_process";

// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import WhitelistedPictures from "../models/WhitelistedPictures.js"; 
// Absolute paths (customized for your project)
const uploadDir = path.join(__dirname, "../../uploads");
const whitelistDir = "D:/New folder/OCR/whitelisted";
const metadataPath = "D:/New folder/OCR/metadata.json";
const pythonPath = "D:/New folder/OCR/update_embedding.py";

// Ensure folders exist
[uploadDir, whitelistDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Update metadata.json
function updateMetadata(name, cam_id, imagePath) {
  let metadata = {};
  if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath));
  }

  if (!metadata[name]) {
    metadata[name] = {
      image: imagePath,
      cameras: [cam_id],
      status: "whitelisted",
    };
  } else {
    if (!metadata[name].cameras.includes(cam_id)) {
      metadata[name].cameras.push(cam_id);
    }
    metadata[name].image = imagePath;
    metadata[name].status = "whitelisted";
  }

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

// Remove from metadata.json
function removeFromMetadata(name) {
  if (fs.existsSync(metadataPath)) {
    let metadataRaw = fs.readFileSync(metadataPath, "utf-8");
    if (!metadataRaw.trim()) {
      console.warn("⚠️ metadata.json is empty. Skipping removal.");
      return;
    }

    let metadata;
    try {
      metadata = JSON.parse(metadataRaw);
    } catch (err) {
      console.error("❌ Failed to parse metadata.json:", err.message);
      return;
    }

    if (metadata[name]) {
      delete metadata[name];
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    }
  }
}

// Run embedding update via Python
function updateEmbedding(name, imagePath) {
  const command = `python "${pythonPath}" "${name}" "${imagePath}"`;
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error updating embedding:", stderr);
    } else {
      console.log("✅ Embedding updated:", stdout.trim());
    }
  });
}

// Register person
export const registerPerson = async (req, res) => {
  try {
    const { name, status, cam_id, category } = req.body;

    if (!name || !status || !cam_id) {
      return res.status(400).json({ error: "Name, Status, and Camera ID are required" });
    }

    let imageName = null;
    let whitelistImagePath = null;
    let uploadPath = null;

    if (req.file) {
      imageName = `${name}.jpg`;
      uploadPath = path.join(uploadDir, imageName);
      whitelistImagePath = path.join(whitelistDir, imageName);

      // Save to uploads
      await sharp(req.file.path).jpeg({ quality: 80 }).toFile(uploadPath);
      console.log("✅ Image saved to uploads:", uploadPath);

      // Copy to whitelisted
      await fs.promises.copyFile(uploadPath, whitelistImagePath);
      console.log("✅ Image copied to whitelisted:", whitelistImagePath);

      // Delete temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn("⚠️ Could not delete temp upload:", err.message);
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
    console.log("✅ Person saved to MongoDB");

    // Save DB record for whitelist image
    if (imageName && whitelistImagePath) {
      try {
        const pictureRecord = new WhitelistedPictures({
          person: newPerson._id,
          filepath: whitelistImagePath.replace(/\\/g, "/"),
        });
        await pictureRecord.save();
        console.log("✅ WhitelistedPictures entry saved.");
      } catch (err) {
        console.error("❌ Failed to save WhitelistedPictures:", err.message);
      }
    }

    // Send success response *before* running metadata & embedding
    res.status(201).json({ message: "✅ Person registered", person: newPerson });

    // === Non-blocking background update ===
    if (imageName && whitelistImagePath) {
      try {
        updateMetadata(name, cam_id, `OCR/whitelisted/${imageName}`);
        console.log("✅ Metadata updated");

        const scriptPath = `"D:/New folder/OCR/update_embedding.py"`;
        const cmd = `python ${scriptPath} "${name}" "${path.resolve(whitelistImagePath)}"`;

        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            console.error("❌ Embedding generation error:", stderr || error.message);
          } else {
            console.log("✅ Embedding generated:", stdout.trim());
          }
        });
      } catch (err) {
        console.error("❌ Metadata/embedding background update failed:", err.message);
      }
    }
  } catch (error) {
    console.error("❌ Registration failed:", error.message);
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
    let whitelistImagePath = null;

    if (req.file) {
      imageName = `${name}.jpg`;
      const uploadPath = path.join(uploadDir, imageName);
      whitelistImagePath = path.join(whitelistDir, imageName);

      // Delete old images if they exist
      if (person.image) {
        const oldUploadPath = path.join(uploadDir, person.image);
        const oldWhitelistPath = path.join(whitelistDir, person.image);
        try { if (fs.existsSync(oldUploadPath)) fs.unlinkSync(oldUploadPath); } catch (err) { console.warn("⚠️ Couldn't delete old upload:", err.message); }
        try { if (fs.existsSync(oldWhitelistPath)) fs.unlinkSync(oldWhitelistPath); } catch (err) { console.warn("⚠️ Couldn't delete old whitelist:", err.message); }
      }

      await sharp(req.file.path).jpeg({ quality: 80 }).toFile(uploadPath);
      fs.copyFileSync(uploadPath, whitelistImagePath);
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn("⚠️ Could not delete temp upload:", err.message);
      }
    }

    person.name = name || person.name;
    person.status = status || person.status;
    person.cam_id = cam_id || person.cam_id;
    person.category = category || person.category;
    person.image = imageName;

    await person.save();

    // Update metadata and embedding if image was changed
    if (req.file && imageName) {
  updateMetadata(person.name, person.cam_id, `OCR/whitelisted/${imageName}`);
  updateEmbedding(person.name, whitelistImagePath);

  // Update WhitelistedPictures (delete old, add new)
  await WhitelistedPictures.deleteMany({ person: person._id });
  const pictureRecord = new WhitelistedPictures({
    person: person._id,
    filepath: whitelistImagePath.replace(/\\/g, "/"),
  });
  await pictureRecord.save();
  console.log("✅ WhitelistedPictures updated.");
}

    res.status(200).json({ message: "✅ Person updated successfully", person });
  } catch (error) {
    console.error("❌ Update failed:", error);
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

    // Delete associated images
    if (person.image) {
      const uploadPath = path.join(uploadDir, person.image);
      const whitelistPath = path.join(whitelistDir, person.image);
      try { if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath); } catch (err) { console.warn("⚠️ Couldn’t delete uploaded image:", err.message); }
      try { if (fs.existsSync(whitelistPath)) fs.unlinkSync(whitelistPath); } catch (err) { console.warn("⚠️ Couldn’t delete whitelist image:", err.message); }
    }

    // Remove from metadata
    removeFromMetadata(person.name);

    await PersonInfo.findByIdAndDelete(id);
    await WhitelistedPictures.deleteMany({ person: id });
console.log("🗑️ WhitelistedPictures records deleted.");
    res.status(200).json({ message: "✅ Person deleted successfully" });
  } catch (error) {
    console.error("❌ Deletion failed:", error);
    res.status(500).json({ error: error.message });
  }
};
export const getPersonWithPictures = async (req, res) => {
  try {
    const { id } = req.params;
    const person = await PersonInfo.findById(id);
    if (!person) return res.status(404).json({ error: "Person not found" });

    const pictures = await WhitelistedPictures.find({ person: id });

    res.status(200).json({ person, pictures });
  } catch (err) {
    console.error("❌ Failed to fetch person & pictures:", err);
    res.status(500).json({ error: err.message });
  }
};
// in personController.js
export const getAllPersonsWithPictures = async (req, res) => {
  try {
    const persons = await PersonInfo.find();

    const result = await Promise.all(
      persons.map(async (person) => {
        const pics = await WhitelistedPictures.find({ person: person._id });
        return {
          name: person.name,
          imagePaths: pics.map(p => p.filepath)
        };
      })
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
