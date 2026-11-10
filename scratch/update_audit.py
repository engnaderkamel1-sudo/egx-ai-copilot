with open('tests/audit_buttons.ps1', 'r', encoding='utf-8') as f:
    text = f.read()

voice_fns = """  'openVoiceTradingModal', 'closeVoiceTradingModal', 'toggleVoiceRecording', 'toggleChatVoiceInput',
  'parseVoiceFromManualInput', 'testVoiceCommandSample', 'executeVoiceOrderFromModal', 'resetVoiceModalToListen',"""

target = "'toggleTradeCustomTicker', 'triggerCloudScanNow', 'triggerSimulatedBotCycle'"
replacement = voice_fns + "\n  " + target

assert target in text, "Target not found in audit_buttons.ps1"
text = text.replace(target, replacement)

with open('tests/audit_buttons.ps1', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated audit_buttons.ps1 successfully')
