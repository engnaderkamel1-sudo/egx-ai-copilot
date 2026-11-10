import glob
import subprocess

for fn in sorted(glob.glob('js/*.js') + glob.glob('api/*.js')):
    # Use python to check if basic bracket counts match or run Windows Script Host
    with open(fn, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check open/close braces outside strings
    print(f"Checking {fn} length {len(content)}")
