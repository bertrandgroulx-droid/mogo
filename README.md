# 🌍 Mogo

**Press the button. Spin the globe. Cook the world.**

Mogo is a tiny, dependency-free web app. Hit one button and it whisks you to a
random country, then serves up links to recipes for that country's most popular
dishes — while a little spinning Earth with vegetables running around it keeps
you company during the search.

## Features

- 🎲 **One-click discovery** — picks a random country every press, and never
  repeats one until you've travelled through all of them.
- 🎲 **Random or pick** — hit the button for a random country, or choose any of
  the 199 from the dropdown.
- 📊 **Country facts** — each country shows its capital, currency, primary
  language(s), population and area (km²), plus world rankings (e.g. "4th
  largest", "9th most populous"). Non-sovereign regions (e.g. Hong Kong,
  Puerto Rico) are labelled as such and left out of the rankings.
- 🧭 **Running count** — tracks how many of the 199 countries you've explored.
- ◀ ▶ **Browse your history** — arrows on either side of the country let you
  step back and forward through the countries you've discovered this session.
- 🥦 **Diet badges & filter** — each dish is tagged V (vegetarian) and/or GF
  (usually gluten-free), and a dropdown filters by Vegetarian, Fish, Chicken,
  Beef, Pork, Dessert, or Other. (Diet tags are a general guide — always check the recipe.)
- 🌐 **199 countries, always with recipes** — a built-in list of iconic dishes
  for every country guarantees options, with photo cards and full recipe links
  pulled from the free [TheMealDB](https://www.themealdb.com) API where available.
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
