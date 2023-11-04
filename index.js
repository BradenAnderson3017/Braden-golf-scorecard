var courses;
var courseInfo;
let tableBody1 = document.querySelector("#tbody1");
let tableBody2 = document.querySelector("#tbody2");

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
  constructor(
    name,
    id = getNextId(),
    scores1 = Array(9).fill(null),
    scores2 = Array(9).fill(null),
    total = 0
  ) {
    this.name = name;
    this.id = id;
    this.scores1 = scores1;
    this.scores2 = scores2;
    this.total = total;
  }
}
let playerIdCounter = 1;

function getNextId() {
  return playerIdCounter++;
}

let nameInput = document.getElementById("nameInput");
let nameButton = document.getElementById("nameButton");
nameButton.addEventListener("click", clickNameButton);

//adding new player
function clickNameButton() {
  let playerName = nameInput.value;

  if (playerName.trim() === "") {
    // Handle case when the user doesn't enter a name
    return;
  }

  let players = JSON.parse(localStorage.getItem("players")) || [];
  let player = new Player(playerName);
  players.push(player);
  localStorage.setItem("players", JSON.stringify(players));

  let tableBodys = document.querySelectorAll("tbody");
  tableBodys.forEach((tableBody) => {
    let playerRow = document.createElement("tr");
    playerRow.classList.add("playerName");

    let nameCell = document.createElement("th");
    nameCell.scope = "row";
    nameCell.textContent = playerName;

    playerRow.appendChild(nameCell);

    if (tableBody === tableBody1) {
      for (let i = 0; i < 9; i++) {
        let scoreCell = document.createElement("th");
        scoreCell.classList.add("hole");
        scoreCell.scope = "row";
        scoreCell.setAttribute("contenteditable", true);
        scoreCell.textContent = null; // Initialize with null values

        scoreCell.addEventListener("input", function (event) {
          let typedText = scoreCell.textContent.trim();
          if (typedText === "") {
            player.scores1[i] = null;
          } else if (!isNaN(parseInt(typedText))) {
            player.scores1[i] = parseInt(typedText);
          }
          localStorage.setItem("players", JSON.stringify(players));
          updateOutInTotal(tableBody1);
          updateTotal(tableBody1);
          updateTotal(tableBody2);
        });

        playerRow.appendChild(scoreCell);
      }

      let outScore = document.createElement("th");
      outScore.classList.add("out");
      outScore.scope = "row";
      playerRow.appendChild(outScore);
      let totalCell = document.createElement("th");
      totalCell.classList.add("totalCell");
      totalCell.scope = "row";
      playerRow.appendChild(totalCell);

      tableBody1.appendChild(playerRow);
      updateOutInTotal(tableBody1);
      updateTotal(tableBody1);
    } else {
      for (let i = 0; i < 9; i++) {
        let scoreCell = document.createElement("th");
        scoreCell.classList.add("hole");
        scoreCell.scope = "row";
        scoreCell.setAttribute("contenteditable", true);
        scoreCell.textContent = null;

        scoreCell.addEventListener("input", function (event) {
          let typedText = scoreCell.textContent.trim();
          if (typedText === "") {
            player.scores2[i] = null;
          } else if (!isNaN(parseInt(typedText))) {
            player.scores2[i] = parseInt(typedText);
          }
          localStorage.setItem("players", JSON.stringify(players));
          updateOutInTotal(tableBody2);
          updateTotal(tableBody1);
          updateTotal(tableBody2);
        });

        playerRow.appendChild(scoreCell);
      }

      let inScore = document.createElement("th");
      inScore.classList.add("in");
      inScore.scope = "row";
      playerRow.appendChild(inScore);
      let totalCell = document.createElement("th");
      totalCell.classList.add("totalCell");
      totalCell.scope = "row";
      playerRow.appendChild(totalCell);

      tableBody2.appendChild(playerRow);
      updateOutInTotal(tableBody2);
      updateTotal(tableBody2);
    }
  });
  nameInput.value = "";
}

