import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";

// Import SEO agents
import { seoKeywordAgent } from "./agents/seo-keyword-agent";
import { seoContentAgent } from "./agents/seo-content-agent";
import { seoAuditAgent } from "./agents/seo-audit-agent";

export const mastra = new Mastra({
  agents: {
    seoKeywordAgent,
    seoContentAgent,
    seoAuditAgent,
  },
  storage: new LibSQLStore({
    // Use memory storage for development, change to file:../mastra.db for persistence
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "SEO Pro Mastra",
    level: "info",
  }),
  server: {
    port: 4111,
    host: "0.0.0.0",
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
  },
});
