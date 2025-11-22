// Workout Timers - AMRAP, EMOM, and Tabata functionality (CrossHero Style)

// Global timer state
let amrapInterval = null;
let amrapTimeRemaining = 0;
let amrapRunning = false;

let emomInterval = null;
let emomTimeRemaining = 0;
let emomCurrentRound = 1;
let emomRunning = false;
let emomInRest = false;

let tabataInterval = null;
let tabataTimeRemaining = 0;
let tabataCurrentRound = 1;
let tabataRunning = false;
let tabataInRest = false;

let soundEnabled = true;

/**
 * Initialize timers on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeTimerTabs();
  initializeAMRAPTimer();
  initializeEMOMTimer();
  initializeTabataTimer();
  initializeControls();
  initializeOneRepMaxCalculator();
});

/**
 * Initialize fullscreen and sound controls
 */
function initializeControls() {
  const fullscreenBtn = document.getElementById('fullscreen-toggle');
  const soundBtn = document.getElementById('sound-toggle');
  const timersSection = document.querySelector('.timers-section');

  // Fullscreen toggle
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        timersSection.requestFullscreen().then(() => {
          timersSection.classList.add('fullscreen');
          fullscreenBtn.innerHTML = '<i class=\"fa-solid fa-compress\"></i>';
        }).catch(err => {
          console.log('Fullscreen error:', err);
        });
      } else {
        document.exitFullscreen().then(() => {
          timersSection.classList.remove('fullscreen');
          fullscreenBtn.innerHTML = '<i class=\"fa-solid fa-expand\"></i>';
        });
      }
    });

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        timersSection.classList.remove('fullscreen');
        fullscreenBtn.innerHTML = '<i class=\"fa-solid fa-expand\"></i>';
      }
    });
  }

  // Sound toggle
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.classList.toggle('active');
      if (soundEnabled) {
        soundBtn.innerHTML = '<i class=\"fa-solid fa-volume-high\"></i>';
      } else {
        soundBtn.innerHTML = '<i class=\"fa-solid fa-volume-xmark\"></i>';
      }
    });
  }
}

/**
 * Initialize timer tab switching
 */
function initializeTimerTabs() {
  const amrapTab = document.getElementById('amrap-tab');
  const emomTab = document.getElementById('emom-tab');
  const tabataTab = document.getElementById('tabata-tab');
  const amrapContainer = document.getElementById('amrap-timer');
  const emomContainer = document.getElementById('emom-timer');
  const tabataContainer = document.getElementById('tabata-timer');

  amrapTab.addEventListener('click', () => {
    setActiveTab('amrap', amrapTab, [emomTab, tabataTab], amrapContainer, [emomContainer, tabataContainer]);
    if (emomRunning) resetEMOMTimer();
    if (tabataRunning) resetTabataTimer();
  });

  emomTab.addEventListener('click', () => {
    setActiveTab('emom', emomTab, [amrapTab, tabataTab], emomContainer, [amrapContainer, tabataContainer]);
    if (amrapRunning) resetAMRAPTimer();
    if (tabataRunning) resetTabataTimer();
  });

  tabataTab.addEventListener('click', () => {
    setActiveTab('tabata', tabataTab, [amrapTab, emomTab], tabataContainer, [amrapContainer, emomContainer]);
    if (amrapRunning) resetAMRAPTimer();
    if (emomRunning) resetEMOMTimer();
  });
}

function setActiveTab(name, activeTab, inactiveTabs, activeContainer, inactiveContainers) {
  activeTab.classList.add('active');
  activeTab.setAttribute('aria-pressed', 'true');
  activeContainer.classList.add('active');

  inactiveTabs.forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-pressed', 'false');
  });

  inactiveContainers.forEach(container => {
    container.classList.remove('active');
  });
}

/**
 * Initialize AMRAP Timer
 */
function initializeAMRAPTimer() {
  const startBtn = document.getElementById('amrap-start');
  const pauseBtn = document.getElementById('amrap-pause');
  const resetBtn = document.getElementById('amrap-reset');
  const durationInput = document.getElementById('amrap-duration');

  startBtn.addEventListener('click', startAMRAPTimer);
  pauseBtn.addEventListener('click', pauseAMRAPTimer);
  resetBtn.addEventListener('click', resetAMRAPTimer);

  durationInput.addEventListener('change', () => {
    if (!amrapRunning) {
      updateAMRAPDisplay();
    }
  });

  updateAMRAPDisplay();
}

