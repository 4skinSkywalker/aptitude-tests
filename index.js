if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// Vars
let genres = [
  "ages",
  "area-and-volume",
  "average",
  "boats-and-streams",
  "calendar",
  "clock",
  "cubes",
  "fractions",
  "HCF-and-LCM",
  "interest",
  "logarithms",
  "mixtures",
  "number-series",
  "numbers",
  "partnership",
  "percentage",
  "permutations",
  "pipes-and-cisterns",
  "probability",
  "profit-and-loss",
  "races-and-games",
  "ratio-and-proportion",
  "square-root-and-cube-root",
  "surds-and-indices",
  "time-and-distance",
  "time-and-work",
  "trains"
];

let app = document.querySelector("#app");
let scrollBackBtn = document.querySelector("#scroll-back-btn");
let genreObjs;
let lastScrollPos = 0;

// Evts
document.addEventListener("scroll", setScrollBackBtnText);

// Fns
function setScrollBackBtnText() {
  if (lastScrollPos === 0 && document.documentElement.scrollTop === 0) {
    scrollBackBtn.style.display = "none";
  } else {
    scrollBackBtn.style.display = "block";
  }

  if (document.documentElement.scrollTop !== 0) {
    scrollBackBtn.innerHTML = "▲ Top";
  } else {
    scrollBackBtn.innerHTML = "▼ Prev";
  }
}

function scrollBack() {
  if (document.documentElement.scrollTop !== 0) {
    lastScrollPos = document.documentElement.scrollTop;
    document.documentElement.scrollTop = 0;
  } else {
    document.documentElement.scrollTop = lastScrollPos;
  }
}

async function readJSON(src) {
  let res = await fetch(src);
  let json = res.json();
  return json;
}

function dashedToCapitalize(text) {
  let els = text.split("-");
  els = els.map(el =>
    el[0].toUpperCase() + el.slice(1).toLowerCase()
  );
  return els.join(" ");
}

function getUniqueId() {
  return "_" + (Math.random() + 1).toString(36).substring(7);
}

function findIndexOfGenre(title) {
  return genres.indexOf(title);
}

