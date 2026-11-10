import re

# 1. Update api/cron.js
with open('api/cron.js', 'r', encoding='utf-8') as f:
    cron_code = f.read()

cron_target = """    // Autonomous Background Push Alert Dispatch if critical breakdown is detected
    const criticals = findings.filter(f => f.action === 'STOP_LOSS_WARNING' || f.alert_level === 'CRITICAL_RISK');
    if (criticals.length > 0) {
      try {
        const firstCrit = criticals[0];
        const host = req.headers?.['x-forwarded-host'] || req.headers?.host || 'localhost:3000';
        const proto = req.headers?.['x-forwarded-proto'] || 'https';
        fetch(`${proto}://${host}/api/send-push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `🚨 تنبيه كسر دعم فني في البورصة (${firstCrit.ticker})`,
            body: `${firstCrit.advice} (السعر الحالي: ${firstCrit.price})`,
            url: '/'
          })
        }).catch(() => {});
      } catch (pushErr) {
        console.warn('Autonomous push dispatch notice:', pushErr.message);
      }
    }"""

cron_replacement = """    // Autonomous Background Push Alert Dispatch (Breakdowns & Profit Targets)
    const host = req.headers?.['x-forwarded-host'] || req.headers?.host;
    const proto = req.headers?.['x-forwarded-proto'] || 'https';
    const baseUrl = (host && !host.includes('localhost')) ? `${proto}://${host}` : 'https://egx-ai-copilot.vercel.app';

    const criticals = findings.filter(f => f.action === 'STOP_LOSS_WARNING' || f.alert_level === 'CRITICAL_RISK');
    const profitTargets = findings.filter(f => f.action === 'TAKE_PROFIT_R1' || f.alert_level === 'POSITIVE_CATALYST');

    let pushAlert = null;
    if (criticals.length > 0) {
      const c = criticals[0];
      pushAlert = {
        title: `🚨 تنبيه كسر دعم فني (${c.ticker})`,
        body: `${c.advice} (السعر اللحظي: ${c.price})`,
        url: '/',
        tag: `egx-stop-${c.ticker}`
      };
    } else if (profitTargets.length > 0) {
      const p = profitTargets[0];
      pushAlert = {
        title: `🎯 تنبيه بلوغ مستهدف جني الأرباح (${p.ticker})`,
        body: `${p.advice} (السعر اللحظي: ${p.price})`,
        url: '/',
        tag: `egx-target-${p.ticker}`
      };
    }

    if (pushAlert) {
      try {
        await fetch(`${baseUrl}/api/send-push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pushAlert)
        }).catch(() => {});
      } catch (pushErr) {
        console.warn('Autonomous push dispatch notice:', pushErr.message);
      }
    }"""

norm_cron = cron_code.replace('\r\n', '\n')
norm_cron_target = cron_target.replace('\r\n', '\n')
norm_cron_replacement = cron_replacement.replace('\r\n', '\n')

assert norm_cron_target in norm_cron, "Target not found in api/cron.js"
norm_cron = norm_cron.replace(norm_cron_target, norm_cron_replacement)

with open('api/cron.js', 'w', encoding='utf-8') as f:
    f.write(norm_cron.replace('\n', '\r\n') if '\r\n' in cron_code else norm_cron)
print("api/cron.js patched!")

# 2. Update js/push-notifications.js
with open('js/push-notifications.js', 'r', encoding='utf-8') as f:
    push_code = f.read()

push_target = """      // Check current subscription in PushManager
      if ('PushManager' in window && swRegistration.pushManager) {
        const subscription = await swRegistration.pushManager.getSubscription();
        if (subscription) {
          isSubscribed = true;
          // Silently sync with server to ensure this device stays in the cloud push list
          registerSubscriptionWithServer(subscription).catch(() => {});
        } else {
          isSubscribed = Notification.permission === 'granted';
        }
      } else {
        isSubscribed = Notification.permission === 'granted';
      }"""

push_replacement = """      // Check current subscription in PushManager
      if ('PushManager' in window && swRegistration.pushManager) {
        let subscription = await swRegistration.pushManager.getSubscription();
        if (!subscription && Notification.permission === 'granted') {
          // Auto-subscribe immediately on Android if permission was granted previously
          try {
            const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            subscription = await swRegistration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedKey
            });
            console.log('✅ Android Device Auto-Subscribed to Cloud Push:', subscription.endpoint);
          } catch (autoSubErr) {
            console.warn('Auto subscribe error on Android:', autoSubErr);
          }
        }

        if (subscription) {
          isSubscribed = true;
          // Silently sync with server to ensure this device stays in the cloud push list
          registerSubscriptionWithServer(subscription).catch(() => {});
        } else {
          isSubscribed = Notification.permission === 'granted';
        }
      } else {
        isSubscribed = Notification.permission === 'granted';
      }"""

norm_push = push_code.replace('\r\n', '\n')
norm_push_target = push_target.replace('\r\n', '\n')
norm_push_replacement = push_replacement.replace('\r\n', '\n')

