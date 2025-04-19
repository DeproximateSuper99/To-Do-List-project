// DOM Elements
const taskInput = document.getElementById('taskInput');
const difficultySelect = document.getElementById('difficultySelect');
const taskList = document.getElementById('taskList');
const earthPointsDisplay = document.getElementById('earthPoints');
const timerDisplay = document.getElementById('timerDisplay');
const plantImage = document.getElementById('plantImage');

// App State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let earthPoints = parseInt(localStorage.getItem('earthPoints')) || 0;
let timerInterval;
let timerMinutes = 25;
let timerSeconds = 0;
let isTimerRunning = false;
let completedSessions = parseInt(localStorage.getItem('completedSessions')) || 0;
let completedTasks = parseInt(localStorage.getItem('completedTasks')) || 0;

// Initialize the app
function init() {
  renderTasks();
  updatePointsDisplay();
  updateTimerDisplay();
  updatePlantProgress();
  setupNavigation();
  setupTimerPresets();
  updateStats();
  plantImage.src = 'assets/plant-1.svg'; // Start with plant-1
  updatePlantProgress();
}

// Navigation Functions
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-links li');
  const contentSections = document.querySelectorAll('.content-section');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Add active class to clicked link
      this.classList.add('active');
      
      // Hide all sections
      contentSections.forEach(section => {
        section.style.display = 'none';
      });
      
      // Show the corresponding section
      const sectionId = this.getAttribute('data-section');
      document.getElementById(sectionId).style.display = 'block';
    });
  });
  
  // Show tasks section by default
  document.querySelector('.nav-links li[data-section="taskSection"]').classList.add('active');
  document.getElementById('taskSection').style.display = 'block';
}

