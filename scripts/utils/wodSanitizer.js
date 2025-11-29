// normalizeWorkouts.js
// Cleans and normalizes the workouts_table.json file

const fs = require('fs');
const path = require('path');

// Path to your JSON file
const filePath = path.join(__dirname, 'data', 'workouts_table.json');

function lbsToKg(lbs) {
  return Math.round((lbs / 2.20462) * 2) / 2; // nearest 0.5
}

function convertWeights(text) {
  return text.replace(/(\d+)\s?lbs/gi, (match, p1) => {
    const kg = lbsToKg(parseInt(p1, 10));
    return `${kg} kgs`;
  });
}

try {
  const raw = fs.readFileSync(filePath, 'utf8');
  let data = JSON.parse(raw);

  // Skip if already cleaned
  if (data.lastCleaned) {
    console.log(`Skipping file, already cleaned on ${data.lastCleaned}`);
    process.exit(0);
  }

  // Delete Environment
  delete data.Environment;

  // Normalize Instructions
  if (data.Instructions_Clean) {
    data.Instructions_Clean = data.Instructions_Clean.toLowerCase();
  }

  // Parse JSON fields
  if (typeof data.Scaling_Tiers === 'string') {
    try { data.Scaling_Tiers = JSON.parse(data.Scaling_Tiers); } catch {}
  }
  if (typeof data.Estimated_Times === 'string') {
    try { data.Estimated_Times = JSON.parse(data.Estimated_Times); } catch {}
  }

  // Convert lbs → kgs
  if (data.Instructions) data.Instructions = convertWeights(data.Instructions);
  if (data.Instructions_Clean) data.Instructions_Clean = convertWeights(data.Instructions_Clean);

  // Standardize timings
  if (data.FormatDuration && data.FormatDuration.toLowerCase().includes('amrap')) {
    const minutes = parseInt(data.FormatDuration.replace(/\D/g,''), 10);
    if (!isNaN(minutes)) {
      if (data.Estimated_Times) data.Estimated_Times.Minutes = minutes;
      data.Estimated_Times_Human = `${minutes}m 0s`;
    }
  }

  // Add lastCleaned
  data.lastCleaned = new Date().toISOString();

  // Save back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ Cleaned workouts_table.json successfully`);

} catch (err) {
  console.error(`❌ Error processing file: ${err.message}`);
}
