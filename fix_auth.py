
import re
with open("server/replit_integrations/auth/replitAuth.ts", "r") as f:
    content = f.read()
lines = content.split(chr(10))
for i, line in enumerate(lines):
    print(f"{i+1}: {line}")
