// Loads the herbs from data/herbs.json and shows each one as a card.
// index.html#basil shows one herb, built from data/basil.json.

const home = document.querySelector("#home")
const herbView = document.querySelector("#herb-view")
const list = document.querySelector("#herbs-list")
const count = document.querySelector(".count")
const filters = document.querySelector(".filters")
const search = document.querySelector("#search")
const life = document.querySelector("#life")
const siteTitle = document.title

const state = {
  herbs: [],
  missing: 0,
  query: "",
  life: "all",
  lastHerb: null,
}

async function loadJSON(url) {
  const response = await fetch(url)
  if (!response.ok) {
    const error = new Error(`Could not load ${url}: ${response.status} ${response.statusText}`)
    error.status = response.status
    throw error
  }
  try {
    return await response.json()
  } catch {
    throw new Error(`${url} is not valid JSON.`)
  }
}

function explain(error) {
  if (location.protocol === "file:") {
    return "This page needs a web server. Run npx serve and open the address it prints."
  }
  if (error instanceof TypeError) {
    return "The server cannot be reached. Check your connection and reload the page."
  }
  return error.message
}

function isHerbId(id) {
  return /^[a-z]+(-[a-z]+)*$/.test(id)
}

function element(tag, className, text) {
  const node = document.createElement(tag)
  node.className = className
  node.textContent = text
  return node
}

function link(href, text, className) {
  const node = element("a", className, text)
  node.href = href
  return node
}

function card(herb) {
  const item = element("li", "card", "")
  const name = element("h3", "name", "")
  name.append(link(`#${herb.id}`, herb.name, ""))
  item.append(
    name,
    element("p", "latin", herb.latin),
    element("p", "use", herb.use),
    element("p", "life", herb.life))
  return item
}

function matches(herb) {
  const text = `${herb.name} ${herb.latin} ${herb.use}`.toLowerCase()
  return text.includes(state.query) && (state.life === "all" || herb.life === state.life)
}

function showList() {
  const shown = state.herbs.filter(matches)
  list.replaceChildren(...shown.map(card))

  if (shown.length === 0) count.textContent = "No herb matches your search."
  else if (shown.length === state.herbs.length) count.textContent = `${shown.length} herbs grow here.`
  else count.textContent = `Showing ${shown.length} of ${state.herbs.length} herbs.`
  if (state.missing > 0) count.textContent += ` (${state.missing} could not be loaded.)`
}

function showListProblem(message) {
  count.textContent = message
  count.classList.add("error")
}

async function loadHerbs() {
  let ids
  try {
    ids = await loadJSON("data/herbs.json")
  } catch (error) {
    showListProblem(explain(error))
    return
  }

  // One missing herb file must not stop the others from showing.
  const results = await Promise.allSettled(ids.filter(isHerbId).map(async (id) => {
    const herb = await loadJSON(`data/${id}.json`)
    return { ...herb, id }
  }))
  for (const result of results) {
    if (result.status === "fulfilled") state.herbs.push(result.value)
    else console.warn(result.reason.message)
  }
  state.missing = results.length - state.herbs.length

  if (state.herbs.length === 0) showListProblem("No herbs could be loaded. Please try again later.")
  else showList()
}

function heading(text) {
  const node = element("h1", "", text)
  node.tabIndex = -1
  return node
}

function herbPage(herb) {
  const parts = [
    link("#herbs", "← All herbs", "back"),
    heading(herb.name),
    element("p", "latin", herb.latin),
    element("p", "life", herb.life),
  ]
  if (herb.description) parts.push(element("p", "description", herb.description))

  const growing = herb.growing ?? {}
  const facts = element("dl", "facts", "")
  if (growing.sun) facts.append(element("dt", "", "Sun"), element("dd", "", growing.sun))
  if (growing.water) facts.append(element("dt", "", "Water"), element("dd", "", growing.water))
  if (growing.height) facts.append(element("dt", "", "Height"), element("dd", "", growing.height))
  if (facts.children.length > 0) parts.push(element("h2", "", "Growing"), facts)

  parts.push(element("h2", "", "Use"), element("p", "", herb.use))
  if (herb.harvest) parts.push(element("h2", "", "Harvest"), element("p", "", herb.harvest))
  return parts
}

function problemPage(title, message) {
  return [
    link("#herbs", "← All herbs", "back"),
    heading(title),
    element("p", "error", message),
  ]
}

function showPage(title, parts) {
  herbView.replaceChildren(...parts)
  herbView.querySelector("h1").focus()
  document.title = `${title} · ${siteTitle}`
}

async function showHerb(id) {
  home.hidden = true
  herbView.hidden = false
  herbView.replaceChildren(element("p", "", "Loading…"))
  window.scrollTo(0, 0)
  state.lastHerb = id

  const unknown = problemPage("Unknown herb", `We do not grow “${id}” here.`)
  if (!isHerbId(id)) {
    showPage("Unknown herb", unknown)
    return
  }

  try {
    const herb = await loadJSON(`data/${id}.json`)
    if (currentId() === id) showPage(herb.name, herbPage(herb))
  } catch (error) {
    if (currentId() !== id) return
    if (error.status === 404) showPage("Unknown herb", unknown)
    else showPage("Could not load this herb", problemPage("Could not load this herb", explain(error)))
  }
}

function showHome(target) {
  herbView.hidden = true
  home.hidden = false
  document.title = siteTitle

  // Back from a herb page: focus returns to that herb's card.
  const backTo = state.lastHerb && list.querySelector(`a[href="#${state.lastHerb}"]`)
  state.lastHerb = null

  if (backTo && (!target || target.id === "herbs")) {
    backTo.focus()
  } else if (target) {
    target.tabIndex = -1
    target.focus()
  }
}

function currentId() {
  try {
    return decodeURIComponent(location.hash.slice(1))
  } catch {
    return location.hash.slice(1)
  }
}

function route() {
  const id = currentId()
  const target = id && document.getElementById(id)
  if (!id || (target && home.contains(target))) showHome(target)
  else showHerb(id)
}

filters.addEventListener("submit", (event) => event.preventDefault())

search.addEventListener("input", () => {
  state.query = search.value.trim().toLowerCase()
  showList()
})

life.addEventListener("change", () => {
  state.life = life.value
  showList()
})

window.addEventListener("hashchange", route)

loadHerbs()
route()
