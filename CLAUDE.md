# Mon carnet de guitare

Site personnel statique (HTML/CSS/JS, sans build ni serveur) qui centralise le matériel des cours de guitare avec Claire : échauffements, théorie, gammes, accords, partitions, et un journal de bord. Pensé pour être complété au fil des cours.

## Instructions pour Claude

- **Ne pas ouvrir automatiquement la page modifiée dans le navigateur après une édition.** L'utilisateur vérifie lui-même quand il en a besoin.
- Toujours réutiliser `css/theme.css` et `css/nav.css` plutôt que dupliquer du CSS, sauf pour `pentatonique-mineure.html` et `chord_progressions.html` qui restent volontairement autonomes (voir plus bas).
- Rester sur des pages HTML/CSS/JS autonomes, sans dépendance externe (à part Google Fonts), pour que le site reste ouvrable en local par simple double-clic.
- Ne pas ajouter de fonctionnalités non demandées (pas de backend, pas de compte, pas de sync cloud) — c'est un site perso mono-utilisateur.
- Pour tout ce qui touche à la musique (tab, accords, gammes), si une info transmise par l'utilisateur semble incohérente ou ambiguë (ex. numéro de case improbable), le signaler explicitement plutôt que de deviner silencieusement — une erreur de tab peut induire en erreur la pratique de l'utilisateur.
- Ne jamais transcrire une tablature/partition à partir d'une photo si la lecture n'est pas fiable à 100% : mieux vaut demander confirmation, ou proposer d'enregistrer la photo elle-même dans `partitions/`, que d'inventer des numéros de case.
- Je n'ai pas de moyen d'écrire directement sur disque les images collées dans le chat (je les vois, mais je n'ai pas accès à leurs octets bruts). Si l'utilisateur veut qu'une photo soit intégrée au site, lui demander de déposer le fichier dans le dossier concerné (ex. `partitions/`) et de m'indiquer le nom du fichier.
- Ne pas laisser traîner de PDF à la racine du site : soit le contenu est repris "en dur" dans une page (texte/SVG, comme `do-majeur.html`) et le PDF source est alors supprimé, soit le PDF est rangé dans `partitions/` et référencé depuis `partitions.html`.

## Structure des fichiers

```
c:\dev\Guitare\
├── index.html                 — accueil, cartes vers chaque section
├── echauffements.html         — hammer-on, pull-off, la torture, le crabe
├── theorie.html                — fiches de théorie (cercle des quartes, notes sur le manche, transposition), datées
├── journal.html                 — journal de bord : un .panel par date de cours, avec liens vers les fiches concernées
├── gammes.html                  — hub des gammes, cartes vers chaque page de gamme
├── pentatonique-mineure.html   — gamme pentatonique mineure, 5 positions, interactif (JS)
├── do-majeur.html               — gamme de Do majeur, position ouverte
├── chord_progressions.html     — explorateur de progressions d'accords
├── partitions.html             — morceaux travaillés (grilles/accords inline) + liens vers des PDF
├── partitions/                 — les PDF référencés par partitions.html
│   ├── Arpèges.pdf
│   └── Little Black Submarines.pdf
├── css/
│   ├── theme.css                — socle partagé (couleurs, polices, composants génériques)
│   └── nav.css                  — styles de la barre de navigation commune
└── js/
    └── nav.js                   — génère le HTML du menu (source unique, voir plus bas)
```

Chaque page HTML est autonome (ouvrable directement dans le navigateur, pas de serveur nécessaire).

## Charte graphique

Palette "papier crème" chaude, extraite à l'origine de `pentatonique-mineure.html` :

```css
--bg: #f4eee2;        --text: #2c2620;       --root: #ab6047;   /* terracotta, accent principal */
--bg-card: #fbf6ec;   --text-soft: #7a6f5e;  --note: #93a487;   /* sauge, accent secondaire */
--bg-accent: #ede5d3; --text-muted: #a89a85; --note-soft: #c4d0b8;
--line: #d8cdb8;                             --note-text: #38463a;
--line-soft: #e5dcc9;
```

- Polices : **Fraunces** (serif, italique pour les éléments expressifs/musicaux : titres, gros chiffres, notes) + **Manrope** (sans-serif, texte courant, labels uppercase trackés).
- Pas d'ombres, coins peu arrondis (2–4px), fond crème avec léger dégradé radial en arrière-plan.
- Composants réutilisables définis dans `css/theme.css` : `.hero` (en-tête de page), `.chips`/`.chip` (liens rapides/sélecteurs), `.panel` (carte de contenu = une "fiche"), `.fretboard`/`.note-circle`/`.string-line`/`.string-label`/`.fret-label` (diagrammes de manche en SVG).
- `pentatonique-mineure.html` et `chord_progressions.html` gardent leur propre bloc `<style>` complet (non migré vers `theme.css`) pour ne pas casser leur logique JS existante — elles chargent `css/nav.css` + `js/nav.js` comme toutes les autres pages pour le menu commun (voir plus bas).
- Chaque page ajoute ses propres classes SVG spécifiques dans son `<style>` local quand `theme.css` ne suffit pas (ex. `.note-natural`/`.note-accidental` dans `theorie.html`, `.finger-note`/`.move-arc` dans `echauffements.html`, `.blues-grid` dans `partitions.html`) — normal, pas besoin de tout remonter dans `theme.css`.

## Menu commun (`js/nav.js` + `css/nav.css`)

Le HTML du menu n'est **plus dupliqué** dans chaque page — il est généré une seule fois par `js/nav.js` à partir d'un tableau `NAV_LINKS`, et injecté au chargement. Chaque page se contente de poser un placeholder juste après `<body>`, avec un `data-page` qui indique quel lien doit être actif :

```html
<body>
  <div id="site-nav-root" data-page="theorie"></div>
  <script src="js/nav.js"></script>
  ...
```

`data-page` doit correspondre à un `id` de `NAV_LINKS` dans `js/nav.js` : `echauffements`, `theorie`, `journal`, `gammes`/`pentatonique`/`do-majeur` (sous-items du dropdown), `accords`, `partitions` — ou `accueil` pour `index.html`, qui n'a **pas** de lien dédié dans `NAV_LINKS` : le logo "Guitare" fait déjà office de lien vers l'accueil (évite un doublon "Guitare" + "Accueil" côte à côte), et prend `class="active"` quand `data-page="accueil"`. C'est du `<script src="...">` (pas `fetch()`), donc ça fonctionne même en ouvrant le fichier directement en local (`file://`), sans serveur — un `fetch()` local aurait été bloqué par le navigateur (CORS).

**Pour ajouter une page au menu commun**, tout se passe dans `js/nav.js` :
- Nouvelle page de premier niveau (comme Théorie, Journal) → ajouter une entrée `{ id, href, label }` dans `NAV_LINKS`.
- Nouvelle gamme → ajouter une entrée dans le tableau `dropdown` de l'item `gammes`.

Puis, sur la nouvelle page elle-même, poser `<div id="site-nav-root" data-page="mon-id"></div>` + `<script src="js/nav.js"></script>` juste après `<body>` — pas besoin de toucher aux autres pages. Ne pas oublier une carte sur `index.html` (et sur `gammes.html` pour une nouvelle gamme).

Toutes les pages, y compris `pentatonique-mineure.html` et `chord_progressions.html` (qui gardent leur propre `<style>` autonome, voir plus haut), utilisent ce même mécanisme pour le menu.

### Le dropdown "Gammes"

"Gammes" s'ouvre **au survol uniquement** (CSS `:hover` dans `css/nav.css`, pas de clic — demande explicite de l'utilisateur), pour accéder à n'importe quelle gamme en un clic depuis n'importe quelle page sans repasser par le hub `gammes.html`. Cliquer sur le mot "Gammes" lui-même emmène directement au hub. `js/nav.js` marque automatiquement le dropdown et le bon sous-lien comme actifs quand `data-page` correspond à un `id` du sous-menu (`gammes`, `pentatonique`, `do-majeur`).

