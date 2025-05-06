// Toggle Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('lightMode', isLight);
  const button = document.querySelector('.toggle-dark-mode');
  button.textContent = isLight ? '🌑' : '🌙'; // Update icon
}

// Load Dark Mode Preference on Page Load
document.addEventListener('DOMContentLoaded', () => {
  const lightModeEnabled = localStorage.getItem('lightMode') === 'true';
  if (lightModeEnabled) {
    document.body.classList.add('light-mode');
    document.querySelector('.toggle-dark-mode').textContent = '🌑';
  } else {
    document.querySelector('.toggle-dark-mode').textContent = '🌙';
  }

  // Apply syntax highlighting if highlight.js is loaded
  if (window.hljs) hljs.highlightAll();
});

// Clear Form
function clearForm() {
  document.getElementById('code').value = '';
  document.querySelector('select[name="mode"]').selectedIndex = 0;
}

// Download Suggestions as TXT
function downloadSuggestions() {
  const suggestions = document.getElementById('ai-suggestions')?.innerText;
  if (!suggestions) return alert("No suggestions to download!");
  const blob = new Blob([suggestions], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ai_suggestions.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Voice Input
function speakCode() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Speech recognition not supported in this browser.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    alert('🎤 Listening... Speak your code!');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('code').value += transcript;
  };

  recognition.onerror = (event) => {
    alert('Voice input error: ' + event.error);
  };

  recognition.start();
}

// Copy AI Suggestions to Clipboard
document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = document.getElementById('ai-suggestions').innerText;
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => (copyBtn.textContent = '📋 Copy'), 2000);
      });
    });
  }
});
