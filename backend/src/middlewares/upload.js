import multer from "multer";
import path from "path";
import fs from "fs";

// Define onde os arquivos serão temporariamente armazenados
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/"; // pasta temporária
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Mantém o nome original com timestamp
    const uniqueSuffix = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueSuffix);
  },
});

// Filtro opcional: aceita apenas PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Apenas arquivos PDF são permitidos"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // limite de 20MB
});

export default upload;
