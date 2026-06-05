#!/usr/bin/env node

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'into',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
  'your',
]);

const PRODUCT_PATTERNS = [
  { matcher: /template|notion|spreadsheet|sheet|tracker|planner/i, type: 'template', buyer: 'busy operators and solo creators' },
  { matcher: /course|workshop|masterclass|lesson|training/i, type: 'course', buyer: 'learners who want a practical shortcut' },
  { matcher: /ebook|book|guide|playbook|manual|checklist/i, type: 'guide', buyer: 'self-directed buyers who want clear next steps' },
  { matcher: /preset|brush|font|asset|pack|icons|mockup/i, type: 'asset pack', buyer: 'designers and creators shipping visual work' },
  { matcher: /script|tool|automation|bot|app|software/i, type: 'tool', buyer: 'builders who want a repeatable workflow' },
  { matcher: /coaching|consult|audit|review/i, type: 'service', buyer: 'buyers who want expert feedback' },
];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function compactWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function titleCase(value) {
  return compactWhitespace(value)
    .split(' ')
    .map((word) => {
      if (word.length <= 3 && word === word.toLowerCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function sentenceCase(value) {
  const text = compactWhitespace(value);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function trimTo(value, maxLength) {
  const text = compactWhitespace(value);
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength - 1);
  const lastSpace = trimmed.lastIndexOf(' ');
  return `${trimmed.slice(0, lastSpace > 40 ? lastSpace : trimmed.length).trim()}...`;
}

function indefiniteArticle(value) {
  return /^[aeiou]/i.test(compactWhitespace(value)) ? 'an' : 'a';
}

function getKeywords(productName, audience = '', niche = '') {
  const source = `${productName} ${audience} ${niche}`.toLowerCase();
  const words = source
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  const phrases = [];
  const cleanedName = compactWhitespace(productName.toLowerCase());
  if (cleanedName) phrases.push(cleanedName);

  for (let i = 0; i < words.length - 1; i += 1) {
    phrases.push(`${words[i]} ${words[i + 1]}`);
  }

  return unique([...phrases, ...words]).slice(0, 16);
}

function inferProduct(productName) {
  return PRODUCT_PATTERNS.find((pattern) => pattern.matcher.test(productName)) || {
    type: 'digital product',
    buyer: 'Gumroad buyers looking for a practical outcome',
  };
}

function inferOutcome(productName, audience = '') {
  const text = `${productName} ${audience}`.toLowerCase();
  if (/seo|traffic|audience|growth|marketing|sales|launch/i.test(text)) return 'grow faster without rebuilding the process from scratch';
  if (/notion|planner|tracker|system|dashboard|spreadsheet/i.test(text)) return 'organize the work and make better decisions faster';
  if (/design|asset|preset|template|mockup|font|icon/i.test(text)) return 'ship polished creative work with less production time';
  if (/course|guide|playbook|checklist|book/i.test(text)) return 'learn the process and put it into action immediately';
  return 'get a clear result with less trial and error';
}

export function generateGumroadSeo({
  product_name,
  audience = '',
  niche = '',
  format = '',
  price = '',
  tone = 'clear, direct, conversion-focused',
} = {}) {
  const productName = compactWhitespace(product_name);
  if (!productName) {
    throw new Error('product_name is required');
  }

  const inferred = inferProduct(productName);
  const targetAudience = compactWhitespace(audience) || inferred.buyer;
  const productFormat = compactWhitespace(format) || inferred.type;
  const outcome = inferOutcome(productName, targetAudience);
  const keywords = getKeywords(productName, targetAudience, niche);
  const primaryKeyword = keywords[0] || productName.toLowerCase();
  const secondaryKeyword = keywords.find((keyword) => keyword !== primaryKeyword) || productFormat;
  const displayName = titleCase(productName);

  const title = trimTo(
    /\bfor\b/i.test(productName) || productName.toLowerCase().includes(targetAudience.toLowerCase())
      ? displayName
      : `${displayName} for ${titleCase(targetAudience)}`,
    90
  );
  const subtitle = trimTo(
    `${sentenceCase(productFormat)} that helps ${targetAudience} ${outcome}.`,
    140
  );
  const metaDescription = trimTo(
    `${displayName} helps ${targetAudience} ${outcome}. Includes a Gumroad-ready description, keywords, FAQs, and launch copy.`,
    155
  );
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  const bullets = [
    `Built for ${targetAudience}`,
    `Focused on the outcome: ${outcome}`,
    `Positioned around "${primaryKeyword}" and "${secondaryKeyword}"`,
    `Easy to preview, understand, and buy from a Gumroad product page`,
  ];

  if (price) {
    bullets.push(`Works with a ${price} price point`);
  }

  const description = [
    `## ${title}`,
    '',
    subtitle,
    '',
    `This ${productFormat} is for ${targetAudience} who want to ${outcome}. Instead of guessing what to say on the product page, the positioning leads with the buyer's goal, explains what is included, and gives search engines enough context to understand the offer.`,
    '',
    '### What you get',
    ...bullets.map((bullet) => `- ${bullet}`),
    '',
    '### Who it is for',
    `- ${sentenceCase(targetAudience)}`,
    `- Buyers searching for ${primaryKeyword}`,
    `- People who want a practical, downloadable solution instead of a vague promise`,
    '',
    '### Why it works',
    `The page connects the product name, buyer intent, and use case in plain language. That makes it stronger for Gumroad discovery, Google snippets, social previews, and creator-led launch posts.`,
  ].join('\n');

  const tags = unique([
    primaryKeyword,
    secondaryKeyword,
    productFormat,
    'gumroad',
    'digital product',
    'creator tools',
    'downloadable',
    ...keywords,
  ]).slice(0, 13);

  const faqs = [
    {
      question: `Who should buy ${displayName}?`,
      answer: `It is for ${targetAudience} who want to ${outcome}.`,
    },
    {
      question: 'What do I receive after purchase?',
      answer: `${sentenceCase(indefiniteArticle(productFormat))} ${productFormat} with clear next steps and supporting material described on the Gumroad product page.`,
    },
    {
      question: 'Can I use this immediately?',
      answer: 'Yes. The page should make the first action obvious so buyers can get value right after download.',
    },
  ];

  return {
    title,
    subtitle,
    slug,
    meta_description: metaDescription,
    gumroad_description: description,
    tags,
    keywords: {
      primary: primaryKeyword,
      secondary: keywords.slice(1, 6),
      long_tail: keywords.filter((keyword) => keyword.includes(' ')).slice(0, 8),
    },
    faqs,
    conversion_notes: [
      'Lead with the buyer outcome in the first two lines.',
      'Use the Gumroad cover image to show the actual product, not only a decorative graphic.',
      'Add a short preview section or sample file when possible.',
      'Name the audience explicitly so the product feels made for someone specific.',
      'Repeat the primary keyword naturally in the title, subtitle, first paragraph, and FAQ.',
    ],
    launch_copy: {
      short_post: trimTo(
        `I made ${displayName} to help ${targetAudience} ${outcome}. It is live on Gumroad now.`,
        220
      ),
      email_subject: trimTo(`${displayName}: ${outcome}`, 70),
      social_hook: trimTo(`Stop guessing. Use ${displayName} to ${outcome}.`, 120),
    },
    tone,
  };
}

export function auditGumroadPage({
  title = '',
  subtitle = '',
  description = '',
  price = '',
  audience = '',
} = {}) {
  const checks = [];
  const titleText = compactWhitespace(title);
  const subtitleText = compactWhitespace(subtitle);
  const body = compactWhitespace(description);
  const lowerBody = body.toLowerCase();

  checks.push({
    item: 'Outcome-led title',
    status: titleText.length >= 20 && titleText.length <= 90 ? 'pass' : 'review',
    recommendation: 'Keep the title specific, searchable, and under about 90 characters.',
  });
  checks.push({
    item: 'Subtitle clarity',
    status: subtitleText.length >= 40 && subtitleText.length <= 140 ? 'pass' : 'review',
    recommendation: 'Use the subtitle to explain the buyer, format, and result in one sentence.',
  });
  checks.push({
    item: 'Buyer named early',
    status: audience && lowerBody.includes(audience.toLowerCase().split(' ')[0]) ? 'pass' : 'review',
    recommendation: 'Name the intended buyer in the first paragraph.',
  });
  checks.push({
    item: 'Scannable benefits',
    status: /what you get|includes|inside|benefits|you get/i.test(body) ? 'pass' : 'review',
    recommendation: 'Add a "What you get" section with concrete bullets.',
  });
  checks.push({
    item: 'Purchase confidence',
    status: /faq|refund|preview|sample|after purchase|download/i.test(body) ? 'pass' : 'review',
    recommendation: 'Add FAQs, preview details, or post-purchase instructions to reduce hesitation.',
  });
  checks.push({
    item: 'Pricing signal',
    status: price ? 'pass' : 'review',
    recommendation: 'State the price strategy or anchor the value against the time saved.',
  });

  const score = Math.round(
    (checks.filter((check) => check.status === 'pass').length / checks.length) * 100
  );

  return {
    score,
    checks,
    priority_fixes: checks
      .filter((check) => check.status !== 'pass')
      .map((check) => check.recommendation),
  };
}

export function generateLaunchPlan({
  product_name,
  audience = '',
  channels = ['email', 'x', 'linkedin'],
  launch_angle = '',
} = {}) {
  const seo = generateGumroadSeo({ product_name, audience });
  const channelList = Array.isArray(channels)
    ? channels
    : String(channels || '')
        .split(',')
        .map((channel) => channel.trim())
        .filter(Boolean);
  const angle = compactWhitespace(launch_angle) || seo.subtitle;

  return {
    angle,
    prelaunch: [
      'Share the problem and ask your audience how they solve it today.',
      'Post one useful preview from inside the product.',
      'Collect 3-5 objections and answer them on the Gumroad page.',
    ],
    launch_day: channelList.map((channel) => ({
      channel,
      copy: `New on Gumroad: ${seo.title}. ${angle} ${seo.launch_copy.short_post}`,
    })),
    follow_up: [
      'Post a buyer-focused use case 24 hours after launch.',
      'Share a short walkthrough or screenshot of the product in action.',
      'Add the strongest question from replies to the Gumroad FAQ.',
    ],
  };
}

function renderSeoResult(result) {
  return [
    `Title: ${result.title}`,
    `Subtitle: ${result.subtitle}`,
    `Slug: ${result.slug}`,
    `Meta description: ${result.meta_description}`,
    '',
    'Tags:',
    result.tags.join(', '),
    '',
    'Gumroad description:',
    result.gumroad_description,
    '',
    'Launch copy:',
    `- ${result.launch_copy.short_post}`,
    `- ${result.launch_copy.email_subject}`,
    `- ${result.launch_copy.social_hook}`,
  ].join('\n');
}

function getFlagValue(flag, args = []) {
  const index = args.indexOf(`--${flag}`);
  if (index !== -1 && args[index + 1] && !args[index + 1].startsWith('--')) {
    return args[index + 1];
  }
  return '';
}

function printUsage() {
  console.log(
    `gumroad-seo ${pkg.version}\n\n` +
      'Commands:\n' +
      '  gumroad-seo generate --product "..." [--audience "..."] [--niche "..."] [--format "..."] [--price "..."] [--json]\n' +
      '  gumroad-seo audit --title "..." --subtitle "..." --description "..." [--audience "..."] [--price "..."] [--json]\n' +
      '  gumroad-seo launch --product "..." [--audience "..."] [--channels "email,x,linkedin"] [--json]\n' +
      '  gumroad-seo --help\n' +
      '  gumroad-seo --version\n\n' +
      'MCP stdio server:\n' +
      '  gumroad-seo-mcp\n'
  );
}

export async function handleCli(args = []) {
  const command = args[0];
  const jsonOutput = args.includes('--json');

  if (!command || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  if (command === '--version' || command === '-v') {
    console.log(pkg.version);
    return;
  }

  if (command === 'generate') {
    const result = generateGumroadSeo({
      product_name: getFlagValue('product', args),
      audience: getFlagValue('audience', args),
      niche: getFlagValue('niche', args),
      format: getFlagValue('format', args),
      price: getFlagValue('price', args),
    });
    console.log(jsonOutput ? JSON.stringify(result, null, 2) : renderSeoResult(result));
    return;
  }

  if (command === 'audit') {
    const result = auditGumroadPage({
      title: getFlagValue('title', args),
      subtitle: getFlagValue('subtitle', args),
      description: getFlagValue('description', args),
      price: getFlagValue('price', args),
      audience: getFlagValue('audience', args),
    });
    console.log(jsonOutput ? JSON.stringify(result, null, 2) : renderAuditResult(result));
    return;
  }

  if (command === 'launch') {
    const result = generateLaunchPlan({
      product_name: getFlagValue('product', args),
      audience: getFlagValue('audience', args),
      channels: getFlagValue('channels', args) || undefined,
      launch_angle: getFlagValue('angle', args),
    });
    console.log(jsonOutput ? JSON.stringify(result, null, 2) : renderLaunchPlan(result));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

function renderAuditResult(result) {
  return [
    `Score: ${result.score}/100`,
    '',
    'Checks:',
    ...result.checks.map((check) => `- ${check.status.toUpperCase()}: ${check.item} - ${check.recommendation}`),
    '',
    'Priority fixes:',
    ...(result.priority_fixes.length ? result.priority_fixes.map((fix) => `- ${fix}`) : ['- None']),
  ].join('\n');
}

function renderLaunchPlan(result) {
  return [
    `Angle: ${result.angle}`,
    '',
    'Prelaunch:',
    ...result.prelaunch.map((item) => `- ${item}`),
    '',
    'Launch day:',
    ...result.launch_day.map((item) => `- ${item.channel}: ${item.copy}`),
    '',
    'Follow up:',
    ...result.follow_up.map((item) => `- ${item}`),
  ].join('\n');
}

export async function startInteractiveShell() {
  printUsage();
  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      const line = compactWhitespace(await rl.question('[gumroad-seo] > '));
      if (!line || line === 'quit' || line === 'exit') break;
      if (line === 'help') {
        printUsage();
        continue;
      }

      try {
        const [product, audience = ''] = line.split('|').map((part) => part.trim());
        console.log(renderSeoResult(generateGumroadSeo({ product_name: product, audience })));
      } catch (error) {
        console.error(error.message || error);
      }
    }
  } finally {
    rl.close();
  }
}

const tools = [
  {
    name: 'generate_gumroad_seo',
    description: 'Generate Gumroad product page SEO, tags, FAQs, and launch copy for a digital product.',
    inputSchema: {
      type: 'object',
      properties: {
        product_name: { type: 'string', description: 'Name or short description of the Gumroad product.' },
        audience: { type: 'string', description: 'Target buyer or creator audience.' },
        niche: { type: 'string', description: 'Market, category, or search niche.' },
        format: { type: 'string', description: 'Product format, such as template, guide, course, or asset pack.' },
        price: { type: 'string', description: 'Optional price or price range.' },
        tone: { type: 'string', description: 'Desired copy tone.' },
      },
      required: ['product_name'],
    },
  },
  {
    name: 'audit_gumroad_page',
    description: 'Audit an existing Gumroad product page for SEO clarity and conversion readiness.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'string' },
        audience: { type: 'string' },
      },
    },
  },
  {
    name: 'generate_gumroad_launch_plan',
    description: 'Generate a lightweight launch plan and channel copy for a Gumroad product.',
    inputSchema: {
      type: 'object',
      properties: {
        product_name: { type: 'string' },
        audience: { type: 'string' },
        channels: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } },
          ],
        },
        launch_angle: { type: 'string' },
      },
      required: ['product_name'],
    },
  },
];

