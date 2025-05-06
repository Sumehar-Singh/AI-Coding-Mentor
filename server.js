require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const LanguageDetect = require('languagedetect');
const fs = require('fs');

const app = express();
const PORT = 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in .env");
  process.exit(1);
}

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const lngDetector = new LanguageDetect();

// 🏠 Home Page
app.get('/', (req, res) => {
  res.render('home');
});

// 🚀 Launch App Page — this is the fix
app.get('/app', (req, res) => {
  res.render('index', {
    code: '',
    suggestions: null,
    language: null,
    mode: 'improve',
    error: null
  });
});

// 🔁 Form Submission
app.post('/', async (req, res) => {
  const userCode = req.body.code.trim();
  const mode = req.body.mode || 'improve';

  if (!userCode) {
    return res.render('index', {
      code: '',
      suggestions: null,
      language: null,
      mode,
      error: '⚠️ Please enter some code to analyze.'
    });
  }

  const detectedLang = detectLanguage(userCode);

  try {
    const aiResponse = await getAIResponse(userCode, mode);
    res.render('index', {
      code: userCode,
      suggestions: aiResponse,
      language: detectedLang,
      mode,
      error: null
    });
  } catch (error) {
    res.render('index', {
      code: userCode,
      suggestions: null,
      language: detectedLang,
      mode,
      error: `❌ Error: ${error.message}`
    });
  }
});

function detectLanguage(code) {
  const detection = lngDetector.detect(code, 1);
  return detection.length > 0 ? detection[0][0] : 'Unknown';
}

async function getAIResponse(code, mode) {
  let prompt = '';
  switch (mode) {
    case 'explain':
      prompt = `Explain the following code:\n\n${code}`;
      break;
    case 'comment':
      prompt = `Add inline comments to the following code:\n\n${code}`;
      break;
    default:
      prompt = `Analyze and improve the following code:\n\n${code}`;
  }

  const response = await axios.post(API_URL, {
    contents: [{ parts: [{ text: prompt }] }]
  }, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.data?.candidates?.length > 0) {
    return response.data.candidates[0].content.parts[0].text.trim();
  } else {
    throw new Error('No suggestions received from Gemini API.');
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
