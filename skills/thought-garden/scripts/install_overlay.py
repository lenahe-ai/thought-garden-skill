#!/usr/bin/env python3
"""Install the clean app overlay into a fresh Sites Vinext starter."""
import argparse
import shutil
from pathlib import Path

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('destination', type=Path)
    p.add_argument('--check', action='store_true', help='Validate and show the copy plan without writing')
    args = p.parse_args()
    dest = args.destination.resolve()
    source = Path(__file__).resolve().parents[1] / 'assets' / 'site-overlay'
    if not (dest / 'package.json').is_file() or not (dest / '.openai' / 'hosting.json').is_file():
        p.error('Prepare a fresh Sites Vinext starter first (package.json and hosting manifest required).')
    if (dest / 'app' / 'garden.tsx').exists() or (dest / '.thought-garden-installed').exists():
        p.error('A garden already exists here. Refusing to overwrite it.')
    if any((dest / 'drizzle').glob('*.sql')):
        p.error('Migration history exists. Use a fresh starter; do not overwrite existing storage.')
    files = sorted(x for x in source.rglob('*') if x.is_file())
    for file in files:
        relative = file.relative_to(source)
        target = dest / relative
        if not target.resolve().is_relative_to(dest):
            p.error('Destination symlink leaves the selected project.')
        if not args.check:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(file, target)
    if not args.check:
        (dest / '.thought-garden-installed').write_text('Clean Thought Garden app overlay installed.\n')
    print(f'{"Would install" if args.check else "Installed"} {len(files)} app/schema files. Hosting identity unchanged.')
    print('Next: configure D1 DB; generate and apply a fresh migration; build and verify private access.')

if __name__ == '__main__':
    main()
