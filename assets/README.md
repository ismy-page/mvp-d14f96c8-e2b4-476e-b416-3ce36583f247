# Assets folder

This folder is reserved for **static assets only**, such as:

- Images (PNG, JPG, SVG, WEBP, GIF)
- Fonts (WOFF, WOFF2, TTF, OTF, EOT)
- Icons or small media files

Rules:
- No scripts or executable files.
- Assets must be referenced locally from `index.html` or `style.css`.
- Keep file sizes reasonable to ensure fast load times.

Example usage:

### HTML
```html
<img src="./assets/hero.png" alt="Hero image">
```

### CSS
```css
@font-face {
  font-family: "MyFont";
  src: url("./assets/myfont.woff2") format("woff2");
}
```