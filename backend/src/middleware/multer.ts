import multer, { StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import { config } from "../config/env";

const uploadDir = config.uploadDir;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = uploadDir;
    if (file.fieldname === "profileImage") {
      folder = path.join(uploadDir, "profiles");
    } else if (file.fieldname === "messageMedia") {
      folder = path.join(uploadDir, "messages");
    }

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedMimes.includes(file.mimetype)) {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, WebP allowed"));
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});