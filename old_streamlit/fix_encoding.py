"""
Fix encoding issues in all Python files
"""
import os
import glob

def check_and_fix_encoding(filepath):
    """Check if file has encoding issues and fix if needed"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Check for encoding issues (corrupted characters)
            if any(ord(char) == 0xFFFD or ord(char) > 0x10000 for char in content[:100]):
                return False, "Has encoding issues"
            return True, "OK"
    except UnicodeDecodeError:
        return False, "Cannot decode"
    except Exception as e:
        return False, str(e)

# Check all Python files in pages directory
pages_dir = "pages"
files = glob.glob(os.path.join(pages_dir, "*.py"))

print("Checking encoding for all page files...")
print("-" * 50)

issues = []
for filepath in files:
    filename = os.path.basename(filepath)
    is_ok, status = check_and_fix_encoding(filepath)
    print(f"{filename}: {status}")
    if not is_ok:
        issues.append(filename)

print("-" * 50)
if issues:
    print(f"Files with encoding issues: {', '.join(issues)}")
else:
    print("All files are OK!")