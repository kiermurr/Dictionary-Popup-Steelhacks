// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const toggleKeyInput = document.getElementById('toggleKey');
    const saveButton = document.getElementById('save');
  
    // Load the current settings from storage
    chrome.storage.sync.get(['toggleKey'], (result) => {
      if (result.toggleKey) {
        toggleKeyInput.value = result.toggleKey;
      }
    });
  
    // Save settings when the user clicks the save button
    saveButton.addEventListener('click', () => {
      const selectedKey = toggleKeyInput.value.trim().toLowerCase();
  
      if (selectedKey.length === 1) {
        chrome.storage.sync.set({
          toggleKey: selectedKey
        }, () => {
          alert(`Settings saved. Toggle key: "${selectedKey}"`);
        });
      } else {
        alert('Please enter a valid single character for the toggle key.');
      }
    });
  });
  
  