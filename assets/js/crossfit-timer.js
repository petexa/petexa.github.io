// CrossFit Timer
// Multiple timer modes for CrossFit workouts - Clock, EMOM, Tabata, AMRAP, and For Time

// Timer state
let timerMode = '';
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

// Tabata/EMOM specific
let currentRound = 1;
let totalRounds = 8;
let workTime = 20;
let restTime = 10;
let isWorkPhase = true;

// Format time as mm:ss
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

// Update display
function updateDisplay() {
  document.getElementById('timer-display').textContent = formatTime(timerSeconds);
}

// Select timer mode
function selectMode(mode) {
  timerMode = mode;
  document.getElementById('timer-mode-select').classList.add('hidden');
  document.getElementById('timer-interface').classList.remove('hidden');
  
  const titles = {
    clock: 'Clock (Stopwatch)',
    tabata: 'Tabata Timer',
    emom: 'EMOM Timer',
    amrap: 'AMRAP Timer',
    fortime: 'For Time (Countdown)'
  };
  document.getElementById('timer-mode-title').textContent = titles[mode];

  // Build settings UI
  const settingsDiv = document.getElementById('timer-settings');
  let settingsHTML = '';

  if (mode === 'tabata') {
    settingsHTML = '<div class="grid grid-cols-1 gap-4 max-w-md mx-auto sm:grid-cols-3">' +
      '<div><label class="form-label">Work (sec)</label><input type="number" id="work-time" class="form-input" value="20" min="5" max="120"></div>' +
      '<div><label class="form-label">Rest (sec)</label><input type="number" id="rest-time" class="form-input" value="10" min="5" max="60"></div>' +
      '<div><label class="form-label">Rounds</label><input type="number" id="rounds" class="form-input" value="8" min="1" max="20"></div>' +
      '</div>';
    timerSeconds = 20;
  } else if (mode === 'emom') {
    settingsHTML = '<div class="grid grid-cols-1 gap-4 max-w-md mx-auto sm:grid-cols-2">' +
      '<div><label class="form-label">Minutes per Round</label><input type="number" id="emom-mins" class="form-input" value="1" min="1" max="5"></div>' +
      '<div><label class="form-label">Total Rounds</label><input type="number" id="rounds" class="form-input" value="10" min="1" max="30"></div>' +
      '</div>';
    timerSeconds = 60;
  } else if (mode === 'amrap' || mode === 'fortime') {
    settingsHTML = '<div class="max-w-xs mx-auto">' +
      '<label class="form-label">Duration (minutes)</label>' +
      '<div class="flex gap-2 mb-2">' +
      '<button type="button" class="btn btn-sm btn-outline" onclick="setDuration(5)">5</button>' +
      '<button type="button" class="btn btn-sm btn-outline" onclick="setDuration(10)">10</button>' +
      '<button type="button" class="btn btn-sm btn-outline" onclick="setDuration(15)">15</button>' +
      '<button type="button" class="btn btn-sm btn-outline" onclick="setDuration(20)">20</button>' +
      '</div>' +
      '<input type="number" id="duration" class="form-input" value="20" min="1" max="60">' +
      '</div>';
    timerSeconds = 20 * 60;
  } else {
    timerSeconds = 0;
  }

  settingsDiv.innerHTML = settingsHTML;
  updateDisplay();
  updateStatus();
}

// Set duration for AMRAP/For Time
function setDuration(mins) {
  document.getElementById('duration').value = mins;
  timerSeconds = mins * 60;
  updateDisplay();
}

// Back to mode selection
function backToModes() {
  resetTimer();
  document.getElementById('timer-mode-select').classList.remove('hidden');
  document.getElementById('timer-interface').classList.add('hidden');
  timerMode = '';
}

// Update status text
function updateStatus() {
  const statusDiv = document.getElementById('timer-status');
  if (timerMode === 'tabata') {
    statusDiv.textContent = (isWorkPhase ? 'WORK' : 'REST') + ' - Round ' + currentRound + '/' + totalRounds;
  } else if (timerMode === 'emom') {
    statusDiv.textContent = 'Round ' + currentRound + '/' + totalRounds;
  } else {
    statusDiv.textContent = '';
  }
}

