# Beginner Instructions — Scott Simpson Photography

## The folder problem in your current GitHub repository

Your repository currently contains only the loose files from the top level of the website. It does **not** contain `assets` or `scripts`. That means GitHub never received the CSS, JavaScript, logo, gallery images, importer code, or site-checking script.

GitHub does not preserve empty folders. It also will not upload a folder when you select only the loose files inside the top level. The safest browser method is to drag the folders themselves from Finder into GitHub's upload box.

## Correct finished structure

After uploading this package, the repository's first screen should include these folders and files:

```text
assets/
scripts/
404.html
README-BEGINNER.md
README.md
about.html
admin.html
gallery.html
index.html
licensing.html
package-lock.json
package.json
privacy.html
robots.txt
terms.html
vercel.json
```

Inside `assets`, you must be able to click through to:

```text
assets/css/site.css
assets/css/admin.css
assets/fonts/...
assets/images/branding/logo-on-dark.svg
assets/images/branding/logo-on-light.svg
assets/images/branding/favicon.svg
assets/images/gallery/previews/README.md
assets/images/gallery/thumbs/README.md
assets/js/site.js
assets/js/gallery.js
assets/js/gallery-data.js
assets/js/admin.js
assets/vendor/fflate.min.js
```

Inside `scripts`, you must see:

```text
scripts/check-site.mjs
```

Do **not** upload `node_modules`. It is intentionally excluded.

## Recommended method: upload the complete site through GitHub's website

1. Download `Scott-Simpson-Photography-GitHub-Ready.zip` from ChatGPT.
2. Find the ZIP in your Mac's **Downloads** folder.
3. Double-click the ZIP once. Your Mac creates an unzipped folder with the same name.
4. Open the unzipped folder. You should immediately see `assets`, `scripts`, `index.html`, and the other website files.
5. In Safari, open your GitHub repository:
   `thefloridacaptain-hub/simpson-photography-website`
6. Confirm the branch selector near the upper-left says **main**.
7. Click **Add file**.
8. Click **Upload files**.
9. Leave the GitHub upload page open.
10. Return to Finder and open the unzipped website folder.
11. Press **Command+A** to select everything *inside* that folder. Do not drag the outer ZIP and do not drag the unzipped parent folder itself.
12. Drag the selected files **and the `assets` and `scripts` folders** into the large GitHub upload box.
13. Wait until GitHub finishes listing the files. Do not commit while files still show as uploading.
14. Before committing, inspect the list. You must see paths beginning with:
    - `assets/css/`
    - `assets/images/`
    - `assets/js/`
    - `assets/vendor/`
    - `scripts/`
15. In the commit-message box, enter:
    `Add complete website assets, scripts, and approved logo`
16. Select **Commit directly to the main branch** if GitHub asks.
17. Click **Commit changes**.
18. Return to the repository's main screen.
19. Confirm `assets` and `scripts` now appear with folder icons.
20. Click `assets`, then click `images`, then `branding`. Confirm `logo-on-dark.svg` appears.

Uploading all files together is intentional. GitHub will replace older files with the new versions and add the missing folders.

## If Safari refuses to upload the folders: use GitHub Desktop

1. Install GitHub Desktop from `desktop.github.com`.
2. Open GitHub Desktop and sign in to your GitHub account.
3. Choose **File → Clone Repository**.
4. Select `thefloridacaptain-hub/simpson-photography-website`.
5. Click **Clone**.
6. In GitHub Desktop, choose **Repository → Show in Finder**.
7. Open the unzipped `Scott-Simpson-Photography-GitHub-Ready` folder in a second Finder window.
8. Press **Command+A** inside the unzipped website folder.
9. Drag everything into the cloned repository folder.
10. When macOS asks, choose **Replace** for files with matching names.
11. Return to GitHub Desktop. The left side will list all additions and changes.
12. In the **Summary** field, enter:
    `Add complete website assets, scripts, and approved logo`
13. Click **Commit to main**.
14. Click **Push origin** at the top of GitHub Desktop.
15. Open the repository in Safari and confirm `assets` and `scripts` appear.

## Vercel after the upload

If Vercel is already connected to this GitHub repository, committing to `main` automatically starts a new deployment.

1. Open Vercel.
2. Open the Scott Simpson Photography project.
3. Click **Deployments**.
4. Wait for the newest deployment to say **Ready**.
5. Open the live website in a private/incognito browser window.
6. Confirm the logo appears and the navigation works.
7. Open `/gallery` and `/admin` directly to confirm both pages load.

## Adding photographs in batches

1. Visit `https://YOUR-DOMAIN.com/admin`.
2. Select multiple 3,000-pixel website-source JPEGs.
3. Enter the common collection, location and prices.
4. Check each generated title.
5. Click **Create gallery update ZIP**.
6. Unzip that downloaded update.
7. Upload its `assets` folder to the root of this same GitHub repository using the folder-dragging method above.
8. Open `assets/js/gallery-data.js` in GitHub.
9. Add the three public Lemon Squeezy checkout URLs for each photograph:
   - `desktopCheckout` — Personal Screen
   - `standardPrintCheckout` — Standard Personal Print
   - `printCheckout` — Full-Resolution Personal Print
10. Commit the edit. Vercel publishes it automatically.

## What never belongs in GitHub

- RAW files
- TIFF masters
- Clean full-resolution customer JPEGs
- Customer Screen files without watermarks
- Lemon Squeezy API keys or secrets
- Lightroom catalogs
- The `node_modules` folder

Public GitHub should contain only website code, the logo, and visibly watermarked preview files.
