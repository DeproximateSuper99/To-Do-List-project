// DOM Elements
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const earthPointsDisplay = document.getElementById('earthPoints');
const timerDisplay = document.getElementById('timerDisplay');
const plantImage = document.getElementById('plantImage');
const bgVideo = document.getElementById('bgVideo');
const videoStore = document.querySelector('.video-store');
const selectedDifficulty = document.getElementById('selectedDifficulty');

// App State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let earthPoints = parseInt(localStorage.getItem('earthPoints')) || 0;
let timerInterval;
let timerMinutes = 25;
let timerSeconds = 0;
let isTimerRunning = false;
let completedSessions = parseInt(localStorage.getItem('completedSessions')) || 0;
let completedTasks = parseInt(localStorage.getItem('completedTasks')) || 0;
let ownedVideos = JSON.parse(localStorage.getItem('ownedVideos')) || ['default'];
let currentVideoBg = localStorage.getItem('currentVideoBg') || 'default';
let currentDifficulty = localStorage.getItem('currentDifficulty') || 'easy';

// Video Backgrounds Data
const videoBackgrounds = [
  { id: 'default', name: 'Default', price: 0, file: 'video13.mp4' },
  { id: '1', name: 'Cosmic Flow', price: 100, file: 'video1.mp4' },
  { id: '2', name: 'Gradient Flow', price: 150, file: 'video2.mp4' },
  { id: '3', name: 'Sonic Gradient', price: 150, file: 'video3.mp4' },
  { id: '4', name: 'Tokoyama Windmill', price: 200, file: 'video4.mp4' },
  { id: '5', name: 'Calm Grind', price: 200, file: 'video5.mp4' },
  { id: '6', name: 'City Lights', price: 250, file: 'video6.mp4' },
  { id: '7', name: 'Northern Lights', price: 250, file: 'video7.mp4' },
  { id: '8', name: 'Waterfall', price: 300, file: 'video8.mp4' },
  { id: '9', name: 'Beach Sunset', price: 300, file: 'video9.mp4' },
  { id: '10', name: 'Space Nebula', price: 350, file: 'video10.mp4' },
  { id: '11', name: 'Rainy Window', price: 350, file: 'video11.mp4' },
  { id: '12', name: 'Autumn Forest', price: 400, file: 'video12.mp4' },
  { id: '13', name: 'Winter Mountains', price: 400, file: 'video13.mp4' },
  { id: '14', name: 'Galaxy Core', price: 500, file: 'video14.mp4' }
];

// Initialize the app
function init() {
  renderTasks();
  updatePointsDisplay();
  updateTimerDisplay();
  updatePlantProgress();
  setupNavigation();
  setupTimerPresets();
  updateStats();
  initVideoStore();
  setupVideo();
  setupCustomSelect();
  setupTaskFilters();
  initClock();
  fetchWeather();
  
  // Set initial difficulty display
  selectedDifficulty.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  
  // Set initial task section state
  const taskSection = document.getElementById('taskSection');
  if (tasks.length > 0) {
    taskSection.classList.add('expanded');
  } else {
    taskSection.style.minHeight = '80px';
  }
   if (document.querySelector('.nav-icon.active[data-section="taskSection"]')) {
    document.body.classList.add('show-vertical-panel');
  }

}


// Pause playback when panel hides
document.addEventListener('sectionChanged', (e) => {
  const iframe = document.querySelector('.spotify-player iframe');
  if (e.detail !== 'taskSection' && iframe) {
    iframe.contentWindow.postMessage({command: 'pause'}, '*');
  }
});



function scaleElements() {
  const baseWidth = 1920; // Reference screen size
  const scale = window.innerWidth / baseWidth;
  
  document.documentElement.style.setProperty(
    '--scale-factor', 
    `scale(${Math.min(1, scale * 0.8 + 0.2)})` // Soft cap
  );
}

window.addEventListener('resize', scaleElements);
scaleElements(); // Initialize



