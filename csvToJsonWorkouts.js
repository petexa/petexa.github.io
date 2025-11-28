// csvToJsonWorkouts.js
// Converts data/workouts_table.csv → data/workouts_table.json
// Adds cleaning, enrichment, error logging, and placeholder mode

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Input/output paths
const inputFile = path.join(__dirname, 'data', 'workouts_table.csv');
const outputFile = path.join(__dirname, 'data', 'workouts_table.json');
const logFile = path.join(__dirname, 'data', 'conversionReport.log');

// Helpers
function lbsToKg(lbs) {
  return Math.round((lbs / 2.20462) * 2) / 2; // nearest 0.5
}

function convertWeights(text) {
  if (!text) return text;
  return text.replace(/(\d+)\s?lbs/gi, (match, p1) => {
    const kg = lbsToKg(parseInt(p1, 10));
    return `${kg} kgs`;
  });
}

// Storage
const workouts = [];
const errors = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    try {
      const workout = {
        id: row.id,
        Name: row.Name,
        Category: row.Category,
        Level: row.Level,
        DifficultyTier: row.DifficultyTier,
        FormatDuration: row.FormatDuration,
        TrainingGoals: row.TrainingGoals,
        Description: row.Description,
        Flavor_Text: row.Flavor_Text,
        Instructions: convertWeights(row.Instructions),
        Instructions_Clean: convertWeights(row.Instructions_Clean?.toLowerCase()),
        EquipmentNeeded: row.EquipmentNeeded,
        MovementTypes: row.MovementTypes,
        Stimulus: row.Stimulus,
        TargetStimulus: row.TargetStimulus,
        Scaling_Tiers: row.Scaling_Tiers ? JSON.parse(row.Scaling_Tiers) : {},
        ScalingOptions: row.ScalingOptions,
        ScoreType: row.ScoreType,
        Warmup: row.Warmup,
        Coaching_Cues: row.Coaching_Cues,
        CoachNotes: row.CoachNotes,
        Estimated_Times: row.Estimated_Times ? JSON.parse(row.Estimated_Times) : {},
        Estimated_Times_Human: row.Estimated_Times_Human,
        lastCleaned: new Date().toISOString(),
        source: "CSV master"
      };

      // Standardize timings for AMRAP formats
      if (workout.FormatDuration && workout.FormatDuration.toLowerCase().includes('amrap')) {
        const minutes = parseInt(workout.FormatDuration.replace(/\D/g,''), 10);
        if (!isNaN(minutes)) {
          workout.Estimated_Times.Minutes = minutes;
          workout.Estimated_Times_Human = `${minutes}m 0s`;
        }
      }

      workouts.push(workout);
    } catch (err) {
      // Add placeholder instead of dropping row
      const placeholder = {
        id: row.id || null,
        error: `Conversion failed: ${err.message}`,
        raw: row,
        lastCleaned: new Date().toISOString(),
        source: "CSV master"
      };
      workouts.push(placeholder);
      errors.push({ row, error: err.message });
    }
  })
  .on('end', () => {
    // Save JSON
    fs.writeFileSync(outputFile, JSON.stringify(workouts, null, 2));

    // Build status report
    const report = [
      '=== Conversion Report ===',
      `Converted: ${workouts.length - errors.length}`,
      `Placeholders: ${errors.length}`,
      `Total: ${workouts.length}`,
      `Run: ${new Date().toISOString()}`,
      '',
      'Error details:',
      ...errors.map((e, i) => `Row ${i+1}: ${e.error} | Raw data: ${JSON.stringify(e.row)}`)
    ].join('\n');

    // Save log file
    fs.writeFileSync(logFile, report);

    // Print to console
    console.log(report);
  });
