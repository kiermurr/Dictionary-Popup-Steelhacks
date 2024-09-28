// content.js

let isCtrlPressed = false;

// Listen for keydown and keyup events to detect when 'Ctrl' is pressed
document.addEventListener('keydown', (event) => {
  if (event.key === 'Control') {
    isCtrlPressed = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Control') {
    isCtrlPressed = false;
  }
});

// Fetch the word definitions from the JSON file
let wordDefinitions = {};
fetch(chrome.runtime.getURL('words-dictionary.json'))
  .then(response => response.json())
  .then(data => {
    wordDefinitions = data;
  });

// Add a mouseover event listener to the whole document
document.addEventListener('mouseover', (event) => {
  const word = getWordUnderMouse(event);
  if (word) {
    // Show popup if Ctrl key is pressed
    if (isCtrlPressed) {
      showPopup(event, word);
    }
  }
});

// Get the word under the mouse cursor
function getWordUnderMouse(event) {
  const selection = window.getSelection();
  const range = document.caretRangeFromPoint(event.clientX, event.clientY);
  if (range) {
    selection.removeAllRanges();
    selection.addRange(range);
    const word = selection.toString().trim();
    selection.removeAllRanges();  // Clear the selection
    return word;
  }
  return null;
}

// Show the popup with the word's definition
function showPopup(event, word) {
  let popup = document.querySelector('#word-popup');
  
  // If there's no popup element, create one
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'word-popup';
    popup.style.position = 'absolute';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid black';
    popup.style.padding = '10px';
    popup.style.width = '200px';
    popup.style.zIndex = '1000';
    document.body.appendChild(popup);
  }

  // Position the popup near the word
  popup.style.top = `${event.pageY + 10}px`;
  popup.style.left = `${event.pageX + 10}px`;

  // Set the definition in the popup, or show 'Definition not found' if it's missing
  const definition = wordDefinitions[word.toLowerCase()] || 'Definition not found';
  popup.innerHTML = `<strong>${word}:</strong> ${definition}`;
  popup.style.display = 'block';
}

// Hide the popup when the mouse leaves the word
document.addEventListener('mouseout', () => {
  const popup = document.querySelector('#word-popup');
  if (popup) {
    popup.style.display = 'none';
  }
});
