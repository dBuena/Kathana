# KathanaDB - Unified Tantra K3 Database Search

A questlog.gg-inspired database search interface for Tantra K3. Unified search for items, monsters, and NPCs with a modern dark theme.

## Quick Start

1. **Open the Interface**
   - Open `index.html` in your browser
   - Or serve with Python: `python -m http.server 8000`
   - Then navigate to `http://localhost:8000`

2. **Search**
   - Enter 3+ characters in the search box
   - Results appear in real-time
   - Click any result to see details

3. **Keyboard Shortcuts**
   - `Ctrl+K` - Focus search box
   - `Esc` - Close detail modal

## Features

✅ **Unified Search** - Items, Monsters, NPCs all in one place
✅ **Real-time Results** - Instant results as you type (debounced for performance)
✅ **Dark Theme** - questlog.gg-inspired modern UI
✅ **Multi-language** - Support for multiple item names (Korean, Chinese, Philippine, etc.)
✅ **Detail Modal** - Click any result for full information
✅ **Responsive** - Works on desktop, tablet, and mobile
✅ **Zero Backend** - Pure HTML/CSS/JavaScript (no server required!)

## File Structure

```
KathanaDB/
├── index.html              # Main interface
├── TantraParam.xml         # Item/Monster/NPC database (auto-loaded)
├── css/
│   └── style.css          # Questlog.gg-inspired dark theme
├── js/
│   ├── xml-parser.js      # XML parser for TantraParam.xml
│   └── app.js             # Search logic and UI interactions
├── HTS_ITEMGRP.json       # Loot group mappings
├── IconMap.json           # Icon mappings
├── IconID.json            # Icon ID reference
├── ItemMapping.json       # Item type corrections
└── ItemType.json          # Item type names
```

## How It Works

1. **Page Load**
   - `xml-parser.js` fetches and parses `TantraParam.xml`
   - Extracts Item, Monster, and NPC data
   - Indexes data for fast searching

2. **Search**
   - User types in search box (min 3 chars)
   - Input debounced for performance (300ms)
   - Results filtered by name and ID
   - Results grouped by type (Items, Monsters, NPCs)

3. **Detail View**
   - Click any result card
   - Modal shows full details
   - Supports all available languages
   - Close with button or Esc key

## Data Source

- **TantraParam.xml**: Master database file (22 MB)
  - Item worksheet: 2,133+ items with 75 columns each
  - Monster worksheet: 814+ monsters with stats and drops
  - NPC worksheet: 312+ NPCs with location data

## Supported Languages

- 🇵🇭 Philippine (Default)
- 🇰🇷 Korean
- 🇨🇳 Chinese
- 🇮🇩 Indonesian
- 🇯🇵 Japanese
- 🇹🇼 Taiwan
- 🇲🇽 Mexico

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 12+
- Mobile browsers (iOS Safari, Chrome Mobile)

## No Installation Required!

This is a **pure static file interface** - no Node.js, npm, or backend server needed. Just open `index.html` in your browser!

### Optional: Use Python Server (for better compatibility)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

## Performance Notes

- XML parsing happens once on page load (~2-3 seconds)
- Search uses client-side filtering (instant results)
- Results limited to 50 per category
- Debounced input reduces unnecessary processing

## Technical Stack

- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Data Format**: Excel XML (TantraParam.xml)
- **Styling**: Modern dark theme with CSS Grid/Flexbox
- **No Dependencies**: Zero external JavaScript libraries

## Troubleshooting

### "Unable to load database files"
- Ensure TantraParam.xml is in the same directory as index.html
- Check browser console for specific error messages

### Slow initial load
- TantraParam.xml is 22 MB - parsing takes 2-3 seconds on first load
- Results are cached in memory for instant subsequent searches

### Data not updating
- Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

## Created With ❤️

A modern unified database interface for the Tantra K3 community.
