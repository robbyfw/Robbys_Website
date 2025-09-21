const generateBtn = document.getElementById("generateBtn");
const ttsText = document.getElementById("ttsText");
const audio = document.getElementById("audio");
const downloadBtn = document.getElementById("downloadBtn");

generateBtn.addEventListener("click", () => {
  const text = ttsText.value.trim();
  if (!text) return alert("Please enter some text!");

  // Using Web Speech API
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';

  // Convert speech to audio using a temporary MediaStream
  const synth = window.speechSynthesis;
  synth.speak(utterance);

  // Create downloadable audio (hacky method: using speechSynthesis is limited)
  // For better downloadable audio, external API like voicerss.org can be used.
  alert("Playback started. Download feature requires external API or server-side implementation.");
});