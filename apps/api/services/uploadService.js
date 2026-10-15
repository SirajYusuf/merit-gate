const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
const ALLOWED_EXTENSIONS = new Set(['.md', '.txt', '.markdown']);

const ensureUploadDir = () => {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
};

const sanitizeBaseName = (fileName) => path
  .basename(fileName, path.extname(fileName))
  .replace(/[^a-zA-Z0-9-_]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80) || 'upload';

const makeStoredFileName = (originalName) => {
  const extension = path.extname(originalName).toLowerCase();
  const safeBaseName = sanitizeBaseName(originalName);
  return `${Date.now()}-${safeBaseName}${extension}`;
};

const assertAllowedFileName = (fileName) => {
  const baseName = path.basename(fileName || '');

  if (!baseName || baseName !== fileName) {
    throw new Error('Invalid upload file name');
  }

  const extension = path.extname(baseName).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error('Only .md, .markdown, and .txt uploads are supported');
  }

  return baseName;
};

const getUploadFilePath = (fileName) => {
  const safeFileName = assertAllowedFileName(fileName);
  const filePath = path.join(UPLOAD_DIR, safeFileName);

  if (!filePath.startsWith(UPLOAD_DIR + path.sep)) {
    throw new Error('Invalid upload file path');
  }

  return filePath;
};

const readUploadedTextFile = async (fileName) => {
  const filePath = getUploadFilePath(fileName);
  return fs.promises.readFile(filePath, 'utf8');
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, makeStoredFileName(file.originalname));
  },
});

const uploadProjectFile = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    try {
      assertAllowedFileName(file.originalname);
      cb(null, true);
    } catch (error) {
      cb(error);
    }
  },
});

module.exports = {
  UPLOAD_DIR,
  uploadProjectFile,
  readUploadedTextFile,
};