function callTool(name, args = {}) {
  if (name === 'generate_gumroad_seo') return generateGumroadSeo(args);
  if (name === 'audit_gumroad_page') return auditGumroadPage(args);
  if (name === 'generate_gumroad_launch_plan') return generateLaunchPlan(args);
  throw new Error(`Unknown tool: ${name}`);
}

function createResponse(request, result) {
  return {
    jsonrpc: '2.0',
    id: request.id,
    result,
  };
}

function createError(request, error, code = -32603) {
  return {
    jsonrpc: '2.0',
    id: request?.id ?? null,
    error: {
      code,
      message: error.message || String(error),
    },
  };
}

async function handleRequest(request) {
  if (request.method === 'initialize') {
    return createResponse(request, {
      protocolVersion: request.params?.protocolVersion || '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'gumroad-seo-mcp', version: pkg.version },
    });
  }

  if (request.method === 'notifications/initialized') {
    return null;
  }

  if (request.method === 'tools/list') {
    return createResponse(request, { tools });
  }

  if (request.method === 'tools/call') {
    const result = callTool(request.params?.name, request.params?.arguments || {});
    return createResponse(request, {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    });
  }

  return createError(request, new Error(`Unsupported method: ${request.method}`), -32601);
}

function writeMessage(message, framed) {
  if (!message) return;
  const payload = JSON.stringify(message);
  if (framed) {
    process.stdout.write(`Content-Length: ${Buffer.byteLength(payload, 'utf8')}\r\n\r\n${payload}`);
    return;
  }
  process.stdout.write(`${payload}\n`);
}

