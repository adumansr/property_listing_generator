let selectedTone =
  "Premium and aspirational — sophisticated, exclusive language that targets high-end buyers";

document.querySelectorAll(".tone-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tone-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTone = btn.dataset.tone;
  });
});

async function generate() {
  const propType = document.getElementById("propType").value;
  const location = document.getElementById("location").value.trim();
  const beds = document.getElementById("beds").value;
  const price = document.getElementById("price").value.trim();
  const features = document.getElementById("features").value.trim();
  const extras = document.getElementById("extras").value.trim();
  const errMsg = document.getElementById("errMsg");
  errMsg.textContent = "";

  if (!location) {
    errMsg.textContent = "Please enter a location.";
    return;
  }
  if (!price) {
    errMsg.textContent = "Please enter a price.";
    return;
  }
  if (!features) {
    errMsg.textContent = "Please add at least a few key features.";
    return;
  }

  const btn = document.getElementById("genBtn");
  btn.disabled = true;
  btn.innerHTML = `
        <div class="dots" style="display:flex;gap:4px;">
          <span></span><span></span><span></span>
        </div>
        Generating...`;

  const resultBox = document.getElementById("resultBox");
  const resultContent = document.getElementById("resultContent");
  resultBox.style.display = "block";
  resultContent.innerHTML = `
        <div class="loading-wrap">
          <div class="dots"><span></span><span></span><span></span></div>
          Writing your listing...
        </div>`;

  const prompt = `You are a professional Nigerian real estate copywriter who writes for top Lagos and Abuja property firms.

Write a compelling property listing with these details:
- Property type: ${propType}
- Bedrooms: ${beds}
- Location: ${location}
- Asking price: ₦${price}
- Key features: ${features}
${extras ? `- Additional info: ${extras}` : ""}
- Tone: ${selectedTone}

Structure your listing as:
1. A strong, specific headline (not generic — make it memorable)
2. An opening paragraph (2-3 sentences that paint a picture)
3. Property highlights (4-6 punchy lines, no bullet symbols, just clean line breaks)
4. A closing call to action (1-2 sentences, direct)

Rules:
- Under 220 words total
- Write for a Nigerian audience who knows Lagos/Abuja real estate
- No markdown, no asterisks, no dashes as bullets — plain text only
- Do not start with "Introducing" or "Welcome to"
- Make the headline and opening feel earned, not templated`;

  try {
    const response = await fetch("/.netlify/functions/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.content?.find((b) => b.type === "text")?.text || "";
    resultContent.textContent = text;
  } catch (err) {
    resultContent.textContent = "";
    resultBox.style.display = "none";
    errMsg.textContent =
      "Something went wrong. Check your connection and try again.";
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Generate listing`;
  }
}

function copyListing() {
  const text = document.getElementById("resultContent").textContent;
  if (!text || text.includes("Writing your listing")) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyBtn");
    btn.classList.add("copied");
    btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Copied`;
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
            </svg>
            Copy`;
    }, 2500);
  });
}

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate();
});
