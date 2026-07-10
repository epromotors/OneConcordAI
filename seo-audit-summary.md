# OneConcord AI SEO Audit Summary

## Executive Summary
This is a high-level summary of the Technical and On-Page SEO Audit of `https://oneconcord.ai`.

### SEO Health Index
*   **Overall Score:** 85 / 100
*   **Health Status:** Good
*   **Recommendation:** Address the SPA-in-multi-HTML duplicate content issues and correct sitemap URLs.

| Category | Score | Weight | Weighted Contribution |
| :--- | :---: | :---: | :---: |
| Crawlability & Indexation | 70 | 30% | 21.00 |
| Technical Foundations | 90 | 25% | 22.50 |
| On-Page Optimization | 85 | 20% | 17.00 |
| Content Quality & E-E-A-T | 95 | 15% | 14.25 |
| Authority & Trust | 100 | 10% | 10.00 |
| **Total** | | **100%** | **84.75** (Rounded to **85**) |

---

## Critical Issues & Recommendations

### 1. Sitemap Canonical Mismatch
*   **Issue:** The `sitemap.xml` lists old `.html` URLs, contradicting the clean URL canonical tags on the pages.
*   **Severity:** High
*   **Action:** Update all sitemap URLs to match clean path canonicals (e.g. remove `.html`).

### 2. Multi-HTML Duplicate SPA Content
*   **Issue:** Every page file contains the source markup for all 7 other pages, creating massive site-wide duplicate content in Google's parsed DOM.
*   **Severity:** Critical
*   **Action:** Re-architect the build to statically output only the active section markup for each file.

### 3. Missing Local H1 Tags
*   **Issue:** Home, Agent, and Contact pages lack a localized `<h1>` tag inside their active sections, yet parse other page H1s.
*   **Severity:** High
*   **Action:** Convert hero titles to `<h1>` elements inside active sections.

### 4. Google Fonts Swap Shift (CLS)
*   **Issue:** Browser layout shift occurs when Google Fonts swap on page load.
*   **Severity:** Medium
*   **Action:** Preload the `.woff2` font files in the document `<head>`.

### 5. Missing E-E-A-T Compliance Pages
*   **Issue:** Missing dedicated Privacy Policy and Terms of Service documents.
*   **Severity:** Medium
*   **Action:** Create pages and link them in the footer.

---

## Priorities and Quick Wins
1.  **Immediate:** Update `sitemap.xml` and `/llms.txt` to remove `.html` extensions. (Effort: Low)
2.  **Immediate:** Add unique `<h1>` tags to Home, Agent, and Contact hero banners. (Effort: Low)
3.  **Short-term:** Trim overlength meta descriptions for all pages to under 155 characters. (Effort: Low)
4.  **Short-term:** Preload webfonts to resolve mobile layout shifts. (Effort: Low)
5.  **Medium-term:** Create Privacy Policy and Terms of Service files. (Effort: Medium)
6.  **Strategic:** Decouple template markup to stop duplicate code loading on all pages. (Effort: High)
