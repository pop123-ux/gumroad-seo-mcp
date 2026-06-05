#!/usr/bin/env node
import { handleCli, startInteractiveShell, startMcpServer } from '../mcp-server.js';

async function main() {
  const args = process.argv.slice(2);
  const isMcpMode =
    args.length === 0 &&
    (!process.stdin.isTTY || !process.stdout.isTTY || process.env.GUMROAD_SEO_MCP === '1');

  if (isMcpMode) {
    startMcpServer();
    return;
  }

  if (args.length === 0) {
    await startInteractiveShell();
    return;
  }

  await handleCli(args);
}

main().catch((error) => {
  console.error(`[gumroad-seo] ${error.message || error}`);
  process.exitCode = 1;
});
