"use strict";
const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-list");
const $searchForm = $("#search-form");
const $episodesBtn = $("#show-getEpisodes");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const url = `http://api.tvmaze.com/search/shows?q=${term}`;
  const res = await axios.get(url);
  //console.log(res);
  //let showObj = { id, name, summary, image }[
  //for each item in res.data, which is an array, get me the {id, name, summary, image} of each show object in res.data
  //res.data=[{showObj}, {}, {}]
  const resultsArr = res.data;
  let showsArr = [];
  function makeShowObj(id, name, summary, image) {
    return { id, name, summary, image };
  }
  //console.log(resultsArr);
  resultsArr.forEach((resultItem) => {
    if (resultItem.show.image) {
      resultItem = makeShowObj(
        resultItem.show.id,
        resultItem.show.name,
        resultItem.show.summary,
        resultItem.show.image.medium
      );
    } else {
      resultItem.show.image = "https://tinyurl.com/tv-missing";
      resultItem = makeShowObj(
        resultItem.show.id,
        resultItem.show.name,
        resultItem.show.summary,
        resultItem.show.image
      );
    }

    showsArr.push(resultItem);

    //console.log(typeof showsArr);
    console.log(showsArr);
  });
  return showsArr;
  
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes" id=${$episodesBtn}>
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  // $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const url = `http://api.tvmaze.com/shows/${id}/episodes`;
  const res = await axios.get(url);
  const resultsArr = res.data;
  let episodesArr = [];
  function makeEpidsodesObj(id, name, season, number) {
    return { id, name, season, number };
  }

  resultsArr.forEach((resultItem) => {
    makeEpidsodesObj(
      resultItem.id,
      resultItem.name,
      resultItem.season,
      resultItem.number
    );
    episodesArr.push(resultItem);
  });

  //console.log(typeof showsArr);
  console.log(episodesArr);
  

  return episodesArr;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  $episodesArea.empty();

  for (let episode of episodes) {
    const $episode = $(
      `<li data-episode-id="${episode.id}" class="list-group-item">${episode.name} (season ${episode.season}, number ${episode.number}</li>
      `
    );

    $episodesArea.append($episode);
  }
  
}

async function searchForEpisodesAndDisplay() {
  const showId = $(this).data("show-id");
  const episodesList = await getEpisodesOfShow(showId);

 
  populateEpisodes(episodesList);
}

$episodesBtn.on("click", function (e) {
  e.preventDefault();
  searchForEpisodesAndDisplay();  
});
