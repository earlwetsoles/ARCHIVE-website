# Jiwt Film Archive

A static personal physical-media movie archive. The website reads the database from `movies.json`; the JSON file is the source of truth. `movies.csv` is a spreadsheet-friendly mirror.

## Current collection

- Entries: 128
- Distinct individual director names: 83 (slash-separated co-director fields are split for stats/index display)
- Total runtime: 15,387 minutes (256 hours, 27 minutes)
- Release-year span: 1939–2024
- Titles no longer repeat a trailing `4K`; the physical format lives in the `format` field.
- The 15 requested Hitchcock entries have `format: "4K UHD"`.
- `posterUrl` and rating fields are empty until you run the optional bulk enrichment script. The CSS-generated placeholder poster art remains the fallback.

## Fields

The core fields are `id`, `title`, `studio`, `upc`, `ean`, `year`, `director`, `runtime`, `genres`, `format`, `rating`, `ratingSource`, `ratingVotes`, `ratingScale`, `tmdbId`, `posterUrl`, `posterSource`, `edition`, `notes`, `source`, and `metadataStatus`.

`rating` is intended to hold the TMDB audience vote average on a 0–10 scale; it is not a critic score or your personal rating. Ratings remain `null` until sourced. UPC/EAN values are stored as strings to preserve leading zeros.

## Bulk poster art and ratings (optional)

The included `enrich_tmdb.py` helper matches titles by normalized title and release year, then fills the TMDB rating, vote count, TMDB ID, and poster URL for confident matches. It does **not** silently choose a loose match: box sets or unmatched/ambiguous titles are left blank and logged to `tmdb_enrichment_report.csv`.

TMDB offers a free developer API for non-commercial use, provided the site attributes TMDB. See the [official TMDB API FAQ](https://developer.themoviedb.org/docs/faq), [search documentation](https://developer.themoviedb.org/docs/search-and-query-for-details), and [image URL documentation](https://developer.themoviedb.org/docs/image-basics). TMDB requires use of an approved logo and the notice “This product uses the TMDB API but is not endorsed or certified by TMDB.” The footer contains that attribution and an official TMDB logo link. This archive is personal/non-commercial; check TMDB's current terms before repurposing it commercially.

### One-time setup on Windows

1. Create a free account at [The Movie Database](https://www.themoviedb.org/) and request a developer API key in account settings.
2. Put `enrich_tmdb.py`, `movies.json`, and `movies.csv` together in your project folder.
3. Open PowerShell in that folder and set your key for the current shell (replace the text with your own key; do not commit the key to GitHub):

   ```powershell
   $env:TMDB_API_KEY="YOUR_V3_API_KEY"
   py enrich_tmdb.py
   ```

4. Review `tmdb_enrichment_report.csv` for `matched` and `not_found_or_ambiguous` records.
5. Open/check `movies.json` and `movies.csv`, then commit the updated data to GitHub Pages. Never place the API key in `index.html` or commit it to the repository.

The helper does not fetch images to your computer; it writes TMDB poster URLs (e.g. `https://image.tmdb.org/t/p/w500/...`) to `posterUrl`, which the website loads directly. If TMDB removes a poster or a match is incorrect, clear that `posterUrl` and the placeholder will appear again.

## Website filters and stats

The poster wall filters by decade, physical format, and genre. The homepage stats are quantity, distinct individual directors, combined runtime, and release-year span. The director index is sorted by number of collection entries per director, largest first. Collaboration entries show under each director listed.

## Running locally

On a Windows PC, open Command Prompt in this folder and run `py -m http.server 8000`, then visit `http://localhost:8000`. On macOS/Linux, run `python3 -m http.server 8000`. GitHub Pages can load `movies.json` beside `index.html` without this local server.

## Editing

Edit `movies.json` to change the data used by the website. If you edit `movies.csv` in a spreadsheet, convert it back into `movies.json` before viewing changes; the website does not read CSV directly. The supplied `enrich_tmdb.py` updates both JSON and CSV after sourcing metadata. Keep UPC/EAN columns formatted as text in spreadsheet software.
