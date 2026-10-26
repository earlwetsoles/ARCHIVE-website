# My Cinema Archive

A static personal movie-collection website. The website loads its database from `movies.json`; the JSON file is the source of truth. `movies.csv` is a spreadsheet-friendly mirror.

## Imported collection

- Records imported: 128
- Source: the refined CSV pasted into the conversation on 2026-10-26.
- `posterUrl` is intentionally blank (`null`) for every record. The site continues to use its generated placeholder poster art until poster links are added.
- Ratings are not included in the source CSV and are stored as `null`.
- UPC and EAN values are stored as strings to preserve exact digits and leading zeros. Empty values are stored as `null`.
- The CSV's `Genre` column is represented as a one-item `genres` array in JSON. The pasted `War Dogs` row had shifted delimiters; its fields were interpreted as 2016, Phillips, 114 minutes, Comedy, Blu-ray based on the apparent intended column sequence.

## Fields in `movies.json`

Each movie includes `id`, `title`, `studio`, `upc`, `ean`, `year`, `director`, `runtime`, `genres`, `format`, `rating`, `edition`, `notes`, `posterUrl`, `source`, and `metadataStatus`.

## Run locally

The site first tries to load `movies.json` automatically. If you open `index.html` by double-clicking it and the browser blocks that request, the page now offers a **Choose movies.json** button; select the JSON file from the same folder. For automatic loading without selecting a file each time, use a local server. From this folder, run:

- Windows: `py -m http.server 8000`
- macOS/Linux: `python3 -m http.server 8000`

Then visit `http://localhost:8000`.

## Editing

Edit `movies.json` to update the site database. If you edit `movies.csv` in a spreadsheet, regenerate `movies.json` from the CSV before viewing changes; the website does not read the CSV directly. Keep UPC/EAN columns formatted as text in spreadsheet software.
