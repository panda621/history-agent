/**
 *  This task tests your ability to create a Mastra tool that calls an
 *  external API and returns structured data using Zod schemas.
 *
 *  In this task you will build a tool that searches the Open Library API
 *  for books related to a historical topic and returns their titles, authors,
 *  and links.
 */

// TODO:
// Task 1 – Open Library Search Tool
//
// EXAMPLE IMPLEMENTATION (from the lesson):
//   In the Science Chat project you saw how createTool is used together
//   with a Zod input/output schema and an async execute function that
//   calls a public API. Use that pattern here.
//
// 1. Import the createTool function from '@mastra/core/tools'
// Reference: https://mastra.ai/docs/tools/overview
//
// 2. Import the z object from 'zod' (used to define input and output schemas)
// Reference: https://zod.dev/?id=basic-usage
//
// 3. Define a TypeScript type called OpenLibraryDoc with the following optional fields:
//    - title (string)
//    - author_name (array of strings)
//    - key (string)
//    - first_publish_year (number)
// Reference: https://www.typescriptlang.org/docs/handbook/2/objects.html
//
// 4. Define a TypeScript type called OpenLibraryResponse with the following fields:
//    - docs (optional array of OpenLibraryDoc)
// Reference: https://www.typescriptlang.org/docs/handbook/2/objects.html
//
// 5. Create and export a constant called openLibrarySearchTool using createTool with:
//    a. id: 'open-library-search'
//    b. description: 'Search Open Library for books on a historical topic and return titles, authors, and links'
//    c. inputSchema: a Zod object with:
//       - topic: z.string() with a .describe() explaining it is the topic to search
//       - limit: z.number().min(1).max(10).optional().default(5)
//    d. outputSchema: a Zod object with:
//       - books: z.array() containing objects with:
//         - title: z.string()
//         - authors: z.string()
//         - url: z.string().url()
//         - firstPublished: z.number().optional()
//         - source: z.literal('openlibrary')
//    e. execute: an async function that receives { context } and:
//       i.   Reads context.topic and trims whitespace, store in a const called q
//       ii.  Reads context.limit with a fallback of 5, store in a const called limit
//       iii. Builds the API URL: `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=${limit}`
//       iv.  Calls fetch() with that URL
//       v.   If the response is not ok, throws an Error with the status
//       vi.  Parses the JSON response and casts it as OpenLibraryResponse
//       vii. Maps over (data.docs ?? []) to build an array of book objects:
//            - title: doc.title or 'Unknown Title'
//            - authors: doc.author_name joined with ', ' or 'Unknown Author'
//            - url: `https://openlibrary.org${doc.key}` (doc.key looks like '/works/OL123W')
//            - firstPublished: doc.first_publish_year or undefined
//            - source: 'openlibrary' as const
//       viii. Returns { books }
//
// Reference: https://openlibrary.org/dev/docs/api/search
// Reference: https://mastra.ai/reference/tools/create-tool
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//
// YOUR CODE STARTS HERE (Feel free to add more lines of code as needed)

import { contextFields } from "@mastra/core/storage";
import {createTool} from "@mastra/core/tools"
import {z} from "zod";

type OpenLibraryDoc = {
  title?: string;
  author_name?: string[];
  key?: string;
  first_publish_year?: number;
};

type OpenLibraryResponse = {
    docs?: OpenLibraryDoc[]
};

export const openLibrarySearchTool = createTool({
  id: "open-library-search",
  description: "Search Open Library for books on a historical topic and return titles, authors, and links",
  inputSchema: z.object({
    topic: z.string().describe("The book's topic (placeholder)"),
    limit: z.number().min(1).max(10).optional().default(5)
  }),
  
  outputSchema: z.object({
    books: z.array(
      z.object({
        title: z.string(),
        authors: z.string(), 
        url: z.url(),
        firstPublish: z.number().optional(), 
        source: z.literal("openLibrary")
      })   
    )
  }),

  // TODO: Confirm type
  execute: async ({ context }) => {
    const q = context.topic.trim()
    const limit = context.limit ?? 5
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=${limit}`
    const res = await fetch(url, {headers: {"User-Agent": "mastra-history-agent/1.0"}});

    if(!res.ok){
      throw new Error(`Open Library search failed with status ${res.status}`);
    }

    const data = (await res.json()) as OpenLibraryResponse
    
    const books = (data.docs ?? []).map((doc) => ({
      title: doc.title ?? "Unknown Title", 
      authors: doc.author_name?.join(", ") ?? "Unknown Author", 
      url: `https://openlibrary.org${doc.key ?? ""}`, 
      firstPublish: doc.first_publish_year ?? undefined, 
      source: "openLibrary" as const, 
    }));

    return {books}
  },
})