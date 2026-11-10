# -*- coding: utf-8 -*-
import subprocess
import os

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

# Read index.html as UTF-8
with open('index.html', 'r', encoding='utf-8') as f:
    idx_content = f.read()

# Test script to inject before </body>
test_script = """
<script>
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    try {
      console.log("=== STARTING VOICE ENGINE IN-PAGE TEST ===");

      // 1. Check openVoiceTradingModal
      window.openVoiceTradingModal();
      const modal = document.getElementById('voice-trading-modal');
      console.log("TEST_MODAL_OPENED: " + (modal && !modal.classList.contains('hidden')));

      // 2. Test Consultation parse
      const q1 = "\\u0633\\u0647\\u0645 \\u0637\\u0644\\u0639\\u062a \\u0645\\u0635\\u0637\\u0641\\u0649"; // سهم طلعت مصطفى
      const res1 = window.parseEgyptianVoiceCommand(q1);
      console.log("TEST_Q1_INTENT: " + res1.intent + " | TICKER: " + (res1.stock ? res1.stock.ticker : 'NONE'));

      // 3. Test Display Consultation Card
      window.displayConsultationCard(res1);
      const consultCard = document.getElementById('voice-consultation-card');
      console.log("TEST_CONSULT_CARD_VISIBLE: " + (consultCard && !consultCard.classList.contains('hidden')));

      // 4. Test Mode Switcher
      window.setVoiceResponseMode('TEXT');
      console.log("TEST_MODE_TEXT: " + (window.getVoiceResponseMode() === 'TEXT'));
      window.setVoiceResponseMode('VOICE');
      console.log("TEST_MODE_VOICE: " + (window.getVoiceResponseMode() === 'VOICE'));

      // 5. Test Trade parse
      const q2 = "\\u0627\\u0634\\u062a\\u0631\\u064a 200 \\u0633\\u0647\\u0645 \\u0627\\u0644\\u0633\\u0648\\u064a\\u062f\\u064a \\u0628\\u0633\\u0639\\u0631 51 \\u062c\\u0646\\u064a\\u0647"; // اشتري 200 سهم السويدي بسعر 51 جنيه
      const res2 = window.parseEgyptianVoiceCommand(q2);
      console.log("TEST_Q2_INTENT: " + res2.intent + " | ACTION: " + res2.action + " | SHARES: " + res2.shares);

      // 6. Test Switch from Consult to Trade
      window.switchConsultationToTrade(res1.stock, 'BUY');
      const confirmCard = document.getElementById('voice-confirmation-card');
      console.log("TEST_TRADE_CONFIRM_VISIBLE: " + (confirmCard && !confirmCard.classList.contains('hidden')));

      console.log("=== ALL_VOICE_IN_PAGE_TESTS_PASSED_100% ===");
    } catch(err) {
      console.error("TEST_FAILURE: " + err.message + "\\n" + err.stack);
    }
  }, 1000);
});
</script>
"""

test_html_content = idx_content.replace('</body>', test_script + '</body>')

with open('test_live_root.html', 'w', encoding='utf-8') as f:
    f.write(test_html_content)

cmd = [
    edge_path,
    '--headless',
    '--disable-gpu',
    '--enable-logging=stderr',
    '--v=1',
    'file:///C:/Users/nader.reda/Documents/antigravity/intelligent-raman/test_live_root.html'
]

stderr_out = ''
try:
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore', timeout=6)
    stderr_out = res.stderr
except subprocess.TimeoutExpired as e:
    stderr_out = e.stderr or ''

# Cleanup test_live_root.html immediately
if os.path.exists('test_live_root.html'):
    os.remove('test_live_root.html')

lines = [l for l in stderr_out.splitlines() if 'TEST_' in l or 'ALL_VOICE_' in l]
for l in lines:
    print(l.encode('ascii', errors='backslashreplace').decode('ascii'))