// Custom Select Functionality
function setupCustomSelect() {
  const customSelects = document.querySelectorAll('.custom-select');
  
  customSelects.forEach(select => {
    const trigger = select.querySelector('.select-trigger');
    const options = select.querySelector('.select-options');
    const optionsList = select.querySelectorAll('.option');
    const taskSection = document.getElementById('taskSection');
    
    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      select.classList.toggle('active');
      options.classList.toggle('open');
      
      // Adjust task section height
      if (select.classList.contains('active')) {
        taskSection.style.minHeight = '200px';
      } else {
        if (tasks.length > 0) {
          taskSection.style.minHeight = '';
          taskSection.classList.add('expanded');
        } else {
          taskSection.style.minHeight = '80px';
          taskSection.classList.remove('expanded');
        }
      }
      
      // Close other open selects
      document.querySelectorAll('.custom-select').forEach(otherSelect => {
        if (otherSelect !== select) {
          otherSelect.classList.remove('active');
          otherSelect.querySelector('.select-options').classList.remove('open');
        }
      });
    });
    
    // Option selection
    optionsList.forEach(option => {
      option.addEventListener('click', () => {
        const value = option.dataset.value;
        selectedDifficulty.textContent = option.textContent;
        currentDifficulty = value;
        localStorage.setItem('currentDifficulty', currentDifficulty);
        
        // Add visual feedback
        optionsList.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        // Close dropdown
        select.classList.remove('active');
        options.classList.remove('open');
        
        // Return task section to appropriate height
        if (tasks.length > 0) {
          taskSection.style.minHeight = '';
          taskSection.classList.add('expanded');
        } else {
          taskSection.style.minHeight = '80px';
          taskSection.classList.remove('expanded');
        }
      });
    });
  });
  
  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select')) {
      document.querySelectorAll('.custom-select').forEach(select => {
        select.classList.remove('active');
        select.querySelector('.select-options').classList.remove('open');
        
        // Return task section to appropriate height
        const taskSection = document.getElementById('taskSection');
        if (tasks.length > 0) {
          taskSection.style.minHeight = '';
          taskSection.classList.add('expanded');
        } else {
          taskSection.style.minHeight = '80px';
          taskSection.classList.remove('expanded');
        }
      });
    }
  });
}

function setupNavigation() {
  
  
  const navElements = document.querySelectorAll('.nav-icon');
  
  navElements.forEach(element => {
    element.addEventListener('click', function() {
      // Don't do anything if clicking the currently active section
      if (this.classList.contains('active')) return;
      
      // Remove active class from all nav elements
      navElements.forEach(el => el.classList.remove('active'));
      
      // Add active class to clicked element
      this.classList.add('active');
      
      // Get the section to show
      const sectionId = this.getAttribute('data-section');
      const sectionToShow = document.getElementById(sectionId);

        if (sectionId === 'taskSection') {
        document.body.classList.add('show-vertical-panel');
      } else {
        document.body.classList.remove('show-vertical-panel');
      }


      // Get the currently visible section
      const currentSection = document.querySelector('.content-section[style*="display: block"]');
      
      // If there's a current section, fade it out first
      if (currentSection) {
        anime({
          targets: currentSection,
          opacity: 0,
          translateY: 20,
          duration: 300,
          easing: 'easeInQuad',
          complete: () => {
            currentSection.style.display = 'none';
            // After fade out completes, fade in the new section
            fadeInSection(sectionToShow);
          }
        });
      } else {
        // If no current section (initial load), just fade in
        fadeInSection(sectionToShow);
        
      }
    });
  });

   // Show panel if task section is active by default
  const defaultActive = document.querySelector('.nav-icon.active');
  if (defaultActive && defaultActive.getAttribute('data-section') === 'taskSection') {
    document.body.classList.add('show-vertical-panel');
  }
  
  // Show tasks section by default
  document.querySelector('.nav-icon[data-section="taskSection"]').classList.add('active');
  fadeInSection(document.getElementById('taskSection'));
}


function fadeInSection(section) {
  section.style.display = 'block';
  section.style.opacity = 0;
  
  anime({
    targets: section,
    opacity: 1,
    translateY: [20, 0],
    duration: 400,
    easing: 'easeOutQuad'
  });
}

