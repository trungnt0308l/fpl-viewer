# FPL Squad Preview - Chrome Extension

A Chrome extension that adds a convenient sidebar to the Fantasy Premier League website, allowing you to preview your squad for the next 5 gameweeks while making transfers and managing your team.

## Features

- **5 Gameweek Preview**: See your team lineup for the next 5 gameweeks at a glance
- **Expected Points**: View calculated expected points for each gameweek
- **Fixture Difficulty**: Color-coded fixture difficulty indicators (green = easy, amber = medium, red = hard)
- **Player Status**: Visual indicators for player form, injuries, and availability
- **Captain & Vice-Captain**: Clear badges showing your captain selections
- **Easy Access**: Floating toggle button for quick sidebar access
- **Responsive Design**: Clean, modern UI that integrates seamlessly with the FPL website

## Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download or Clone** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in the top-right corner)
4. **Click "Load unpacked"**
5. **Select the `extension` folder** from this repository
6. The extension should now be installed and active

### Method 2: Create PNG Icons (Optional)

The extension includes an SVG icon. For best results, convert it to PNG:

1. Open `extension/icons/icon.svg` in a browser or vector graphics editor
2. Export/save as PNG in three sizes:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)
3. Save these files in the `extension/icons/` folder

Alternatively, you can use online tools like:
- https://cloudconvert.com/svg-to-png
- https://www.aconvert.com/image/svg-to-png/

Or use ImageMagick from command line:
```bash
cd extension/icons
convert -background none -resize 16x16 icon.svg icon16.png
convert -background none -resize 48x48 icon.svg icon48.png
convert -background none -resize 128x128 icon.svg icon128.png
```

## Usage

1. **Navigate to** [fantasy.premierleague.com](https://fantasy.premierleague.com)
2. **Log in** to your FPL account
3. **Go to your team page** (Pick Team, Transfers, etc.)
4. **Click the "Preview" button** on the right side of the screen
5. **View your squad** for the next 5 gameweeks in the sidebar
6. **Switch between gameweeks** using the tabs at the top
7. **Close the sidebar** by clicking the × button or clicking outside

## How It Works

The extension:
1. Detects when you're on the FPL website
2. Extracts your FPL manager ID from the page
3. Fetches your team data from the FPL API
4. Calculates expected points based on upcoming fixtures
5. Displays your squad in an easy-to-read format

## Features Explained

### Expected Points (EP)
- Calculated using FPL's own expected points data for the next gameweek
- For future gameweeks, estimates are based on points per game and fixture difficulty
- Captain picks are automatically doubled

### Fixture Difficulty
- **Green**: Easy fixture (difficulty ≤ 2)
- **Amber**: Medium fixture (difficulty = 3)
- **Red**: Hard fixture (difficulty ≥ 4)

### Player Indicators
- **C Badge**: Captain
- **V Badge**: Vice-Captain
- **Green Dot**: Hot form (≥ 6.0)
- **Amber Dot**: Okay form (3.0-6.0)
- **Red Dot**: Cold form (< 3.0)
- **Red Status Dot**: Injured or Suspended
- **Amber Status Dot**: Doubtful

## Permissions

The extension requests the following permissions:

- **storage**: To save your preferences
- **fantasy.premierleague.com**: To inject the sidebar and read your team data
- **fpl-proxy.tuantrung.workers.dev**: To fetch FPL data via proxy (helps with CORS)

## Privacy

This extension:
- ✅ Only runs on the FPL website
- ✅ Uses public FPL API endpoints
- ✅ Does not collect or transmit any personal data
- ✅ All data processing happens locally in your browser
- ✅ Does not require any additional accounts or authentication

## Troubleshooting

### Sidebar not showing?
- Make sure you're logged in to FPL
- Navigate to your team page (the extension needs your manager ID)
- Try refreshing the page

### Data not loading?
- Check your internet connection
- The FPL API might be temporarily down (especially during high traffic times)
- Try closing and reopening the sidebar

### Incorrect team showing?
- Make sure you're logged in to the correct FPL account
- The extension reads your team data from the currently logged-in account

## Development

### Project Structure
```
extension/
├── manifest.json       # Extension configuration
├── content.js         # Main extension logic
├── sidebar.css        # Sidebar styles
├── icons/             # Extension icons
│   ├── icon.svg
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

### Debugging
1. Open Chrome DevTools (F12)
2. Check the Console for any errors
3. The extension logs "FPL Squad Preview Extension loaded" when successfully initialized

### Making Changes
1. Edit the files in the `extension/` folder
2. Go to `chrome://extensions/`
3. Click the refresh icon on the FPL Squad Preview extension
4. Reload the FPL website to see your changes

## Credits

- Built for the FPL community
- Data sourced from the official Fantasy Premier League API
- Team badges hosted on Cloudflare R2

## License

MIT License - Feel free to use, modify, and distribute this extension.

## Support

If you encounter any issues or have suggestions:
1. Check the Troubleshooting section above
2. Open an issue on GitHub
3. Make sure you're using the latest version of Chrome

## Changelog

### Version 1.0.0
- Initial release
- 5 gameweek preview
- Expected points calculation
- Fixture difficulty indicators
- Player form and status indicators
- Captain/Vice-Captain badges
- Responsive sidebar design
