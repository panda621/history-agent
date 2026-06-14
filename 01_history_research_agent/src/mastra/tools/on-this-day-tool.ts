/**
 *  This task tests your ability to create a Mastra tool that calls the
 *  Wikimedia REST API to retrieve historical events that happened on a
 *  specific month and day.
 */

// TODO:
// Task 2 – "On This Day" Historical Events Tool
//
// 1. Import the createTool function from '@mastra/core/tools'
// Reference: https://mastra.ai/reference/tools/create-tool
//
// 2. Import the z object from 'zod'
// Reference: https://zod.dev/?id=basic-usage
//
// 3. Define a TypeScript type called OnThisDayEvent with the following fields:
//    - text (string)
//    - year (number)
//    - pages (array of objects, each having: title (string), extract (optional string),
//      content_urls (optional object with desktop (optional object with page (optional string))))
// Reference: https://www.typescriptlang.org/docs/handbook/2/objects.html
//
// 4. Define a TypeScript type called OnThisDayResponse with the following fields:
//    - events (optional array of OnThisDayEvent)
// Reference: https://www.typescriptlang.org/docs/handbook/2/objects.html
//
// 5. Create and export a constant called onThisDayTool using createTool with:
//    a. id: 'on-this-day'
//    b. description: 'Look up notable historical events that happened on a given month and day using the Wikimedia API'
//    c. inputSchema: a Zod object with:
//       - month: z.number().min(1).max(12).describe('Month of the year (1–12)')
//       - day: z.number().min(1).max(31).describe('Day of the month (1–31)')
//       - limit: z.number().min(1).max(10).optional().default(5)
//    d. outputSchema: a Zod object with:
//       - events: z.array() containing objects with:
//         - year: z.number()
//         - description: z.string()
//         - title: z.string()
//         - url: z.string().optional()
//         - source: z.literal('wikimedia')
//    e. execute: an async function that receives { context } and:
//       i.   Reads context.month and context.day from the context
//       ii.  Pads month and day to two digits with String(...).padStart(2, '0'), store as mm and dd
//       iii. Reads context.limit with a fallback of 5
//       iv.  Builds the API URL: `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${mm}/${dd}`
//       v.   Calls fetch() with that URL, passing a header 'User-Agent': 'mastra-history-agent/1.0'
//       vi.  If the response is not ok, throws an Error with the status
//       vii. Parses the JSON response and casts it as OnThisDayResponse
//       viii. Takes (data.events ?? []).slice(0, limit) and maps each event to:
//             - year: event.year
//             - description: event.text
//             - title: the title of the first page in event.pages, or 'Unknown'
//             - url: the desktop page URL from the first page's content_urls, or ''
//             - source: 'wikimedia' as const
//       ix.  Returns { events }
//
// Reference: https://api.wikimedia.org/wiki/Feed_API/Reference/On_this_day
// Reference: https://www.mediawiki.org/wiki/Wikifeeds_API#Reference
// Reference: https://mastra.ai/reference/tools/create-tool
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//
// YOUR CODE STARTS HERE (Feel free to add more lines of code as needed)

import { createTool } from "@mastra/core/tools"
import { z } from "zod"

type OnThisDayEvent = {
    text: string,
    year: number,
    pages: Array<{
        title: string,
        extract?: string, 
        content_urls?: {
            desktop?: {
                page?: string
            }
        } 
    }>
};

type OnThisDayResponse = {
    event: Array<OnThisDayEvent>
};

export const onThisDayTool = createTool({
    id: "on-this-day", 
    description: "Look up notable historical events that happened on a given month and day using the Wikimedia API", 
    inputSchema: z.object({
        month: z.number().min(1).max(12).describe('Month of the year (1–12)'), 
        day: z.number().min(1).max(31).describe('Day of the month (1–31)'), 
        limit: z.number().min(1).max(10).optional().default(5)
    }), 

    outputSchema: z.object({
        events: z.array(
            z.object({
                year: z.number(), 
                description: z.string(), 
                title: z.string(), 
                url: z.string().optional(), 
                source: z.literal("wikimedia")
            })
        )
    }), 
    
    execute: async ({context}) => {
        const month = String(context.month).padStart(2, "0");
        const day = String(context.day).padStart(2, "0");
        const limit = context.limit ?? 5 // Ternary operator to enforce defaults
        const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${month}/${day}`;
        const res = await fetch(url, {headers: {"User-Agent": "mastra-history-agent/1.0"}});

         if(!res.ok){
            throw new Error(`Wikipedia History search failed with status ${res.status}`);
        }

        const data = (await res.json()) as OnThisDayResponse

        const events = (data.events ?? []).slice(0, limit).map((events) => {
            // capture first page
            const firstPage = events.pages?.[0];

            return {
                year: events.year,
                description: events.text,
                title: firstPage?.title ?? 'Unknown',
                url: firstPage?.content_urls?.desktop?.page ?? '',
                source: 'wikimedia' as const,
            };
        });

        return {events}
    }
});