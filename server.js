const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const gofileRes = await axios.post(
      "https://api.gofile.io/v2/uploadFile",
      formData,
      {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    fs.unlinkSync(filePath); // cleanup

    const { data } = gofileRes;
    if (data.status === "ok") {
      res.json({ success: true, link: data.data.downloadPage });
    } else {
      res.json({ success: false, message: data.status });
    }
  } catch (err) {
    console.error("Upload error:", err.message);
    fs.unlinkSync(filePath);
    res.json({ success: false, message: "Upload failed. Try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
