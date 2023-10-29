var courses;
var courseInfo;
let tableBody1 = document.querySelector("#tbody1");
let tableBody2 = document.querySelector("#tbody2");
loadPlayer();
let yardTable = document.getElementById("yardage");
let parTable = document.getElementById("par");
let hcpTable = document.getElementById("handicap");
let yardTable2 = document.getElementById("yardage2");
let parTable2 = document.getElementById("par2");
let hcpTable2 = document.getElementById("handicap2");
function getAvailableGolfCourses() {
  return fetch(
    "https://exquisite-pastelito-9d4dd1.netlify.app/golfapi/courses.json"
  ).then(function (response) {
    return response.json();
  });
}
function getGolfCourseDetails(golfCourseId) {
  return fetch(
    `https://exquisite-pastelito-9d4dd1.netlify.app/golfapi/course${golfCourseId}.json`
  ).then(function (response) {
    return response.json();
  });
}

function load() {
  getAvailableGolfCourses().then((result) => {
    courses = result;
    let emptyOption = `<option value="" disabled selected>Select a Golf Course</option>`;
    let courseOptionsHtml = "";
    courses.forEach((course) => {
      courseOptionsHtml += `<option value="${course.id}">${course.name}</option>`;
    });

    document.getElementById("course-select").innerHTML =
      courseOptionsHtml + emptyOption;
    document
      .getElementById("course-select")
      .addEventListener("change", function () {
        courseSpecs();
        toFindSelectedCourse();
      });
  });
}
load();

function courseSpecs() {
  let totalYards = {};
  const selectedCourseId = document.getElementById("course-select").value;
  getGolfCourseDetails(selectedCourseId).then((golfCourseDetails) => {
    courseInfo = golfCourseDetails;
    courseInfo.holes.forEach((hole) => {
      hole.teeBoxes.forEach(function (teeBox) {
        if (!totalYards[teeBox.teeType]) {
          totalYards[teeBox.teeType] = teeBox.yards;
        } else {
          totalYards[teeBox.teeType] += teeBox.yards;
        }
      });
    });
    let emptyOption = `<option value="" disabled selected>Select a Tee Type</option>`;
    let teeBoxSelectHtml = "";
    for (let teeBoxProp in totalYards) {
      let yards = totalYards[teeBoxProp];
      teeBoxSelectHtml += `<option value="${teeBoxProp}">${teeBoxProp.toUpperCase()}, 
        ${yards} yards</option>`;
      document.getElementById("tee-box-select").innerHTML =
        teeBoxSelectHtml + emptyOption;
    }
    document
      .getElementById("tee-box-select")
      .addEventListener("change", function () {
        toFindSelectedTee();
      });
  });
}

class Player {
  constructor(name, id = getNextId(), scores = Array(9).fill(null)) {
    this.name = name;
    this.id = id;
    this.scores = scores;
  }
}
let playerIdCounter = 1;

function getNextId() {
  return playerIdCounter++;
}

let nameInput = document.getElementById("nameInput");
let nameButton = document.getElementById("nameButton");
nameButton.addEventListener("click", clickNameButton);

