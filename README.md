# Kwaku'so Study Hub — JHS/BECE + SHS/WASSCE

A responsive school-resource website with a public library and a Firebase-backed admin upload area. The frontend is provided, but live uploads/downloads require you to configure Firebase and publish the site over HTTPS.

## What works in this project
- Responsive home page, search, level and subject filters.
- Public resource library reads published resource records from Firestore.
- Admin sign-in through Firebase Authentication.
- Admin upload form sends files to Firebase Storage and saves metadata in Firestore.
- Public download buttons request a Storage download URL.
- Security rules are included as a starting point.

## Important: not live until configured
No Firebase project or credentials are included. The website will clearly show that the library is not connected until you configure it. Do not advertise working uploads until you have completed the setup and tested the rules.

## Setup checklist
1. Open https://console.firebase.google.com/ and create a project.
2. Add/register a Web App in Project settings. Copy the web app config into `js/firebase-config.js`.
3. In Firebase Authentication, enable **Email/Password** sign-in.
4. Create your own admin user with a strong password. Do not share this login.
5. In Authentication → Users, copy the admin user's UID.
6. Create a Cloud Firestore database.
7. Open `firestore.rules` and replace `REPLACE_WITH_YOUR_ADMIN_USER_UID` with the admin UID. Publish these rules in Firestore → Rules.
8. Set up Firebase Storage. Open `storage.rules`, replace the same placeholder UID, and publish the rules in Storage → Rules.
9. Confirm your Storage bucket value in `js/firebase-config.js` exactly matches the config shown by Firebase. New Firebase projects may show a `*.firebasestorage.app` bucket; use the exact value provided.
10. Deploy the files to a static host that serves HTTPS and supports ES modules (GitHub Pages or Firebase Hosting). Test public browsing, downloads, and that a non-admin account cannot upload.

### Suggested file layout
Keep `index.html`, `admin.html`, `style.css`, `app.js`, `admin.js`, `js/firebase-config.js`, `firestore.rules`, and `storage.rules` together in the same published root folder.

## Google search indexing
1. Publish the website first.
2. Open Google Search Console: https://search.google.com/search-console/
3. Add your exact website domain or URL-prefix property and verify ownership.
4. Submit a sitemap when you create one, or use URL Inspection to request indexing of your homepage.
Google can take time to crawl and index a new site; indexing and rankings are not guaranteed. A custom domain can make the address easier to remember but is not required to begin.

## Advertising / monetization
- The ad box on the homepage is only a placeholder. It does not display ads or earn money yet.
- Apply for Google AdSense only when the site is published, useful, navigable, has original or properly licensed content, and complies with Google's current policies. Approval and revenue are not guaranteed.
- Google AdSense publishers must generally be at least 18. If the site owner is under 18, a parent/guardian can sign up using their own Google Account and be responsible for the account and payments, subject to Google's current rules.
- Do not click your own ads or ask classmates to click ads. Invalid traffic can lead to withheld earnings or account closure.
- Never upload copyrighted textbooks, paid notes, answer keys, or other material unless you have permission to distribute them. Prefer your own notes, original revision guides, and public-domain/licensed resources.
- Don't upload classmates' personal information or private school documents.

## What needs hosting / services?
- **Hosting:** serves the website to everyone. GitHub Pages can host static frontend files; Firebase Hosting is another option.
- **Database:** Firestore stores resource titles, subjects, descriptions, publication status, and file paths.
- **File storage:** Firebase Storage stores actual uploaded PDFs/documents/images. As of 2026, new Firebase Storage buckets require the Blaze pay-as-you-go plan and a linked billing account. Some no-cost usage quotas may apply, but usage above them can cost money. Because this can create charges, ask a parent/guardian to review pricing and billing before enabling it; do not add a payment method without their permission.
- **Authentication and security:** Firebase Authentication signs in the admin; Firestore/Storage rules enforce that only your UID can upload or edit. A secret admin password must never be written into public JavaScript.
- **Payments:** not needed for the current free-download/ad-supported plan. If you later sell files, you would need a payment provider and server-side verification before granting paid access.
- **Ads:** an approved ad network and its ad code; a placeholder box alone earns nothing.

## Local testing
Because this uses ES modules and Firebase, open it through a local web server or deploy it to HTTPS. Opening the HTML directly as a `file://` URL may block module imports. For Android, use an editor/preview that runs a local web server, or publish a private test deployment before launch.
