const generateBtn = document.getElementById("generateBtn");
const ttsText = document.getElementById("ttsText");
const audio = document.getElementById("audio");
const downloadBtn = document.getElementById("downloadBtn");

generateBtn.addEventListener("click", () => {
  const text = ttsText.value.trim();
  if (!text) return alert("Please enter some text!");

  // VoiceRSS API key
  const apiKey = "1010ac1c09c14b088b3202b9d21c37f4";

  // Build API URL
  const url = `https://api.voicerss.org/?key=${apiKey}&hl=en-us&src=${encodeURIComponent(text)}&c=MP3&f=44khz_16bit_stereo`;

  // Set audio source
  audio.src = url;
  audio.play();

  // Set download link
  downloadBtn.href = url;
});