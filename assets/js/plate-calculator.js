// Plate Calculator
// Calculate plates needed for target weight or total weight from plates

// Mode toggle
let currentMode = 'plates';

function setMode(mode) {
  currentMode = mode;
  const platesPanel = document.getElementById('plates-panel');
  const weightPanel = document.getElementById('weight-panel');
  const modePlatesBtn = document.getElementById('mode-plates');
  const modeWeightBtn = document.getElementById('mode-weight');
  const result = document.getElementById('result');

  if (mode === 'plates') {
    platesPanel.classList.remove('hidden');
    weightPanel.classList.add('hidden');
    modePlatesBtn.classList.remove('btn-secondary');
    modePlatesBtn.classList.add('btn-primary');
    modeWeightBtn.classList.remove('btn-primary');
    modeWeightBtn.classList.add('btn-secondary');
    modePlatesBtn.setAttribute('aria-selected', 'true');
    modeWeightBtn.setAttribute('aria-selected', 'false');
  } else {
    platesPanel.classList.add('hidden');
    weightPanel.classList.remove('hidden');
    modePlatesBtn.classList.remove('btn-primary');
    modePlatesBtn.classList.add('btn-secondary');
    modeWeightBtn.classList.remove('btn-secondary');
    modeWeightBtn.classList.add('btn-primary');
    modePlatesBtn.setAttribute('aria-selected', 'false');
    modeWeightBtn.setAttribute('aria-selected', 'true');
  }
  
  result.classList.add('hidden');
}

// Calculate plates needed for target weight
function calculatePlates() {
  const barWeight = parseFloat(document.getElementById('bar-weight').value) || 20;
  const targetWeight = parseFloat(document.getElementById('target-weight').value) || 60;
  const result = document.getElementById('result');
  const resultContent = document.getElementById('result-content');

  if (targetWeight < barWeight) {
    resultContent.innerHTML = '<p class="text-danger-600">Target weight must be greater than bar weight.</p>';
    result.classList.remove('hidden');
    return;
  }

  const plateSizes = [25, 20, 15, 10, 5, 2.5, 1.25];
  let perSide = (targetWeight - barWeight) / 2;
  const breakdown = [];

  plateSizes.forEach(function(size) {
    const count = Math.floor(perSide / size);
    if (count > 0) {
      breakdown.push('<span class="inline-flex items-center gap-1"><span class="font-bold text-primary-600">' + count + '</span> × ' + size + 'kg</span>');
      perSide -= count * size;
    }
  });

  if (perSide > 0.01) {
    breakdown.push('<span class="text-secondary-600">+ ' + perSide.toFixed(2) + 'kg remaining (small plates)</span>');
  }

  resultContent.innerHTML = 
    '<p class="mb-2"><strong>Total Weight:</strong> ' + targetWeight + ' kg</p>' +
    '<p class="mb-2"><strong>Bar:</strong> ' + barWeight + ' kg</p>' +
    '<p><strong>Each Side:</strong></p>' +
    '<div class="flex flex-wrap gap-2 mt-2">' + (breakdown.length ? breakdown.join('') : '<span>No plates needed</span>') + '</div>';
  
  result.classList.remove('hidden');
}

// Add plate to input
function addPlate(kg) {
  const input = document.getElementById('side-plates');
  let val = input.value.trim();
  if (val) {
    val += ',';
  }
  input.value = val + kg;
  input.focus();
}

// Clear plates input
function clearPlates() {
  document.getElementById('side-plates').value = '';
  document.getElementById('result').classList.add('hidden');
}

// Calculate total weight from plates
function calculateWeight() {
  const barWeight = parseFloat(document.getElementById('bar-weight').value) || 20;
  const sidePlatesInput = document.getElementById('side-plates').value;
  const sidePlates = sidePlatesInput.split(',')
    .map(function(p) { return parseFloat(p.trim()); })
    .filter(function(p) { return !isNaN(p); });
  
  const totalPlates = sidePlates.reduce(function(sum, kg) { return sum + kg; }, 0) * 2;
  const totalWeight = barWeight + totalPlates;
  
  const result = document.getElementById('result');
  const resultContent = document.getElementById('result-content');

  resultContent.innerHTML = 
    '<p class="text-2xl font-bold text-primary-600 mb-2">' + totalWeight + ' kg</p>' +
    '<p class="text-sm text-gray-600">Bar: ' + barWeight + ' kg</p>' +
    '<p class="text-sm text-gray-600">Plates per side: ' + (sidePlates.length ? sidePlates.join(', ') : 'None') + ' kg</p>';
  
  result.classList.remove('hidden');
}

// Set year on page load
document.addEventListener('DOMContentLoaded', function() {
  const currentYear = new Date().getFullYear();
  const footerYear = document.getElementById('footer-year');
  const sidebarYear = document.getElementById('sidebar-year');
  if (footerYear) footerYear.textContent = currentYear;
  if (sidebarYear) sidebarYear.textContent = currentYear;
});
