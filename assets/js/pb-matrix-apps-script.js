/**
 * Google Apps Script - Personal Bests (PB) Matrix Web App
 * 
 * This script reads workout data from a Google Sheet named "workout-log" and generates
 * a Personal Bests matrix showing the maximum weight lifted for each (Name, Exercise) combination.
 * 
 * Sheet Structure (workout-log):
 * Columns: Date, Exercise, Sets, Reps, Weight, Unit, Notes, PR, Name
 * 
 * Deploy: Web App → Execute as Me → Access: Anyone
 * URL ends with /exec
 * 
 * Usage:
 * - GET request: Returns HTML table
 * - GET request with ?format=json: Returns JSON data
 */

/**
 * Converts weight to kilograms based on the unit provided.
 * @param {number} weight - The weight value to convert.
 * @param {string} unit - The unit of the weight ('kg', 'lbs', 'lb', or empty).
 * @returns {number} - The weight in kilograms.
 */
function normalizeToKg(weight, unit) {
  if (typeof weight !== 'number' || isNaN(weight)) {
    return 0;
  }
  
  const unitLower = (unit || '').toLowerCase().trim();
  
  // Convert lbs to kg (1 lb = 0.453592 kg)
  if (unitLower === 'lbs' || unitLower === 'lb') {
    return weight * 0.453592;
  }
  
  // Default to kg
  return weight;
}

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * @param {string} str - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) {
    return '';
  }
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Reads the Logs sheet and computes Personal Bests for each (Name, Exercise) combination.
 * @returns {Object} - An object containing names, exercises, and rows data.
 */
function getPBMatrix_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('workout-log');
  
  if (!sheet) {
    return { names: [], exercises: [], rows: [] };
  }
  
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return { names: [], exercises: [], rows: [] };
  }
  
  // Get headers (first row)
  const headers = data[0].map(h => String(h).toLowerCase().trim());
  
  // Find column indices
  const nameIdx = headers.indexOf('name');
  const exerciseIdx = headers.indexOf('exercise');
  const weightIdx = headers.indexOf('weight');
  const unitIdx = headers.indexOf('unit');
  
  if (nameIdx === -1 || exerciseIdx === -1 || weightIdx === -1) {
    return { names: [], exercises: [], rows: [] };
  }
  
  // Build a map of (name, exercise) -> max weight in kg
  const pbMap = {};
  const namesSet = new Set();
  const exercisesSet = new Set();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const name = String(row[nameIdx] || '').trim();
    const exercise = String(row[exerciseIdx] || '').trim();
    const weight = parseFloat(row[weightIdx]);
    const unit = unitIdx !== -1 ? String(row[unitIdx] || '') : 'kg';
    
    if (!name || !exercise || isNaN(weight)) {
      continue;
    }
    
    const weightKg = normalizeToKg(weight, unit);
    
    namesSet.add(name);
    exercisesSet.add(exercise);
    
    const key = `${name}|||${exercise}`;
    
    if (!pbMap[key] || weightKg > pbMap[key]) {
      pbMap[key] = weightKg;
    }
  }
  
  // Convert sets to sorted arrays
  const names = Array.from(namesSet).sort((a, b) => a.localeCompare(b));
  const exercises = Array.from(exercisesSet).sort((a, b) => a.localeCompare(b));
  
  // Build rows array: each row is [name, pb1, pb2, ...]
  const rows = names.map(name => {
    const rowData = [name];
    exercises.forEach(exercise => {
      const key = `${name}|||${exercise}`;
      const pb = pbMap[key];
      rowData.push(pb !== undefined ? Math.round(pb * 10) / 10 : null);
    });
    return rowData;
  });
  
  return { names, exercises, rows };
}

/**
 * Handles GET requests to the Web App.
 * @param {Object} e - The event parameter containing request information.
 * @returns {HtmlOutput|TextOutput} - HTML page or JSON data based on the format parameter.
 */
