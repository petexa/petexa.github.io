// One Rep Max Calculator
// Calculate estimated 1RM using multiple formulas and get training percentages

// Set reps value
function setReps(val) {
  document.getElementById('orm-reps').value = val;
}

// Calculate 1RM
function calculateORM() {
  const weight = parseFloat(document.getElementById('orm-weight').value);
  const reps = parseInt(document.getElementById('orm-reps').value);
  const formula = document.getElementById('orm-formula').value;
  const resultDiv = document.getElementById('orm-result');

  if (isNaN(weight) || isNaN(reps) || weight <= 0 || reps <= 0) {
    resultDiv.innerHTML = '<div class="alert alert-danger">Please enter valid weight and rep values.</div>';
    resultDiv.classList.remove('hidden');
    return;
  }

  // Calculate using all formulas
  const epley = weight * (1 + reps / 30);
  const brzycki = reps < 37 ? weight * (36 / (37 - reps)) : 0;
  const lombardi = weight * Math.pow(reps, 0.10);
  const oconner = weight * (1 + 0.025 * reps);

  let oneRM = 0;
  let resultsHTML = '';

  if (formula === 'all') {
    oneRM = (epley + brzycki + lombardi + oconner) / 4;
    resultsHTML = '<div class="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">';
    resultsHTML += '<div class="p-4 bg-primary-50 rounded-lg text-center"><p class="text-sm text-gray-600">Epley</p><p class="text-xl font-bold text-primary-600">' + epley.toFixed(1) + ' kg</p></div>';
    resultsHTML += '<div class="p-4 bg-secondary-50 rounded-lg text-center"><p class="text-sm text-gray-600">Brzycki</p><p class="text-xl font-bold text-secondary-600">' + brzycki.toFixed(1) + ' kg</p></div>';
    resultsHTML += '<div class="p-4 bg-success-50 rounded-lg text-center"><p class="text-sm text-gray-600">Lombardi</p><p class="text-xl font-bold text-success-600">' + lombardi.toFixed(1) + ' kg</p></div>';
    resultsHTML += '<div class="p-4 bg-danger-50 rounded-lg text-center"><p class="text-sm text-gray-600">O\'Conner</p><p class="text-xl font-bold text-danger-600">' + oconner.toFixed(1) + ' kg</p></div>';
    resultsHTML += '</div>';
    resultsHTML += '<div class="p-4 bg-gray-900 rounded-lg text-center mb-6"><p class="text-sm text-gray-300">Average Estimated 1RM</p><p class="text-3xl font-bold text-white">' + oneRM.toFixed(1) + ' kg</p></div>';
  } else {
    switch (formula) {
      case 'epley': oneRM = epley; break;
      case 'brzycki': oneRM = brzycki; break;
      case 'lombardi': oneRM = lombardi; break;
      case 'oconner': oneRM = oconner; break;
    }
    const formulaNames = { epley: 'Epley', brzycki: 'Brzycki', lombardi: 'Lombardi', oconner: "O'Conner" };
    resultsHTML = '<div class="p-4 bg-primary-50 rounded-lg text-center mb-6"><p class="text-sm text-gray-600">' + formulaNames[formula] + ' Estimated 1RM</p><p class="text-3xl font-bold text-primary-600">' + oneRM.toFixed(1) + ' kg</p></div>';
  }

  // Training percentages
  if (oneRM > 0) {
    resultsHTML += '<h3 class="font-semibold mb-4" style="color: var(--text);">Training Percentages</h3>';
    resultsHTML += '<div class="overflow-x-auto"><table class="w-full text-sm">';
    resultsHTML += '<thead><tr class="border-b"><th class="py-2 text-left">%</th><th class="py-2 text-left">Weight</th><th class="py-2 text-left">Use For</th></tr></thead>';
    resultsHTML += '<tbody>';
    
    const percentages = [
      { pct: 100, use: 'Max single' },
      { pct: 95, use: 'Heavy singles' },
      { pct: 90, use: '1-3 reps' },
      { pct: 85, use: '3-5 reps' },
      { pct: 80, use: '5-6 reps' },
      { pct: 75, use: '6-8 reps' },
      { pct: 70, use: '8-10 reps' },
      { pct: 65, use: '10-12 reps' },
      { pct: 60, use: 'Warm-up / Light' }
    ];

    percentages.forEach(function(p) {
      const calcWeight = (oneRM * p.pct / 100).toFixed(1);
      resultsHTML += '<tr class="border-b"><td class="py-2 font-medium">' + p.pct + '%</td><td class="py-2 text-primary-600 font-semibold">' + calcWeight + ' kg</td><td class="py-2 text-gray-500">' + p.use + '</td></tr>';
    });

    resultsHTML += '</tbody></table></div>';
  }

  resultDiv.innerHTML = resultsHTML;
  resultDiv.classList.remove('hidden');
}

// Set year on page load
document.addEventListener('DOMContentLoaded', function() {
  const currentYear = new Date().getFullYear();
  const footerYear = document.getElementById('footer-year');
  const sidebarYear = document.getElementById('sidebar-year');
  if (footerYear) footerYear.textContent = currentYear;
  if (sidebarYear) sidebarYear.textContent = currentYear;
});
