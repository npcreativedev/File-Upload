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
    const serverRes = await axios.get("https://api.gofile.io/getServer");
    const server = serverRes.data.data.server;

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
      return res.json({ success: false, message: "GoFile API error" });
    }
  } catch (error) {
    console.error(error);
    fs.unlinkSync(localPath);
    return res.json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