function doGet(e) {
  const format = (e && e.parameter && e.parameter.format) || '';
  const { names, exercises, rows } = getPBMatrix_();
  
  if (format.toLowerCase() === 'json') {
    // Return JSON response
    const jsonData = {
      names: names,
      exercises: exercises,
      rows: rows
    };
    return ContentService
      .createTextOutput(JSON.stringify(jsonData))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Return HTML table
  const html = buildHtmlTable(names, exercises, rows);
  return HtmlService
    .createHtmlOutput(html)
    .setTitle('Personal Bests Matrix - Iron & Ale')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Builds the HTML table for displaying Personal Bests.
 * @param {Array} names - Array of member names.
 * @param {Array} exercises - Array of exercise names.
 * @param {Array} rows - 2D array of PB data.
 * @returns {string} - Complete HTML document string.
 */
function buildHtmlTable(names, exercises, rows) {
  const style = `
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        background: #1a1a2e;
        color: #fff;
        padding: 16px;
        min-height: 100vh;
      }
      
      h1 {
        text-align: center;
        color: #19baff;
        font-size: 1.5rem;
        margin-bottom: 16px;
        text-shadow: 0 0 10px rgba(25, 186, 255, 0.5);
      }
      
      .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 400px;
        background: #222;
      }
      
      th, td {
        padding: 10px 12px;
        text-align: center;
        border: 1px solid #333;
        white-space: nowrap;
      }
      
      th {
        background: linear-gradient(135deg, #19baff 0%, #0d7ba8 100%);
        color: #fff;
        font-weight: 600;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      
      th:first-child {
        position: sticky;
        left: 0;
        z-index: 20;
        background: linear-gradient(135deg, #ffb84d 0%, #cc8a00 100%);
      }
      
      td:first-child {
        position: sticky;
        left: 0;
        background: #2a2a4a;
        font-weight: 600;
        color: #ffb84d;
        z-index: 5;
      }
      
      tr:nth-child(even) td {
        background: #2a2a3a;
      }
      
      tr:nth-child(even) td:first-child {
        background: #2a2a4a;
      }
      
      tr:hover td {
        background: #3a3a5a;
      }
      
      tr:hover td:first-child {
        background: #3a3a6a;
      }
      
      td.pb-value {
        color: #39ff14;
        font-weight: 500;
      }
      
      td.no-pb {
        color: #666;
      }
      
      .empty-message {
        text-align: center;
        padding: 40px;
        color: #888;
        font-style: italic;
      }
      
      .unit-note {
        text-align: center;
        color: #888;
        font-size: 0.85rem;
        margin-top: 12px;
      }
      
      @media (max-width: 600px) {
        body {
          padding: 8px;
        }
        
        h1 {
          font-size: 1.2rem;
        }
        
        th, td {
          padding: 8px 10px;
          font-size: 0.9rem;
        }
      }
    </style>
  `;
  
  let tableContent = '';
  
  if (exercises.length === 0 || rows.length === 0) {
    tableContent = '<div class="empty-message">No workout data found. Start logging your workouts!</div>';
  } else {
    // Build header row
    let headerRow = '<tr><th>Name</th>';
    exercises.forEach(ex => {
      headerRow += `<th>${escapeHtml(ex)}</th>`;
    });
    headerRow += '</tr>';
    
    // Build data rows
    let dataRows = '';
    rows.forEach(row => {
      dataRows += '<tr>';
      row.forEach((cell, idx) => {
        if (idx === 0) {
          // Name column
          dataRows += `<td>${escapeHtml(cell)}</td>`;
        } else {
          // PB value column
          if (cell !== null && cell !== undefined) {
            dataRows += `<td class="pb-value">${escapeHtml(cell)} kg</td>`;
          } else {
            dataRows += '<td class="no-pb">—</td>';
          }
        }
      });
      dataRows += '</tr>';
    });
    
    tableContent = `
      <div class="table-container">
        <table>
          <thead>${headerRow}</thead>
          <tbody>${dataRows}</tbody>
        </table>
      </div>
      <p class="unit-note">All weights normalized to kilograms (kg)</p>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Personal Bests Matrix - Iron &amp; Ale</title>
      ${style}
    </head>
    <body>
      <h1>🏆 Personal Bests Matrix</h1>
      ${tableContent}
    </body>
    </html>
  `;
}
