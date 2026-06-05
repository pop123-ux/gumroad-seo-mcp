# Gumroad SEO MCP

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933)](https://nodejs.org)

MCP server and CLI for Gumroad creators who sell digital products, templates, courses, guides, services, or asset packs.

It helps generate Gumroad-ready product page SEO, buyer-focused descriptions, tags, FAQs, and launch copy without depending on a hosted API or account key.

## Who It Is For

- Gumroad sellers launching templates, guides, courses, prompt packs, plugins, or design assets
- Indie hackers and creators who want better product page copy before launch
- Claude Desktop and MCP users who want local SEO helpers without API keys
- Digital product makers who need quick keyword ideas, FAQs, and channel copy

## Why Use It

Gumroad product pages need more than keywords. Buyers need to understand the outcome, what is included, who the product is for, and why it is worth buying now. Gumroad SEO MCP turns a rough product idea into a structured product page draft, then helps audit the page before launch.

## What It Does

- Generates Gumroad product titles, subtitles, slugs, descriptions, tags, and meta descriptions
- Writes buyer-focused page copy for creators selling digital products
- Produces FAQs and conversion notes to reduce purchase hesitation
- Audits existing Gumroad product pages for SEO and conversion clarity
- Creates lightweight launch plans for email, X, LinkedIn, or other channels
- Runs as both an MCP stdio server and a local CLI

## Quick Start

### Install from GitHub

```bash
npm install -g github:pop123-ux/gumroad-seo-mcp
```

No external API key is required.

### Run the CLI

```bash
gumroad-seo generate --product "Notion content calendar template" --audience "solo creators" --format "Notion template"
```

JSON output:

```bash
gumroad-seo generate --product "AI prompt pack for indie hackers" --audience "technical founders" --json
```

Interactive mode:

```bash
gumroad-seo
```

Then type:

```text
Notion content calendar template | solo creators
```

## Claude Desktop Setup

Add this to your Claude Desktop config.

macOS:

```text
~/Library/Application Support/Claude/claude_desktop_config.json
```

Windows:

```text
%APPDATA%\Claude\claude_desktop_config.json
```

Config:

```json
{
  "mcpServers": {
    "gumroad-seo": {
      "command": "gumroad-seo-mcp"
    }
  }
}
```

Restart Claude Desktop after editing the config.

## MCP Tools

### `generate_gumroad_seo`

Generates a complete Gumroad SEO package.

Input:

```json
{
  "product_name": "Notion content calendar template",
  "audience": "solo creators",
  "niche": "content planning",
  "format": "Notion template",
  "price": "$19"
}
```

Output includes:

- Title
- Subtitle
- URL slug
- Meta description
- Gumroad product description
- Tags
- Primary, secondary, and long-tail keywords
- FAQs
- Conversion notes
- Launch copy

### `audit_gumroad_page`

Scores an existing Gumroad page for SEO and conversion readiness.

Input:

```json
{
  "title": "Content Calendar",
  "subtitle": "Plan better posts",
  "description": "A Notion system for planning content.",
  "audience": "solo creators",
  "price": "$19"
}
```

### `generate_gumroad_launch_plan`

Creates a practical launch plan and channel copy.

Input:

```json
{
  "product_name": "AI prompt pack for indie hackers",
  "audience": "technical founders",
  "channels": ["email", "x", "linkedin"]
}
```

## CLI Commands

Generate product page copy:

```bash
gumroad-seo generate --product "Figma landing page wireframe kit" --audience "SaaS founders" --format "asset pack"
```

Audit a page:

```bash
gumroad-seo audit --title "Prompt Pack" --subtitle "Prompts for builders" --description "A prompt pack for shipping faster." --audience "indie hackers"
```

Generate launch copy:

```bash
gumroad-seo launch --product "No-code automation checklist" --audience "freelancers" --channels "email,x,linkedin"
```

## Example Output

```text
Title: Notion Content Calendar Template for Solo Creators
Subtitle: Notion template that helps solo creators organize the work and make better decisions faster.
Slug: notion-content-calendar-template
Meta description: Notion Content Calendar Template helps solo creators organize the work and make better decisions faster. Includes a Gumroad-ready description...

Tags:
notion content calendar template, content calendar, Notion template, gumroad, digital product, creator tools
```

## Local Development

```bash
npm install
npm test
node bin/gumroad-seo.js generate --product "Creator revenue dashboard" --audience "newsletter operators"
```

Test MCP line-delimited JSON manually:

```bash
printf '{"jsonrpc":"2.0","id":1,"method":"tools/list"}\n' | node bin/gumroad-seo-mcp.js
```

## Notes

This project does not scrape Gumroad or call external SEO APIs. It generates structured recommendations locally from the product, audience, niche, and format you provide.

Use the output as a strong draft, then edit it with real product details, screenshots, proof, refund policy, and delivery specifics.

## Promotion Kit

Want to share the project? See [PROMOTION.md](PROMOTION.md) for launch posts, short descriptions, target communities, and submission copy.

## License

MIT