// Start timer
function startTimer() {
  if (timerRunning) return;
  
  // Get settings
  if (timerMode === 'tabata') {
    workTime = parseInt(document.getElementById('work-time').value) || 20;
    restTime = parseInt(document.getElementById('rest-time').value) || 10;
    totalRounds = parseInt(document.getElementById('rounds').value) || 8;
    if (!timerInterval) {
      timerSeconds = workTime;
      isWorkPhase = true;
      currentRound = 1;
    }
  } else if (timerMode === 'emom') {
    const emomMins = parseInt(document.getElementById('emom-mins').value) || 1;
    totalRounds = parseInt(document.getElementById('rounds').value) || 10;
    if (!timerInterval) {
      timerSeconds = emomMins * 60;
      currentRound = 1;
    }
  } else if ((timerMode === 'amrap' || timerMode === 'fortime') && !timerInterval) {
    const duration = parseInt(document.getElementById('duration').value) || 20;
    timerSeconds = duration * 60;
  }

  timerRunning = true;
  document.getElementById('btn-start').disabled = true;
  document.getElementById('btn-pause').disabled = false;

  timerInterval = setInterval(function() {
    if (timerMode === 'clock') {
      timerSeconds++;
    } else {
      timerSeconds--;
      
      if (timerSeconds <= 0) {
        if (timerMode === 'tabata') {
          if (isWorkPhase) {
            isWorkPhase = false;
            timerSeconds = restTime;
          } else {
            currentRound++;
            if (currentRound > totalRounds) {
              finishTimer();
              return;
            }
            isWorkPhase = true;
            timerSeconds = workTime;
          }
          // Update display color
          document.getElementById('timer-display').classList.toggle('text-primary-400', isWorkPhase);
          document.getElementById('timer-display').classList.toggle('text-secondary-400', !isWorkPhase);
        } else if (timerMode === 'emom') {
          currentRound++;
          if (currentRound > totalRounds) {
            finishTimer();
            return;
          }
          const emomMins = parseInt(document.getElementById('emom-mins').value) || 1;
          timerSeconds = emomMins * 60;
        } else {
          finishTimer();
          return;
        }
      }
    }
    
    updateDisplay();
    updateStatus();
  }, 1000);
}

// Pause timer
function pauseTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
  document.getElementById('btn-start').disabled = false;
  document.getElementById('btn-pause').disabled = true;
}

// Reset timer
function resetTimer() {
  pauseTimer();
  currentRound = 1;
  isWorkPhase = true;
  
  if (timerMode === 'tabata') {
    timerSeconds = parseInt(document.getElementById('work-time')?.value) || 20;
  } else if (timerMode === 'emom') {
    const emomMins = parseInt(document.getElementById('emom-mins')?.value) || 1;
    timerSeconds = emomMins * 60;
  } else if (timerMode === 'amrap' || timerMode === 'fortime') {
    const duration = parseInt(document.getElementById('duration')?.value) || 20;
    timerSeconds = duration * 60;
  } else {
    timerSeconds = 0;
  }
  
  document.getElementById('timer-display').classList.add('text-primary-400');
  document.getElementById('timer-display').classList.remove('text-secondary-400', 'text-success-400');
  updateDisplay();
  updateStatus();
}

// Finish timer
function finishTimer() {
  pauseTimer();
  document.getElementById('timer-display').textContent = 'DONE!';
  document.getElementById('timer-display').classList.remove('text-primary-400', 'text-secondary-400');
  document.getElementById('timer-display').classList.add('text-success-400');
  document.getElementById('timer-status').textContent = 'Workout Complete!';
}

// Toggle fullscreen
function toggleFullscreen() {
  const timerCard = document.getElementById('timer-card');
  if (!document.fullscreenElement) {
    if (timerCard.requestFullscreen) {
      timerCard.requestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Set year on page load
document.addEventListener('DOMContentLoaded', function() {
  const currentYear = new Date().getFullYear();
  const footerYear = document.getElementById('footer-year');
  const sidebarYear = document.getElementById('sidebar-year');
  if (footerYear) footerYear.textContent = currentYear;
  if (sidebarYear) sidebarYear.textContent = currentYear;
});
