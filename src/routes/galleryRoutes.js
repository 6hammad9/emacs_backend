import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// Base folders
const folders = [
  {
    category: "Unclear",
    dir: "D:/New folder/OCR/detected/unclear",
    urlPrefix: "unclear",
  },
  {
    category: "Whitelisted",
    dir: "D:/New folder/OCR/detected/whitelisted",
    urlPrefix: "whitelisted",
  },
  {
    category: "NotWhitelisted",
    dir: "D:/New folder/OCR/detected/notwhitelisted",
    urlPrefix: "notwhitelisted",
  }
];

router.get("/api/gallery-images", async (req, res) => {
  try {
    const allImages = [];

    for (const folder of folders) {
      if (fs.existsSync(folder.dir)) {
        const files = fs.readdirSync(folder.dir).filter(file =>
          /\.(jpg|jpeg|png|webp)$/i.test(file)
        );

        files.forEach(file => {
          allImages.push({
            category: folder.category,
            filename: file,
            url: `/${folder.urlPrefix}/${file}`
          });
        });
      }
    }

    res.status(200).json(allImages);
  } catch (err) {
    console.error("Error reading gallery images:", err);
    res.status(500).json({ error: "Failed to fetch gallery images" });
  }
});

export default router;
