# The Little Herb Garden

> Herbs you can smell, taste and grow.

The Little Herb Garden is a small garden with herbs for the kitchen, for tea and
for the bees. I built this website so visitors can see what grows in the garden,
learn how to use and grow each herb, and plan their visit.

**Live site:** https://tyche-lab.github.io/culs-frontend-day1/

Team member - Su Yati (xyats001@studenti.czu.cz)

## Table of contents

- [Features](#features)
- [Built with](#built-with)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Project structure](#project-structure)
- [Herb data format](#herb-data-format)
- [Adding a new herb](#adding-a-new-herb)
- [Error handling](#error-handling)
- [Deployment](#deployment)

## Features

- **Herb catalogue:** every herb in the garden is shown as a card with its
  picture, name, Latin name, use, and whether it is annual or perennial.
- **A page for every herb:** each herb has its own page, laid out like a
  recipe card: the picture and name on top, a small table of how much sun,
  water and space it needs, numbered steps for growing it, and ways to use it.
- **Videos:** a herb page can show a YouTube video, like the growing guide on
  the rosemary page.
- **Shareable links:** every herb page has its own address, for example
  `#basil`, so it can be bookmarked or sent to a friend.
- **Search:** results update while you type. You can search by name, Latin name
  or use. For example, "tea" finds spearmint, sage and chamomile.
- **Filter:** show only annual herbs or only perennial herbs.
- **Keyboard friendly:** the whole site works without a mouse.
- **Handles errors:** if something is missing, the visitor gets a clear message
  instead of a broken page.
- **Responsive:** works on phones, tablets and desktops.

## Built with

- HTML
- CSS
- JavaScript (no frameworks, no build step)
- JSON for the herb data

## Getting started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (LTS version), which includes `npx`

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/tyche-lab/culs-frontend-day1.git
   cd culs-frontend-day1
   ```

2. Start a local web server:

   ```sh
   npx serve
   ```

3. Open <http://localhost:3000> in your browser.

To stop the server, press `Ctrl+C`.

> **Note:** The site has to run on a web server. 

## Usage

| Address | What you see |
|---|---|
| `index.html` | home page with all herbs |
| `index.html#basil` | the basil page |
| `index.html#herbs` | the herb list |
| `index.html#visit` | opening hours |
| `index.html#about` | about the garden |

To open a herb, click its card.
To go back, click **All herbs**.

## Project structure

```text
culs-frontend-day1/
├── index.html        the only HTML page
├── style.css         styles
├── app.js            loads the data, the herb list, search, filter and routing
├── herb-page.js      builds the page for each herb
├── data/
│   ├── herbs.json    list of all herb ids, in display order
│   ├── basil.json    one file for each herb
│   ├── chamomile.json
│   ├── chives.json
│   ├── lavender.json
│   ├── rosemary.json
│   ├── sage.json
│   ├── spearmint.json
│   └── thyme.json
└── images/
    ├── logo.svg
    ├── garden.svg    picture on the home page
    ├── basil.svg     one picture for each herb
    ├── chamomile.svg
    ├── chives.svg
    ├── lavender.svg
    ├── rosemary.svg
    ├── sage.svg
    ├── spearmint.svg
    └── thyme.svg
```

### How it works

1. `app.js` loads `data/herbs.json` to get the list of herb ids.
2. It loads every `data/<id>.json` with `fetch()` and shows the herbs as cards.
3. When the address changes to `#<id>`, it loads `data/<id>.json`, and
   `herb-page.js` builds the herb page.
4. When the visitor types in search or changes the filter, the page saves it in
   `state` and draws the list again.

The JavaScript is split into modules. `app.js` loads the other files with
`import`, so `index.html` needs only one `<script type="module">`.

## Herb data format

Every herb has its own file `data/<id>.json`, and they all use the same format.

```json
{
  "name": "Basil",
  "latin": "Ocimum basilicum",
  "life": "annual",
  "use": "Tomatoes, pesto and anything summery.",
  "description": "A herb that loves warm weather, with soft leaves that smell sweet.",
  "img": {
    "src": "images/basil.svg",
    "alt": "A sprig of basil with bright green, oval leaves"
  },
  "growing": {
    "sun": "Full sun",
    "water": "Keep the soil moist, water at the base",
    "height": "30 to 60 cm"
  },
  "harvest": "Pinch off the top leaves often, before the plant flowers."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | common name, used as the page heading |
| `latin` | string | yes | scientific name |
| `life` | `"annual"` \| `"perennial"` | yes | lives for one year or for many years |
| `use` | string | yes | what the herb is good for, one sentence |
| `description` | string | no | a few sentences about the plant |
| `img.src` | string | no | path to the herb's picture, e.g. `images/basil.svg` |
| `img.alt` | string | with `img` | what the picture shows, for screen readers |
| `growing.sun` | string | no | how much sun it needs |
| `growing.water` | string | no | how much water it needs |
| `growing.height` | string | no | how tall it grows |
| `harvest` | string | no | when and how to harvest it |
| `steps` | list of strings | no | steps for growing it, shown as a numbered list |
| `uses` | list of strings | no | ways to use the herb; without it, `use` is shown |
| `video.youtube` | string | no | the YouTube video id, e.g. `Lr35gagWw6Y` |
| `video.title` | string | with `video` | the title of the video, for screen readers |
| `video.author` | string | no | who made the video, shown as credit |

The **id** is the file name without `.json`. It uses lowercase letters, with
words joined by `-`, for example `lemon-balm`.

## Adding a new herb

1. Create `data/<id>.json` using the format above. If you have a picture,
   save it as `images/<id>.svg` and add the `img` field.
2. Add the id to `data/herbs.json`:

   ```json
   ["basil", "spearmint", "rosemary", "lemon-balm"]
   ```

3. Reload the page. The new herb appears in the list, and its page is at
   `#<id>`.

## Error handling

| Situation | What the visitor sees |
|---|---|
| unknown herb, e.g. `#mint` | "We do not grow “mint” here." and a link back |
| one herb file is missing | the other herbs, and how many could not load |
| `data/herbs.json` is missing | a message saying which file is missing |
| a file is not valid JSON | a message saying which file is broken |
| a herb picture is missing | the herb without its picture, no broken image |
| server cannot be reached | a message asking to check the connection and reload |
| page opened as `file://` | a message explaining how to start a web server |

## Deployment

Hosting the site on GitHub Pages.

1. Push the changes to the `main` branch.
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select **main** and **/ (root)**, then click **Save**.
5. After a few minutes, the site is live at the address shown on that page.



