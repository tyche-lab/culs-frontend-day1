// Loads the herbs from data/herbs.json and shows each one as a card.
// index.html#basil shows one herb, built from data/basil.json by herb-page.js.

import { element, link, picture, herbPage, problemPage } from "./herb-page.js"

const home = document.querySelector("#home")
const herbView = document.querySelector("#herb-view")
const list = document.querySelector("#herbs-list")
const count = document.querySelector(".count")
const filters = document.querySelector(".filters")
const search = document.querySelector("#search")
const life = document.querySelector("#life")
const skipLink = document.querySelector(".skip-link")
const main = document.querySelector("main")
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
  if (error instanceof TypeError) {
    return "The server cannot be reached. Check your connection and reload the page."
  }
  return error.message
}

function isHerbId(id) {
  return /^[a-z]+(-[a-z]+)*$/.test(id)
}

function card(herb) {
  const item = element("li", "card", "")
  // The name below says what the picture shows, so the picture has an empty alt.
  if (herb.img) {
    const image = picture(herb.img, "", "card-picture")
    image.loading = "lazy"
    item.append(image)
  }
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

function countText(shown) {
  if (shown === 0) return "No herb matches your search."
  if (shown === state.herbs.length) return `${shown} herbs grow here.`
  return `Showing ${shown} of ${state.herbs.length} herbs.`
}

function showList() {
  const shown = state.herbs.filter(matches)
  list.replaceChildren(...shown.map(card))

  count.textContent = countText(shown.length)
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

  if (state.herbs.length === 0) {
    showListProblem("No herbs could be loaded. Please try again later.")
  } else {
    showList()
  }
}

function showPage(title, parts) {
  herbView.replaceChildren(...parts)
  herbView.querySelector("h1").focus()
  document.title = `${title} · ${siteTitle}`
}

function showProblem(title, message) {
  showPage(title, problemPage(title, message))
}

async function showHerb(id) {
  home.hidden = true
  herbView.hidden = false
  herbView.replaceChildren(element("p", "", "Loading…"))
  window.scrollTo(0, 0)
  state.lastHerb = id

  const unknown = `We do not grow “${id}” here.`
  if (!isHerbId(id)) {
    showProblem("Unknown herb", unknown)
    return
  }

  try {
    const herb = await loadJSON(`data/${id}.json`)
    if (currentId() === id) showPage(herb.name, herbPage(herb))
  } catch (error) {
    if (currentId() !== id) return
    if (error.status === 404) showProblem("Unknown herb", unknown)
    else showProblem("Could not load this herb", explain(error))
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
  if (!id || (target && !herbView.contains(target))) showHome(target)
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

// The skip link only moves focus; changing the address would leave the herb page.
skipLink.addEventListener("click", (event) => {
  event.preventDefault()
  main.focus()
})

loadHerbs()
route()
