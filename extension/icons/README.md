# Extension Icons

## Creating PNG Icons from SVG

The extension uses `icon.svg` as the source. To create PNG versions:

### Option 1: Online Converter
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Convert to PNG
4. Download and resize to create:
   - `icon16.png` (16x16)
   - `icon48.png` (48x48)
   - `icon128.png` (128x128)

### Option 2: ImageMagick (Command Line)
```bash
# Install ImageMagick first if you don't have it
# macOS: brew install imagemagick
# Ubuntu: sudo apt install imagemagick

# Then run:
convert -background none -resize 16x16 icon.svg icon16.png
convert -background none -resize 48x48 icon.svg icon48.png
convert -background none -resize 128x128 icon.svg icon128.png
```

### Option 3: Inkscape
1. Open `icon.svg` in Inkscape
2. File → Export PNG Image
3. Export at 16x16, 48x48, and 128x128 sizes

### Option 4: Browser Method
1. Open `icon.svg` in Chrome
2. Right-click → Inspect
3. In DevTools Console, paste and run:
```javascript
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, size, size);
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `icon${size}.png`;
      a.click();
    });
  };
  img.src = 'icon.svg';
});
```

## Note

The extension will work without PNG icons, but Chrome will show a warning. The SVG icon provides the design that can be converted to PNG format.