### Le métronome global

Le bouton "Métronome" est le dernier élément de la barre, poussé à droite (`margin-left: auto`). `js/nav.js` génère aussi ce bouton et injecte un panneau flottant (`#nav-metro-panel`, `position: fixed`) directement dans `<body>`, positionné dynamiquement sous le bouton via `getBoundingClientRect()`. Comportement voulu par l'utilisateur, à respecter si on retouche ce code :
- Clic sur le bouton "Métronome" → ouvre/ferme le panneau (tempo, slider, play/stop en icône ▶/■, réutilisés depuis l'ancien métronome de `echauffements.html`).
- Clic **en dehors** du panneau et du bouton → referme le panneau, mais **sans arrêter** le métronome s'il tourne (le `setInterval`/`AudioContext` continue).
- Tant que le métronome tourne, le bouton de nav passe en terracotta (`.running`) et son petit point clignote à chaque temps (`.site-nav-metro-dot.pulse`) — visible même panneau fermé, pour qu'on sache qu'il tourne toujours sans avoir à rouvrir le panneau.
- **Limite inhérente au site multi-pages statique** : l'état du métronome (en cours ou non, tempo) ne survit pas à une navigation vers une autre page — un changement de page recharge tout le JS. Il continue de tourner uniquement tant qu'on reste sur la même page.

Comme pour la nav, tout est dans `js/nav.js` (une seule fonction `initMetronome()`) + `css/nav.css` (`.site-nav-metro*`) — pas de dépendance à `theme.css` puisque `nav.css` doit rester autonome.

## Contenu actuel

- **Échauffements** : hammer-on et pull-off (schéma 2-2-4 sur la corde 1 uniquement, doigts qui restent posés, décalage d'une case), la torture (position en escalier cases 11-14 sur cordes 6-3, décalage doigt par doigt), le crabe (motif décalé simultané sur 3 cordes) et l'araignée (**différente du crabe** : les 4 doigts 5-6-7-8 restent groupés sur une seule corde, et se déplacent un par un vers la corde suivante, en gardant les autres posés). Le métronome est global (menu du haut), plus embarqué dans cette page.
- **Théorie** : fiches datées (`panel-meta` = "Reçu le JJ/MM/AAAA — cours avec Claire"). Fiches actuelles : cercle des quartes (pas des quintes — sens horaire = quarte ascendante), les notes sur le manche (grille chromatique complète cases 1-12, sharps sauf Bb à la place de A#), transposer 6ᵉ → 4ᵉ corde (règle +2 cases en sautant une corde).
- **Journal** : un `.panel` par date de cours, **du plus récent au plus ancien** (haut → bas), avec une liste de liens vers les fiches/sections concernées ailleurs sur le site. C'est le point d'entrée chronologique ; les fiches elles-mêmes restent organisées par thème dans leurs pages respectives. L'utilisateur ne se souvient pas toujours de la date exacte d'un cours (les cours ont lieu le jeudi) — dans ce cas, dater avec une estimation explicite (`panel-roman` = "Vers le JJ/MM/AAAA", `panel-meta` = "Date approximative — noté rétroactivement") plutôt que d'inventer une date précise.
- **Gammes** : hub (`gammes.html`) + une page par gamme. Actuel : pentatonique mineure (5 positions, interactif, + une fiche `.info-panel` sous l'explorateur pour les licks/exercices liés à cette gamme), Do majeur (position ouverte, 1 octave — la version 2 octaves/démanchée reste à détailler). Gamme blues listée comme "à venir" sur le hub, pas encore de page.
- **Partitions** : morceaux travaillés affichés directement sur la page (ex. grille de blues en Mi, 12 mesures) + liste de liens ouvrant des PDF stockés dans `partitions/`. Le lick de fin du blues en Mi est en attente (photo à déposer dans `partitions/` ou tab à redonner en détail).

## Workflow après chaque cours

L'utilisateur décrit ce que Claire a montré (souvent avec des photos de partition/manche) ; à partir de là :
1. Créer/mettre à jour le contenu à l'endroit pertinent :
   - Nouvelle notion de théorie → nouvelle fiche `.panel` dans `theorie.html`.
   - Nouvel exercice d'échauffement → nouvelle section dans `echauffements.html` (+ lien dans les chips d'ancrage en haut de page).
   - Licks/exercices liés à une gamme précise → fiche sur la page de cette gamme (ex. `pentatonique-mineure.html`), pas dans `theorie.html` ni `echauffements.html`.
   - Nouveau morceau → nouvelle entrée dans `partitions.html` (grille/accords inline si pas de PDF, sinon PDF dans `partitions/` + `.score-link`).
   - Sujet entièrement nouveau (hors catégories existantes) → proposer une nouvelle page + l'ajouter au menu commun sur toutes les pages + une carte sur `index.html`.
2. Ajouter une entrée dans `journal.html` à la date du cours (ou une date approximative si l'utilisateur ne s'en souvient pas — voir plus haut), avec des liens vers tout ce qui a été ajouté/modifié à l'étape 1. La placer au bon endroit selon sa date : les entrées sont classées du plus récent en haut au plus ancien en bas (un cours raconté après coup peut donc se glisser plus bas que les entrées déjà présentes).
3. Garder le même socle visuel (`theme.css`/`nav.css`, palette, polices) pour la cohérence.
