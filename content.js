// content.js

let wordDefinitions = {};

// Fetch the word definitions from the JSON file
fetch(chrome.runtime.getURL('words-dictionary.json'))
  .then(response => response.json())
  .then(data => {
    wordDefinitions = data;
  });

// Listen for mouse movement to detect the word being hovered
document.addEventListener('mousemove', (event) => {
  const word = getWordUnderMouse(event);
  if (word) {
    showPopup(event, word);
  } else {
    hidePopup();
  }
});

// Get the word under the mouse cursor
function getWordUnderMouse(event) {
  const range = document.caretRangeFromPoint(event.clientX, event.clientY);
  if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
    const text = range.startContainer.textContent;
    const offset = range.startOffset;

    // Extract the word by scanning left and right from the cursor
    const left = text.slice(0, offset).match(/\b\w+$/);
    const right = text.slice(offset).match(/^\w+/);
    const word = (left ? left[0] : '') + (right ? right[0] : '');
    return word.trim();
  }
  return null;
}

// Show the popup with the word's definition
function showPopup(event, word) {
  let popup = document.querySelector('#word-popup');
  
  // If popup doesn't exist, create it
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'word-popup';
    popup.style.position = 'absolute';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid black';
    popup.style.padding = '10px';
    popup.style.width = '250px';
    popup.style.zIndex = '1000';
    document.body.appendChild(popup);
  }

  // Position the popup near the mouse cursor
  popup.style.top = `${event.pageY + 10}px`;
  popup.style.left = `${event.pageX + 10}px`;

  // Set the definition in the popup, or show 'Definition not found'
  const definition = wordDefinitions[word.toLowerCase()] || 'Definition not found';
  popup.innerHTML = `<strong>${word}:</strong> ${definition}`;
  popup.style.display = 'block';
}

// Hide the popup when the word is no longer under the mouse
function hidePopup() {
  const popup = document.querySelector('#word-popup');
  if (popup) {
    popup.style.display = 'none';
  }
}


