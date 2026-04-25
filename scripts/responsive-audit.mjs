const BASE_URL = process.env.RESPONSIVE_BASE_URL || 'http://localhost:3101';
const DEBUG_URL = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9222';

const routes = [
  '/',
  '/guides',
  '/guides/model-selection-mistakes',
  '/guides/choose-ai-model-by-gpu-budget',
  '/compare',
  '/recommender',
  '/gpu',
  '/gpu/hardware',
  '/gpu/execution',
  '/gpu/performance',
  '/gpu/tools/vram-calculator',
  '/gpu/tools/gpu-picker',
  '/gpu/tools/roofline-model-analyzer',
  '/gpu/tools/kernel-occupancy-estimator',
  '/gpu/tools/warp-divergence',
  '/ai-inference',
  '/ai-inference/tutorial',
  '/ai-updates',
  '/coding-model-analysis',
  '/about',
  '/editorial-policy',
  '/contact',
  '/privacy',
  '/terms',
];

const viewports = [
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1366', width: 1366, height: 900 },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function newPage() {
  const res = await fetch(`${DEBUG_URL}/json/new`, { method: 'PUT' });
  if (!res.ok) throw new Error(`Unable to create Chrome tab: ${res.status}`);
  const data = await res.json();
  return data.webSocketDebuggerUrl;
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  });

  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  return {
    async send(method, params = {}) {
      await ready;
      const messageId = ++id;
      ws.send(JSON.stringify({ id: messageId, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(messageId, { resolve, reject });
        setTimeout(() => {
          if (pending.has(messageId)) {
            pending.delete(messageId);
            reject(new Error(`Timed out waiting for ${method}`));
          }
        }, 20000);
      });
    },
    close() {
      ws.close();
    },
  };
}

async function waitForLoad(client) {
  for (let i = 0; i < 80; i += 1) {
    const result = await client.send('Runtime.evaluate', {
      expression: 'document.readyState',
      returnByValue: true,
    });
    if (result.result.value === 'complete') return;
    await delay(250);
  }
}

async function auditRoute(client, route, viewport) {
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width < 768,
  });
  await client.send('Page.navigate', { url: `${BASE_URL}${route}` });
  await waitForLoad(client);
  await delay(750);

  const result = await client.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const doc = document.documentElement;
      const body = document.body;
      const viewportWidth = window.innerWidth;
      const pageWidth = Math.max(doc.scrollWidth, body ? body.scrollWidth : 0);
      const offenders = [...document.querySelectorAll('body *')]
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return { el, rect };
        })
        .filter(({ rect }) => rect.width > 0 && rect.height > 0 && (rect.right > viewportWidth + 2 || rect.left < -2))
        .slice(0, 8)
        .map(({ el, rect }) => ({
          tag: el.tagName.toLowerCase(),
          className: String(el.className || '').slice(0, 220),
          text: String(el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 100),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        }));
      const overlaps = [...document.querySelectorAll('button, a, input, select, textarea')]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.width < 28 || rect.height < 28);
        })
        .slice(0, 6)
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          className: String(el.className || '').slice(0, 160),
          text: String(el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 80),
          width: Math.round(el.getBoundingClientRect().width),
          height: Math.round(el.getBoundingClientRect().height),
        }));
      return {
        url: location.pathname,
        viewportWidth,
        pageWidth,
        overflow: pageWidth - viewportWidth,
        offenders,
        tinyControls: overlaps,
      };
    })()`,
  });

  return result.result.value;
}

async function main() {
  const wsUrl = await newPage();
  const client = connect(wsUrl);
  await client.send('Page.enable');
  await client.send('Runtime.enable');

  const failures = [];
  for (const route of routes) {
    for (const viewport of viewports) {
      try {
        const result = await auditRoute(client, route, viewport);
        if (result.overflow > 2 || result.offenders.length > 0) {
          failures.push({ route, viewport: viewport.name, ...result });
        }
        console.log(`${result.overflow > 2 ? 'FAIL' : 'PASS'} ${viewport.name.padEnd(12)} ${route} overflow=${result.overflow}`);
      } catch (error) {
        failures.push({ route, viewport: viewport.name, error: error.message });
        console.log(`ERROR ${viewport.name.padEnd(12)} ${route} ${error.message}`);
      }
    }
  }

  client.close();

  console.log('\nResponsive audit summary');
  if (!failures.length) {
    console.log('No horizontal overflow found on audited routes.');
    return;
  }

  for (const failure of failures) {
    console.log(`\n${failure.viewport} ${failure.route}`);
    if (failure.error) {
      console.log(`  error: ${failure.error}`);
      continue;
    }
    console.log(`  pageWidth=${failure.pageWidth} viewport=${failure.viewportWidth} overflow=${failure.overflow}`);
    for (const offender of failure.offenders) {
      console.log(`  - <${offender.tag}> right=${offender.right} width=${offender.width} text="${offender.text}" class="${offender.className}"`);
    }
  }

  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
