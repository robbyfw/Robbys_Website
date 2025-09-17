const organs = {
  brain: "The brain controls thoughts, memory, emotions, touch, motor skills, vision, breathing, and every process in the body.",
  "lung-left": "The left lung helps in the exchange of oxygen and carbon dioxide when you breathe.",
  "lung-right": "The right lung does the same job, slightly larger than the left lung.",
  heart: "The heart pumps blood throughout the body, supplying oxygen and nutrients.",
  liver: "The liver filters blood, detoxifies chemicals, and metabolizes drugs.",
  stomach: "The stomach digests food by mixing it with gastric juices.",
  "kidney-left": "The kidneys filter blood and remove waste, balancing fluids.",
  "kidney-right": "The kidneys filter blood and remove waste, balancing fluids.",
  intestines: "The intestines absorb nutrients and water from digested food.",
  bladder: "The bladder stores urine before it leaves the body."
};

const infoBox = document.getElementById("info-box");
const organName = document.getElementById("organ-name");
const organDesc = document.getElementById("organ-desc");

document.querySelectorAll(".organ").forEach(org => {
  org.addEventListener("click", () => {
    const id = org.id;
    organName.textContent = id.replace(/-/g, " ").toUpperCase();
    organDesc.textContent = organs[id] || "No description.";
    infoBox.classList.remove("hidden");
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("organ")) {
    infoBox.classList.add("hidden");
  }
});