// Task Functions
function addTask() {
  const text = taskInput.value.trim();
  if (text === '') return;

  const difficulty = difficultySelect.value;
  const task = {
    id: Date.now(),
    text,
    difficulty,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  taskInput.value = '';
}

function renderTasks() {
  taskList.innerHTML = '';
  
  tasks.forEach(task => {
    const li = document.createElement('li');
    
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
             data-id="${task.id}" onchange="toggleTaskCompletion(${task.id})">
      <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
      <span class="task-difficulty ${task.difficulty}">${task.difficulty}</span>
      <i class="fas fa-trash task-delete" onclick="deleteTask(${task.id})"></i>
    `;
    
    taskList.appendChild(li);
  });
}

function toggleTaskCompletion(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    
    if (task.completed) {
      // Award points based on difficulty
      const points = {
        easy: 5,
        medium: 10,
        hard: 20
      }[task.difficulty];
      
      earthPoints += points;
      completedTasks++;
      updatePointsDisplay();
      updateStats();
    } else {
      // Deduct points if unchecking
      const points = {
        easy: 5,
        medium: 10,
        hard: 20
      }[task.difficulty];
      
      earthPoints = Math.max(0, earthPoints - points);
      completedTasks = Math.max(0, completedTasks - 1);
      updatePointsDisplay();
      updateStats();
    }
    
    saveTasks();
    renderTasks();
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('earthPoints', earthPoints.toString());
  localStorage.setItem('completedTasks', completedTasks.toString());
}

// Points System
function updatePointsDisplay() {
  earthPointsDisplay.textContent = earthPoints;
  localStorage.setItem('earthPoints', earthPoints.toString());
}

// Timer Functions
function setupTimerPresets() {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const minutes = parseInt(this.getAttribute('data-minutes'));
      setTimerPreset(minutes);
    });
  });
}

function startFocusTimer() {
  if (isTimerRunning) return;
  
  isTimerRunning = true;
  timerInterval = setInterval(updateTimer, 1000);
  
  // Update UI
  document.querySelector('.start-btn').innerHTML = '<i class="fas fa-play"></i> Running';
  document.querySelector('.start-btn').classList.add('active');
}

function pauseTimer() {
  if (!isTimerRunning) return;
  
  clearInterval(timerInterval);
  isTimerRunning = false;
  
  // Update UI
  document.querySelector('.start-btn').innerHTML = '<i class="fas fa-play"></i> Resume';
  document.querySelector('.start-btn').classList.remove('active');
}

function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timerMinutes = 25;
  timerSeconds = 0;
  updateTimerDisplay();
  
  // Update UI
  document.querySelector('.start-btn').innerHTML = '<i class="fas fa-play"></i> Start';
  document.querySelector('.start-btn').classList.remove('active');
}

function updateTimer() {
  if (timerSeconds === 0) {
    if (timerMinutes === 0) {
      // Timer completed
      timerCompleted();
      return;
    }
    timerMinutes--;
    timerSeconds = 59;
  } else {
    timerSeconds--;
  }
  
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const mins = String(timerMinutes).padStart(2, '0');
  const secs = String(timerSeconds).padStart(2, '0');
  timerDisplay.textContent = `${mins}:${secs}`;
}

function timerCompleted() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  
  // Award points for completed session
  earthPoints += 15;
  completedSessions++;
  updatePointsDisplay();
  updatePlantProgress();
  updateStats();
  
  // Show completion message
  alert('Focus session completed! You earned 15 Earth Points.');
  
  // Reset timer to initial state
  resetTimer();
}

function setTimerPreset(minutes) {
  timerMinutes = minutes;
  timerSeconds = 0;
  updateTimerDisplay();
}

// Plant Progress
function updatePlantProgress() {
    localStorage.setItem('completedSessions', completedSessions.toString());
    
    // Calculate growth stage (2-4)
    const growthStage = Math.min(Math.max(1, Math.floor(completedSessions / 3) + 2), 4);
    const plantImage = document.getElementById('plantImage');
    
    // Debugging: Log the expected image path
    console.log(`Loading plant image: ./assets/plant-${growthStage}.svg`);
    
    plantImage.src = `./assets/plant-${growthStage}.svg`;
    
    // Add error handling
    plantImage.onerror = function() {
      console.error('Failed to load plant image:', this.src);
      this.style.border = '2px solid red'; // Visual error indicator
    };
    
    // Update progress text
    const sessionsNeeded = 3 - (completedSessions % 3);
    const progressText = growthStage === 4 ?
      'Your plant is fully grown! 🌿' :
      sessionsNeeded === 3 ?
        'Complete 3 sessions to grow your plant' :
        `Keep going! ${sessionsNeeded} more session${sessionsNeeded > 1 ? 's' : ''} to next growth stage`;
    
    document.querySelector('.progress-text').textContent = progressText;
  }
  

// Stats Functions
function updateStats() {
  document.getElementById('tasksCompleted').textContent = completedTasks;
  document.getElementById('focusSessions').textContent = completedSessions;
  document.getElementById('totalPoints').textContent = earthPoints;
  
  // Simple streak calculation (you might want to implement a proper streak tracker)
  const lastCompletion = localStorage.getItem('lastCompletionDate');
  const today = new Date().toDateString();
  
  if (lastCompletion === today) {
    // Already updated today
    const currentStreak = parseInt(localStorage.getItem('currentStreak')) || 0;
    document.getElementById('currentStreak').textContent = `${currentStreak} days`;
  } else {
    // New day
    const lastDate = lastCompletion ? new Date(lastCompletion) : null;
    const currentStreak = lastDate && (new Date() - lastDate) < 86400000 * 2 ? 
      (parseInt(localStorage.getItem('currentStreak')) || 0) + 1 : 1;
    
    localStorage.setItem('currentStreak', currentStreak.toString());
    localStorage.setItem('lastCompletionDate', today);
    document.getElementById('currentStreak').textContent = `${currentStreak} days`;
  }
}
// Video Background Controller
const bgVideo = document.getElementById('bgVideo');

// Optional: Play/pause toggle (add a button in your UI)
function toggleVideo() {
  if (bgVideo.paused) {
    bgVideo.play();
  } else {
    bgVideo.pause();
  }
}

// Fallback for mobile devices
function setupVideo() {
  // Check if mobile (optional)
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    bgVideo.poster = 'assets/bg-nature-1.jpg';
    bgVideo.load();
  }
}

// Call this in your init()
setupVideo();

// Initialize the app
document.addEventListener('DOMContentLoaded', init);

// Expose functions to global scope for HTML onclick attributes
window.addTask = addTask;
window.startFocusTimer = startFocusTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.toggleTaskCompletion = toggleTaskCompletion;
window.deleteTask = deleteTask;
