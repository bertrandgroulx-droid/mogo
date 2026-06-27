# 🌍 Mogo

**Press the button. Spin the globe. Cook the world.**

Mogo is a tiny, dependency-free web app. Hit one button and it whisks you to a
random country, then serves up links to recipes for that country's most popular
dishes — while a little spinning Earth with vegetables running around it keeps
you company during the search.

## Features

- 🎲 **One-click discovery** — picks a random country every press.
- 🍲 **Real recipes** — pulls the country's popular dishes (with photos and
  full recipe links) from the free [TheMealDB](https://www.themealdb.com) API.
- 🌍 **Spinning-Earth loader** — a CSS-animated globe with carrots, broccoli,
  tomatoes, and corn orbiting across the top while results load.
- 📱 **Responsive & self-contained** — a single `index.html`, no build step,
  no dependencies.

## Run it

It's a static page, so just open it:

```bash
# from the project root
open index.html        # macOS
xdg-open index.html    # Linux
```

Or serve it locally (recommended, so the recipe API calls work cleanly):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## How it works

1. Fetches the list of available cuisines/countries from TheMealDB.
2. Picks one at random and requests its dishes.
3. Maps the cuisine to a friendly country name + flag and renders recipe cards
   linking to each full recipe.

No API key required.
