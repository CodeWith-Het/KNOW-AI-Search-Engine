import { tavily } from "@tavily/core";
import FirecrawlApp from '@mendable/firecrawl-js';
import { nvidiaModel } from "../ai/ai.agent.js"; // 🔥 Directly imported Nvidia for best planning

export const performDeepResearch = async (userMessage, sendEvent) => {
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
  const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

  // ==========================================
  // STEP 1: Cognitive Research Plan (Reasoning)
  // ==========================================
  if (sendEvent) sendEvent({ type: "status", content: "🧠 Analyzing topic & creating research plan..." });
  
  const queryPrompt = `You are an elite autonomous research agent. The user wants to research: "${userMessage}".
Think step-by-step about what specific information, data points, or diverse angles are needed to provide a comprehensive answer.
Generate exactly 3 highly targeted search queries.

Return ONLY a valid JSON object in this exact format. No extra markdown or text:
{
  "reasoning": "Explain briefly what you need to find and why",
  "queries": ["query 1", "query 2", "query 3"]
}`;

  let queries = [userMessage];
  let agentReasoning = "";

  try {
    // 🔥 Yahan quality ke liye strict Nvidia use hoga
    const queryRes = await nvidiaModel.invoke(queryPrompt);
    const text = queryRes.content.toString().replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(text);
    
    if (parsed.queries && Array.isArray(parsed.queries)) {
      queries = [...new Set([...parsed.queries, userMessage])].slice(0, 3);
      agentReasoning = parsed.reasoning || "";
      console.log("🧠 Nvidia Agent Reasoning:", agentReasoning);
    }
  } catch (error) {
    console.error("⚠️ Cognitive planning failed, falling back to basic query.", error.message);
  }

  // ==========================================
  // STEP 2: Broad Scouting (Tavily)
  // ==========================================
  if (sendEvent) sendEvent({ type: "status", content: "🔍 Scouting the web for top sources..." });
  
  const searchPromises = queries.map(q => 
    tvly.search(q, { searchDepth: "advanced", maxResults: 3 })
  );
  const searchResults = await Promise.allSettled(searchPromises);

  // ==========================================
  // STEP 3: Deduplication & Ranking
  // ==========================================
  if (sendEvent) sendEvent({ type: "status", content: "🧹 Filtering and selecting best URLs..." });
  
  const uniqueResultsMap = new Map();
  searchResults.forEach(res => {
    if (res.status === "fulfilled" && res.value && res.value.results) {
      res.value.results.forEach(item => {
        if (!uniqueResultsMap.has(item.url)) {
          uniqueResultsMap.set(item.url, item);
        }
      });
    }
  });

  const topSources = Array.from(uniqueResultsMap.values()).slice(0, 3);

  // ==========================================
  // STEP 4: Deep Reading (Firecrawl)
  // ==========================================
  if (sendEvent) sendEvent({ type: "status", content: "🕷️ Deep reading articles via Firecrawl..." });

  const scrapePromises = topSources.map(source => 
    firecrawl.scrapeUrl(source.url, { formats: ['markdown'] })
  );
  
  const scrapeResults = await Promise.allSettled(scrapePromises);
  const citations = [];
  const extractedBlocks = [];

  scrapeResults.forEach((res, i) => {
    const sourceInfo = topSources[i];
    
    citations.push({
      id: i + 1,
      url: sourceInfo.url,
      title: sourceInfo.title,
      domain: new URL(sourceInfo.url).hostname.replace(/^www\./, '')
    });

    let contentToUse = "";

    if (res.status === "fulfilled" && res.value && res.value.success) {
      contentToUse = res.value.markdown.slice(0, 15000); 
    } else {
      console.log(`⚠️ Firecrawl blocked for ${sourceInfo.url}, using Tavily fallback.`);
      contentToUse = sourceInfo.content; 
    }

    extractedBlocks.push(`[EVIDENCE BLOCK ${i + 1}]
Source ID: [${i + 1}]
Title: ${sourceInfo.title}
Publisher/Domain: ${new URL(sourceInfo.url).hostname}
Extracted Content: 
${contentToUse.trim()}
`);
  });

  // ==========================================
  // STEP 5: Final Structure Assembly
  // ==========================================
  if (sendEvent) sendEvent({ type: "status", content: "📑 Structuring massive evidence payload..." });

  const contextText = extractedBlocks.join("\n\n" + "=".repeat(50) + "\n\n");

  return { contextText, citations, agentReasoning };
};