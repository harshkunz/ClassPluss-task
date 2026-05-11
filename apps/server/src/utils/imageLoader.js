const fs = require("fs/promises");

async function loadImageBuffer(source) {
  if (!source) {
    throw new Error("Image source is required");
  }

  if (source.startsWith("data:")) {
    const base64 = source.split(",")[1];
    if (!base64) {
      throw new Error("Invalid data URL");
    }

    return Buffer.from(base64, "base64");
  }

  if (source.startsWith("http://") || source.startsWith("https://")) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  return fs.readFile(source);
}

module.exports = { loadImageBuffer };
