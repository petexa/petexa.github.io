// Workout Timers - AMRAP and EMOM functionality

// Global timer state
let amrapInterval = null;
let amrapTimeRemaining = 0;
let amrapRunning = false;

let emomInterval = null;
let emomTimeRemaining = 0;
let emomCurrentRound = 1;
let emomRunning = false;
let emomInRest = false;

/**
 * Initialize timers on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeTimerTabs();
    initializeAMRAPTimer();
    initializeEMOMTimer();
});

/**
 * Initialize timer tab switching
 */
function initializeTimerTabs() {
    const amrapTab = document.getElementById('amrap-tab');
    const emomTab = document.getElementById('emom-tab');
    const amrapContainer = document.getElementById('amrap-timer');
    const emomContainer = document.getElementById('emom-timer');
    
    amrapTab.addEventListener('click', () => {
        amrapTab.classList.add('active');
        emomTab.classList.remove('active');
        amrapTab.setAttribute('aria-pressed', 'true');
        emomTab.setAttribute('aria-pressed', 'false');
        amrapContainer.classList.add('active');
        emomContainer.classList.remove('active');
        
        // Reset other timer if switching
        if (emomRunning) {
            resetEMOMTimer();
        }
    });
    
    emomTab.addEventListener('click', () => {
        emomTab.classList.add('active');
        amrapTab.classList.remove('active');
        emomTab.setAttribute('aria-pressed', 'true');
        amrapTab.setAttribute('aria-pressed', 'false');
        emomContainer.classList.add('active');
        amrapContainer.classList.remove('active');
        
        // Reset other timer if switching
        if (amrapRunning) {
            resetAMRAPTimer();
        }
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
    
    if (amrapTimeRemaining === 0) {
        const durationInput = document.getElementById('amrap-duration');
        const minutes = parseInt(durationInput.value) || 10;
        display.textContent = formatTime(minutes * 60);
    } else {
        display.textContent = formatTime(amrapTimeRemaining);
    }
    
    // Add visual indicator for last 10 seconds
    if (amrapTimeRemaining > 0 && amrapTimeRemaining <= 10) {
        display.classList.add('warning');
    } else {
        display.classList.remove('warning');
    }
}

/**
 * Initialize EMOM Timer
 */
function initializeEMOMTimer() {
    const startBtn = document.getElementById('emom-start');
    const pauseBtn = document.getElementById('emom-pause');
    const resetBtn = document.getElementById('emom-reset');
    const roundsInput = document.getElementById('emom-rounds');
    const intervalInput = document.getElementById('emom-interval');
    const restInput = document.getElementById('emom-rest');
    
    startBtn.addEventListener('click', startEMOMTimer);
    pauseBtn.addEventListener('click', pauseEMOMTimer);
    resetBtn.addEventListener('click', resetEMOMTimer);
    
    [roundsInput, intervalInput, restInput].forEach(input => {
        input.addEventListener('change', () => {
            if (!emomRunning) {
                updateEMOMDisplay();
            }
        });
    });
    
    updateEMOMDisplay();
}

/**
 * Start EMOM Timer
 */
function startEMOMTimer() {
    if (emomRunning) return;
    
    const roundsInput = document.getElementById('emom-rounds');
    const intervalInput = document.getElementById('emom-interval');
    const restInput = document.getElementById('emom-rest');
    const startBtn = document.getElementById('emom-start');
    const pauseBtn = document.getElementById('emom-pause');
    
    // Initialize if starting fresh
    if (emomTimeRemaining === 0) {
        const interval = parseInt(intervalInput.value) || 60;
        emomTimeRemaining = interval;
        emomCurrentRound = 1;
        emomInRest = false;
    }
    
    emomRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    roundsInput.disabled = true;
    intervalInput.disabled = true;
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
    const intervalInput = document.getElementById('emom-interval');
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
            const interval = parseInt(intervalInput.value) || 60;
            emomTimeRemaining = interval;
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
            const interval = parseInt(intervalInput.value) || 60;
            emomTimeRemaining = interval;
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
    const intervalInput = document.getElementById('emom-interval');
    const restInput = document.getElementById('emom-rest');
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    roundsInput.disabled = false;
    intervalInput.disabled = false;
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
    const intervalInput = document.getElementById('emom-interval');
    const restInput = document.getElementById('emom-rest');
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    roundsInput.disabled = false;
    intervalInput.disabled = false;
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
    const intervalInput = document.getElementById('emom-interval');
    
    currentRoundEl.textContent = emomCurrentRound;
    totalRoundsEl.textContent = roundsInput.value;
    
    if (emomTimeRemaining === 0 && !emomRunning) {
        const interval = parseInt(intervalInput.value) || 60;
        display.textContent = formatTime(interval);
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
