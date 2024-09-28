let toggleKey = 't';  // Default key is 't' for showing the definition
let keyPressed = false;  // Track if the toggle key is currently held down
let popupVisible = false;  // Track if a popup is currently open
let currentWord = '';  // Track the current word being displayed
let wordCache = {};  // Cache for storing word definitions
let mouseMoveTimeout;  // Timeout for debouncing mouse movements

// Fetch the toggle key from chrome storage
chrome.storage.sync.get(['toggleKey'], (result) => {
  if (result.toggleKey) {
    toggleKey = result.toggleKey;
  }
});

// Listen for keydown event to track when the toggle key is held down
document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === toggleKey.toLowerCase() && !keyPressed) {
    keyPressed = true;  // Mark the toggle key as being pressed

    // If no popup is currently visible, allow a new one to be created
    if (!popupVisible) {
      const word = getWordUnderMouse(event);
      if (word) {
        currentWord = word;  // Store the word being hovered over
        fetchWordDefinition(event, currentWord);  // Fetch and show the definition
      }
    }
  }
});

// Listen for keyup event to hide the popup when the toggle key is released
document.addEventListener('keyup', (event) => {
  if (event.key.toLowerCase() === toggleKey.toLowerCase()) {
    keyPressed = false;  // Toggle key released
    hidePopup();  // Hide the popup
  }
});

// Debounce mouse movement to reduce API requests
document.addEventListener('mousemove', (event) => {
  if (!keyPressed || popupVisible) {
    return;  // Do nothing if the toggle key is not pressed or popup is already visible
  }

  // Debounce the mousemove event to avoid excessive API calls
  clearTimeout(mouseMoveTimeout);
  mouseMoveTimeout = setTimeout(() => {
    const word = getWordUnderMouse(event);
    if (word && word !== currentWord) {
      currentWord = word;  // Update the word being hovered over
      fetchWordDefinition(event, currentWord);  // Fetch and show the definition
    }
  }, 300);  // Wait for 300ms before making the API call
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

// Fetch the word's definition from the Free Dictionary API
function fetchWordDefinition(event, word) {
  // Check if the definition is already cached
  if (wordCache[word]) {
    showPopup(event, word, wordCache[word]);
    return;
  }

  // Show loading state while fetching
  showPopup(event, word, 'Loading...');

  const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data && data[0] && data[0].meanings) {
        const definitions = data[0].meanings[0].definitions;
        const definition = definitions[0].definition || 'Definition not found';

        // Cache the word definition
        wordCache[word] = definition;

        // Show the definition in the popup
        showPopup(event, word, definition);
      } else {
        showPopup(event, word, 'Definition not found');
      }
    })
    .catch(error => {
      console.error('Error fetching definition:', error);
      showPopup(event, word, 'Definition not found');
    });
}

// Show the popup with the word's definition and keep it in the same position
function showPopup(event, word, definition) {
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

  // Set the definition in the popup
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
    popupVisible = false;  // Mark that no popup is visible blah
  }
}
