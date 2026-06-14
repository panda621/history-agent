/**
 *  This task tests your ability to create a Mastra tool that searches
 *  Wikipedia for articles related to a historical topic. This is similar
 *  to the Wikipedia tool from the Science Chat lesson but focused on
 *  history research.
 */

// TODO:
// Task 3 – Wikipedia History Search Tool
//
// 1. Import the createTool function from '@mastra/core/tools'
// Reference: https://mastra.ai/reference/tools/create-tool
//
// 2. Import the z object from 'zod'
// Reference: https://zod.dev/?id=basic-usage
//
// 3. Define a TypeScript type called WikiSearchResponse with the following fields:
//    - query (optional object containing:
//        - search (optional array of objects, each with:
//            - title (string)
//            - snippet (string)
//            - pageid (number)))
// Reference: https://www.typescriptlang.org/docs/handbook/2/objects.html
//
// 4. Create a helper function called stripHtml that:
//    a. Takes a single string parameter called html
//    b. Returns a string with all HTML tags removed using .replace(/<[^>]+>/g, '')
//    c. Also decodes common HTML entities: &quot; -> ", &amp; -> &, &lt; -> <, &gt; -> >
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
//
// 5. Create and export a constant called wikipediaHistoryTool using createTool with:
//    a. id: 'wikipedia-history-search'
//    b. description: 'Search Wikipedia for articles related to a historical topic and return titles, snippets, and links'
//    c. inputSchema: a Zod object with:
//       - topic: z.string() with a .describe() explaining it is the historical topic to search
//       - limit: z.number().min(1).max(10).optional().default(5)
//    d. outputSchema: a Zod object with:
//       - articles: z.array() containing objects with:
//         - title: z.string()
//         - snippet: z.string()
//         - url: z.string().url()
//         - source: z.literal('wikipedia')
//    e. execute: an async function that receives { context } and:
//       i.   Reads context.topic and trims whitespace, store in a const called q
//       ii.  Reads context.limit with a fallback of 5
//       iii. Builds the API URL:
//            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=${limit}&format=json&origin=*`
//       iv.  Calls fetch() with that URL
//       v.   If the response is not ok, throws an Error with the status
//       vi.  Parses the JSON response and casts it as WikiSearchResponse
//       vii. Maps over (data.query?.search ?? []) to build an array of article objects:
//            - title: item.title
//            - snippet: call stripHtml(item.snippet) to clean the HTML tags
//            - url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`
//            - source: 'wikipedia' as const
//       viii. Returns { articles }
//
// Reference: https://www.mediawiki.org/wiki/API:Search
// Reference: https://mastra.ai/reference/tools/create-tool
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//
// YOUR CODE STARTS HERE (Feel free to add more lines of code as needed)

import {createTool} from "@mastra/core/tools";
import {string, z} from "zod";

type WikiSearchResponse = {
    query?: {
        search?: Array<{
            title: string
            snippet: string
            pageId: number
        }>
    }
};

function stripHtml(html: string): string{
    return html
        .replace(/<[^>]+>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
}


export const wikipediaHistoryTool = createTool({
    id: "wikipedia-history-search",
    description: "Search Wikipedia for articles related to a historical topic and return titles, snippets, and links", 
    inputSchema: z.object({
        topic: z.string().describe("It is the historical topic to search"), 
        limit: z.number().min(1).max(10).optional().default(5)
    }), 

    outputSchema: z.object({
        articles: z.array(
            z.object({
                title: z.string(), 
                snippet: z.string(), 
                url: z.url(), 
                source: z.literal("wikipedia")
            })
        )
    }), 

    execute: async ({context}) => {
        const q = context.topic.trim()
        const limit = context.limit ?? 5 // Ternary operator to enforce defaults
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=${limit}&format=json&origin=*`
        const res = await fetch(url, {headers: {"User-Agent": "mastra-history-agent/1.0"}});

        if(!res.ok){
            throw new Error(`Wikipedia History search failed with status ${res.status}`);
        }

        const data = (await res.json()) as WikiSearchResponse

        const articles = (data?.query?.search ?? []).map((item) => ({
            title: item.title, 
            snippet: stripHtml(item.snippet), 
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`, 
            source: "wikipedia" as const
        }));

        return {articles}
    }
})