let selectedCourseArr = [];
function toFindSelectedCourse() {
  let selectedCourse = document.getElementById("course-select");
  let selectedIndex = selectedCourse.selectedIndex;
  let selectedOption = selectedCourse.options[selectedIndex];
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
          tableRows += `<th scope="row"></th></tr>`;
          yardTable.innerHTML = tableRows;

          let parTableRows = '<tr><th scope="row">Par</th>';
          let parTotal = 0;
          for (let i = 0; i < belowNinePar.length; i++) {
            parTableRows += `<th scope="row">${belowNinePar[i]}</th>`;
            parTotal += belowNinePar[i];
          }
          parTableRows += `<th scope="row">${parTotal}</th></tr>`;
          parTableRows += `<th scope="row"></th></tr>`;
          parTable.innerHTML = parTableRows;

          let hcpTableRows = '<tr><th scope="row">Handicap</th>';
          for (let i = 0; i < belowNineHcp.length; i++) {
            hcpTableRows += `<th scope="row">${belowNineHcp[i]}</th>`;
          }
          hcpTableRows += `<th scope="row"></th></tr>`;
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
          tableRows += `<th scope="row"></th></tr>`;
          yardTable2.innerHTML = tableRows;

          let parTableRows = '<tr><th scope="row">Par</th>';
          let parTotal = 0;
          for (let i = 0; i < aboveNinePar.length; i++) {
            parTableRows += `<th scope="row">${aboveNinePar[i]}</th>`;
            parTotal += aboveNinePar[i];
          }
          parTableRows += `<th scope="row">${parTotal}</th></tr>`;
          parTableRows += `<th scope="row"></th></tr>`;
          parTable2.innerHTML = parTableRows;

          let hcpTableRows = '<tr><th scope="row">Handicap</th>';
          for (let i = 0; i < aboveNineHcp.length; i++) {
            hcpTableRows += `<th scope="row">${aboveNineHcp[i]}</th>`;
          }
          hcpTableRows += `<th scope="row"></th></tr>`;
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
  //console.log("hello");
}
function loadPlayer1() {
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
      scoreCell.textContent = player.scores1[i];

      scoreCell.addEventListener("input", function (event) {
        let typedText = scoreCell.textContent.trim();
        let playerIndex = players.findIndex((p) => p.name === player.name);

        if (typedText === "") {
          players[playerIndex].scores1[i] = null;
        } else if (!isNaN(parseInt(typedText))) {
          players[playerIndex].scores1[i] = parseInt(typedText);
        }

        localStorage.setItem("players", JSON.stringify(players));
        updateOutInTotal(tableBody1);
        updateTotal(tableBody1);
        updateTotal(tableBody2);
      });

      playerRow.appendChild(scoreCell);
    }
    let outScore = document.createElement("th");
    outScore.classList.add("out");
    outScore.scope = "row";
    playerRow.appendChild(outScore);
    let totalCell = document.createElement("th");
    totalCell.classList.add("totalCell");
    totalCell.scope = "row";
    playerRow.appendChild(totalCell);

    tableBody1.appendChild(playerRow);
  });
}

function loadPlayer2() {
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
      scoreCell.textContent = player.scores2[i]; // Set initial content

      scoreCell.addEventListener("input", function (event) {
        let typedText = scoreCell.textContent.trim();
        if (typedText === "") {
          player.scores2[i] = null;
        } else if (!isNaN(parseInt(typedText))) {
          player.scores2[i] = parseInt(typedText);
        }
        localStorage.setItem("players", JSON.stringify(players));
        updateOutInTotal(tableBody2);
        updateTotal(tableBody1);
        updateTotal(tableBody2);
      });

      playerRow.appendChild(scoreCell);
    }
    let inScore = document.createElement("th");
    inScore.classList.add("in");
    inScore.scope = "row";
    playerRow.appendChild(inScore);
    let totalCell = document.createElement("th");
    totalCell.classList.add("totalCell");
    totalCell.scope = "row";
    playerRow.appendChild(totalCell);

    tableBody2.appendChild(playerRow);
  });
}

loadPlayer1();
loadPlayer2();
updateOutInTotal(tableBody1);
updateOutInTotal(tableBody2);
updateTotal(tableBody1);
updateTotal(tableBody2);

function addingNameScore1() {
  let names = document.querySelectorAll(".playerName");
  names.forEach((name) => {
    let holes = name.querySelectorAll(".hole");
    holes.forEach((hole, index) => {
      hole.setAttribute("contenteditable", true);

      hole.addEventListener("input", function () {
        let playerName = name.querySelector("th").textContent;
        let players = JSON.parse(localStorage.getItem("players")) || [];
        let playerIndex = players.findIndex((p) => p.name === playerName);

        if (playerIndex !== -1) {
          let typedText = hole.textContent.trim();
          if (typedText === "") {
            players[playerIndex].scores1[index] = null;
          } else {
            let parsedValue = parseInt(typedText);
            if (!isNaN(parsedValue)) {
              players[playerIndex].scores1[index] = parsedValue;
            } else {
              // Handle invalid input here, for example, display an error message
            }
          }

          localStorage.setItem("players", JSON.stringify(players));
          updateOutInTotal(tableBody1);
          updateTotal(tableBody1);
        }
      });
    });
  });
}