/**
 * Start AMRAP Timer
 */
function startAMRAPTimer() {
  if (amrapRunning) return;

  const durationInput = document.getElementById('amrap-duration');
  const startBtn = document.getElementById('amrap-start');
  const pauseBtn = document.getElementById('amrap-pause');

  // Initialize time remaining if starting fresh
  if (amrapTimeRemaining === 0) {
    const minutes = parseInt(durationInput.value) || 10;
    amrapTimeRemaining = minutes * 60;
  }

  amrapRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  durationInput.disabled = true;

  amrapInterval = setInterval(() => {
    amrapTimeRemaining--;
    updateAMRAPDisplay();

    if (amrapTimeRemaining <= 0) {
      completeAMRAPTimer();
    } else if (amrapTimeRemaining <= 10) {
      // Beep sound for last 10 seconds
      playBeep();
    }
  }, 1000);
}

/**
 * Pause AMRAP Timer
 */
function pauseAMRAPTimer() {
  if (!amrapRunning) return;

  amrapRunning = false;
  clearInterval(amrapInterval);

  const startBtn = document.getElementById('amrap-start');
  const pauseBtn = document.getElementById('amrap-pause');

  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

/**
 * Reset AMRAP Timer
 */
function resetAMRAPTimer() {
  amrapRunning = false;
  amrapTimeRemaining = 0;
  clearInterval(amrapInterval);

  const startBtn = document.getElementById('amrap-start');
  const pauseBtn = document.getElementById('amrap-pause');
  const durationInput = document.getElementById('amrap-duration');

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  durationInput.disabled = false;

  updateAMRAPDisplay();
}

/**
 * Complete AMRAP Timer
 */
function completeAMRAPTimer() {
  amrapRunning = false;
  amrapTimeRemaining = 0;
  clearInterval(amrapInterval);

  const startBtn = document.getElementById('amrap-start');
  const pauseBtn = document.getElementById('amrap-pause');
  const durationInput = document.getElementById('amrap-duration');

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  durationInput.disabled = false;

  updateAMRAPDisplay();
  playCompletionSound();
  showToast('AMRAP Timer Complete! 🎉');
}

/**
 * Update AMRAP Display
 */
function updateAMRAPDisplay() {
  const display = document.querySelector('#amrap-display .timer-time');
  const statusEl = document.getElementById('amrap-status');

  if (amrapTimeRemaining === 0) {
    const durationInput = document.getElementById('amrap-duration');
    const minutes = parseInt(durationInput.value) || 10;
    display.textContent = formatTime(minutes * 60);
    if (statusEl) statusEl.textContent = 'Ready to start';
  } else {
    display.textContent = formatTime(amrapTimeRemaining);
    if (statusEl && amrapRunning) {
      statusEl.textContent = 'In progress...';
    }
  }

  // Add visual indicator for last 10 seconds
  if (amrapTimeRemaining > 0 && amrapTimeRemaining <= 10) {
    display.classList.add('warning');
  } else {
    display.classList.remove('warning');
  }
}

/**
 * Complete AMRAP Timer
 */
function completeAMRAPTimer() {
  amrapRunning = false;
  amrapTimeRemaining = 0;
  clearInterval(amrapInterval);

  const startBtn = document.getElementById('amrap-start');
  const pauseBtn = document.getElementById('amrap-pause');
  const durationInput = document.getElementById('amrap-duration');
  const statusEl = document.getElementById('amrap-status');

  startBtn.disabled = false;
  startBtn.innerHTML = '<i class=\"fa-solid fa-play\"></i>';
  pauseBtn.disabled = true;
  durationInput.disabled = false;

  updateAMRAPDisplay();
  if (statusEl) statusEl.textContent = 'Complete! 🎉';
  playCompletionSound();
  showToast('AMRAP Timer Complete! 🎉');
}

/**
 * Start AMRAP Timer
 */
function startAMRAPTimer() {
  if (amrapRunning) return;

  const durationInput = document.getElementById('amrap-duration');
  const startBtn = document.getElementById('amrap-start');
  const pauseBtn = document.getElementById('amrap-pause');

  // Initialize time remaining if starting fresh
  if (amrapTimeRemaining === 0) {
    const minutes = parseInt(durationInput.value) || 10;
    amrapTimeRemaining = minutes * 60;
  }

  amrapRunning = true;
  startBtn.disabled = true;
  startBtn.innerHTML = '<i class=\"fa-solid fa-play\"></i>';
  pauseBtn.disabled = false;
  durationInput.disabled = true;

  amrapInterval = setInterval(() => {
    amrapTimeRemaining--;
    updateAMRAPDisplay();

    if (amrapTimeRemaining <= 0) {
      completeAMRAPTimer();
    } else if (amrapTimeRemaining <= 10) {
      playBeep();
    }
  }, 1000);
}

/**
 * Pause AMRAP Timer
 */
function pauseAMRAPTimer() {
  if (!amrapRunning) return;

  amrapRunning = false;
  clearInterval(amrapInterval);

  const startBtn = document.getElementById('amrap-start');
  const pauseBtn = document.getElementById('amrap-pause');
  const statusEl = document.getElementById('amrap-status');

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  if (statusEl) statusEl.textContent = 'Paused';
}

/**
 * Reset AMRAP Timer
 */
function resetAMRAPTimer() {
  amrapRunning = false;
  amrapTimeRemaining = 0;
  clearInterval(amrapInterval);

  const startBtn = document.getElementById('amrap-start');
  const pauseBtn = document.getElementById('amrap-pause');
  const durationInput = document.getElementById('amrap-duration');

  startBtn.disabled = false;
  startBtn.innerHTML = '<i class=\"fa-solid fa-play\"></i>';
  pauseBtn.disabled = true;
  durationInput.disabled = false;

  updateAMRAPDisplay();
}
function initializeEMOMTimer() {
  const startBtn = document.getElementById('emom-start');
  const pauseBtn = document.getElementById('emom-pause');
  const resetBtn = document.getElementById('emom-reset');
  const roundsInput = document.getElementById('emom-rounds');
  const workInput = document.getElementById('emom-work');
  const restInput = document.getElementById('emom-rest');

  startBtn.addEventListener('click', startEMOMTimer);
  pauseBtn.addEventListener('click', pauseEMOMTimer);
  resetBtn.addEventListener('click', resetEMOMTimer);

  [roundsInput, workInput, restInput].forEach(input => {
    if (input) {
      input.addEventListener('change', () => {
        if (!emomRunning) {
          updateEMOMDisplay();
        }
      });
    }
  });

  updateEMOMDisplay();
}

/**
 * Start EMOM Timer
 */
function startEMOMTimer() {
  if (emomRunning) return;

  const roundsInput = document.getElementById('emom-rounds');
  const workInput = document.getElementById('emom-work');
  const restInput = document.getElementById('emom-rest');
  const startBtn = document.getElementById('emom-start');
  const pauseBtn = document.getElementById('emom-pause');

  // Initialize if starting fresh
  if (emomTimeRemaining === 0) {
    const workMin = parseInt(workInput.value) || 1;
    emomTimeRemaining = workMin * 60;
    emomCurrentRound = 1;
    emomInRest = false;
  }

  emomRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  roundsInput.disabled = true;
  workInput.disabled = true;
  restInput.disabled = true;

  updateEMOMStatus('Work!');

  emomInterval = setInterval(() => {
    emomTimeRemaining--;
    updateEMOMDisplay();

    if (emomTimeRemaining <= 0) {
      handleEMOMRoundComplete();
    } else if (emomTimeRemaining <= 3 && !emomInRest) {
      // Beep for last 3 seconds of work interval
      playBeep();
    }
  }, 1000);
}

/**
 * Handle EMOM Round Complete
 */
function handleEMOMRoundComplete() {
  const roundsInput = document.getElementById('emom-rounds');
  const workInput = document.getElementById('emom-work');
  const restInput = document.getElementById('emom-rest');
  const totalRounds = parseInt(roundsInput.value) || 10;
  const restTime = parseInt(restInput.value) || 0;

  if (emomInRest) {
    // Rest complete, move to next round
    emomCurrentRound++;
    emomInRest = false;

    if (emomCurrentRound > totalRounds) {
      // All rounds complete
      completeEMOMTimer();
    } else {
      // Start next work interval
      const workMin = parseInt(workInput.value) || 1;
      emomTimeRemaining = workMin * 60;
      updateEMOMStatus('Work!');
      playBeep();
    }
  } else {
    // Work interval complete
    if (restTime > 0 && emomCurrentRound < totalRounds) {
      // Start rest period
      emomInRest = true;
      emomTimeRemaining = restTime;
      updateEMOMStatus('Rest');
      playBeep();
    } else if (emomCurrentRound < totalRounds) {
      // No rest, move to next round immediately
      emomCurrentRound++;
      const workMin = parseInt(workInput.value) || 1;
      emomTimeRemaining = workMin * 60;
      updateEMOMStatus('Work!');
      playBeep();
    } else {
      // Last round complete
      completeEMOMTimer();
    }
  }

  updateEMOMDisplay();
}

/**
 * Pause EMOM Timer
 */
function pauseEMOMTimer() {
  if (!emomRunning) return;

  emomRunning = false;
  clearInterval(emomInterval);

  const startBtn = document.getElementById('emom-start');
  const pauseBtn = document.getElementById('emom-pause');

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  updateEMOMStatus('Paused');
}

/**
 * Reset EMOM Timer
 */
function resetEMOMTimer() {
  emomRunning = false;
  emomTimeRemaining = 0;
  emomCurrentRound = 1;
  emomInRest = false;
  clearInterval(emomInterval);

  const startBtn = document.getElementById('emom-start');
  const pauseBtn = document.getElementById('emom-pause');
  const roundsInput = document.getElementById('emom-rounds');
  const workInput = document.getElementById('emom-work');
  const restInput = document.getElementById('emom-rest');

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  roundsInput.disabled = false;
  workInput.disabled = false;
  restInput.disabled = false;

  updateEMOMDisplay();
  updateEMOMStatus('Ready');
}

/**
 * Complete EMOM Timer
 */
function completeEMOMTimer() {
  emomRunning = false;
  emomTimeRemaining = 0;
  clearInterval(emomInterval);

  const startBtn = document.getElementById('emom-start');
  const pauseBtn = document.getElementById('emom-pause');
  const roundsInput = document.getElementById('emom-rounds');
  const workMinInput = document.getElementById('emom-work-min');
  const workSecInput = document.getElementById('emom-work-sec');
  const restInput = document.getElementById('emom-rest');

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  roundsInput.disabled = false;
  workMinInput.disabled = false;
  workSecInput.disabled = false;
  restInput.disabled = false;
  restInput.disabled = false;

  updateEMOMDisplay();
  updateEMOMStatus('Complete! 🎉');
  playCompletionSound();
  showToast('EMOM Timer Complete! 🎉');
}

/**
 * Update EMOM Display
 */
function updateEMOMDisplay() {
  const display = document.querySelector('#emom-display .timer-time');
  const currentRoundEl = document.getElementById('emom-current-round');
  const totalRoundsEl = document.getElementById('emom-total-rounds');
  const roundsInput = document.getElementById('emom-rounds');
  const workInput = document.getElementById('emom-work');

  currentRoundEl.textContent = emomCurrentRound;
  totalRoundsEl.textContent = roundsInput.value;

  if (emomTimeRemaining === 0 && !emomRunning) {
    const workMin = parseInt(workInput.value) || 1;
    display.textContent = formatTime(workMin * 60);
  } else {
    display.textContent = formatTime(emomTimeRemaining);
  }

  // Add visual indicator for last 3 seconds
  if (emomTimeRemaining > 0 && emomTimeRemaining <= 3 && !emomInRest) {
    display.classList.add('warning');
  } else {
    display.classList.remove('warning');
  }
}

/**
 * Update EMOM Status
 */
function updateEMOMStatus(status) {
  const statusEl = document.getElementById('emom-status');
  if (!statusEl) return;
  
  statusEl.textContent = status;

  // Update styling based on status
  statusEl.className = 'emom-status';
  if (status === 'Work!') {
    statusEl.classList.add('work');
  } else if (status === 'Rest') {
    statusEl.classList.add('rest');
  } else if (status.includes('Complete')) {
    statusEl.classList.add('complete');
  }
}

/**
 * Initialize Tabata Timer
 */
function initializeTabataTimer() {
  const startBtn = document.getElementById('tabata-start');
  const pauseBtn = document.getElementById('tabata-pause');
  const resetBtn = document.getElementById('tabata-reset');
  const roundsInput = document.getElementById('tabata-rounds');
  const workInput = document.getElementById('tabata-work');
  const restInput = document.getElementById('tabata-rest');

  if (!startBtn) return; // Tabata elements don't exist yet

  startBtn.addEventListener('click', startTabataTimer);
  pauseBtn.addEventListener('click', pauseTabataTimer);
  resetBtn.addEventListener('click', resetTabataTimer);

  [roundsInput, workInput, restInput].forEach(input => {
    input.addEventListener('change', () => {
      if (!tabataRunning) {
        updateTabataDisplay();
      }
    });
  });

  updateTabataDisplay();
}

/**
 * Start Tabata Timer
 */
function startTabataTimer() {
  if (tabataRunning) return;

  const roundsInput = document.getElementById('tabata-rounds');
  const workInput = document.getElementById('tabata-work');
  const restInput = document.getElementById('tabata-rest');
  const startBtn = document.getElementById('tabata-start');
  const pauseBtn = document.getElementById('tabata-pause');

  // Initialize if starting fresh
  if (tabataTimeRemaining === 0) {
    const work = parseInt(workInput.value) || 20;
    tabataTimeRemaining = work;
    tabataCurrentRound = 1;
    tabataInRest = false;
  }

  tabataRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  roundsInput.disabled = true;
  workInput.disabled = true;
  restInput.disabled = true;

  updateTabataStatus('Work!');

  tabataInterval = setInterval(() => {
    tabataTimeRemaining--;
    updateTabataDisplay();

    if (tabataTimeRemaining <= 0) {
      handleTabataRoundComplete();
    } else if (tabataTimeRemaining <= 3) {
      playBeep();
    }
  }, 1000);
}

/**
 * Handle Tabata Round Complete
 */
function handleTabataRoundComplete() {
  const roundsInput = document.getElementById('tabata-rounds');
  const workInput = document.getElementById('tabata-work');
  const restInput = document.getElementById('tabata-rest');
  const totalRounds = parseInt(roundsInput.value) || 8;
  const restTime = parseInt(restInput.value) || 10;
  const workTime = parseInt(workInput.value) || 20;

  if (tabataInRest) {
    // Rest complete, move to next round
    tabataCurrentRound++;
    tabataInRest = false;

    if (tabataCurrentRound > totalRounds) {
      // All rounds complete
      completeTabataTimer();
    } else {
      // Start next work interval
      tabataTimeRemaining = workTime;
      updateTabataStatus('Work!');
      playBeep();
    }
  } else {
    // Work interval complete
    if (tabataCurrentRound < totalRounds) {
      // Start rest period
      tabataInRest = true;
      tabataTimeRemaining = restTime;
      updateTabataStatus('Rest');
      playBeep();
    } else {
      // Last round complete
      completeTabataTimer();
    }
  }

  updateTabataDisplay();
}

/**
 * Pause Tabata Timer
 */
function pauseTabataTimer() {
  if (!tabataRunning) return;

  tabataRunning = false;
  clearInterval(tabataInterval);

  const startBtn = document.getElementById('tabata-start');
  const pauseBtn = document.getElementById('tabata-pause');

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  updateTabataStatus('Paused');
}

/**
 * Reset Tabata Timer
 */
function resetTabataTimer() {
  tabataRunning = false;
  tabataTimeRemaining = 0;
  tabataCurrentRound = 1;
  tabataInRest = false;
  clearInterval(tabataInterval);

  const startBtn = document.getElementById('tabata-start');
  const pauseBtn = document.getElementById('tabata-pause');
  const roundsInput = document.getElementById('tabata-rounds');
  const workInput = document.getElementById('tabata-work');
  const restInput = document.getElementById('tabata-rest');

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  roundsInput.disabled = false;
  workInput.disabled = false;
  restInput.disabled = false;

  updateTabataDisplay();
  updateTabataStatus('Ready to start');
}

/**
 * Complete Tabata Timer
 */
function completeTabataTimer() {
  tabataRunning = false;
  tabataTimeRemaining = 0;
  clearInterval(tabataInterval);

  const startBtn = document.getElementById('tabata-start');
  const pauseBtn = document.getElementById('tabata-pause');
  const roundsInput = document.getElementById('tabata-rounds');
  const workInput = document.getElementById('tabata-work');
  const restInput = document.getElementById('tabata-rest');

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  roundsInput.disabled = false;
  workInput.disabled = false;
  restInput.disabled = false;

  updateTabataDisplay();
  updateTabataStatus('Complete! 🎉');
  playCompletionSound();
  showToast('Tabata Timer Complete! 🎉');
}

/**
 * Update Tabata Display
 */
function updateTabataDisplay() {
  const display = document.querySelector('#tabata-display .timer-time');
  const currentRoundEl = document.getElementById('tabata-current-round');
  const totalRoundsEl = document.getElementById('tabata-total-rounds');
  const roundsInput = document.getElementById('tabata-rounds');
  const workInput = document.getElementById('tabata-work');

  if (!display) return;

  currentRoundEl.textContent = tabataCurrentRound;
  totalRoundsEl.textContent = roundsInput.value;

  if (tabataTimeRemaining === 0 && !tabataRunning) {
    const work = parseInt(workInput.value) || 20;
    display.textContent = `0:${work.toString().padStart(2, '0')}`;
  } else {
    const secs = tabataTimeRemaining;
    display.textContent = `0:${secs.toString().padStart(2, '0')}`;
  }

  // Add visual indicator for last 3 seconds
  if (tabataTimeRemaining > 0 && tabataTimeRemaining <= 3) {
    display.classList.add('warning');
  } else {
    display.classList.remove('warning');
  }
}

/**
 * Update Tabata Status
 */
function updateTabataStatus(status) {
  const statusEl = document.getElementById('tabata-status');
  if (!statusEl) return;
  
  statusEl.textContent = status;

  // Update styling based on status
  statusEl.className = 'tabata-status';
  if (status === 'Work!') {
    statusEl.classList.add('work');
  } else if (status === 'Rest') {
    statusEl.classList.add('rest');
  } else if (status.includes('Complete')) {
    statusEl.classList.add('complete');
  }
}

/**
 * Format time in MM:SS format
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Play beep sound
 */
function playBeep() {
  if (!soundEnabled) return;
  
  // Create a simple beep using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Audio not supported or blocked
    console.log('Audio not available');
  }
}

