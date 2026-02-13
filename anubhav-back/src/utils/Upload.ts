import express from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const UPLOAD_PATH = path.join(__dirname, "image");

const storage = multer.diskStorage({
  destination: UPLOAD_PATH,
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});


router.post(
  "/upload",
  upload.single("image"),
  (req: express.Request, res: express.Response): void => {
    try {
      if (!req.file) {
        return 
        res.status(400).json({
          success: false,
          error: "Invalid file upload. Only images (JPEG, PNG, GIF, WEBP) under 5MB are allowed",
        });
      }

      res.status(201).json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          filename: req.file.filename,
          path: `/uploads/image/${req.file.filename}`,
          size: req.file.size,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "An unexpected error occurred during file upload.",
      });
    }
  }
);
export { router as uploadRouter };
