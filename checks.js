const apiKey = "AQ.Ab8RN6IZQnuOflOpDKUJI0AwpjKq9DGO_BLFhHHjap5Ak_z8LQ"; // Apni actual API key yahan paste karein

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.error("❌ API Key Error:", data.error.message);
    } else {
      console.log("✅ Aapki API Key in models ko support karti hai:");
      const modelNames = data.models.map(m => m.name.replace("models/", ""));
      console.log(modelNames.join("\n"));
    }
  })
  .catch(err => console.error("Fetch Error:", err.message));