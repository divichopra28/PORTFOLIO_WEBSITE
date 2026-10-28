# Divi Chopra · Full-Stack & AI Developer Portfolio

A personal portfolio site in plain HTML, CSS and JavaScript, with no framework and no build step. It uses a warm beige and brown editorial design, has light and dark themes, and runs scroll-driven animations. It deploys as-is on GitHub Pages.

## Features
- **Sections:** Home → About → Skills → Projects → Experience → Achievements → Contact
- **Themes:** light ("Latte") and dark ("Espresso"). The site follows your system setting by default, and your choice is remembered in `localStorage`. Switching themes plays a circular reveal (View Transitions API), with a fade in browsers that don't support it.
- **Animations:** preloader, hero text reveal, rotating role text, drifting gradient blobs, a custom cursor, magnetic buttons, project-card tilt, a skills marquee, a self-drawing experience timeline, count-up stats and a back-to-top ring. They use GSAP + ScrollTrigger, with Lenis for smooth scrolling.
- **Accessibility:** if you set `prefers-reduced-motion: reduce`, the animations are turned off or simplified. Everything stays visible if JavaScript or the CDNs fail to load.
- **Contact form:** posts to Formspree with `fetch()`. It validates fields inline and shows a loading → success state on the button.

## Tech Stack
- HTML, CSS, JavaScript
- [GSAP 3](https://gsap.com/) + ScrollTrigger and [Lenis](https://lenis.darkroom.engineering/), loaded from CDNs (pinned versions)
- Google Fonts: Fraunces, Manrope, JetBrains Mono
- [Devicon](https://devicon.dev/) skill logos

## Project Structure
```
.
├── index.html          # Page markup
├── styles.css          # All styles (theme variables at the top)
├── script.js           # Interactions and animations
├── README.md
├── Task-img1.jpeg      # (unused) old profile photo
├── Task-img3.png       # Edu Scheduler screenshot
├── Task-img2_1.jpeg    # (unused) old emoji project screenshot
├── Task-img2.jpeg      # (unused)
└── assets/
    ├── divi-profile.jpg       # Profile photo (hero + social preview)
    ├── Divi_Chopra_Resume.pdf
    └── projects/
        ├── sentinel-os.jpg
        └── leadflow.jpg
```

## Run Locally
Open `index.html` in any modern browser by double-clicking it, or run:

```bash
start index.html      # Windows
open index.html       # macOS
```

You can also serve the folder (for example with VS Code's Live Server) so the page loads the same way it will on GitHub Pages.

## Things to Replace
| What | Where |
| --- | --- |
| **Resume PDF** | Add `assets/Divi_Chopra_Resume.pdf`. The nav "Resume" button links to it. |
| **Project screenshots** | Add `assets/projects/sentinel-os.jpg` and `leadflow.jpg`. Until then, each card shows a styled placeholder. To swap the profile photo, replace `assets/divi-profile.jpg`. |
| **Project links** | In `index.html`, every project's GitHub / Live Demo / "View Project" link that is still `href="#"`. |
| **Formspree ID** | Create a form at [formspree.io](https://formspree.io), then replace `YOUR_FORM_ID` in **both** `script.js` (`FORM_ENDPOINT`) and the `action` attribute of `#contactForm` in `index.html`. Until you do, the form opens the visitor's email app instead. |
| **Open Graph URL** | The `og:url` / `og:image` tags in `<head>` assume `https://divichopra28.github.io/PORTFOLIO_WEBSITE/`. Update them if you use a custom domain. |

## Deploy to GitHub Pages
1. Push the files to the `main` branch of your GitHub repository.
2. On GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`, and click **Save**.
4. After a minute the site will be live at `https://<username>.github.io/<repo-name>/`.

All asset paths are relative, so the site works from a repository sub-path.

## Contact
- Email: divi.chopra28@gmail.com
- GitHub: [divichopra28](https://github.com/divichopra28)
- LinkedIn: [Divi Chopra](https://www.linkedin.com/in/divi-chopra-4ab477359)

---
© 2026 Divi Chopra