function addingNameScore2() {
  let names = document.querySelectorAll(".playerName");
  names.forEach((name) => {
    let holes = name.querySelectorAll(".hole");
    holes.forEach((hole, index) => {
      hole.setAttribute("contenteditable", true);

      hole.addEventListener("input", function () {
        let playerName = name.querySelector("th").textContent;
        let players = JSON.parse(localStorage.getItem("players")) || [];
        let playerIndex = players.findIndex((p) => p.name === playerName);

        if (playerIndex !== -1) {
          let typedText = hole.textContent.trim();
          if (typedText === "") {
            players[playerIndex].scores2[index] = null;
          } else {
            let parsedValue = parseInt(typedText);
            if (!isNaN(parsedValue)) {
              players[playerIndex].scores2[index] = parsedValue;
            } else {
              // Handle invalid input here, for example, display an error message
            }
          }

          localStorage.setItem("players", JSON.stringify(players));
          updateOutInTotal(tableBody2);
          updateTotal(tableBody2);
        }
      });
    });
  });
}
function updateOutInTotal(tableBody) {
  let players = JSON.parse(localStorage.getItem("players")) || [];
  let outTotal = 0;
  let inTotal = 0;

  // Iterate through player rows and calculate totals
  tableBody.querySelectorAll(".playerName").forEach((nameRow) => {
    let playerName = nameRow.querySelector("th").textContent;
    let player = players.find((p) => p.name === playerName);

    if (player) {
      if (tableBody === tableBody1) {
        // Calculate Out total (first 9 holes)
        let outScores = player.scores1
          .slice(0, 9)
          .filter((score) => score !== null);
        let outSum = outScores.reduce((total, score) => total + score, 0);
        outTotal = outSum;

        // Update Out and In total boxes in the row
        let outTotalCell = nameRow.querySelector(".out");

        outTotalCell.textContent = outTotal;
        updateTotal(tableBody1);
      } else {
        // Calculate In total (last 9 holes)
        let inScores = player.scores2
          .slice(0, 9)
          .filter((score) => score !== null);
        let inSum = inScores.reduce((total, score) => total + score, 0);
        inTotal = inSum;
        let inTotalCell = nameRow.querySelector(".in");
        inTotalCell.textContent = inTotal;
        updateTotal(tableBody2);
      }
    }
  });
}
function updateTotal(tableBody) {
  let players = JSON.parse(localStorage.getItem("players")) || [];

  // Iterate through players and calculate total scores
  players.forEach((player) => {
    let playerName = player.name;
    let totalScores1 = player.scores1.filter((score) => score !== null);
    let totalScores2 = player.scores2.filter((score) => score !== null);
    let totalScores = [...totalScores1, ...totalScores2];
    let totalSum = totalScores.reduce((total, score) => total + score, 0);

    // Update total cell for the player in the specified table body
    tableBody.querySelectorAll(".playerName").forEach((nameRow) => {
      let nameCell = nameRow.querySelector("th");
      if (nameCell.textContent === playerName) {
        let totalCell = nameRow.querySelector(".totalCell");
        totalCell.textContent = totalSum;
        player.total = totalSum;
        localStorage.setItem("players", JSON.stringify(players));
      }
    });
  });
}
function endingGame() {
  let endGameButton = document.getElementById("endGame");
  endGameButton.addEventListener("click", () => {
    let players = JSON.parse(localStorage.getItem("players"));
    
    let numbers = [];
    let winnerName;
    
    for (let winner in players) {
      numbers.push(players[winner].total);
      let smallestNumber = Math.min(...numbers);
      if (smallestNumber === players[winner].total){
        winnerName = players[winner].name;
      }
    }
    
    
    
    Command: toastr["success"](`${winnerName}, you are (L)PGA Tour material`);

    toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": false,
      "progressBar": true,
      "positionClass": "toast-top-center",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }
    let playerVisuals = document.querySelectorAll(".playerName");
    playerVisuals.forEach((player) => {
      player.remove();
    });
    localStorage.removeItem("players");
  });
}
endingGame();
