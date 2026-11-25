# Aboobacker Sideeqe Portfolio

A premium, responsive personal portfolio website for **Aboobacker Sideeqe** — Digital Marketer, Graphic Designer, and Video Editor.

## Project Structure

```text
.
├── index.html                  # Main website markup
├── css/
│   └── styles.css              # Theme, layout, responsive styles, animations
├── js/
│   └── main.js                 # Navigation, modals, filters, form, GSAP animations
├── assets/
│   ├── images/
│   │   └── profile-placeholder.svg  # Replace with real profile photo
│   └── videos/                 # Optional local video files
└── README.md
```

## Profile Photo

The uploaded profile photo file in the workspace was empty/unreadable (`aboobacker sideeqe`, 0 bytes), so a premium placeholder is used.

**To use the real profile photo:**
1. Add your photo to `assets/images/` (recommended name: `aboobacker-sideeqe.jpg`).
2. In `index.html`, replace `assets/images/profile-placeholder.svg` with your photo path in both hero and about image `src` attributes.

## Adding Real Projects

### Graphic Design
- Replace gallery/work image `src` URLs in `index.html`.
- Update `data-lightbox`, `data-title`, and `data-cat` attributes for modal previews.

### Video Editing
- Add `data-video-src="assets/videos/your-video.mp4"` to a `.video-card__play` or `.work-card__play` button for local videos.
- Or use an embeddable YouTube/Vimeo URL in `data-video-src`.

## Contact

- WhatsApp: +91 7902392766
- WhatsApp link opens with prefilled project message.
- Contact form opens WhatsApp with the entered name, email, and message (no fake email backend).
- Email and social links are placeholders — replace with real URLs.

## Tech

- HTML5, CSS3, JavaScript
- GSAP + ScrollTrigger (CDN)
- Lucide icons (CDN)
- Google Fonts (Sora, Inter)

## Run Locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
# Example (if Python is installed)
python -m http.server 8080
```

Then visit `http://localhost:8080`.