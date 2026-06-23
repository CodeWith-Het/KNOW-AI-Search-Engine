import { tavily as Tavily} from "@tavily/core";

const tavily = Tavily({
        apiKey: process.env.TAVILY_API_KEY,
});
    
export const searchInternet = async (query) => {
    try {
        return await tavily.search(query, {
            maxResults: 5,
            searchDepth: "advanced",
        });
    } catch (error) {
        console.error("Error searching Tavily:", error);
        throw error;
    }
}