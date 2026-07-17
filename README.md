# SonoPromptAttack

Project page for **[When Minor Edits Matter: LLM-Driven Prompt Attack for Medical VLM Robustness in Ultrasound](https://arxiv.org/abs/2603.21047)**.

Static site (HTML / CSS / JS). No build step. Relative paths — works on GitHub Pages at the repo root.

## Preview locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy on GitHub Pages

1. Create a GitHub repo and push this directory as the **root** of `main`:

```bash
git init
git add .
git commit -m "Add SonoPromptAttack project page"
git branch -M main
git remote add origin https://github.com/<USER>/<REPO>.git
git push -u origin main
```

2. **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: `main` · folder: **/ (root)**

3. Site URL: `https://<USER>.github.io/<REPO>/`

After the site is live, set absolute `og:image` / `twitter:image` URLs in `index.html` (replace `assets/og-image.jpg` with the full Pages URL) so social previews work reliably.

## Structure

```
.
├── index.html
├── css/styles.css
├── js/main.js
├── assets/
│   ├── favicon.svg
│   ├── og-image.jpg
│   └── figures/
│       ├── method-overview.png
│       ├── dd-asr-anatomy.png
│       └── examples.png
├── .nojekyll
├── .gitignore
└── README.md
```

## Paper

- Abstract: https://arxiv.org/abs/2603.21047  
- PDF: https://arxiv.org/pdf/2603.21047  

```bibtex
@misc{medghalchi2026minoreditsmatterllmdriven,
  title         = {When Minor Edits Matter: LLM-Driven Prompt Attack for Medical VLM Robustness in Ultrasound},
  author        = {Yasamin Medghalchi and Milad Yazdani and Amirhossein Dabiriaghdam and Moein Heidari and Mojan Izadkhah and Zahra Kavian and Giuseppe Carenini and Lele Wang and Dena Shahriari and Ilker Hacihaliloglu},
  year          = {2026},
  eprint        = {2603.21047},
  archivePrefix = {arXiv},
  primaryClass  = {cs.CV},
  url           = {https://arxiv.org/abs/2603.21047}
}
```
