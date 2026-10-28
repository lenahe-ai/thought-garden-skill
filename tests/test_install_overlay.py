import json
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'skills/thought-garden/scripts/install_overlay.py'

class InstallerTests(unittest.TestCase):
    def test_fresh_install_and_refusal(self):
        with tempfile.TemporaryDirectory() as folder:
            p = Path(folder)
            (p / '.openai').mkdir()
            (p / 'package.json').write_text('{}')
            manifest = json.dumps({'project_id': 'fictional-new-site'})
            (p / '.openai/hosting.json').write_text(manifest)
            def run(*extra):
                return subprocess.run([__import__('sys').executable, str(SCRIPT), folder, *extra], capture_output=True, text=True)
            self.assertEqual(run('--check').returncode, 0)
            self.assertFalse((p / 'app').exists())
            self.assertEqual(run().returncode, 0)
            self.assertEqual((p / '.openai/hosting.json').read_text(), manifest)
            self.assertNotEqual(run().returncode, 0)
    def test_existing_migrations_preserved(self):
        with tempfile.TemporaryDirectory() as folder:
            p = Path(folder)
            (p / '.openai').mkdir()
            (p / 'package.json').write_text('{}')
            (p / '.openai/hosting.json').write_text('{}')
            (p / 'drizzle').mkdir()
            (p / 'drizzle/0000.sql').write_text('-- existing database')
            r = subprocess.run([__import__('sys').executable, str(SCRIPT), folder], capture_output=True)
            self.assertNotEqual(r.returncode, 0)
            self.assertFalse((p / 'app').exists())

if __name__ == '__main__':
    unittest.main()