function clickNameButton() {
  let newPlayer = new Player(nameInput.value);
  nameInput.value = "";
  let newPlayerHTML = `
    <tr class="playerName">
      <th scope="row">${newPlayer.name}</th>
      <th class="hole" scope="row"></th>
      <th class="hole" scope="row"></th>
      <th class="hole" scope="row"></th>
      <th class="hole" scope="row"></th>
      <th class="hole" scope="row"></th>
      <th class="hole" scope="row"></th>
      <th class="hole" scope="row"></th>
      <th class="hole" scope="row"></th>
      <th class="hole" scope="row"></th>
      <th scope="row"></th>
    </tr>`;
  tableBody1.innerHTML += newPlayerHTML;
  tableBody2.innerHTML += newPlayerHTML
  savePlayer(newPlayer);
  addingNameScore();
}
let selectedCourseArr = [];
function toFindSelectedCourse() {
  let selectedCourse = document.getElementById("course-select");
  let selectedIndex = selectedCourse.selectedIndex;
  let selectedOption = selectedCourse.options[selectedIndex];
  console.log("Selected value is: " + selectedOption.value);
  console.log("Selected text is: " + selectedOption.text);
  selectedCourseArr = selectedOption.text;
  saveCourse(selectedCourseArr);
}
function toFindSelectedTee() {
  let belowNineArray = [];
  let belowNinePar = [];
  let belowNineHcp = [];
  let aboveNineArray = [];
  let aboveNinePar = [];
  let aboveNineHcp = [];
  let selectedTee = document.getElementById("tee-box-select");
  let selectedIndex = selectedTee.selectedIndex;
  let selectedOption = selectedTee.options[selectedIndex];
  courseInfo.holes.forEach((hole) => {
    if (hole.hole <= 9) {

      hole.teeBoxes.forEach((teeBox) => {
        if (selectedOption.value === teeBox.teeType) {
          let selectedOptionYards = teeBox.yards;
          let selectedOptionPar = teeBox.par;
          let selectedOptionHcp = teeBox.hcp;
          belowNineArray.push(selectedOptionYards);
          belowNinePar.push(selectedOptionPar);
          belowNineHcp.push(selectedOptionHcp);
          let tableRows = '<tr><th scope="row">Yardage</th>';

          let total = 0;
          for (let i = 0; i < belowNineArray.length; i++) {
            tableRows += `<th scope="row">${belowNineArray[i]}</th>`;
            total += belowNineArray[i];
          }
          tableRows += `<th scope="row">${total}</th></tr>`;
          yardTable.innerHTML = tableRows;

          let parTableRows = '<tr><th scope="row">Par</th>';
          let parTotal = 0;
          for (let i = 0; i < belowNinePar.length; i++) {
            parTableRows += `<th scope="row">${belowNinePar[i]}</th>`;
            parTotal += belowNinePar[i];
          }
          parTableRows += `<th scope="row">${parTotal}</th></tr>`;
          parTable.innerHTML = parTableRows;

          let hcpTableRows = '<tr><th scope="row">Handicap</th>';
          for (let i = 0; i < belowNineHcp.length; i++) {
            hcpTableRows += `<th scope="row">${belowNineHcp[i]}</th>`;
          }
          hcpTableRows += `<th scope="row"></th></tr>`;
          hcpTable.innerHTML = hcpTableRows;
        }
      });
    } else {
        hole.teeBoxes.forEach((teeBox) => {
            if (selectedOption.value === teeBox.teeType) {
              let selectedOptionYards = teeBox.yards;
              let selectedOptionPar = teeBox.par;
              let selectedOptionHcp = teeBox.hcp;
              aboveNineArray.push(selectedOptionYards);
              aboveNinePar.push(selectedOptionPar);
              aboveNineHcp.push(selectedOptionHcp);
              let tableRows = '<tr><th scope="row">Yardage</th>';
    
              let total = 0;
              for (let i = 0; i < aboveNineArray.length; i++) {
                tableRows += `<th scope="row">${aboveNineArray[i]}</th>`;
                total += aboveNineArray[i];
              }
              tableRows += `<th scope="row">${total}</th></tr>`;
              yardTable2.innerHTML = tableRows;
    
              let parTableRows = '<tr><th scope="row">Par</th>';
              let parTotal = 0;
              for (let i = 0; i < aboveNinePar.length; i++) {
                parTableRows += `<th scope="row">${aboveNinePar[i]}</th>`;
                parTotal += aboveNinePar[i];
              }
              parTableRows += `<th scope="row">${parTotal}</th></tr>`;
              parTable2.innerHTML = parTableRows;
    
              let hcpTableRows = '<tr><th scope="row">Handicap</th>';
              for (let i = 0; i < aboveNineHcp.length; i++) {
                hcpTableRows += `<th scope="row">${aboveNineHcp[i]}</th>`;
              }
              hcpTableRows += `<th scope="row"></th></tr>`;
              hcpTable2.innerHTML = hcpTableRows;
            }
          });
    }
  });
  saveTee(selectedOption.value);
}
reload();
function reload() {
  let course = localStorage.getItem("Course");
  if (course === null) {
  } else {
    document
      .getElementById("course-select")
      .querySelectorAll("option")
      .forEach((option) => {
        if (option.text === course) {
          option.setAttribute("selected", "selected");
          console.log(option);
        }
      });
  }
}
function saveCourse(selectedCourseArr) {
  localStorage.setItem("Course", selectedCourseArr);
}
function saveTee(selectedTee) {
  localStorage.setItem("Tee", selectedTee);
}
function savePlayer(player) {
  let players = JSON.parse(localStorage.getItem("players")) || [];
  players.push(player);
  localStorage.setItem("players", JSON.stringify(players));
}
function savePlayerId() {
  console.log("hello");
}
function addingNameScore() {
  let names = document.querySelectorAll(".playerName");
  names.forEach((name) => {
    name.querySelectorAll(".hole").forEach((hole) => {
      hole.addEventListener("click", addingScore);
    });
  });
}
function addingNameScore() {
  let names = document.querySelectorAll(".playerName");
  names.forEach((name) => {
    let holes = name.querySelectorAll(".hole");
    holes.forEach((hole, index) => {
      hole.setAttribute("contenteditable", true);
      hole.addEventListener("input", () => {
        let players = JSON.parse(localStorage.getItem("players")) || [];
        let playerName = name.querySelector("th").textContent;
        let playerIndex = players.findIndex(
          (player) => player.name === playerName
        );

        if (playerIndex !== -1) {
          let typedText = hole.textContent.trim();
          if (typedText === "") {
            players[playerIndex].scores[index] = null;
          } else if (!isNaN(parseInt(typedText))) {
            players[playerIndex].scores[index] = parseInt(typedText);
          }

          localStorage.setItem("players", JSON.stringify(players));
        }
      });
    });
  });
}

function loadPlayer() {
    let players = JSON.parse(localStorage.getItem("players")) || [];
    players.forEach((player) => {
        let playerRow = document.createElement("tr");
        playerRow.classList.add("playerName");

        let nameCell = document.createElement("th");
        nameCell.scope = "row";
        nameCell.textContent = player.name;
        playerRow.appendChild(nameCell);

        for (let i = 0; i < 9; i++) {
            let scoreCell = document.createElement("th");
            scoreCell.classList.add("hole");
            scoreCell.scope = "row";
            scoreCell.setAttribute("contenteditable", true);

            // Check if the score for this hole is null or undefined
            if (player.scores[i] !== null && player.scores[i] !== undefined) {
                scoreCell.textContent = player.scores[i];
            }

            scoreCell.addEventListener("input", function (event) {
                let typedText = event.target.textContent.trim();
                if (typedText === "") {
                    player.scores[i] = null;
                } else if (!isNaN(parseInt(typedText))) {
                    player.scores[i] = parseInt(typedText);
                }

                // Save the updated player object to local storage
                localStorage.setItem("players", JSON.stringify(players));

                // Update the row's total score if needed
                // For example, if you have a total score cell at the end of each row
                // you can update it here by calculating the total score for the row
            });

            playerRow.appendChild(scoreCell);
        }

        tableBody1.appendChild(playerRow.cloneNode(true));
        tableBody2.appendChild(playerRow);
    });

    addingNameScore(); // Call the function to attach event listeners
}

