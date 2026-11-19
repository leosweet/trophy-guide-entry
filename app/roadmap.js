// Roadmap to the platinum: the order to earn the 55 trophies in, built from the
// official descriptions (story chapters and missions, collectibles and counts).
// Stage blurbs are our own summary of the published roadmaps; each trophy's own
// guide, with its sources, lives in app/data/trophies.json.
export const STAGES = [
  {
    n: 1,
    title: 'Story I — Chapters 1–2',
    blurb: 'Play the opening chapters and meet the crew. The first mission, Gone Fishing, and the first two chapter trophies land here, along with the questlines that start early: Kenton in Chapter 1, Cal\u2019s fishing, Billy after Coffee Break, and Bret\u2019s hunts. Do the Chapter 1 balcony meditation with Lucia — it is the one thing in the game that may be missable.',
  },
  {
    n: 2,
    title: 'Story II — Chapters 3–4',
    blurb: 'Vice City opens up. The Chapter 3 and 4 story trophies and the Cartel Heist land here, plus the side lines that start now: Andy (Lucia-only), Randy\u2019s car list, Tyrone\u2019s labs, and Yasmani\u2019s jewelry jobs — which unlock the Snap Gun, the jewelry robberies and, later, the bank-vault tips. Buy your garages and start registering cars with Moses.',
  },
  {
    n: 3,
    title: 'Story III — Chapter 5 & the finale',
    blurb: 'The last chapter and the final mission: Operation Savage Glory, then the gold for the final mission. After the credits, free-roam carries on and the 100% checklist appears under Progress, then Stats — everything left is still doable.',
  },
  {
    n: 4,
    title: 'Post-story — the 100% checklist',
    blurb: 'The long grind, around 100 hours: 250+ stunts, 42 shooting-range gold medals, 42 drone races, 20 race wins, 50 to 70 challenges, card sets, WAiNK scans, vehicle scans, animal studies, all 8 bank vaults, all 39 gang operations, underwater discoveries and Bret\u2019s 15 Target Decks. Most trophies in this stage pop while you work the checklist.',
  },
  {
    n: 5,
    title: 'Cleanup — Strangers & misc',
    blurb: 'The last few: 8 qualifying Strangers & Freaks strands, the one-off stunts (the plane, the tank, the bowling alley, max strength, the criminal profile), and the five trophies whose unlock method is still unconfirmed at launch — read their guides before chasing guesses. Then the platinum pops.',
  },
];

export const MISSABLE_NOTE =
  'Only one trophy may be missable: Positive Mental Attitude. In Chapter 1, the morning after Down to Earth, Lucia talks about meditating in the kitchen and walks out to the balcony — follow her and accept. That meditation is gone after Chapter 1, and it is not yet confirmed whether the trophy needs it. Everything else can be earned after the story, so keep a manual save at the start of each chapter just in case.';

// Render the roadmap into el. trophies is the full list; state carries the earned
// set, the spoiler flag, and onSelect(id) to jump to a trophy in the checklist.
export function renderRoadmap(el, trophies, state) {
  el.replaceChildren();
  const intro = document.createElement('p');
  intro.className = 'roadmap-intro';
  intro.innerHTML =
    'One playthrough is enough, no online play is needed, and the whole road takes about <b>200 hours</b> — 60 to 80 on the story, about 100 on the 100% checklist. ' +
    'There are no difficulty settings and no mission replay, so the only thing to watch for on the way is the Chapter 1 meditation. ' +
    'Click any trophy below to open its guide in the checklist.';
  el.append(intro);

  const callout = document.createElement('div');
  callout.className = 'missable-callout';
  const calloutTitle = document.createElement('h2');
  calloutTitle.textContent = '⚠ The one possibly missable trophy';
  const calloutBody = document.createElement('p');
  calloutBody.textContent = MISSABLE_NOTE;
  callout.append(calloutTitle, calloutBody);
  el.append(callout);

  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.stage === stage.n);
    if (!members.length) continue;
    const box = document.createElement('section');
    box.className = 'stage';
    const h = document.createElement('h2');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = 'Stage ' + stage.n;
    h.append(num, document.createTextNode(stage.title + ' — ' + members.length + ' trophies'));
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    const list = document.createElement('ul');
    for (const t of members) {
      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = 'grade-dot grade-' + t.grade;
      dot.title = t.grade;
      const name = document.createElement('span');
      name.className = 't-name';
      const hidden = state.spoiler && t.kind === 'story' && !state.earned.has(t.name);
      name.textContent = hidden ? 'Hidden story trophy' : t.name;
      li.append(dot, name);
      if (t.missable) {
        const flag = document.createElement('span');
        flag.className = 'tag missable';
        flag.textContent = 'missable';
        li.append(document.createTextNode(' '), flag);
      }
      if (state.earned.has(t.name)) {
        const done = document.createElement('span');
        done.className = 't-note';
        done.textContent = ' ✓ earned';
        li.append(done);
      }
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => state.onSelect(t.id));
      list.append(li);
    }
    box.append(h, blurb, list);
    el.append(box);
  }
}
