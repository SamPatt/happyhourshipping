# Happy Hour Shipping Estimator

A mobile-first static web tool for estimating USPS Ground Advantage shipping costs from Syracuse, NY 13206. Built for use with GitHub Pages — no build step, no dependencies.

## Run Locally

```bash
cd happyhourshipping
python3 -m http.server 8008
```

Open http://localhost:8008 in your browser.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings > Pages**.
3. Under **Source**, select the branch (e.g. `main`) and root folder (`/`).
4. Save. The site will be available at `https://<username>.github.io/<repo>/`.

## What It Does

- Takes a destination ZIP, order weight (lbs), and optional packaging cost.
- Looks up the USPS zone from origin ZIP3 prefix 132 (Syracuse, NY 13206).
- Calculates USPS Ground Advantage retail postage based on zone and weight bracket.
- Shows the Square shipping fee the customer is charged based on weight tiers.
- Displays the delta (over/under) between what Square charges and the estimated cost.
- Provides a "Copy summary" button for a one-line summary string.
- Shows a "Details" accordion with zone lookup info, weight bracket, and rate row used.

## Limitations

- **Estimates only.** Actual USPS postage may differ.
- **Retail rates.** Commercial or commercial plus pricing is not included.
- **USPS Ground Advantage only.** No Priority Mail, Priority Mail Express, or other services.
- **Origin ZIP3 132 only.** The zone chart is specific to Syracuse, NY 13206.
- **Weight limit: 10 lbs.** Ground Advantage packages over 10 lbs are not supported.
- **ZIP5 exceptions are limited** to the specific ranges documented in the USPS zone chart export for origin 132 (APO/FPO, Pacific territories, and select 969xx ranges).
- **Zone chart is static.** USPS may update zones; the embedded data would need manual refresh.
- **Rates are static.** USPS rate changes require updating the hardcoded rate table.

## Files

- `index.html` — page structure
- `styles.css` — mobile-first styling
- `app.js` — all logic (zone lookup, rate table, Square tiers, validation)
- `README.md` — this file
