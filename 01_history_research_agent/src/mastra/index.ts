/**
 *  This task tests your ability to register your agent with the Mastra
 *  framework so it can be served via the Mastra dev server.
 *
 *  In the Science Chat lesson you saw how the Mastra instance ties
 *  together agents, storage, logging, and observability.
 */

// TODO:
// Task 5 – Mastra Instance Registration
//
// 1. Import the Mastra class from '@mastra/core/mastra'
// Reference: https://mastra.ai/docs/getting-started
//
// 2. Import the PinoLogger class from '@mastra/loggers'
// Reference: https://mastra.ai/docs/observability/logging
//
// 3. Import the LibSQLStore class from '@mastra/libsql'
// Reference: https://mastra.ai/docs/storage/libsql
//
// 4. Import the historyResearchAgent from './agents/history-agent'
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
//
// 5. Create and export a constant called mastra using new Mastra({ ... }) with:
//    a. agents: an object containing the historyResearchAgent
//       { historyResearchAgent }
//    b. storage: a new LibSQLStore with url set to ':memory:'
//       (This stores observability data in memory; change to 'file:../mastra.db' to persist)
//    c. logger: a new PinoLogger with:
//       - name: 'Mastra'
//       - level: 'info'
//    d. telemetry: an object with enabled set to false
//       (Telemetry is deprecated and will be removed in a future release)
//    e. observability: an object with:
//       - default: { enabled: true }
//       (Enables DefaultExporter and CloudExporter for AI tracing)
//
// Reference: https://mastra.ai/docs/getting-started
// Reference: https://mastra.ai/docs/observability/logging
//
// YOUR CODE STARTS HERE (Feel free to add more lines of code as needed)

import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

import { historyResearchAgent } from './agents/history-agent';

export const mastra = new Mastra({
  agents: { historyResearchAgent },
  storage: new LibSQLStore({
    url: ':memory:',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    enabled: false,
  },
  observability: {
    default: { enabled: true },
  },
});

// YOUR CODE ENDS HERE
