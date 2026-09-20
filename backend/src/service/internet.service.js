import dotenv from "dotenv";
dotenv.config();

import { tavily as Tavily } from "@tavily/core";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";

// ============================================================
// 1. SETUP TAVILY & GEMINI
// ============================================================

const tavily = Tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

// Deep Research ke liye hum fast model use karenge
const researchModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.2, // Low temperature for factual accuracy
  maxRetries: 3,
});

// ============================================================
// 2. DEFINE LANGGRAPH STATE
// ============================================================

// State object jo pure research workflow me ghumega
const ResearchState = Annotation.Root({
  question: Annotation({
    reducer: (x, y) => y ?? x,
  }),
  queries: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  rawContent: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  sources: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  finalReport: Annotation({
    reducer: (x, y) => y ?? x,
  }),
});

// ============================================================
// 3. DEFINE GRAPH NODES (WORKFLOW STEPS)
// ============================================================

// STEP A: Question ko dekh kar 3-5 specific search queries generate karna
const generateQueriesNode = async (state) => {
  console.log("🔍 [1/3] Generating Search Queries...");
  
  const querySchema = z.object({
    queries: z.array(z.string()).describe("A list of 3 to 5 highly specific search queries to fully research the topic."),
  });

  const structuredLlm = researchModel.withStructuredOutput(querySchema);

  const prompt = `You are a professional research assistant. The user wants to research the following topic:
  "${state.question}"
  
  Break this down into 3 to 5 highly specific search queries that will yield the best factual data, statistics, and latest news from the internet.`;

  const response = await structuredLlm.invoke([new HumanMessage(prompt)]);
  
  return { queries: response.queries };
};

// STEP B: Un saari queries par parallel search marna aur content extract karna
const executeSearchesNode = async (state) => {
  console.log(`🌐 [2/3] Executing Searches for ${state.queries.length} queries...`);
  
  const allRawContent = [];
  const uniqueSources = new Map();
  let sourceCounter = 1;

  // Saari queries ko ek sath (parallel) run karne ke liye Promise.all
  const searchPromises = state.queries.map(async (query) => {
    try {
      const result = await tavily.search(query, {
        searchDepth: "advanced",
        maxResults: 2, // Har query ke liye top 2 pages (to save token limits)
        includeRawContent: true, // Actual website content
      });
      return result.results;
    } catch (error) {
      console.error(`⚠️ Tavily Search failed for query: "${query}"`, error.message);
      return [];
    }
  });

  const searchResults = await Promise.all(searchPromises);

  // Results ko flat aur clean karna
  searchResults.flat().forEach((site) => {
    if (!uniqueSources.has(site.url)) {
      uniqueSources.set(site.url, {
        id: sourceCounter++,
        title: site.title,
        url: site.url,
      });

      // Gemini context window ke hisaab se content ko trim karna
      const cleanContent = site.rawContent ? site.rawContent.substring(0, 3000) : site.content;
      
      allRawContent.push(`
        Source ID: [${uniqueSources.get(site.url).id}]
        Title: ${site.title}
        URL: ${site.url}
        Content: ${cleanContent}
      `);
    }
  });

  return {
    rawContent: allRawContent,
    sources: Array.from(uniqueSources.values()),
  };
};

// STEP C: Ek detailed Markdown report likhna with exact citations
const synthesizeReportNode = async (state) => {
  console.log("📝 [3/3] Synthesizing Final Report...");
  
  const systemPrompt = `You are an expert AI researcher and technical analyst. 
  Your goal is to synthesize the provided internet research into a comprehensive, well-structured markdown report.

  USER'S QUESTION: ${state.question}

  FORMATTING RULES:
  You MUST follow this exact structure:

  ## Research Summary
  (Provide a structured summary using bullet points categorizing the main aspects. Use bold text for key terms).

  ## Findings
  (Provide a detailed analysis, synthesizing the data you found. Write in short paragraphs).

  ## Sources
  (List the sources exactly as provided, formatted as a numbered list with URLs).

  CITATION RULES:
  Every single factual claim, statistic, or piece of news MUST be cited inline using the Source ID provided. 
  Example format: "React remains the most popular frontend framework [1]."

  RAW RESEARCH CONTENT:
  ${state.rawContent.join("\n---\n")}
  `;

  const response = await researchModel.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage("Generate the structured report now."),
  ]);

  return { finalReport: response.content };
};

// ============================================================
// 4. BUILD AND COMPILE THE LANGGRAPH
// ============================================================

const workflow = new StateGraph(ResearchState)
  .addNode("generateQueries", generateQueriesNode)
  .addNode("executeSearches", executeSearchesNode)
  .addNode("synthesizeReport", synthesizeReportNode)
  .addEdge(START, "generateQueries")
  .addEdge("generateQueries", "executeSearches")
  .addEdge("executeSearches", "synthesizeReport")
  .addEdge("synthesizeReport", END);

const deepResearchApp = workflow.compile();

// ============================================================
// 5. EXPORT THE FUNCTION
// ============================================================

/**
 * Executes a full Deep Research cycle using LangGraph.
 * @param {string} question - The user's research query.
 * @returns {Promise<{ report: string, sources: Array, queriesRun: Array }>}
 */
export const runDeepResearch = async (question) => {
  try {
    // Graph execute karna
    const resultState = await deepResearchApp.invoke({ question });

    return {
      report: resultState.finalReport,
      sources: resultState.sources,
      queriesRun: resultState.queries,
    };
  } catch (error) {
    console.error("❌ Deep Research Error:", error);
    throw error;
  }
};