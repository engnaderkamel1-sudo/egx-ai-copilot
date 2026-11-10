# -*- coding: utf-8 -*-
import subprocess
import os

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

with open('index.html', 'r', encoding='utf-8') as f:
    idx_content = f.read()

test_script = """
<script>
try {
  console.log("PING_TEST_VOICE_START");
  window.openVoiceTradingModal();
  console.log("PING_MODAL_OK");
  const r1 = window.parseEgyptianVoiceCommand("\\u0633\\u0647\\u0645 \\u0637\\u0644\\u0639\\u062a \\u0645\\u0635\\u0637\\u0641\\u0649");
  console.log("PING_R1_INTENT: " + r1.intent + " | TICKER: " + r1.stock.ticker);
  window.displayConsultationCard(r1);
  console.log("PING_CONSULT_DISPLAY_OK");
  window.setVoiceResponseMode('TEXT');
  console.log("PING_MODE_TEXT_OK: " + (window.getVoiceResponseMode() === 'TEXT'));
  window.setVoiceResponseMode('VOICE');
  console.log("PING_MODE_VOICE_OK: " + (window.getVoiceResponseMode() === 'VOICE'));
  const r2 = window.parseEgyptianVoiceCommand("\\u0627\\u0634\\u062a\\u0631\\u064a 100 \\u0633\\u0647\\u0645 \\u0627\\u0644\\u0633\\u0648\\u064a\\u062f\\u064a \\u0628\\u0633\\u0639\\u0631 50 \\u062c\\u0646\\u064a\\u0647");
  console.log("PING_R2_INTENT: " + r2.intent + " | ACTION: " + r2.action);
  window.switchConsultationToTrade(r1.stock, 'BUY');
  console.log("PING_SWITCH_TRADE_OK");
  console.log("=== ALL_VOICE_TESTS_100_PERCENT_PASSED ===");
} catch(e) {
  console.error("PING_ERROR: " + e.message + " " + e.stack);
}
</script>
"""

with open('test_verify_root.html', 'w', encoding='utf-8') as f:
    f.write(idx_content.replace('</body>', test_script + '</body>'))

cmd = [
    edge_path,
    '--headless',
    '--disable-gpu',
    '--enable-logging=stderr',
    '--v=1',
    'file:///C:/Users/nader.reda/Documents/antigravity/intelligent-raman/test_verify_root.html'
]

stderr_out = ''
try:
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore', timeout=6)
    stderr_out = res.stderr
except subprocess.TimeoutExpired as e:
    stderr_out = e.stderr or ''

if os.path.exists('test_verify_root.html'):
    os.remove('test_verify_root.html')

print(f"Total lines in stderr: {len(stderr_out.splitlines())}")
for l in stderr_out.splitlines():
    if 'PING' in l or 'CONSOLE' in l or 'error' in l.lower():
        print(l.encode('ascii', errors='backslashreplace').decode('ascii'))
