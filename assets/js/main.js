// Mobile menu toggle
// Plate Calculator Logic (KG only)
// Collapsible Utility Sections
function toggleUtilitySection(id) {
  // Collapse all sections and set aria-expanded to false
  document.querySelectorAll('.utility-collapsible-content').forEach(function(section) {
    section.style.display = 'none';
  });
  document.querySelectorAll('.utility-collapsible-header').forEach(function(header) {
    header.setAttribute('aria-expanded', 'false');
  });
  // Expand the selected section and set aria-expanded to true
  var content = document.getElementById(id + '-content');
  var header = document.querySelector('.utility-collapsible-header[onclick*="' + id + '"]');
  if (content && header) {
    content.style.display = 'block';
    header.setAttribute('aria-expanded', 'true');
  }
}
// Plate Calculator Flip Mode & Quick Plate Buttons
let plateCalcMode = 'plates';
function setPlateCalcMode(mode) {
  plateCalcMode = mode;
  document.getElementById('mode-plates').setAttribute('aria-pressed', mode === 'plates');
  document.getElementById('mode-weight').setAttribute('aria-pressed', mode === 'weight');
  document.getElementById('plates-mode-fields').style.display = mode === 'plates' ? '' : 'none';
  document.getElementById('weight-mode-fields').style.display = mode === 'weight' ? '' : 'none';
  document.getElementById('plate-result').innerHTML = '';
}

function addPlate(kg) {
  const input = document.getElementById('side-plates');
  let val = input.value.trim();
  if (val) {
    val += ',';
  }
  input.value = val + kg;
  input.focus();
}

function calculateWeight() {
  const barWeight = parseFloat(document.getElementById('bar-weight').value) || 20;
  const sidePlates = document.getElementById('side-plates').value.split(',').map(p => parseFloat(p)).filter(p => !isNaN(p));
  const totalPlates = sidePlates.reduce((sum, kg) => sum + kg, 0) * 2;
  const totalWeight = barWeight + totalPlates;
  const plateResult = document.getElementById('plate-result');
  plateResult.innerHTML = `<strong>Total Weight:</strong> ${totalWeight} kg<br><span style='font-size:0.95em;color:#19baff;'>Bar: ${barWeight} kg, Plates: ${sidePlates.length ? sidePlates.join(', ') : 'None'} kg per side</span>`;
}
function calculatePlates() {
  const barWeight = parseFloat(document.getElementById('bar-weight').value) || 20;
  const targetWeight = parseFloat(document.getElementById('target-weight').value) || 60;
  const plateResult = document.getElementById('plate-result');
  if (targetWeight < barWeight) {
    plateResult.textContent = 'Target weight must be greater than bar weight.';
    return;
  }
  const plateSizes = [25, 20, 15, 10, 5, 2.5, 1.25];
  let perSide = (targetWeight - barWeight) / 2;
  let breakdown = [];
  plateSizes.forEach(size => {
    let count = Math.floor(perSide / size);
    if (count > 0) {
      breakdown.push(`${count} x ${size}kg`);
      perSide -= count * size;
    }
  });
  if (perSide > 0.01) {
    breakdown.push(`Small plates or collars: ${perSide.toFixed(2)}kg per side`);
  }
  plateResult.innerHTML =
    `<strong>Each Side:</strong><br>${breakdown.length ? breakdown.join('<br>') : 'No plates needed.'}`;
}
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.neon-nav ul');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function(event) {
      event.stopPropagation();
      const isExpanded = navMenu.classList.contains('show');
      navMenu.classList.toggle('show');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', !isExpanded);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.neon-nav') && !event.target.closest('.menu-toggle')) {
        navMenu.classList.remove('show');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Close menu when pressing Escape
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    });
  }
});
