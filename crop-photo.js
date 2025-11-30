const sharp = require('sharp');

// ADJUST THESE VALUES:
const SHIFT_X = 25;    // Positive = face moves RIGHT, Negative = face moves LEFT
const SHIFT_Y = 40;    // Positive = face moves DOWN, Negative = face moves UP
const CROP_SIZE = 1000; // Size of square crop (smaller = more zoomed in)
const CROP_TOP = 150;  // Distance from top of image to start crop

async function cropPhoto() {
    const meta = await sharp('assets/photo.png').metadata();

    // Add padding to allow shifting
    const padding = 200;
    const bgColor = { r: 38, g: 38, b: 46 }; // Match photo background

    const padded = await sharp('assets/photo.png')
        .extend({
            left: padding,
            right: padding,
            top: 0,
            bottom: 0,
            background: bgColor
        })
        .toBuffer();

    const newWidth = meta.width + padding * 2;
    const centerX = Math.floor(newWidth / 2);

    // Apply shifts
    const cropX = Math.max(0, Math.min(centerX - Math.floor(CROP_SIZE / 2) - SHIFT_X, newWidth - CROP_SIZE));
    const cropY = Math.max(0, CROP_TOP - SHIFT_Y);

    await sharp(padded)
        .extract({ left: cropX, top: cropY, width: CROP_SIZE, height: CROP_SIZE })
        .resize(400, 400)
        .toFile('assets/photo-square.png');

    console.log(`Done! SHIFT_X=${SHIFT_X}, SHIFT_Y=${SHIFT_Y}, CROP_SIZE=${CROP_SIZE}`);
}

cropPhoto();
