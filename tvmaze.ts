import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const API_URL = `http://api.tvmaze.com`
const MISSING_IMG = `https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300`


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

interface Show {
  id: number;
  name: string;
  summary: string;
  image: string;
}

async function getShowsByTerm(term: string | number | string[]): Promise<Show[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const resp = await axios.get(`${API_URL}/search/shows?q=${term}`);
  const shows = resp.data.map( show  => ({
  id: show.show.id,
    name: show.show.name,
    summary: show.show.summary,
    image: show.show.image?.original || MISSING_IMG
  }));

  return shows
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Show[]) : void{
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() : Promise<void>{
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

interface Episode {
  id: number;
  name: string;
  season: number;
  number: number;
}

async function getEpisodesOfShow(id: number): Promise<Episode[]> {
  let resp = await axios.get(`${API_URL}/shows/${id}/episodes`);

  let episodes = resp.data.map(episode =>
     ({id:episode.id, name:episode.name, season:episode.season, number:episode.number}))

  return episodes;
}

/** Given a list of episodes, create markup and append to DOM in #episodeArea */

function populateEpisodes(episodes: Episode[]): void {
  $episodesArea.empty();

  for (let episode of episodes) {
    console.log(episode)
    const $episode = $(
        `<li>
          ${episode.name} (season ${episode.season}, episode ${episode.number})
        </li>
      `);

    $episodesArea.append($episode);  }
  $episodesArea.show();
}

async function listEpisodes(evt) : Promise<void>{
  let showId = $(evt.target).closest(".Show").data("show-id");
  let episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", listEpisodes);