// Task Functions
function addTask() {
  const text = taskInput.value.trim();
  if (text === '') {
    animateInputError();
    return;
  }

  const task = {
    id: Date.now(),
    text,
    difficulty: currentDifficulty,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  
  // Animation for new task
  const newTask = taskList.lastChild;
  anime({
    targets: newTask,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 300,
    easing: 'easeOutQuad'
  });
  
  // Expand the container
  const taskSection = document.getElementById('taskSection');
  if (!taskSection.classList.contains('expanded')) {
    taskSection.classList.add('expanded');
    taskSection.style.minHeight = '';
  }
  
  taskInput.value = '';
  taskInput.focus();
}

function animateInputError() {
  anime({
    targets: taskInput,
    translateX: [-10, 10, -10, 10, 0],
    backgroundColor: ['rgba(255,255,255,0.3)', 'rgba(255,100,100,0.5)', 'rgba(255,255,255,0.3)'],
    duration: 500,
    easing: 'easeInOutSine'
  });
}

function renderTasks() {
  taskList.innerHTML = '';
  
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.classList.add(task.difficulty);
    
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
             data-id="${task.id}" onchange="toggleTaskCompletion(${task.id})">
      <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
      <i class="fas fa-trash task-delete" onclick="deleteTask(${task.id})"></i>
    `;
    
    taskList.appendChild(li);
  });
}

function toggleTaskCompletion(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    
    const points = {
      easy: 5,
      medium: 10,
      hard: 20
    }[task.difficulty];
    
    if (task.completed) {
      earthPoints += points;
      completedTasks++;
      
      // Animation for completed task
      anime({
        targets: `li[class*="${task.difficulty}"] input[data-id="${taskId}"]`,
        scale: [1, 1.2, 1],
        duration: 300,
        easing: 'easeOutBack'
      });
    } else {
      earthPoints = Math.max(0, earthPoints - points);
      completedTasks = Math.max(0, completedTasks - 1);
    }
    
    saveTasks();
    renderTasks();
    updatePointsDisplay();
    updateStats();
  }
}


// Updated Clock Functionality
function updateLiveClock() {
  const now = new Date();
  const clock = document.getElementById('liveClock');
  
  if (clock) {
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    const hoursEl = clock.querySelector('.hours');
    const minutesEl = clock.querySelector('.minutes');
    const secondsEl = clock.querySelector('.seconds');
    
    // Hours (only update if changed)
    if (hoursEl.textContent !== hours) {
      hoursEl.textContent = hours;
    }
    
    // Minutes with animation
    if (minutesEl.textContent !== minutes) {
      minutesEl.classList.add('changing');
      setTimeout(() => {
        minutesEl.textContent = minutes;
        setTimeout(() => minutesEl.classList.remove('changing'), 100);
      }, 200);
    }
    
    // Seconds with smooth animation
    if (secondsEl.textContent !== seconds) {
      secondsEl.classList.add('changing');
      setTimeout(() => {
        secondsEl.textContent = seconds;
        secondsEl.classList.remove('changing');
      }, 150);
    }
  }
}

// Initialize clock
function initClock() {
  updateLiveClock();
  setInterval(updateLiveClock, 1000);
}


/*delete a task*/
function deleteTask(taskId) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) return;
  
  // Animation for deletion
  const taskElement = document.querySelector(`li input[data-id="${taskId}"]`).parentElement;
  anime({
    targets: taskElement,
    opacity: [1, 0],
    height: [taskElement.offsetHeight, 0],
    marginBottom: [parseInt(window.getComputedStyle(taskElement).marginBottom), 0],
    paddingTop: [parseInt(window.getComputedStyle(taskElement).paddingTop), 0],
    paddingBottom: [parseInt(window.getComputedStyle(taskElement).paddingBottom), 0],
    duration: 300,
    easing: 'easeOutQuad',
    complete: () => {
      tasks = tasks.filter(task => task.id !== taskId);
      saveTasks();
      renderTasks();
      
      // Check if we should shrink the container
      if (tasks.length === 0) {
        const taskSection = document.getElementById('taskSection');
        taskSection.classList.remove('expanded');
        taskSection.style.minHeight = '80px';
      }
    }
  });
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('earthPoints', earthPoints.toString());
  localStorage.setItem('completedTasks', completedTasks.toString());
}

// Points System
function updatePointsDisplay() {
  // Animation for points change
  anime({
    targets: earthPointsDisplay,
    scale: [1.2, 1],
    duration: 300,
    easing: 'easeOutBack'
  });
  
  earthPointsDisplay.textContent = earthPoints;
  localStorage.setItem('earthPoints', earthPoints.toString());
}

// Timer Functions
function setupTimerPresets() {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const minutes = parseInt(this.getAttribute('data-minutes'));
      setTimerPreset(minutes);
      
      // Animation for button press
      anime({
        targets: this,
        scale: [0.9, 1],
        duration: 200,
        easing: 'easeOutBack'
      });
    });
  });
}

function startFocusTimer() {
  if (isTimerRunning) return;
  
  isTimerRunning = true;
  timerInterval = setInterval(updateTimer, 1000);
  
  document.querySelector('.start-btn').innerHTML = '<i class="fas fa-play"></i> Running';
  document.querySelector('.start-btn').classList.add('active');
  
  // Animation for timer start
  anime({
    targets: timerDisplay,
    scale: [1.05, 1],
    color: ['#00ff95', '#ffffff'],
    duration: 500,
    easing: 'easeOutQuad'
  });
}

function pauseTimer() {
  if (!isTimerRunning) return;
  
  clearInterval(timerInterval);
  isTimerRunning = false;
  
  document.querySelector('.start-btn').innerHTML = '<i class="fas fa-play"></i> Resume';
  document.querySelector('.start-btn').classList.remove('active');
  
  // Animation for timer pause
  anime({
    targets: timerDisplay,
    color: ['#ff6d8b', '#ffffff'],
    duration: 300,
    easing: 'easeOutQuad'
  });
}

function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timerMinutes = 25;
  timerSeconds = 0;
  updateTimerDisplay();
  
  document.querySelector('.start-btn').innerHTML = '<i class="fas fa-play"></i> Start';
  document.querySelector('.start-btn').classList.remove('active');
  
  // Animation for timer reset
  anime({
    targets: timerDisplay,
    scale: [0.9, 1],
    duration: 300,
    easing: 'easeOutBack'
  });
}

function updateTimer() {
  if (timerSeconds === 0) {
    if (timerMinutes === 0) {
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
  
  // Pulsing animation when under 1 minute
  if (timerMinutes === 0 && timerSeconds <= 10) {
    anime({
      targets: timerDisplay,
      scale: [1, 1.05],
      color: ['#ffffff', '#ff6d8b'],
      duration: 500,
      direction: 'alternate',
      easing: 'easeInOutSine'
    });
  }
}

function timerCompleted() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  
  earthPoints += 15;
  completedSessions++;
  updatePointsDisplay();
  updatePlantProgress();
  updateStats();
  
  // Celebration animation
  anime({
    targets: timerDisplay,
    scale: [1, 1.2, 1],
    color: ['#ffffff', '#00ff95', '#ffffff'],
    duration: 800,
    easing: 'easeOutBack'
  });
  
  anime({
    targets: '.plant-visual',
    translateY: [0, -10, 0],
    duration: 800,
    easing: 'easeOutBack'
  });
  
  // Notification
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = '<i class="fas fa-check-circle"></i> Focus session completed! +15 Earth Points';
  document.body.appendChild(notification);
  
  anime({
    targets: notification,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 300,
    easing: 'easeOutQuad',
    complete: () => {
      setTimeout(() => {
        anime({
          targets: notification,
          opacity: 0,
          translateY: -20,
          duration: 300,
          easing: 'easeInQuad',
          complete: () => notification.remove()
        });
      }, 3000);
    }
  });
  
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
  
  const growthStage = Math.min(Math.max(1, Math.floor(completedSessions / 3) + 2), 4);
  plantImage.src = `./assets/plant-${growthStage}.svg`;
  
  plantImage.onerror = function() {
    console.error('Failed to load plant image:', this.src);
    this.style.border = '2px solid red';
  };
  
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
  
  const lastCompletion = localStorage.getItem('lastCompletionDate');
  const today = new Date().toDateString();
  
  if (lastCompletion === today) {
    const currentStreak = parseInt(localStorage.getItem('currentStreak')) || 0;
    document.getElementById('currentStreak').textContent = `${currentStreak} days`;
  } else {
    const lastDate = lastCompletion ? new Date(lastCompletion) : null;
    const currentStreak = lastDate && (new Date() - lastDate) < 86400000 * 2 ? 
      (parseInt(localStorage.getItem('currentStreak')) || 0) + 1 : 1;
    
    localStorage.setItem('currentStreak', currentStreak.toString());
    localStorage.setItem('lastCompletionDate', today);
    document.getElementById('currentStreak').textContent = `${currentStreak} days`;
  }
}

// Video Background Functions
function setupVideo() {
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    bgVideo.poster = 'assets/bg-nature-1.jpg';
    bgVideo.load();
  } else {
    bgVideo.play().catch(e => console.log("Background video autoplay prevented"));
  }
}

function initVideoStore() {
  videoStore.innerHTML = '';
  
  videoBackgrounds.forEach(video => {
    const isOwned = ownedVideos.includes(video.id);
    const isApplied = currentVideoBg === video.id;
    
    const vidItem = document.createElement('div');
    vidItem.className = `vid-item ${isOwned ? 'owned' : ''} ${isApplied ? 'applied' : ''}`;
    vidItem.dataset.id = video.id;
    vidItem.dataset.price = video.price;
    
    vidItem.innerHTML = `
      <div class="video-container">
        <video muted loop playsinline>
          <source src="assets/backgrounds/${video.file}" type="video/mp4">
        </video>
      </div>
      <div class="vid-details">
        <h3>${video.name}</h3>
        <p class="price">${video.price === 0 ? 'Free' : `${video.price} Points`}</p>
        <button class="buy-btn" onclick="purchaseVideoBg('${video.id}')">
          ${isOwned ? (isApplied ? '<span class="check"><i class="fas fa-check"></i> Applied</span>' : '<span class="check"><i class="fas fa-check"></i> Owned</span>') : 
          `<span class="buy-text">Purchase</span>`}
        </button>
      </div>
    `;
    
    videoStore.appendChild(vidItem);
    
    if (isOwned) {
      const videoEl = vidItem.querySelector('video');
      if (videoEl) {
        videoEl.play().catch(e => addPlayButton(videoEl));
      }
    }
  });
}

function addPlayButton(video) {
  const container = video.parentElement;
  const playBtn = document.createElement('div');
  playBtn.className = 'video-play-btn';
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
  playBtn.addEventListener('click', () => {
    video.play();
    playBtn.remove();
  });
  container.appendChild(playBtn);
}

function purchaseVideoBg(id) {
  const vidItem = document.querySelector(`.vid-item[data-id="${id}"]`);
  const video = videoBackgrounds.find(v => v.id === id);
  
  if (!video) return;
  
  if (ownedVideos.includes(id)) {
    applyVideoBackground(id);
    return;
  }

  if (earthPoints >= video.price) {
    earthPoints -= video.price;
    ownedVideos.push(id);
    
    localStorage.setItem('ownedVideos', JSON.stringify(ownedVideos));
    localStorage.setItem('earthPoints', earthPoints.toString());
    
    updatePointsDisplay();
    vidItem.classList.add('owned');
    applyVideoBackground(id);
    
    const videoEl = vidItem.querySelector('video');
    if (videoEl) videoEl.play().catch(e => addPlayButton(videoEl));
    
    // Purchase animation
    anime({
      targets: vidItem,
      scale: [1, 1.05, 1],
      duration: 500,
      easing: 'easeOutBack'
    });
    
    // Points animation
    anime({
      targets: '.points-display',
      translateY: [-5, 0],
      color: ['#00ff95', '#ffffff'],
      duration: 500,
      easing: 'easeOutQuad'
    });
  } else {
    // Not enough points animation
    anime({
      targets: '.points-display',
      translateX: [-5, 5, -5, 5, 0],
      color: ['#ff6d8b', '#ffffff'],
      duration: 500,
      easing: 'easeInOutSine'
    });
  }
}

function applyVideoBackground(id) {
  const video = videoBackgrounds.find(v => v.id === id);
  if (!video) return;
  
  bgVideo.src = `assets/backgrounds/${video.file}`;
  bgVideo.load();
  bgVideo.play().catch(e => console.log("Background video autoplay prevented"));
  
  currentVideoBg = id;
  localStorage.setItem('currentVideoBg', currentVideoBg);
  
  updateAppliedVideo();
  
  // Animation for video change
  anime({
    targets: '.video-background',
    opacity: [0, 1],
    duration: 1000,
    easing: 'easeInOutQuad'
  });
}

function updateAppliedVideo() {
  document.querySelectorAll('.vid-item').forEach(item => {
    item.classList.remove('applied');
    const btn = item.querySelector('.buy-btn');
    if (btn) {
      btn.innerHTML = item.classList.contains('owned') ? 
        '<span class="check"><i class="fas fa-check"></i> Owned</span>' : 
        '<span class="buy-text">Purchase</span>';
    }
  });
  
  const currentItem = document.querySelector(`.vid-item[data-id="${currentVideoBg}"]`);
  if (currentItem) {
    currentItem.classList.add('applied');
    const btn = currentItem.querySelector('.buy-btn');
    if (btn) {
      btn.innerHTML = '<span class="check"><i class="fas fa-check"></i> Applied</span>';
    }
  }
}

// Task Filters
function setupTaskFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Filter tasks
      const filter = button.textContent.toLowerCase();
      let filteredTasks = tasks;
      
      if (filter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
      } else if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
      }
      
      // Render filtered tasks with animation
      renderFilteredTasks(filteredTasks);
    });
  });
}

function renderFilteredTasks(filteredTasks) {
  taskList.innerHTML = '';
  
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.classList.add(task.difficulty);
    
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
             data-id="${task.id}" onchange="toggleTaskCompletion(${task.id})">
      <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
      <i class="fas fa-trash task-delete" onclick="deleteTask(${task.id})"></i>
    `;
    
    taskList.appendChild(li);
    
    // Animation for filtered tasks
    anime({
      targets: li,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 300,
      easing: 'easeOutQuad',
      delay: anime.stagger(50)
    });
  });
}




