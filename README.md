# FPL Viewer

View your Fantasy Premier League team for the next 5 gameweeks with fixture difficulty and expected points.

## 🎯 Features

- **5 Gameweek Preview**: See your squad lineup for the upcoming gameweeks
- **Expected Points**: Calculated based on fixtures and player form
- **Fixture Difficulty**: Color-coded indicators (green/amber/red)
- **Player Status**: Form, injuries, and availability at a glance
- **Captain & Vice-Captain**: Clear identification of your captain picks
- **Shareable**: Generate images to share your team with friends

## 🚀 Two Ways to Use

### 1. Web App (Standalone)
Simply open `index.html` in your browser or visit the hosted version.

**Usage:**
1. Enter your FPL ID (find it in your FPL URL)
2. Click "View Team"
3. See your squad for the next 5 gameweeks
4. Share via link or download as image

### 2. Chrome Extension (Recommended) ⭐
Get a sidebar preview directly on the FPL website while making transfers!

**Installation:**
1. Navigate to the `/extension` folder
2. Follow the instructions in [extension/README.md](extension/README.md)
3. Load the unpacked extension in Chrome
4. Visit fantasy.premierleague.com and click the "Preview" button

**Extension Benefits:**
- Integrated directly into the FPL website
- No need to enter your ID manually
- Preview your squad while making transfer decisions
- Always accessible via sidebar toggle

## 📁 Project Structure

```
fpl-viewer/
├── index.html          # Standalone web app
├── extension/          # Chrome extension
│   ├── manifest.json
│   ├── content.js
│   ├── sidebar.css
│   ├── icons/
│   └── README.md
└── README.md          # This file
```

## 🎨 What You'll See

- **Squad Value & Bank**: Your current team value and remaining budget
- **Expected Points**: Projected points for your starting XI
- **Injury/Suspension Alerts**: Red/amber dots for player availability
- **Form Indicators**: Green (hot), amber (okay), red (cold)
- **Ownership Badges**: DIFF (<10% owned) and ESS (>50% owned)
- **Fixture Difficulty**: Color-coded opponent matchups

## 🔒 Privacy

Both the web app and extension:
- Use only public FPL API data
- Don't collect or store any personal information
- Process everything locally in your browser
- Don't require any additional authentication

## 🛠️ Development

The project uses:
- Vanilla JavaScript (no frameworks)
- FPL's official API
- Cloudflare R2 for team badge hosting
- Modern CSS with custom properties

## 📝 License

MIT License - Feel free to use, modify, and share!

## 🙏 Credits

- Built for the FPL community
- Data from the official Fantasy Premier League API
- Inspired by the need for better transfer planning tools

## 📞 Support

- **Issues**: Open a GitHub issue
- **Questions**: Check the extension README for detailed troubleshooting
- **Suggestions**: Pull requests welcome!

---

**Tip**: Use the Chrome extension for the best experience when making transfers. Use the web app to share your team with friends!
