# NanoT8r

**NanoT8r** is a powerful, intuitive browser extension that lets you visually customize any website. Hide, resize, restyle, and annotate elements with a point-and-click interface—no coding required!

---

## ✨ Features

- **Point-and-Click Customization:** Select any element on a page to hide, resize, or restyle it instantly.
- **Mini Toolbar:** Floating, draggable toolbar with Undo/Redo, Hide, Resize, Style, and Close options.
- **Style Popup:** Beautiful, modern UI for changing background color, text color, font size, and font family.
- **Dark Mode:**
  - **Extension Dark Mode:** Toggle dark mode for the extension's overlays and toolbars.
  - **Website Dark Mode:** Toggle dark mode for the entire website content.
- **Undo/Redo:** Instantly revert or re-apply your last actions from the popup or toolbar.
- **Remove All Customizations:** Restore the page to its original state and clear your history.
- **Draggable Toolbar:** Move the toolbar anywhere on the page for convenience.
- **Modern UI:** Clean, animated, and accessible design throughout.

---

## 🛠️ How to Use

1. **Click the NanoT8r icon** in your browser toolbar.
2. **Activate Element Selector** from the popup.
3. **Click any element** on the page to bring up the mini-toolbar.
4. **Use the toolbar** to hide, resize, style, or undo/redo changes.
5. **Use the popup** to toggle dark mode, undo/redo, or remove all customizations.

---

## 🎨 Customization & Dark Mode
- **Extension Dark Mode:** Affects only the extension's overlays and toolbars.
- **Website Dark Mode:** Applies a dark theme to the entire page content.
- **Both can be toggled independently from the popup.**

---

## ⏪ Undo/Redo
- Undo and redo your last actions from the popup or the mini-toolbar.
- Remove all customizations to restore the page and clear your history.

---

## 🖼️ Icons
- Uses a custom cursor + magic sparkle icon for all sizes (16, 32, 48, 128).
- You can replace the icons in the `icons/` directory with your own PNGs.

---

## 🌐 Compatibility
- **Chrome, Edge, Brave:** Fully supported (Manifest V3).
- **Firefox:** Supported (Manifest V3, minor tweaks may be needed).

---

## 📥 Download
- [Get NanoT8r from the Chrome Web Store](https://chrome.google.com/webstore/detail/nanot8r/your-extension-id)
- [Get NanoT8r from Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/nanot8r/your-extension-id)
- [Get NanoT8r from Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/nanot8r/)

  *(Replace the above links with your actual store listing URLs after publishing!)*

---

## 🚀 Deployment Steps

### Chrome Web Store
1. Zip the contents of your extension directory (not the directory itself).
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
3. Click **Add new item** and upload your ZIP file.
4. Fill out the listing, upload icons/screenshots, and submit for review.

### Edge Add-ons
1. Use the same ZIP file as for Chrome.
2. Go to [Microsoft Partner Center](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview).
3. Click **+ New extension** and upload your ZIP.
4. Fill out the listing and submit for review.

### Firefox Add-ons
1. Use the same ZIP file (Manifest V3 is supported, but check for compatibility).
2. Go to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/en-US/developers/).
3. Click **Submit a New Add-on** and upload your ZIP.
4. Fill out the listing and submit for review.

---

## 🧪 Manual Testing in Developer Mode

### Chrome, Edge, Brave
1. Go to `chrome://extensions/` (or `edge://extensions/`).
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select your extension directory.
4. The NanoT8r icon will appear in your toolbar for testing.

### Firefox
1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select the `manifest.json` file from your extension directory.
4. The NanoT8r icon will appear in your toolbar for testing.

---

## 📝 License
MIT

---

## 🙌 Credits
- Inspired by user feedback and the need for granular, visual web customization.
- Icon based on a cursor + magic sparkle concept.

---

## 💡 Suggestions & Issues
Feel free to open an issue or pull request for suggestions, bug reports, or contributions! 