with open('js/ui.js', encoding='utf-8') as f:
    text = f.read()

open_braces = 0
close_braces = 0
in_str = None
in_comment = False
in_multiline_comment = False
escape = False

i = 0
n = len(text)
line = 1
col = 1
brace_stack = []

# Note: In template literals `${...}`, we can have expressions!
# For simple JS parser, we can evaluate syntax directly using Edge or simple parser.
while i < n:
    c = text[i]
    if c == '\n':
        line += 1
        col = 1
    else:
        col += 1
        
    if in_multiline_comment:
        if c == '*' and i + 1 < n and text[i+1] == '/':
            in_multiline_comment = False
            i += 1
    elif in_comment:
        if c == '\n':
            in_comment = False
    elif in_str:
        if escape:
            escape = False
        elif c == '\\':
            escape = True
        elif in_str == '`' and c == '$' and i + 1 < n and text[i+1] == '{':
            # template literal expression start!
            brace_stack.append(('template', line, col))
            i += 1
        elif c == in_str:
            in_str = None
    else:
        if c == '/' and i + 1 < n and text[i+1] == '*':
            in_multiline_comment = True
            i += 1
        elif c == '/' and i + 1 < n and text[i+1] == '/':
            in_comment = True
            i += 1
        elif c in ('"', "'", '`'):
            in_str = c
        elif c == '{':
            brace_stack.append(('code', line, col))
        elif c == '}':
            if brace_stack:
                popped = brace_stack.pop()
                if popped[0] == 'template':
                    in_str = '`'
            else:
                print(f'Extra closing brace at line {line}:{col}')
    i += 1

print(f'Unclosed braces count: {len(brace_stack)}')
for b in brace_stack[-10:]:
    print(f'Unclosed {b[0]} at line {b[1]}:{b[2]}')
