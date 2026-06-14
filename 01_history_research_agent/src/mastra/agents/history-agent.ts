/**
 *  This task tests your ability to create a Mastra Agent that uses multiple
 *  tools and memory to help students research historical topics.
 *
 *  The agent should combine the three tools you built in the previous tasks
 *  (Open Library, On This Day, and Wikipedia History) so a user can ask
 *  questions about any historical period, event, or figure.
 */

// TODO:
// Task 4 – History Research Agent
//
// 1. Import the Agent class from '@mastra/core/agent'
// Reference: https://mastra.ai/docs/agents/overview
//
// 2. Import the Memory class from '@mastra/memory'
// Reference: https://mastra.ai/docs/memory/overview
//
// 3. Import the LibSQLStore class from '@mastra/libsql'
// Reference: https://mastra.ai/docs/storage/libsql
//
// 4. Import the three tools you created in the previous tasks:
//    a. openLibrarySearchTool   from '../tools/open-library-tool'
//    b. onThisDayTool           from '../tools/on-this-day-tool'
//    c. wikipediaHistoryTool    from '../tools/wikipedia-history-tool'
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
//
// 5. Create and export a constant called historyResearchAgent using new Agent({ ... }) with:
//    a. name: 'History Research Agent'
//    b. instructions: a template literal string (backtick string) that tells the agent:
//       - It helps students research historical topics, events, and figures.
//       - When a student asks about a historical topic it should:
//         * Use the Wikipedia history tool to find relevant articles.
//         * Use the Open Library tool to find related books.
//         * Use the On This Day tool when the student asks about a specific date.
//       - It should present findings in clearly organized sections:
//         * Wikipedia Articles, Books, and (when relevant) Events On This Day.
//       - Each item should include a title, brief description, and link.
//       - It should be concise and educational.
//    c. model: 'mistral/mistral-medium-2508'
//       (This tells Mastra to use the Mistral provider with the mistral-medium-2508 model)
//    d. tools: an object containing the three imported tools:
//       { openLibrarySearchTool, onThisDayTool, wikipediaHistoryTool }
//    e. memory: a new Memory instance configured with:
//       - storage: a new LibSQLStore with url set to 'file:../mastra.db'
//         (the path is relative to the .mastra/output directory)
//
// Reference: https://mastra.ai/docs/agents/overview
// Reference: https://mastra.ai/docs/memory/overview
//
// YOUR CODE STARTS HERE (Feel free to add more lines of code as needed)

import {Agent} from "@mastra/core/agent";
import {Memory} from "@mastra/memory";
import {LibSQLStore} from "@mastra/libsql";
import {openLibrarySearchTool}   from '../tools/open-library-tool';
import {onThisDayTool}   from '../tools/on-this-day-tool';
import {wikipediaHistoryTool}   from '../tools/wikipedia-history-tool';

export const historyResearchAgent = new Agent({
    id: 'history-agent',
    name: 'History Research Agent',
    instructions: `
                 - You help students research historical topics, events, and figures.
                 - When a student asks about a historical topic you should:
                   * Use the Wikipedia history tool to find relevant articles.
                   * Use the Open Library tool to find related books.
                   * Use the On This Day tool when the student asks about a specific date.
                 - You should present findings in clearly organized sections:
                   * Wikipedia Articles, Books, and (when relevant) Events On This Day.
                 - Each item should include a title, brief description, and link.
                 - You should respond in a concise and educational way.`,
    model: 'mistral/mistral-medium-2508',
    tools: {openLibrarySearchTool, onThisDayTool, wikipediaHistoryTool},
    memory: new Memory({
        storage: new LibSQLStore({
            id: "mastra-db",
            url: "file:../mastra.db", 
        }), 
    }), 
});