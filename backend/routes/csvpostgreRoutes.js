const express = require('express');
const { uploadCsv, downloadCsv } = require('../controllers/csvpostgreController');
const router = express.Router();
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/upload-csv', upload.single('file'), uploadCsv);
router.get('/download-csv', downloadCsv);

module.exports = router;