// Inspirational quotes data
const quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Productivity is being able to do things that you were never able to do before.",
    author: "Franz Kafka"
  },
  {
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss"
  },
  {
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    author: "Stephen Covey"
  }
];

// Quote rotation system
let currentQuoteIndex = 0;
const quoteElement = document.querySelector('.quote-text');
const authorElement = document.querySelector('.quote-author');
const quoteContainer = document.querySelector('.quote-container');

function showRandomQuote() {
  // Fade out current quote
  quoteContainer.classList.remove('show');
  
  setTimeout(() => {
    // Get new random quote (different from current)
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (quotes.length > 1 && newIndex === currentQuoteIndex);
    
    currentQuoteIndex = newIndex;
    
    // Update quote content
    quoteElement.textContent = `"${quotes[currentQuoteIndex].text}"`;
    authorElement.textContent = `- ${quotes[currentQuoteIndex].author}`;
    
    // Fade in new quote
    quoteContainer.classList.add('show');
  }, 1500); // Match this with CSS transition time
}





// Weather Functions
async function fetchWeather() {
  try {
    // First get user's approximate location
    const position = await getLocation();
    const { latitude, longitude } = position.coords;
    
    // Then fetch weather for that location
    const weatherData = await getWeatherData(latitude, longitude);
    updateWeatherDisplay(weatherData);
  } catch (error) {
    console.error("Error getting weather:", error);
    document.querySelector('.weather-info').innerHTML = 
      '<i class="fas fa-cloud-slash"></i> Weather unavailable';
  }
}

