var courses;
var courseInfo;
let tableBody = document.querySelector("tbody");
let yardTable = document.getElementById("yardage");
let parTable = document.getElementById("par");
let hcpTable = document.getElementById("handicap");
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
  constructor(name, id = getNextId(), scores = []) {
    this.name = name;
    this.id = id;
    this.scores = scores;
  }
}
function getNextId() {}

let nameInput = document.getElementById("nameInput");
let nameButton = document.getElementById("nameButton");
nameButton.addEventListener("click", clickNameButton);

function clickNameButton() {
  let newPlayer = new Player();
  newPlayer.name = nameInput.value;
  nameInput.value = "";
  let newPlayerHTML = `
    <tr>
      <th scope="row">${newPlayer.name}</th>
      <th scope="row"></th>
      <th scope="row"></th>
      <th scope="row"></th>
      <th scope="row"></th>
      <th scope="row"></th>
      <th scope="row"></th>
      <th scope="row"></th>
      <th scope="row"></th>
      <th scope="row"></th>
      <th scope="row"></th>
    </tr>`;
  tableBody.innerHTML += newPlayerHTML;
  //save(newPlayer.name);
}
let selectedCourseArr = [];
function toFindSelectedCourse() {
  let selectedCourse = document.getElementById("course-select");
  let selectedIndex = selectedCourse.selectedIndex;
  let selectedOption = selectedCourse.options[selectedIndex];
  console.log("Selected value is: " + selectedOption.value);
  console.log("Selected text is: " + selectedOption.text);
  selectedCourseArr = selectedOption.text;
  save(selectedCourseArr);
}
function toFindSelectedTee() {
  let belowNineArray = [];
  let belowNinePar = [];
  let belowNineHcp = [];
  let selectedTee = document.getElementById("tee-box-select");
  let selectedIndex = selectedTee.selectedIndex;
  let selectedOption = selectedTee.options[selectedIndex];
  console.log("Selected value is: " + selectedOption.value);
  console.log("Selected text is: " + selectedOption.text);
  courseInfo.holes.forEach((hole) => {
    if (hole.hole <= 9) {
      console.log("below 9", hole.hole);
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
    }
  });
}
reload()
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
          console.log(option)
        }
      });
  }
}
function save() {
  localStorage.setItem("Course", selectedCourseArr);
}