function escapeHTML(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getGenresHTML(genres, genreObjs) {
  let d = document.createElement("DIV");
  window.reset = function () {
    // Reset all the genres
    let isUserSure = confirm(`Are you sure that you want to reset all progresses?`);
    if (isUserSure) {
      Object.keys(localStorage)
        .filter(key => key.includes("aptitude-"))
        .forEach(key => localStorage.removeItem(key));
      render(getGenresHTML(genres, genreObjs));
    }
  };
  d.innerHTML = `
    <div class="container text-white text-center">
      <h1 class="display-5 my-5">Aptitude Areas</h1>
      <div id="genre-grid" class="m-3">
        ${
          genres.map((genre, i) => {
            let { problems } = genreObjs[i];
            let userCorrectAnswers = Object.entries(localStorage)
              .filter(([key, value]) => key.includes("aptitude-" + genre));
            return `
              <div class="${ userCorrectAnswers.length / problems.length === 1 && 'completed' || '' } fade-in-top staggered d-flex flex-column justify-content-between align-items-center bg-dark p-3 pointer-hover shadow" style="border-radius: 1rem;" onclick="render(getGenreHTML('${genre}'));">
                <div class="fs-3">${dashedToCapitalize(genre)}</div>
                <div class="fs-5">${userCorrectAnswers.length} / ${problems.length}</div>
              </div>
            `
          }).join("")
        }
      </div>
    </div>`;
  return d.firstElementChild;
}

function getGenreHTML(title) {
  let index = findIndexOfGenre(title);
  let { formula, problems } = genreObjs[index];
  let d = document.createElement("DIV");
  window.reset = function () {
    // Reset just the current genre
    let isUserSure = confirm(`Are you sure that you want to reset progresses in ${dashedToCapitalize(title)}?`);
    if (isUserSure) {
      Object.keys(localStorage)
        .filter(key => key.includes("aptitude-" + title))
        .forEach(key => localStorage.removeItem(key));
        render(getGenreHTML(title));
    }
  };
  d.innerHTML = `
    <div class="container text-white">
      <header class="text-center">
        <h1 class="display-5 my-5">${dashedToCapitalize(title)}</h1>
        <div class="my-3">
          <input id="formula-collapse-trigger" hidden type="checkbox">
          <label class="pointer-hover" style="border-radius: 1rem;" for="formula-collapse-trigger"></label>
          <pre id="formula" class="bg-dark text-start shadow">${formula}</pre>
        </div>
        <a class="text-reset" target="_blank" href="https://github.com/4skinSkywalker/aptitude-tests/issues/${index + 1}">Issues with questions in ${dashedToCapitalize(title)}?<br>Click here to report it</a>
      </header>
      <div class="d-grid gap-3 m-3">
        ${
          problems.map((problem, i) => {
            let answerMemoryKey = "aptitude-" + title + "-" + problem.id;
            let savedAnswer = localStorage.getItem(answerMemoryKey);
            return `<div class="fade-in-left staggered d-grid gap-2 bg-dark p-3 shadow" style="border-radius: 1rem;">
              <div>${problem.id} / ${problems.length}</div>
              <pre class="fs-5">${escapeHTML(problem.question)}</pre>
              <div class="d-grid gap-2 m-2">
                ${
                  problem.answers.map((answer, i) => {
                    let checkFnId = getUniqueId();
                    window[checkFnId] = function (radio) {
                      let labelOfChoosenAns = radio.parentElement;
                      let listOfAnswers = labelOfChoosenAns.parentElement;
                      let labelOfSolution = listOfAnswers
                        .querySelectorAll("label")[problem.answerIndex];
                      let solution = document.querySelector("#solution-" + problem.id);
                      if (labelOfChoosenAns !== labelOfSolution) {
                        // Highlight the incorrect answer in red
                        labelOfChoosenAns.classList.add("wrong");
                        // Show the guide
                        solution.classList.remove("d-none");
                        solution.classList.add("fade-in-top");
                      } else {
                        // Save answer to LS
                        localStorage.setItem(
                          answerMemoryKey,
                          problem.answerIndex
                        );
                      }
                      // Highlight the correct answer in green
                      labelOfSolution.classList.add("right");
                    }
                    return `
                      <label
                        for="radio-${problem.id}-${answer}"
                        class="pointer-hover fade-in-top-left staggered d-block p-2 rounded-3 shadow ${(savedAnswer == i) ? 'right' : ''}"
                        style="background-color: #333;"
                      >
                        <input
                          class="pointer-hover"
                          id="radio-${problem.id}-${answer}"
                          type="radio" name="radio-${problem.id}"
                          value="${answer}"
                          oninput="${checkFnId}(this)"
                          ${(savedAnswer == i) ? 'checked' : ''}
                        >
                        ${answer}
                      </label>
                    `;
                  }).join("")
                }
              </div>
              <pre
                id="solution-${problem.id}"
                class="d-none px-4 py-2 fst-italic fs-5"
              >${escapeHTML(problem.solution)}</pre>
            </div>`
          }).join("")
        }
      </div>
    </div>`;
  return d.firstElementChild;
}

function render(el) {
  // Reset the scroll
  lastScrollPos = 0;
  document.documentElement.scrollTop = 0;
  setScrollBackBtnText();
  if (app.firstElementChild) {
    app.replaceChild(
      el,
      app.firstElementChild
    );
  } else {
    app.appendChild(el);
  }
  const lastRight = [...document.querySelectorAll(".right")].pop();
  if (lastRight)
  setTimeout(() =>
    lastRight.scrollIntoView({ behavior: "smooth" })
  , 450);
}

(async function (){

  genreObjs = await Promise.all(
    genres.map(genre =>
      readJSON(genre + ".json")
    )
  );

  render(getGenresHTML(genres, genreObjs));

})();
