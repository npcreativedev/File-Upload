const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.post("/upload", upload.single("file"), async (req, res) => {
  const localPath = req.file.path;
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(localPath));

    // ✅ Upload to v2 GoFile API endpoint
    const uploadRes = await axios.post(
      "https://api.gofile.io/v2/uploadFile",
      formData,
      { headers: formData.getHeaders() }
    );

    fs.unlinkSync(localPath); // Clean up uploaded file

    if (uploadRes.data.status === "ok") {
      return res.json({
        success: true,
        link: uploadRes.data.data.downloadPage
      });
    } else {
      return res.json({ success: false, message: "Upload failed." });
    }
  } catch (error) {
    console.error("Upload exception:", error.message);
    fs.unlinkSync(localPath);
    return res.json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
