/**
 * Custom Workout Builder
 * Generates custom workout sessions with multiple output formats:
 * - Full Coaching Version (detailed instructions)
 * - Printable A4 Version (minimal, PDF-friendly)
 * - Chalkboard Mode (ultra-minimal WOD board style)
 */
(function () {
  'use strict';

  // DOM Elements
  const form = document.getElementById('workoutBuilderForm');
  const outputSection = document.getElementById('output-section');
  const coachingOutput = document.getElementById('coaching-output');
  const printArea = document.getElementById('print-area');
  const chalkboardOutput = document.getElementById('chalkboard-output');
  const printBtn = document.getElementById('printBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const tabs = document.querySelectorAll('.output-tab');
  const panels = document.querySelectorAll('.output-panel');
  const collapsibleHeaders = document.querySelectorAll('.collapsible-header');

  if (!form) return; // Page safety guard

  // Exercise database organized by type and target area
  const exerciseDB = {
    warmup: {
      general: [
        'Light jog or row (2-3 min)',
        'Jumping jacks (30 seconds)',
        'Arm circles (forward & backward)',
        'Leg swings (front & side)',
        'Hip circles',
        'High knees (30 seconds)',
        'Butt kicks (30 seconds)',
        'Inch worms (5-8 reps)',
        'World\'s greatest stretch (5 each side)',
        'Cat-cow stretches (10 reps)'
      ],
      mobility: [
        'Thoracic spine rotations',
        'Hip 90/90 stretches',
        'Shoulder pass-throughs with PVC',
        'Ankle mobility circles',
        'Wrist circles and stretches'
      ]
    },
    strength: {
      'full-body': [
        { name: 'Deadlift', sets: '5', reps: '5', notes: 'Focus on hip hinge' },
        { name: 'Back Squat', sets: '5', reps: '5', notes: 'Maintain upright torso' },
        { name: 'Bench Press', sets: '4', reps: '6-8', notes: 'Control the descent' },
        { name: 'Barbell Row', sets: '4', reps: '8', notes: 'Squeeze at the top' },
        { name: 'Overhead Press', sets: '4', reps: '6', notes: 'Full lockout overhead' }
      ],
      upper: [
        { name: 'Bench Press', sets: '4', reps: '6-8', notes: 'Full ROM' },
        { name: 'Pull-ups', sets: '4', reps: 'Max', notes: 'Strict form' },
        { name: 'Dumbbell Shoulder Press', sets: '3', reps: '10', notes: 'Neutral grip' },
        { name: 'Barbell Curl', sets: '3', reps: '12', notes: 'No swinging' },
        { name: 'Tricep Dips', sets: '3', reps: '12', notes: 'Elbows back' }
      ],
      lower: [
        { name: 'Back Squat', sets: '5', reps: '5', notes: 'Below parallel' },
        { name: 'Romanian Deadlift', sets: '4', reps: '8', notes: 'Feel the hamstring stretch' },
        { name: 'Walking Lunges', sets: '3', reps: '12 each', notes: 'Knee tracks over toe' },
        { name: 'Leg Press', sets: '3', reps: '12', notes: 'Full depth' },
        { name: 'Calf Raises', sets: '4', reps: '15', notes: 'Pause at top' }
      ],
      core: [
        { name: 'Plank', sets: '3', reps: '45-60 sec', notes: 'Keep hips level' },
        { name: 'Hanging Leg Raises', sets: '3', reps: '12', notes: 'Control the swing' },
        { name: 'Russian Twists', sets: '3', reps: '20 total', notes: 'Twist from the core' },
        { name: 'Dead Bug', sets: '3', reps: '10 each side', notes: 'Press low back into floor' },
        { name: 'Ab Wheel Rollout', sets: '3', reps: '10', notes: 'Maintain hollow body' }
      ],
      push: [
        { name: 'Bench Press', sets: '4', reps: '6-8', notes: 'Arch the back slightly' },
        { name: 'Incline Dumbbell Press', sets: '3', reps: '10', notes: '30-45 degree angle' },
        { name: 'Overhead Press', sets: '4', reps: '6', notes: 'Brace core tight' },
        { name: 'Dips', sets: '3', reps: '10-12', notes: 'Lean forward for chest' },
        { name: 'Cable Flyes', sets: '3', reps: '12', notes: 'Squeeze at centre' }
      ],
      pull: [
        { name: 'Pull-ups', sets: '4', reps: 'Max', notes: 'Full dead hang' },
        { name: 'Barbell Row', sets: '4', reps: '8', notes: 'Chest to bar' },
        { name: 'Face Pulls', sets: '3', reps: '15', notes: 'External rotation at end' },
        { name: 'Lat Pulldown', sets: '3', reps: '10', notes: 'Wide grip' },
        { name: 'Hammer Curls', sets: '3', reps: '12', notes: 'Neutral grip' }
      ],
      legs: [
        { name: 'Back Squat', sets: '5', reps: '5', notes: 'Drive through heels' },
        { name: 'Front Squat', sets: '4', reps: '6', notes: 'Elbows high' },
        { name: 'Bulgarian Split Squat', sets: '3', reps: '10 each', notes: 'Stay upright' },
        { name: 'Leg Curl', sets: '3', reps: '12', notes: 'Slow eccentric' },
        { name: 'Goblet Squat', sets: '3', reps: '12', notes: 'Elbows inside knees' }
      ],
      back: [
        { name: 'Deadlift', sets: '5', reps: '3', notes: 'Maintain neutral spine' },
        { name: 'Pull-ups', sets: '4', reps: 'Max', notes: 'Chin over bar' },
        { name: 'T-Bar Row', sets: '4', reps: '8', notes: 'Chest supported' },
        { name: 'Single Arm Dumbbell Row', sets: '3', reps: '10 each', notes: 'Full stretch' },
        { name: 'Good Mornings', sets: '3', reps: '12', notes: 'Slight knee bend' }
      ]
    },
    conditioning: {
      gym: [
        'Row 500m',
        'Bike Erg 1000m',
        'Ski Erg 500m',
        'Box Jumps (15-20)',
        'Burpees (10-15)',
        'Kettlebell Swings (15-20)',
        'Wall Balls (15-20)',
        'Double-Unders (50)',
        'Assault Bike Calories (10-15)',
        'Thrusters (10-12)'
      ],
      home: [
        'Burpees (10-15)',
        'Mountain Climbers (30 sec)',
        'Jump Squats (15-20)',
        'High Knees (30 sec)',
        'Jumping Lunges (20 total)',
        'Plank to Push-up (10)',
        'Tuck Jumps (10)',
        'Skaters (20 total)',
        'Step-ups (15 each)',
        'Bear Crawls (30 sec)'
      ],
      bodyweight: [
        'Burpees (10-15)',
        'Air Squats (20)',
        'Push-ups (15-20)',
        'Sit-ups (20)',
        'Lunges (20 total)',
        'Mountain Climbers (30 sec)',
        'Plank Hold (45 sec)',
        'Jump Squats (15)',
        'V-ups (15)',
        'Hollow Holds (30 sec)'
      ],
      outdoor: [
        'Run 400m',
        'Sprint 100m',
        'Hill Sprints (x5)',
        'Walking Lunges (50m)',
        'Bear Crawls (20m)',
        'Broad Jumps (10)',
        'Step-ups on bench (15 each)',
        'Dips on bench (15)',
        'Incline Push-ups (15)',
        'Box Jumps on bench (15)'
      ],
      minimal: [
        'Kettlebell Swings (20)',
        'Goblet Squats (15)',
        'KB Clean & Press (10 each)',
        'KB Deadlift (15)',
        'KB Rows (12 each)',
        'Dumbbell Thrusters (12)',
        'DB Snatches (10 each)',
        'Resistance Band Pull-Aparts (20)',
        'Band Squats (20)',
        'Band Good Mornings (15)'
      ]
    },
    cooldown: [
      'Light walk or row (2-3 min)',
      'Quad stretch (30 sec each)',
      'Hamstring stretch (30 sec each)',
      'Hip flexor stretch (30 sec each)',
      'Chest doorway stretch (30 sec each)',
      'Child\'s pose (60 sec)',
      'Pigeon pose (30 sec each)',
      'Lying spinal twist (30 sec each)',
      'Cat-cow stretches (10 reps)',
      'Deep breathing (2 min)'
    ]
  };

  // Skill level modifiers
  const skillModifiers = {
    beginner: { setsMultiplier: 0.7, repsMultiplier: 0.7, restIncrease: 30 },
    intermediate: { setsMultiplier: 1, repsMultiplier: 1, restIncrease: 0 },
    advanced: { setsMultiplier: 1.2, repsMultiplier: 1.2, restIncrease: -15 },
    beast: { setsMultiplier: 1.4, repsMultiplier: 1.3, restIncrease: -30 }
  };

  // Intensity rest times (seconds)
  const intensityRest = {
    low: 90,
    moderate: 60,
    high: 45,
    max: 30
  };

  /**
   * Shuffle array randomly
   */
  function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get random items from array
   */
  function getRandomItems(arr, count) {
    return shuffleArray(arr).slice(0, count);
  }

  /**
   * Generate workout based on form values
   */
  function generateWorkout(values) {
    const { duration, warmup, intensity, sessionType, targetArea, location, skillLevel, includeVideos } = values;
    const workout = {
      meta: { duration, warmup, intensity, sessionType, targetArea, location, skillLevel },
      sections: []
    };

    const durationMins = parseInt(duration, 10);
    const modifier = skillModifiers[skillLevel] || skillModifiers.intermediate;
    const baseRest = intensityRest[intensity] || 60;
    const restTime = Math.max(15, baseRest + modifier.restIncrease);

    // Calculate time allocation
    let warmupTime = warmup === 'yes' ? Math.min(10, Math.floor(durationMins * 0.15)) : 0;
    let cooldownTime = Math.floor(durationMins * 0.1);
    let mainTime = durationMins - warmupTime - cooldownTime;

    // Warm-up section
    if (warmup === 'yes') {
      const warmupExercises = getRandomItems(exerciseDB.warmup.general, 5);
      const mobilityExercises = getRandomItems(exerciseDB.warmup.mobility, 2);
      workout.sections.push({
        name: 'Warm-Up',
        duration: warmupTime,
        exercises: [...warmupExercises, ...mobilityExercises],
        notes: 'Move through each exercise smoothly, focusing on range of motion.'
      });
    }

    // Main session based on type
    if (sessionType === 'strength' || sessionType === 'mixed') {
      const strengthTarget = targetArea || 'full-body';
      const strengthExercises = exerciseDB.strength[strengthTarget] || exerciseDB.strength['full-body'];
      const selectedStrength = getRandomItems(strengthExercises, sessionType === 'strength' ? 5 : 3);
      
      const modifiedExercises = selectedStrength.map(ex => ({
        ...ex,
        sets: Math.max(2, Math.round(parseInt(ex.sets, 10) * modifier.setsMultiplier)).toString(),
        rest: `${restTime} sec`
      }));

      workout.sections.push({
        name: sessionType === 'strength' ? 'Strength Training' : 'Strength Component',
        duration: sessionType === 'strength' ? mainTime : Math.floor(mainTime * 0.6),
        exercises: modifiedExercises,
        notes: `Rest ${restTime} seconds between sets. Focus on controlled movement.`,
        isStrength: true
      });
    }

    if (sessionType === 'conditioning' || sessionType === 'mixed' || sessionType === 'hiit') {
      const conditioningLocation = location || 'gym';
      const conditioningExercises = exerciseDB.conditioning[conditioningLocation] || exerciseDB.conditioning.gym;
      const selectedConditioning = getRandomItems(conditioningExercises, sessionType === 'conditioning' ? 6 : 4);
      
      const wodFormat = sessionType === 'hiit' ? 'EMOM' : (Math.random() > 0.5 ? 'AMRAP' : 'For Time');
      const wodDuration = sessionType === 'mixed' ? Math.floor(mainTime * 0.4) : mainTime;

      workout.sections.push({
        name: sessionType === 'conditioning' ? 'Conditioning' : (sessionType === 'hiit' ? 'HIIT Session' : 'Conditioning Finisher'),
        duration: wodDuration,
        format: wodFormat,
        exercises: selectedConditioning,
        notes: wodFormat === 'AMRAP' 
          ? `Complete as many rounds as possible in ${wodDuration} minutes.`
          : wodFormat === 'EMOM'
          ? `Every minute on the minute for ${wodDuration} minutes.`
          : `Complete all exercises for time. Record your finish time.`
      });
    }

    if (sessionType === 'mobility') {
      const mobilityExercises = [
        ...getRandomItems(exerciseDB.warmup.mobility, 4),
        'Deep squat hold (2 min)',
        'Foam rolling quads (60 sec each)',
        'Foam rolling IT band (60 sec each)',
        'Thoracic spine foam rolling (2 min)',
        'Hip capsule stretches (60 sec each)',
        'Shoulder sleeper stretch (60 sec each)'
      ];
      workout.sections.push({
        name: 'Mobility Session',
        duration: mainTime,
        exercises: getRandomItems(mobilityExercises, 8),
        notes: 'Take your time with each stretch. Breathe deeply and relax into positions.'
      });
    }

    if (sessionType === 'skill') {
      const skillWork = [
        'Handstand practice (5-10 min)',
        'Double-under progressions',
        'Muscle-up transitions',
        'Pistol squat progressions',
        'Olympic lift technique drills',
        'Kipping pull-up practice',
        'Rope climb technique',
        'L-sit progressions'
      ];
      workout.sections.push({
        name: 'Skill Work',
        duration: mainTime,
        exercises: getRandomItems(skillWork, 3),
        notes: 'Focus on quality of movement over quantity. Take breaks as needed.'
      });
    }

    if (sessionType === 'endurance') {
      const enduranceOptions = location === 'outdoor' 
        ? ['Run 3-5km at steady pace', 'Interval runs: 400m fast / 200m recovery x 6-8', 'Long run at conversational pace']
        : ['Row 3000-5000m', 'Bike Erg 30-45 min', 'Mixed: Row/Bike/Ski Erg rotation'];
      workout.sections.push({
        name: 'Endurance Training',
        duration: mainTime,
        exercises: getRandomItems(enduranceOptions, 1),
        notes: `Maintain heart rate in Zone 2-3. ${intensity === 'high' || intensity === 'max' ? 'Include interval bursts.' : 'Keep steady pace.'}`
      });
    }

    // Cool-down section
    const cooldownExercises = getRandomItems(exerciseDB.cooldown, 5);
    workout.sections.push({
      name: 'Cool-Down',
      duration: cooldownTime,
      exercises: cooldownExercises,
      notes: 'Focus on deep breathing and relaxation. Hold each stretch gently.'
    });

    // Add video references if requested
    if (includeVideos) {
      workout.sections.forEach(section => {
        if (Array.isArray(section.exercises)) {
          section.exercises = section.exercises.map(ex => {
            if (typeof ex === 'string') {
              return { name: ex, video: `search: "${ex} tutorial"` };
            }
            return { ...ex, video: `search: "${ex.name} proper form"` };
          });
        }
      });
    }

    return workout;
  }

  /**
   * Render Full Coaching Version
   */
  function renderCoachingVersion(workout) {
    const { meta, sections } = workout;
    let html = `
      <h3>🏋️ Custom Workout Session</h3>
      <div class="workout-meta">
        <span class="workout-meta-item"><strong>Duration:</strong> ${meta.duration} min</span>
        <span class="workout-meta-item"><strong>Type:</strong> ${formatLabel(meta.sessionType)}</span>
        <span class="workout-meta-item"><strong>Target:</strong> ${formatLabel(meta.targetArea)}</span>
        <span class="workout-meta-item"><strong>Intensity:</strong> ${formatLabel(meta.intensity)}</span>
        <span class="workout-meta-item"><strong>Level:</strong> ${formatLabel(meta.skillLevel)}</span>
        <span class="workout-meta-item"><strong>Location:</strong> ${formatLabel(meta.location)}</span>
      </div>
    `;

    sections.forEach(section => {
      html += `<h4>${section.name} (${section.duration} min${section.format ? ` - ${section.format}` : ''})</h4>`;
      
      if (section.notes) {
        html += `<p><em>${section.notes}</em></p>`;
      }

      html += '<ul>';
      section.exercises.forEach(ex => {
        if (typeof ex === 'string') {
          html += `<li>${ex}</li>`;
        } else if (ex.sets && ex.reps) {
          html += `<li><strong>${ex.name}</strong>: ${ex.sets} sets × ${ex.reps}`;
          if (ex.notes) html += ` – <em>${ex.notes}</em>`;
          if (ex.rest) html += ` (Rest: ${ex.rest})`;
          if (ex.video) html += `<br><small>🎥 ${ex.video}</small>`;
          html += '</li>';
        } else {
          html += `<li>${ex.name}`;
          if (ex.video) html += `<br><small>🎥 ${ex.video}</small>`;
          html += '</li>';
        }
      });
      html += '</ul>';
    });

    html += `
      <h4>💡 Coaching Tips</h4>
      <ul>
        <li>Listen to your body and adjust intensity as needed.</li>
        <li>Stay hydrated throughout the session.</li>
        <li>Focus on form over speed, especially when fatigued.</li>
        <li>Log your results to track progress over time.</li>
      </ul>
    `;

    return html;
  }

  /**
   * Render Printable A4 Version
   */
  function renderPrintableVersion(workout) {
    const { meta, sections } = workout;
    const today = new Date().toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let html = `
      <h3 style="margin-bottom: 10pt;">Workout Session – ${today}</h3>
      <div class="workout-meta" style="margin-bottom: 15pt;">
        <span class="workout-meta-item">${meta.duration} min</span>
        <span class="workout-meta-item">${formatLabel(meta.sessionType)}</span>
        <span class="workout-meta-item">${formatLabel(meta.targetArea)}</span>
        <span class="workout-meta-item">${formatLabel(meta.intensity)}</span>
      </div>
    `;

    sections.forEach(section => {
      html += `<h4 style="margin: 10pt 0 5pt 0;">${section.name}${section.format ? ` (${section.format})` : ''}</h4>`;
      html += '<ul style="margin: 0; padding-left: 20pt;">';
      
      section.exercises.forEach(ex => {
        if (typeof ex === 'string') {
          html += `<li>${ex}</li>`;
        } else if (ex.sets && ex.reps) {
          html += `<li>${ex.name}: ${ex.sets} × ${ex.reps}</li>`;
        } else {
          html += `<li>${ex.name}</li>`;
        }
      });
      
      html += '</ul>';
    });

    html += `
      <div style="margin-top: 20pt; border-top: 1pt solid #ccc; padding-top: 10pt;">
        <p style="font-size: 10pt;"><strong>Notes:</strong> ________________________________________</p>
        <p style="font-size: 10pt;"><strong>Time:</strong> _______ <strong>Score/Result:</strong> _______</p>
      </div>
    `;

    return html;
  }

  /**
   * Render Chalkboard Version
   */
  function renderChalkboardVersion(workout) {
    const { meta, sections } = workout;
    const mainSection = sections.find(s => 
      s.name.includes('Strength') || 
      s.name.includes('Conditioning') || 
      s.name.includes('HIIT') ||
      s.name.includes('Skill') ||
      s.name.includes('Mobility') ||
      s.name.includes('Endurance')
    ) || sections[0];

    let html = `
      <h3>WOD</h3>
      <div class="wod-title">${mainSection.format || formatLabel(meta.sessionType)}</div>
      <div class="wod-content">
    `;

    if (mainSection.format) {
      html += `<p>${mainSection.format === 'AMRAP' ? `${mainSection.duration} Min AMRAP` : 
                  mainSection.format === 'EMOM' ? `${mainSection.duration} Min EMOM` :
                  'For Time'}</p>`;
    }

    html += '<ul>';
    mainSection.exercises.forEach(ex => {
      if (typeof ex === 'string') {
        html += `<li>${ex}</li>`;
      } else if (ex.sets && ex.reps) {
        html += `<li>${ex.name} ${ex.sets}×${ex.reps}</li>`;
      } else {
        html += `<li>${ex.name}</li>`;
      }
    });
    html += '</ul>';

    html += `
      </div>
      <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
        ${formatLabel(meta.skillLevel)} | ${formatLabel(meta.intensity)} intensity
      </p>
    `;

    return html;
  }

  /**
   * Format label for display
   */
  function formatLabel(value) {
    if (!value) return '';
    return value
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Handle form submission
   */
  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const values = {
      duration: formData.get('duration') || '45',
      warmup: formData.get('warmup') || 'yes',
      intensity: formData.get('intensity') || 'moderate',
      sessionType: formData.get('sessionType') || 'mixed',
      targetArea: formData.get('targetArea') || 'full-body',
      location: formData.get('location') || 'gym',
      skillLevel: formData.get('skillLevel') || 'intermediate',
      includeVideos: formData.get('includeVideos') === 'on',
      generatePdf: formData.get('generatePdf') === 'on',
      chalkboardMode: formData.get('chalkboardMode') === 'on'
    };

    const workout = generateWorkout(values);

    // Render all versions
    coachingOutput.innerHTML = renderCoachingVersion(workout);
    printArea.innerHTML = renderPrintableVersion(workout);
    chalkboardOutput.innerHTML = renderChalkboardVersion(workout);

    // Show output section
    outputSection.classList.remove('hidden');

    // If chalkboard mode is checked, switch to that tab
    if (values.chalkboardMode) {
      switchTab('tab-chalkboard');
    }

    // Scroll to output
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Switch between output tabs
   */
  function switchTab(tabId) {
    tabs.forEach(tab => {
      const isActive = tab.id === tabId;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive.toString());
    });

    panels.forEach(panel => {
      const tabForPanel = document.getElementById(panel.getAttribute('aria-labelledby'));
      panel.classList.toggle('active', tabForPanel && tabForPanel.id === tabId);
    });
  }

  /**
   * Handle tab clicks
   */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.id));
  });

  /**
   * Handle collapsible sections
   */
  collapsibleHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const expanded = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', (!expanded).toString());
      const contentId = header.getAttribute('aria-controls');
      const content = document.getElementById(contentId);
      if (content) {
        content.classList.toggle('is-open', !expanded);
      }
    });
  });

  /**
   * Print functionality
   */
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  /**
   * PDF download functionality
   */
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      const element = document.getElementById('print-area');
      const today = new Date().toISOString().split('T')[0];
      
      const opt = {
        margin: [15, 15, 15, 15], // UK A4 margins in mm
        filename: `workout-${today}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Check if html2pdf is available
      if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(element).save();
      } else {
        // Fallback to print
        alert('PDF generation is loading. Please try again in a moment, or use the Print button.');
      }
    });
  }

  /**
   * Form reset handler
   */
  form.addEventListener('reset', () => {
    setTimeout(() => {
      outputSection.classList.add('hidden');
      coachingOutput.innerHTML = '<div class="empty-output">Generate a workout to see the full coaching version here.</div>';
      printArea.innerHTML = '<div class="empty-output">Generate a workout to see the printable version here.</div>';
      chalkboardOutput.innerHTML = '<div class="empty-output" style="color: #888;">Generate a workout to see the chalkboard WOD here.</div>';
      switchTab('tab-coaching');
    }, 0);
  });

  // Attach form submit handler
  form.addEventListener('submit', handleSubmit);

})();
