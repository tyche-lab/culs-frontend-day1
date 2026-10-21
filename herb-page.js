// Builds the page for one herb: index.html#rosemary shows data/rosemary.json.
// The small helpers at the top are also used by app.js.

export function element(tag, className, text) {
  const node = document.createElement(tag)
  node.className = className
  node.textContent = text
  return node
}

export function link(href, text, className) {
  const node = element("a", className, text)
  node.href = href
  return node
}

export function picture(img, alt, className) {
  const node = element("img", className, "")
  node.src = img.src
  node.alt = alt
  node.addEventListener("error", () => node.remove())
  return node
}

function heading(text) {
  const node = element("h1", "", text)
  node.tabIndex = -1
  return node
}

function section(title, ...content) {
  const node = element("section", "", "")
  node.append(element("h2", "", title), ...content)
  return node
}

function list(tag, className, items) {
  const node = element(tag, className, "")
  node.append(...items.map((item) => element("li", "", item)))
  return node
}

function top(herb) {
  const node = element("header", "recipe-top", "")
  if (herb.img) node.append(picture(herb.img, herb.img.alt ?? "", "recipe-picture"))
  node.append(
    heading(herb.name),
    element("p", "latin", herb.latin),
    element("p", "life", herb.life))
  if (herb.description) node.append(element("p", "", herb.description))
  return node
}

function row(label, value) {
  const node = element("tr", "", "")
  const head = element("th", "", label)
  head.scope = "row"
  node.append(head, element("td", "", value))
  return node
}

function facts(herb) {
  const growing = herb.growing ?? {}
  const table = element("table", "recipe-facts", "")
  for (const [label, value] of [
    ["Sun", growing.sun],
    ["Water", growing.water],
    ["Height", growing.height],
    ["Lives for", { annual: "One year", perennial: "Many years" }[herb.life]],
  ]) {
    if (value) table.append(row(label, value))
  }
  return table
}

function recipeCard(herb) {
  const node = element("div", "recipe-card", "")
  node.append(top(herb), facts(herb))
  if (herb.steps) node.append(section("How to grow it", list("ol", "steps", herb.steps)))
  node.append(section("How to use it", list("ul", "", herb.uses ?? [herb.use])))
  if (herb.harvest) node.append(section("Harvest", element("p", "", herb.harvest)))
  return node
}

function video(info) {
  const frame = element("iframe", "", "")
  frame.src = `https://www.youtube-nocookie.com/embed/${info.youtube}`
  frame.title = info.title
  frame.loading = "lazy"
  frame.referrerPolicy = "strict-origin-when-cross-origin"
  frame.allow = "encrypted-media; picture-in-picture; fullscreen"
  const player = element("div", "video-player", "")
  player.append(frame)

  const url = `https://www.youtube.com/watch?v=${info.youtube}`
  const credit = element("p", "", info.author ? `Video by ${info.author}. ` : "")
  credit.append(link(url, "Open the video on YouTube", ""), ".")

  return section("Watch how it grows", player, credit)
}

export function herbPage(herb) {
  const node = element("div", "recipe", "")
  node.append(link("#herbs", "← All herbs", "back"), recipeCard(herb))
  if (herb.video?.youtube) node.append(video(herb.video))
  node.append(link("#herbs", "← All herbs", "back"))
  return [node]
}

export function problemPage(title, message) {
  return [
    link("#herbs", "← All herbs", "back"),
    heading(title),
    element("p", "error", message),
  ]
}