function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
      reject(new Error("Geolocation not supported"));
    }
  });
}

async function getWeatherData(lat, lon) {
  // Using OpenWeatherMap API - you'll need to sign up for a free API key
  const apiKey = 'bdc8e99aaafa27eee93d07c835e0cf2a'; // Replace with your actual API key
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );
  return await response.json();
}

function updateWeatherDisplay(data) {
  const weatherWidget = document.querySelector('.weather-info');
  const iconCode = data.weather[0].icon;
  const temp = Math.round(data.main.temp);
  const city = data.name;
  
  weatherWidget.innerHTML = `
    <img src="https://openweathermap.org/img/wn/${iconCode}.png" class="weather-icon" alt="Weather icon">
    <span class="weather-temp">${temp}°C</span>
    <span class="weather-city">${city}</span>
  `;
}

// Initialize weather when app starts
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(fetchWeather, 1000); // Small delay to let other elements load first
});



// Initialize
quoteContainer.classList.add('show');
setInterval(showRandomQuote, 300000); // Change every 5 minutes (300000ms)

// Start first rotation after initial display
setTimeout(showRandomQuote, 300000);



// Initialize the app
document.addEventListener('DOMContentLoaded', init);

// Expose functions to global scope
window.addTask = addTask;
window.startFocusTimer = startFocusTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.toggleTaskCompletion = toggleTaskCompletion;
window.deleteTask = deleteTask;
window.purchaseVideoBg = purchaseVideoBg;
