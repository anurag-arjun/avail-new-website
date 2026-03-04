# Website Localization Process

This document outlines the step-by-step process for localizing pages from availproject.org to work with local assets (fonts, images, scripts).

## Prerequisites

- Local web server running on `http://localhost:3000/`
- Chrome browser with both original and local sites open
- Shared `css/fonts.css` file already created with all font definitions

## Process for Each New Page

### Step 1: Download the HTML File

```bash
curl -s "https://availproject.org/[PAGE_NAME]" -o [PAGE_NAME].html
```

Example: `curl -s "https://availproject.org/nexus" -o nexus.html`

### Step 2: Identify and Download New Images

Extract unique image URLs from the HTML:

```bash
grep -o 'https://framerusercontent.com/images/[^"?]*' [PAGE_NAME].html | sort -u > /tmp/[PAGE_NAME]_image_urls.txt
```

Check which images are new (not already downloaded):

```bash
while IFS= read -r url; do
  filename=$(basename "$url")
  if [ ! -f "images/$filename" ]; then
    echo "$url"
  fi
done < /tmp/[PAGE_NAME]_image_urls.txt > /tmp/[PAGE_NAME]_new_images.txt
```

Download the new images:

```bash
while IFS= read -r url; do
  filename=$(basename "$url")
  curl -s -o "images/$filename" "$url"
  echo "Downloaded: $filename"
done < /tmp/[PAGE_NAME]_new_images.txt
```

### Step 3: Update External URLs to Local Paths

Replace Framer asset URLs with local paths:

```bash
sed -i '' \
  -e 's|https://framerusercontent.com/assets/|fonts/|g' \
  -e 's|https://framerusercontent.com/images/|images/|g' \
  [PAGE_NAME].html
```

### Step 4: Add Fonts CSS Link

Add the shared fonts.css link after the apple-touch-icon line:

```bash
sed -i '' '[LINE_NUMBER]a\
    <link rel="stylesheet" href="css/fonts.css">
' [PAGE_NAME].html
```

Note: Find the correct line number by checking where the apple-touch-icon link is located.

### Step 5: Remove Inline Font Definitions

Remove the inline `<style data-framer-font-css>` block:

```bash
sed -i '' '[START_LINE],[END_LINE]d' [PAGE_NAME].html
```

Note: Identify the start and end line numbers of the font style block first using:
```bash
grep -n '@font-face' [PAGE_NAME].html | head -1  # Start line
grep -n 'Placeholder' [PAGE_NAME].html | tail -1  # End line (approximately)
```

### Step 6: Test the Page

1. Navigate to `http://localhost:3000/[PAGE_NAME].html` in the browser
2. Check network requests to verify:
   - `css/fonts.css` loads successfully (200 or 304 status)
   - All font files load from local `fonts/` directory
   - All images load from local `images/` directory
   - No 404 errors for missing assets

### Step 7: Verify Visual Appearance

Compare the local page with the original to ensure:
- Fonts render correctly
- Images display properly
- Layout matches the original
- No console errors

## Key Points to Remember

1. **Keep original hashed image filenames** - Don't rename them as the HTML references these exact names
2. **Use shared fonts.css** - Never duplicate font definitions in individual HTML files
3. **Font paths in fonts.css use `../fonts/`** - Because the CSS file is in the `css/` subdirectory
4. **Image paths in HTML use `images/`** - Because HTML files are in the root directory
5. **Download only new images** - Check existing images first to avoid redundant downloads
6. **Test immediately** - Verify each page works before moving to the next one

## File Structure

```
availproject.org/
├── index.html              # Homepage (localized)
├── nexus.html              # Nexus page (localized)
├── [other-pages].html      # Additional pages to localize
├── css/
│   ├── fonts.css           # Shared font definitions (69 fonts)
│   └── styles.css          # Other styles
├── fonts/                  # 69 font files with meaningful names
│   ├── Delight-Medium.woff2
│   ├── Inter-Regular-latin.woff2
│   └── ...
├── images/                 # All images with original hashed names
│   ├── fU0bGT9LbVp0sy4WwRkzkeOZuI.png
│   └── ...
└── scripts/
    └── sw.js               # Service worker
```

## Common Issues and Solutions

### Issue: Fonts not loading
- **Check**: Verify `css/fonts.css` link is present in HTML
- **Check**: Ensure font paths in fonts.css use `../fonts/` (relative to css directory)

### Issue: Images showing 404 errors
- **Check**: Verify image filenames match exactly (case-sensitive)
- **Check**: Ensure images are in the `images/` directory
- **Check**: Confirm sed command replaced all `framerusercontent.com/images/` URLs

### Issue: Page layout broken
- **Check**: Ensure inline font style block was removed completely
- **Check**: Verify no accidental deletion of other style blocks
- **Check**: Compare with original page structure

## Next Pages to Localize

- `/nexus/deposits` - Deposits page
- `/da` - Avail DA page
- `/ecosystem` - Ecosystem page
- `/aboutus` - About Us page
- `/whitepaper` - Whitepaper page
- `/brand` - Brand assets page
- `/termsandconditions` - Terms and Conditions page



## Notes

- All font files are already downloaded and renamed with meaningful names
- The `css/fonts.css` file contains all necessary font-face definitions
- Each new page typically adds 20-50 new images
- Process takes approximately 5-10 minutes per page
