// Timer and Task Logic
let earthPoints = 0;
let timer;
let isTimerRunning = false;
let plantGrowth = 0;  // Percentage of plant growth (0 to 100)

// Start Focus Timer
function startFocusTimer() {
  if (isTimerRunning) return; // Prevent multiple timers from starting
  isTimerRunning = true;
  let time = 0;  // Timer in seconds
  const timerDisplay = document.getElementById("timerDisplay");
  const plantSVG = document.getElementById("plantSVG");

  timer = setInterval(() => {
    time++;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;

    // Grow the plant over time
    if (time % 60 === 0 && plantGrowth < 100) {
      plantGrowth += 5;
      plantSVG.style.transform = `scale(${1 + (plantGrowth / 100)})`;
    }

    // When timer reaches 60 minutes, award Earth Points
    if (time === 3600) {
      clearInterval(timer);
      isTimerRunning = false;
      plantGrowth = 0;
      earthPoints += 25;
      document.getElementById("earthPoints").textContent = earthPoints;
      plantSVG.style.transform = `scale(1)`;
      timerDisplay.textContent = `00:00`;
    }
  }, 1000);
}

// Add Task to To-Do List
function addTask() {
  const taskInput = document.getElementById("taskInput");
  const taskDifficulty = document.getElementById("taskDifficulty");
  const taskList = document.getElementById("taskList");

  if (taskInput.value.trim() === "") return; // Don't add empty tasks

  const task = document.createElement("li");
  task.innerHTML = `
    ${taskInput.value} - <strong>${taskDifficulty.value}</strong>
    <button onclick="completeTask(this)">Complete</button>
  `;
  taskList.appendChild(task);

  taskInput.value = ""; // Clear input field
}

// Complete Task and Award Points
function completeTask(button) {
  const task = button.parentElement;
  const difficulty = task.querySelector("strong").textContent;
  let points = 0;

  if (difficulty === "Easy") {
    points = 5;
  } else if (difficulty === "Medium") {
    points = 10;
  } else if (difficulty === "Hard") {
    points = 20;
  }

  earthPoints += points;
  document.getElementById("earthPoints").textContent = earthPoints;
  task.remove(); // Remove task from list
}

// Pad zero for timer formatting
function padZero(num) {
  return num < 10 ? `0${num}` : num;
}

