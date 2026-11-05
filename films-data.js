/* =========================================================
   films-data.js
   The single source for all film information.
   Used by the home page (index.html) and film pages (film.html).

   Fields:
   id          unique, lowercase, no spaces (used in the web address)
   title       film title
   year        release year (number)
   role        SRK's role, e.g. "Lead actor"
   director    director's name
   poster      image path, e.g. "images/films/ddlj.jpg" ("" if none)
   synopsis    short summary in your own words ("" shows a placeholder)
   awards      list of verified awards, e.g. ["Best Actor, Filmfare, 1996"]
   trailerId   11-character YouTube ID of an official trailer ("" if none)
   source      https link to a reliable source ("" if none)

   Only add facts you have verified from reliable sources.
   ========================================================= */
window.FILMS = [
  { id: "baazigar",     title: "Baazigar",                    year: 1993, role: "Anti-hero",       director: "Abbas-Mustan",          poster: "images/bazigar.jpg",      synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "darr",         title: "Darr",                        year: 1993, role: "Antagonist",      director: "Yash Chopra",           poster: "images/darr.jpg",          synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "ddlj",         title: "Dilwale Dulhania Le Jayenge", year: 1995, role: "Lead actor",      director: "Aditya Chopra",         poster: "images/dilwa.jpg",          synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "dtph",         title: "Dil To Pagal Hai",            year: 1997, role: "Lead actor",      director: "Yash Chopra",           poster: "images/dtph.jpg",          synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "kkhh",         title: "Kuch Kuch Hota Hai",          year: 1998, role: "Lead actor",      director: "Karan Johar",           poster: "images/kuch.jpg",          synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "devdas",       title: "Devdas",                      year: 2002, role: "Lead actor",      director: "Sanjay Leela Bhansali", poster: "images/devdaas2.jpg",        synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "mohabbatein",  title: "Mohabbatein",                 year: 2000, role: "Lead actor",      director: "Aditya Chopra",         poster: "images/Mohabbatein.jpg",   synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "khnh",         title: "Kal Ho Naa Ho",               year: 2003, role: "Lead actor",      director: "Nikhil Advani",         poster: "images/khnh.jpg",          synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "veerzaara",    title: "Veer-Zaara",                  year: 2004, role: "Lead actor",      director: "Yash Chopra",           poster: "images/veerzaara.jpg",     synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "chakde",       title: "Chak De! India",              year: 2007, role: "Lead actor",      director: "Shimit Amin",           poster: "images/chakde.jpg",        synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "oso",          title: "Om Shanti Om",                year: 2007, role: "Dual role",       director: "Farah Khan",            poster: "images/osm.jpg",           synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "mnik",         title: "My Name Is Khan",             year: 2010, role: "Lead actor",      director: "Karan Johar",           poster: "images/khan.jpg",          synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "chennaiexpress", title: "Chennai Express",           year: 2013, role: "Lead actor",      director: "Rohit Shetty",          poster: "images/chennai.jpg", synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "dilwale",      title: "Dilwale",                     year: 2015, role: "Lead actor",      director: "Rohit Shetty",          poster: "images/Dilwale.jpg",       synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "raees",        title: "Raees",                       year: 2017, role: "Lead actor",      director: "Rahul Dholakia",        poster: "images/raees.jpg",         synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "zero",         title: "Zero",                        year: 2018, role: "Lead actor",      director: "Aanand L. Rai",         poster: "images/zero.jpg",          synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "pathaan",      title: "Pathaan",                     year: 2023, role: "Lead actor",      director: "Siddharth Anand",       poster: "images/pathaan1.jpg",       synopsis: "", awards: [], trailerId: "", source: "" },
  { id: "jawan",        title: "Jawan",                       year: 2023, role: "Dual role",       director: "Atlee",                 poster: "images/jawan.jpg",         synopsis: "", awards: [], trailerId: "", source: "" }
];