assert norm_push_target in norm_push, "Target not found in js/push-notifications.js"
norm_push = norm_push.replace(norm_push_target, norm_push_replacement)

with open('js/push-notifications.js', 'w', encoding='utf-8') as f:
    f.write(norm_push.replace('\n', '\r\n') if '\r\n' in push_code else norm_push)
print("js/push-notifications.js patched!")

# 3. Update sw.js for Android
with open('sw.js', 'r', encoding='utf-8') as f:
    sw_code = f.read()

sw_target = """  // Full-featured options for modern Android & Desktop
  const fullOptions = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200, 100, 200],
    data: { url: payload.url || '/' },
    tag: payload.tag || 'egx-market-alert',
    renotify: true,
    dir: 'rtl',
    lang: 'ar'
  };"""

sw_replacement = """  // Full-featured options for modern Android & Desktop
  const fullOptions = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [300, 150, 300, 150, 300],
    data: { url: payload.url || '/' },
    tag: payload.tag || 'egx-market-alert',
    renotify: true,
    requireInteraction: true,
    dir: 'rtl',
    lang: 'ar'
  };"""

norm_sw = sw_code.replace('\r\n', '\n')
norm_sw_target = sw_target.replace('\r\n', '\n')
norm_sw_replacement = sw_replacement.replace('\r\n', '\n')

assert norm_sw_target in norm_sw, "Target not found in sw.js"
norm_sw = norm_sw.replace(norm_sw_target, norm_sw_replacement)

with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(norm_sw.replace('\n', '\r\n') if '\r\n' in sw_code else norm_sw)
print("sw.js patched!")

# 4. Update .github/workflows/market_bot.yml
with open('.github/workflows/market_bot.yml', 'r', encoding='utf-8') as f:
    bot_code = f.read()

bot_target = """on:
  schedule:
    # Sunday - Thursday (Trading Hours Cairo: 10:30 AM, 01:00 PM, 03:30 PM)
    - cron: '30 7 * * 0-4'
    - cron: '0 10 * * 0-4'
    - cron: '30 12 * * 0-4'
    # Saturday (Weekend Technical & Disclosure Audit: 09:00 PM Cairo)
    - cron: '0 18 * * 6'
  workflow_dispatch:"""

bot_replacement = """on:
  schedule:
    # Sunday - Thursday (Trading Hours Cairo: Every 30 mins from 10:00 AM to 02:30 PM Cairo)
    - cron: '0 8,9,10,11,12 * * 0-4'
    - cron: '30 7,8,9,10,11,12 * * 0-4'
    # Evening Audit (09:00 PM Cairo)
    - cron: '0 18 * * 0-4'
  workflow_dispatch:"""

bot_step_target = """      - name: Commit & Push Ledger Updates
        run: |
          git config --global user.name "egx-ai-bot[bot]"
          git config --global user.email "bot@egx-ai-copilot.local"
          git add trading_ledger.json
          git diff --quiet && git diff --staged --quiet || (git commit -m "chore(bot): autonomous market scan and real ledger sync [skip ci]" && git push)"""

bot_step_replacement = """      - name: Trigger Cloud Serverless Scan & Dispatch Background Web Push to Android
        run: |
          curl -s -X GET "https://egx-ai-copilot.vercel.app/api/cron" -H "User-Agent: GitHub-Actions-EGX-Bot" || true

      - name: Commit & Push Ledger Updates
        run: |
          git config --global user.name "egx-ai-bot[bot]"
          git config --global user.email "bot@egx-ai-copilot.local"
          git add trading_ledger.json
          git diff --quiet && git diff --staged --quiet || (git commit -m "chore(bot): autonomous market scan and real ledger sync [skip ci]" && git push)"""

norm_bot = bot_code.replace('\r\n', '\n')
norm_bot = norm_bot.replace(bot_target.replace('\r\n', '\n'), bot_replacement.replace('\r\n', '\n'))
norm_bot = norm_bot.replace(bot_step_target.replace('\r\n', '\n'), bot_step_replacement.replace('\r\n', '\n'))

with open('.github/workflows/market_bot.yml', 'w', encoding='utf-8') as f:
    f.write(norm_bot.replace('\n', '\r\n') if '\r\n' in bot_code else norm_bot)
print(".github/workflows/market_bot.yml patched!")

# 5. Update vercel.json
with open('vercel.json', 'r', encoding='utf-8') as f:
    vercel_code = f.read()

vercel_code = re.sub(r'"schedule":\s*"0 18 \* \* 0-4"', '"schedule": "0 10 * * 0-4"', vercel_code)
with open('vercel.json', 'w', encoding='utf-8') as f:
    f.write(vercel_code)
print("vercel.json patched!")

print("\n>>> ALL 5 NOTIFICATION & ANDROID BACKGROUND PUSH MODULES PATCHED 100%! <<<")
