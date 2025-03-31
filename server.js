const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.post("/upload", upload.single("file"), async (req, res) => {
  const localPath = req.file.path;
  try {
    // Step 1: Get the best GoFile server
    const serverRes = await axios.get("https://api.gofile.io/v2/getServer");
    const server = serverRes.data.data.server;

    if (!server) {
      console.error("Failed to fetch GoFile server.");
      return res.json({ success: false, message: "Could not get upload server. Try again later." });
    }

    // Step 2: Upload file to GoFile
    const formData = new FormData();
    formData.append("file", fs.createReadStream(localPath));

    const uploadRes = await axios.post(
      `https://${server}.gofile.io/uploadFile`,
      formData,
      { headers: formData.getHeaders() }
    );

    fs.unlinkSync(localPath); // Cleanup local file

    if (uploadRes.data.status === "ok") {
      return res.json({
        success: true,
        link: uploadRes.data.data.downloadPage
      });
    } else {
      console.error("GoFile upload error response:", uploadRes.data);
      return res.json({ success: false, message: "Upload failed. Please try again." });
    }
  } catch (error) {
    console.error("Upload exception:", error.message);
    fs.unlinkSync(localPath);
    return res.json({ success: false, message: "An error occurred during upload." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
