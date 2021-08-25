if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// Vars
let genre = [
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
let genreProblems;

// Events

// Fns
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
  return genre.indexOf(title);
}

function escapeHTML(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getGenreList(areas, genreProblems) {
  let d = document.createElement("DIV");
  window.reset = function () {
    // Reset all the genres
    let isUserSure = confirm(`Are you sure that you want to reset all progresses?`);
    if (isUserSure) {
      Object.keys(localStorage)
        .filter(key => key.includes("aptitude-"))
        .forEach(key => localStorage.removeItem(key));
      location.reload();
    }
  };
  d.innerHTML = `
    <div class="container">
      <h1 class="display-5 text-white text-center my-5">Aptitude Areas</h1>
      <div class="d-grid gap-3 m-3">
        ${
          areas.map((area, i) => {
            let userCorrectAnswers = Object.entries(localStorage)
              .filter(([key, value]) => key.includes("aptitude-" + area));
            return `
              <div class="bg-dark text-white p-3 pnt-ovr shadow" style="border-radius: 1rem;" onclick="render(getProblemsList('${area}'));">
                <div class="d-grid gap-2 text-center">
                  <div class="fs-3">${dashedToCapitalize(area)}</div>
                  <div class="fs-5">${userCorrectAnswers.length} / ${genreProblems[i].length}</div>
                </div>
              </div>
            `
          }).join("")
        }
      </div>
    </div>`;
  return d.firstElementChild;
}

function getProblemsList(title) {
  let index = findIndexOfGenre(title);
  let problems = genreProblems[index];
  let d = document.createElement("DIV");
  window.reset = function () {
    // Reset just the current genre
    let isUserSure = confirm(`Are you sure that you want to reset progresses in ${dashedToCapitalize(title)}?`);
    if (isUserSure) {
      Object.keys(localStorage)
        .filter(key => key.includes("aptitude-" + title))
        .forEach(key => localStorage.removeItem(key));
      location.reload();
    }
  };
  d.innerHTML = `
    <div class="container">
      <header class="text-white text-center">
        <h1 class="display-5 my-5">${dashedToCapitalize(title)}</h1>
        <a class="text-reset" target="_blank" href="https://github.com/4skinSkywalker/aptitude-tests/issues/${index + 1}">Issues with questions in ${dashedToCapitalize(title)}?<br>Click here to report it</a>
      </header>
      <div class="d-grid gap-3 m-3">
        ${
          problems.map((problem, i) => {
            let answerMemoryKey = "aptitude-" + title + "-" + problem.id;
            let savedAnswer = localStorage.getItem(answerMemoryKey);
            return `<div class="d-grid gap-2 bg-dark text-white p-3 shadow" style="border-radius: 1rem;">
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
                      if (labelOfChoosenAns !== labelOfSolution) {
                        // Highlight the incorrect answer in red
                        labelOfChoosenAns.classList.add("bg-danger");
                        // Show the guide
                        document.querySelector("#solution-" + problem.id)
                          .classList.remove("d-none");
                      } else {
                        // Save answer to LS
                        localStorage.setItem(
                          answerMemoryKey,
                          problem.answerIndex
                        );
                      }
                      // Highlight the correct answer in green
                      labelOfSolution.classList.add("bg-success");
                    }
                    return `
                      <label
                        for="radio-${problem.id}-${answer}"
                        class="d-block p-2 rounded-3 shadow ${(savedAnswer == i) ? 'bg-success' : ''}"
                        style="background-color: #333;"
                      >
                        <input
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
  if (app.firstElementChild) {
    app.replaceChild(
      el,
      app.firstElementChild
    );
  } else {
    app.appendChild(el);
  }
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

(async function (){

  genreProblems = await Promise.all(
    genre.map(area =>
      readJSON(area + ".json")
    )
  );

  render(getGenreList(genre, genreProblems));

})();