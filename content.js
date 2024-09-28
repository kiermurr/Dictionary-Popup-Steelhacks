let wordDefinitions = {};
let toggleKey = 't';  // Default key is 't' for showing the definition
let keyPressed = false;  // Track if the toggle key is currently held down
let popupVisible = false;  // Track if a popup is currently open
let currentWord = '';  // Track the current word being displayed

// Fetch the word definitions from the JSON file
fetch(chrome.runtime.getURL('words-dictionary.json'))
  .then(response => response.json())
  .then(data => {
    wordDefinitions = data;
  });

// Fetch the toggle key from chrome storage
chrome.storage.sync.get(['toggleKey'], (result) => {
  if (result.toggleKey) {
    toggleKey = result.toggleKey;
  }
});

// Listen for keydown event to track when the toggle key is held down
document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === toggleKey.toLowerCase() && !keyPressed) {
    keyPressed = true;  // Mark the toggle key as being pressed

    // If no popup is currently visible, allow a new one to be created
    if (!popupVisible) {
      const word = getWordUnderMouse(event);
      if (word) {
        currentWord = word;  // Store the word being hovered over
        showPopup(event, currentWord);  // Show the popup
      }
    }
  }
});

// Listen for keyup event to hide the popup when the toggle key is released
document.addEventListener('keyup', (event) => {
  if (event.key.toLowerCase() === toggleKey.toLowerCase()) {
    keyPressed = false;  // Toggle key released
    hidePopup();  // Hide the popup
  }
});

// Listen for mouse movement, but only allow word detection if the popup is not already visible
document.addEventListener('mousemove', (event) => {
  if (!keyPressed || popupVisible) {
    return;  // Do nothing if the toggle key is not pressed or popup is already visible
  }

  const word = getWordUnderMouse(event);
  if (word && word !== currentWord) {
    currentWord = word;  // Update the word being hovered over
    if (!popupVisible) {
      showPopup(event, currentWord);  // Only open if no popup is visible
    }
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

// Show the popup with the word's definition and keep it in the same position
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

  // Position the popup near the mouse cursor (only initially)
  popup.style.top = `${event.pageY + 10}px`;
  popup.style.left = `${event.pageX + 10}px`;

  // Set the definition in the popup, or show 'Definition not found'
  const definition = wordDefinitions[word.toLowerCase()] || 'Definition not found';
  popup.innerHTML = `<strong>${word}:</strong> ${definition}`;
  popup.style.display = 'block';

  // Mark that a popup is now visible
  popupVisible = true;
}

// Hide the popup when the toggle key is released
function hidePopup() {
  const popup = document.querySelector('#word-popup');
  if (popup) {
    popup.style.display = 'none';
    popupVisible = false;  // Mark that no popup is visible
  }
}
