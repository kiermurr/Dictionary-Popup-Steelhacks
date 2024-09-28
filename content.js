// content.js

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
    highlightWord(event.target);
    showPopup(event, word);
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

// Highlight the hovered word
function highlightWord(targetElement) {
  if (targetElement && targetElement.nodeType === Node.TEXT_NODE) {
    const parent = targetElement.parentElement;
    parent.style.backgroundColor = 'yellow';  // Highlight color
    setTimeout(() => {
      parent.style.backgroundColor = '';  // Remove highlight after a short time
    }, 2000);
  }
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

