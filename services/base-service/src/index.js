const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", env: process.env.ENV || "unknown" });
});

app.get("/", (req, res) => {
  res.send("no tstatus ");
});

app.listen(PORT, () => {
  console.log(`Base service running on port ${PORT}`);
});
