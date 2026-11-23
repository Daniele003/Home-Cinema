import json
import os
import tempfile
import unittest
from pathlib import Path

import scanner


class ScannerCatalogTests(unittest.TestCase):
    def test_windows_and_unix_file_urls(self):
        self.assertEqual(scanner.percorso_file_url('E:\\Film & serie\\a#1.mp4'),
                         'file:///E:/Film%20%26%20serie/a%231.mp4')
        self.assertEqual(scanner.percorso_file_url('/media/Film con spazi.mkv'),
                         'file:///media/Film%20con%20spazi.mkv')

    def test_generated_data_includes_duration_and_preserves_existing_on_error(self):
        with tempfile.TemporaryDirectory() as directory:
            old_cwd = os.getcwd()
            try:
                os.chdir(directory)
                item = {'id': 123, 'media_type': 'movie', 'title': '</script>', 'genre_ids': [28]}
                scanner.genera_html({'E:\\film.mp4': {'info_ricerca': item, 'info_dettagliate': {'runtime': 103}}})
                output = Path('local-data.js').read_text(encoding='utf-8')
                self.assertNotIn('</script>', output)
                payload = output.removeprefix('window.LOCAL_CATALOG = ').removesuffix(';\n')
                records = json.loads(payload)
                self.assertEqual(records[0]['item']['runtime'], 103)
                self.assertEqual(records[0]['item']['title'], '</script>')
                self.assertEqual(records[0]['play'], 'file:///E:/film.mp4')
                before = output
                invalid = {'id': 2, 'genre_ids': [], 'vote_average': float('nan')}
                with self.assertRaises(ValueError):
                    scanner.genera_html({'E:\\bad.mp4': {'info_ricerca': invalid}})
                self.assertEqual(Path('local-data.js').read_text(encoding='utf-8'), before)
                scanner.genera_html({'E:\\sconosciuto.mp4': {'info_ricerca': None}})
                self.assertEqual(Path('local-data.js').read_text(encoding='utf-8'), before)
            finally:
                os.chdir(old_cwd)


if __name__ == '__main__':
    unittest.main()