/**
 * Play completion sound
 */
function playCompletionSound() {
  if (!soundEnabled) return;
  
  // Play a series of beeps for completion
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    [0, 0.15, 0.3].forEach((delay, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = index === 2 ? 1200 : 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.2);

      oscillator.start(audioContext.currentTime + delay);
      oscillator.stop(audioContext.currentTime + delay + 0.2);
    });
  } catch (e) {
    // Audio not supported or blocked
    console.log('Audio not available');
  }
}

/**
 * Initialize One Rep Max Calculator
 */
function initializeOneRepMaxCalculator() {
  const weightInput = document.getElementById('orm-weight');
  const repsInput = document.getElementById('orm-reps');

  if (!weightInput || !repsInput) return;

  // Calculate on input change
  weightInput.addEventListener('input', calculateOneRepMax);
  repsInput.addEventListener('input', calculateOneRepMax);

  // Initial calculation
  calculateOneRepMax();
}

/**
 * Calculate One Rep Max using Epley Formula
 * Formula: Weight × (1 + Reps/30)
 */
function calculateOneRepMax() {
  const weightInput = document.getElementById('orm-weight');
  const repsInput = document.getElementById('orm-reps');
  const resultEl = document.getElementById('orm-result');

  if (!weightInput || !repsInput || !resultEl) {
    console.error('ORM Calculator: Missing input elements');
    return;
  }

  const weight = parseFloat(weightInput.value) || 0;
  const reps = parseInt(repsInput.value) || 1;

  console.log('ORM Calculation:', { weight, reps });

  // Epley formula
  let oneRepMax;
  if (reps === 1) {
    oneRepMax = weight;
  } else {
    oneRepMax = weight * (1 + reps / 30);
  }

  // Round to nearest integer
  oneRepMax = Math.round(oneRepMax);

  console.log('Calculated 1RM:', oneRepMax);

  // Update main result
  resultEl.textContent = oneRepMax;

  // Update percentage values (kg only)
  const percentages = [95, 90, 85, 80, 75, 70, 65, 60];
  percentages.forEach(percent => {
    const el = document.getElementById(`orm-${percent}`);
    if (el) {
      const value = Math.round(oneRepMax * (percent / 100));
      el.textContent = `${value} kg`;
    }
  });
}
