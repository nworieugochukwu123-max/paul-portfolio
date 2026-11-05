# Paul Portfolio

A modern single-page portfolio website for Paul Nworie Ugochukwu, showcasing frontend development work, resume/CV writing services, and contact details in a sleek interactive design.

## Overview

This project is a personal portfolio built as a static site with HTML, CSS, and JavaScript. It features:

- A cinematic loading screen
- Animated hero section with layered imagery
- Sticky navigation with smooth section scrolling
- Responsive layout for mobile and desktop
- Project highlights for past client work
- Contact section with email form integration
- Dark, futuristic visual design with motion and glassmorphism effects

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Three.js for 3D visual elements
- EmailJS for the contact form
- Font Awesome for icons

## Project Structure

```text
.
├── index.html          # Main page structure and content
├── style.css           # Site styling and animations
├── script.js           # Interactive behavior and animations
├── images/             # Portfolio images and project visuals
├── README.md           # Project documentation
└── .gitignore          # Optional repo ignore settings (if added later)
```

## Features

- Custom animated intro loader
- Parallax and reveal effects across sections
- Three.js-powered hero or project visual backgrounds
- Mobile-friendly navigation menu
- Portfolio cards for services and projects
- CTA buttons and social links
- Contact form wired to EmailJS

## Getting Started

### Option 1: Open directly in a browser

1. Clone the repository.
2. Open `index.html` in your browser.

### Option 2: Run a local web server

From the project root:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Customization

### Personal details
Update the following in [index.html](index.html):

- Name and title text
- About section content
- Project links and descriptions
- Social media URLs
- Email address and contact CTA

### Email form
The contact form uses EmailJS. To make it work for your own email:

1. Create an EmailJS account
2. Set up a service and email template
3. Replace the public key in [index.html](index.html) with your own

Look for:

```html
<script>
  emailjs.init({ publicKey: "-MGqkdJtU0IfAsueo" });
</script>
```

### Images and branding
Add or replace assets in the [images/](images/) folder and update the corresponding `src` paths in [index.html](index.html).

## Deployment

This project is suitable for static hosting on:

- GitHub Pages
- Netlify
- Vercel
- Any simple web host that serves static files

## License

This project is for personal portfolio use. If you plan to reuse or adapt it, please credit the original author and keep branding consistent with your own project.

## Contact

For inquiries or collaboration:

- Email: nworieugochukwu123@gmail.com
- GitHub: https://github.com/nworieugochukwu123-max
- WhatsApp: https://wa.me/2348154681877
