with open('js/voice-assistant.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('scratch/voice_modal_dump.txt', 'w', encoding='utf-8') as out:
    for i in range(335, min(500, len(lines))):
        out.write(f"{i+1}: {lines[i]}")

print("Dumped voice modal to scratch/voice_modal_dump.txt")
