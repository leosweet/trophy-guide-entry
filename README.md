# Leonida Legend — GTA VI Trophy Guide & Tracker

[![make.fun — gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/leosweet/trophy-guide-entry/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/leosweet/trophy-guide-entry/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline web app that is the best guide *and* tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/c/gta6-trophy-guide-01).

## What it does

- **Tracker** — a checklist of all 55 trophies with their official name, description and grade. Progress is saved in the browser (localStorage), and can be exported to a file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, side quests, robberies, free-roam, money, platinum), by grade, and by free-text search; earned trophies can be hidden.
- **Spoiler-free mode** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap to the platinum** — the order to earn them in, in five stages built from the official descriptions, with the one possibly missable trophy called out.
- **A guide for every trophy, in our own words** — what to do, where and how, and when it can be missed. Each guide names its sources beside it (PowerPyx, GTABase, GTA Zone, Output Lag, EGamers) and links to them; nothing is copied from them. Five trophies had no confirmed unlock method at launch, and their guides say so honestly instead of inventing steps.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

No build step, no network: every file the app loads lives under `app/`. Open `app/index.html` in desktop Chrome with the network off and it works.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Sources

- Official trophy names, descriptions and grades as listed by Exophase and PSNProfiles.
- Guides draw on [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/) and [GTABase — GTA 6 Trophy Guide & Achievements List](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series), with further cross-checks from GTA Zone, Output Lag and EGamers. Each trophy's guide lists its own sources in `app/data/trophies.json` and in the app.

## License

MIT — see [LICENSE](LICENSE). No Rockstar Games logo, artwork, box art or game screenshots are used anywhere in this guide.