function parseFramedMessages(state, onMessage) {
  while (true) {
    const headerEnd = state.buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) return;

    const header = state.buffer.slice(0, headerEnd);
    const lengthMatch = header.match(/Content-Length:\s*(\d+)/i);
    if (!lengthMatch) {
      state.buffer = state.buffer.slice(headerEnd + 4);
      continue;
    }

    const length = Number(lengthMatch[1]);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + length;
    if (state.buffer.length < bodyEnd) return;

    const body = state.buffer.slice(bodyStart, bodyEnd);
    state.buffer = state.buffer.slice(bodyEnd);
    onMessage(JSON.parse(body), true);
  }
}

export function startMcpServer() {
  const state = { buffer: '', framed: false };
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (chunk) => {
    state.buffer += chunk;
    if (state.buffer.includes('Content-Length:')) {
      state.framed = true;
      parseFramedMessages(state, (request) => {
        handleRequest(request)
          .then((response) => writeMessage(response, true))
          .catch((error) => writeMessage(createError(request, error), true));
      });
      return;
    }

    const lines = state.buffer.split('\n');
    state.buffer = lines.pop() || '';
    for (const line of lines) {
      const text = line.trim();
      if (!text) continue;
      let request;
      try {
        request = JSON.parse(text);
      } catch (error) {
        writeMessage(createError(null, error, -32700), false);
        continue;
      }

      handleRequest(request)
        .then((response) => writeMessage(response, false))
        .catch((error) => writeMessage(createError(request, error), false));
    }
  });

  process.stderr.write('gumroad-seo-mcp server started\n');
}
