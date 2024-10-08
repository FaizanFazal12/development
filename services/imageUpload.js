const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const Image = require('../models/Image');

/**
 * Function to save an image in a folder based on its category name, save its details to the database, and get its size.
 * @param {String} categoryName - The category name under which the image will be saved.
 * @param {String} imageData - The image data (e.g., base64 data, file buffer).
 * @returns {Promise<String>} - Returns a promise that resolves to the URL where the image is saved.
 */
async function saveImage(categoryName, imageData) {
  const imagePath = path.join(__dirname, '../storage/files');

  // Get current date and time
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const timestamp = now.getTime().toString();

  const directory = path.join(imagePath, categoryName, year, month);

  try {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const matches = imageData.match(/^data:image\/([A-Za-z]+);base64,/);
    if (!matches || matches.length < 2) {
      throw new Error('Invalid image data format');
      // return;
    }
    const imageExtension = matches[1];

    const filename = `${timestamp}.${imageExtension}`;

    const imagePath = path.join(directory, filename);

    const imageBuffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    await fs.promises.writeFile(imagePath, imageBuffer);

    // Get the dimensions (size) of the image
    const dimensions = sizeOf(imagePath);

    const image = new Image({
      size: `${dimensions.width}x${dimensions.height}`,
      extension: imageExtension,
      uploaded: now,
      url: imagePath,
      category_name: categoryName,
    });

    await image.save();
    // let url = window.location.host;
    // const imageUrl = `${host}/storage/files/${categoryName}/${year}/${month}/${filename}`;
    const imageUrl = `/storage/files/${categoryName}/${year}/${month}/${filename}`;

    return imageUrl;
  } catch (error) {
    console.log('Error saving image:', error);
    throw error;
  }
}

module.exports = saveImage;