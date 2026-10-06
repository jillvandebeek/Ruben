# 💖 De Grote Ruby Quiz

Een kleine liefdesquiz voor Ruben: 7 vragen, en op het einde ontdekt hij hoeveel kusjes hij verdiend heeft.

## Structuur

- `public/index.html` – de pagina
- `public/style.css` – het romantische thema (hartjes!)
- `public/app.js` – de vragen, het controleren van de antwoorden en de score
- `netlify.toml` – Netlify-configuratie (geen build, publiceert `public/`)

## Lokaal bekijken

Open `public/index.html` in je browser, of:

```bash
npx serve public
```

## Deployen op Netlify

Koppel deze repository in Netlify (Add new site → Import from Git). De instellingen worden automatisch uit `netlify.toml` gehaald: geen build command, publish directory `public`. Elke push naar `main` wordt automatisch gedeployed.

## Vragen aanpassen

Alle vragen en juiste antwoorden staan bovenaan in `public/app.js` in de lijst `QUESTIONS`.
