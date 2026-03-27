import multer from "multer";
import path from "path";
import fs from "fs";

const tempUploadDir = path.resolve("public/temp");

if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

// storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("DEBUG - Multer Destination Called for:", file.fieldname);
    cb(null, tempUploadDir); // yahan file temporarily save hogi
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

// file filter (optional but recommended)
export const uploadImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"), false);
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export const uploadVideo = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/") || file.mimetype.startsWith("image/"))
      cb(null, true);
    else cb(new Error("Only video or image files allowed"), false);
  },
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max for video
});


// multer middleware
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
