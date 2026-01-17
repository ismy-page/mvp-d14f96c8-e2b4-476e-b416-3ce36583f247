(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const btn = document.getElementById("ctaButton");
  const out = document.getElementById("ctaResult");
  if (btn && out) {
    btn.addEventListener("click", () => {
      out.textContent = "Lovely choice. Now tailor the words and colors to your story.";
    });
  }
})();
