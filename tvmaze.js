"use strict";
const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-list");
const $searchForm = $("#search-form");
const $episodesListSection = $("#episodes-list");
/**
 * Element.closest() polyfill
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
 */
// if (!Element.prototype.closest) {
// 	if (!Element.prototype.matches) {
// 		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
// 	}
// 	Element.prototype.closest = function (s) {
// 		var el = this;
// 		var ancestor = this;
// 		if (!document.documentElement.contains(el)) return null;
// 		do {
// 			if (ancestor.matches(s)) return ancestor;
// 			ancestor = ancestor.parentElement;
// 		} while (ancestor !== null);
// 		return null;
// 	};
// }
function makeCard(id, name, ...props) {
  return { id, name, ...props };
}
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

  const resultsArr = res.data;
  console.log(res.data);
  let showsArr = [];
  function makeShowObj(id, name, summary, image) {
    return { id, name, summary, image };
  }

  resultsArr.forEach((resultItem) => {
    // if (resultItem.show.image) {
    //   resultItem = makeCard(
    //     resultItem.show.id,
    //     resultItem.show.name,
    //     resultItem.show.summary,
    //     resultItem.show.image.medium);
    // } else {
    //   resultItem.show.image = "https://tinyurl.com/tv-missing";
    //   resultItem = makeCard(
    //       resultItem.show.id,
    //       resultItem.show.name,
    //       resultItem.show.summary,
    //       resultItem.show.image
    //     );
    // }
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
  });
  return showsArr;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show card col-lg-6">
        <div class="media">
            
          <img 
            src="${show.image}" 
            alt="${show.name}" 
            class="img-fluid rounded">
          <div class="media-body">
            <h5 class="fw-bolder">${show.name}</h5>
            <div class="info"><small>${show.summary}</small></div>
            <button class="btn btn-info btn-sm Show-getEpisodes">
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

  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
  $searchForm.trigger("reset");
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const url = `http://api.tvmaze.com/shows/${id}/episodes`;
  const res = await axios.get(url);
  const resultsArr = res.data;
  let episodesArr = [];

  resultsArr.forEach((resultItem) => {
    episodesArr.push(
      makeCard(
        resultItem.id,
        resultItem.name,
        resultItem.season,
        resultItem.number
      )
    );
  });

  return episodesArr;
}

/** Write a clear docstring for this function... */

async function populateEpisodes(episodes) {
  $episodesArea.empty();
  console.log("EPISODES", await episodes);
  let $episodesList = await episodes;
  for (let episode of $episodesList) {
    const $episode = $(
      `<li data-episode-id="${episode.id}" class="list-group-item list-group-flush">Episode Title: ${episode.name} (Season - ${episode[0]}, Number - ${episode[1]})</li>
      `
    );

    // $episodesArea.append($episode);
    $episodesListSection.append($episode);
  }
  $episodesArea.parent().css("display", "contents");
}

$showsList.on("click", function (e) {
  e.preventDefault();
  const showId = e.target
    .closest("[data-show-id]")
    .getAttribute("data-show-id");
  console.log(showId);

  const episodesToPopulate = getEpisodesOfShow(showId);
  // console.log(episodesToPopulate);
  // console.log(typeof(episodesToPopulate));
  // $("html, body").scrollTop(3600); // <-- Also integer can be used

  this.scrollIntoView(false);

  populateEpisodes(episodesToPopulate);
});
