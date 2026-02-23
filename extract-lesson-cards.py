#!/usr/bin/env python3
"""
Extract learning cards from lesson PDFs.
Parses vocabulary tables, sample sentences, and dialogue from each lesson PDF
and outputs a structured JSON file for use in the FamLingo app.

Handles two PDF formats:
  - Levels 1-4: Sections titled "SIMPLIFIED CHINESE", "TRADITIONAL CHINESE", "PINYIN", "ENGLISH"
  - Level 5: Sections titled "DIALOGUE - CHINESE" (with \x01 separators), "ENGLISH", "PINYIN"
"""

import fitz  # PyMuPDF
import json
import re
import unicodedata
from pathlib import Path

RESOURCES_DIR = Path("resources/courses")
OUTPUT_FILE = Path("src/data/course-cards.json")

# CJK Compatibility Ideographs -> Standard CJK Unified Ideographs
CJK_COMPAT_MAP = {}
def build_cjk_compat_map():
    """Build mapping from CJK compatibility forms to standard forms."""
    # CJK Compatibility Ideographs (F900-FAFF) and CJK Radicals Supplement (2E80-2EFF)
    # plus CJK Radicals (2F00-2FDF)
    for cp in range(0x2E80, 0x2FE0):
        char = chr(cp)
        decomp = unicodedata.decomposition(char)
        if decomp:
            parts = decomp.split()
            # Take the last codepoint as the standard form
            try:
                standard = chr(int(parts[-1], 16))
                CJK_COMPAT_MAP[char] = standard
            except (ValueError, IndexError):
                pass
    for cp in range(0xF900, 0xFB00):
        char = chr(cp)
        decomp = unicodedata.decomposition(char)
        if decomp:
            parts = decomp.split()
            try:
                standard = chr(int(parts[-1], 16))
                CJK_COMPAT_MAP[char] = standard
            except (ValueError, IndexError):
                pass

build_cjk_compat_map()

# Manual mappings for CJK radicals without decomposition -> standard simplified Chinese
MANUAL_CJK_MAP = {
    '\u2EA0': '\u6C11',  # ⺠ -> 民 (CIVILIAN)
    '\u2EC4': '\u897F',  # ⻄ -> 西 (WEST)
    '\u2EC5': '\u89C1',  # ⻅ -> 见 (SEE)
    '\u2EC9': '\u8D1D',  # ⻉ -> 贝 (SHELL)
    '\u2ECB': '\u8F66',  # ⻋ -> 车 (CART)
    '\u2ED1': '\u957F',  # ⻑ -> 长 (LONG ONE)
    '\u2ED3': '\u957F',  # ⻓ -> 长 (LONG)
    '\u2EDA': '\u9875',  # ⻚ -> 页 (LEAF/PAGE)
    '\u2EDB': '\u98CE',  # ⻛ -> 风 (WIND)
    '\u2EDD': '\u98DF',  # ⻝ -> 食 (EAT)
    '\u2EE2': '\u9A6C',  # ⻢ -> 马 (HORSE)
    '\u2EE5': '\u9C7C',  # ⻥ -> 鱼 (FISH)
    '\u2EE8': '\u9EA6',  # ⻨ -> 麦 (WHEAT)
    '\u2EE9': '\u9EC4',  # ⻩ -> 黄 (YELLOW)
    '\u2EEC': '\u9F50',  # ⻬ -> 齐 (EVEN)
    '\u2EF0': '\u9F99',  # ⻰ -> 龙 (DRAGON)
    '\u2E9F': '\u6BCD',  # ⺟ -> 母 (MOTHER)
}
CJK_COMPAT_MAP.update(MANUAL_CJK_MAP)

def fix_cjk_compat(text):
    """Replace CJK compatibility ideographs with standard forms."""
    result = []
    for char in text:
        result.append(CJK_COMPAT_MAP.get(char, char))
    return ''.join(result)


def extract_text_dict(pdf_path):
    """Extract text using dict mode (preserves word boundaries via spans)."""
    doc = fitz.open(pdf_path)
    all_lines = []
    for page in doc:
        blocks = page.get_text('dict')['blocks']
        for block in blocks:
            if 'lines' not in block:
                continue
            for line in block['lines']:
                text = ' '.join(span['text'] for span in line['spans'])
                all_lines.append(text)
    doc.close()
    return all_lines


def extract_text_plain(pdf_path):
    """Extract all text from a PDF as plain text."""
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    doc.close()
    return full_text


def clean_line(line):
    """Clean a single line: remove control chars, fix CJK, normalize spaces."""
    # Replace \x01 with space (Level 5 PDF word separator)
    line = line.replace('\x01', ' ')
    # Fix CJK compatibility chars
    line = fix_cjk_compat(line)
    # Normalize multiple spaces
    line = re.sub(r'  +', ' ', line).strip()
    # Fix ligatures
    line = line.replace('ﬁ', 'fi').replace('ﬂ', 'fl').replace('ﬀ', 'ff').replace('ﬃ', 'ffi').replace('ﬄ', 'ffl')
    return line


def clean_text(text):
    """Clean full extracted text."""
    text = re.sub(r'CHI\s*NES\s*ECLAS\s*S\s*101\.COM.*?\n', '\n', text)
    text = re.sub(r'CHINESECLASS101\.COM.*?\n', '\n', text)
    text = re.sub(r'^\d+\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r"CONT'D OVER\s*", '', text)
    text = text.replace('\x01', ' ')
    text = fix_cjk_compat(text)
    text = text.replace('ﬁ', 'fi').replace('ﬂ', 'fl').replace('ﬀ', 'ff').replace('ﬃ', 'ffi').replace('ﬄ', 'ffl')
    # Remove level header lines that leak into content
    text = re.sub(r'(?:ABSOLUTE BEGINNER|BEGINNER|ELEMENTARY|LOWER INTERMEDIATE|INTERMEDIATE|UPPER INTERMEDIATE)\s+(?:S\d+|SEASON)\s+(?:S\d+\s+)?#\d+', '', text)
    return text


def detect_pdf_format(lines):
    """Detect whether this is format A (levels 1-4) or format B (level 5)."""
    joined = ' '.join(lines[:30])
    if 'DIALOGUE' in joined and 'CHINESE' in joined:
        return 'B'  # Level 5 format
    return 'A'  # Standard format


def extract_lesson_title_from_lines(lines):
    """Extract lesson title from dict-mode lines."""
    # Look for LESSON NOTES or LESSONNOTES header
    title_lines = []
    in_title = False
    for line in lines[:20]:
        cl = clean_line(line)
        if 'LESSON NOTES' in cl or 'LESSONNOTES' in cl:
            in_title = True
            continue
        if in_title:
            if 'CONTENTS' in cl or cl.startswith('#') or cl.startswith('COPYRIGHT'):
                break
            if cl:
                title_lines.append(cl)

    if len(title_lines) >= 2:
        # First line is level descriptor, rest is title
        return ' '.join(title_lines[1:])
    elif title_lines:
        return title_lines[0]
    return None


def extract_lesson_title_plain(text):
    """Extract lesson title from plain text."""
    match = re.search(r'LESSON\s*NOTES\s*\n(.*?)(?:CONTENTS|# \d)', text, re.DOTALL)
    if match:
        lines = [l.strip() for l in match.group(1).strip().split('\n') if l.strip()]
        if len(lines) >= 2:
            return ' '.join(lines[1:])
        elif lines:
            return lines[0]
    return None


# ─── Format A: Levels 1-4 ───

def parse_dialogue_format_a(text):
    """Parse dialogue from format A PDFs (separate CN/PY/EN sections)."""
    dialogue = []

    cn_match = re.search(r'SIMPLIFIED CHINESE\s*\n(.*?)(?:TRADITIONAL CHINESE|PINYIN)', text, re.DOTALL)
    cn_lines = parse_numbered_lines(cn_match.group(1)) if cn_match else []

    py_match = re.search(r'PINYIN\s*\n(.*?)(?:ENGLISH)', text, re.DOTALL)
    py_lines = parse_numbered_lines(py_match.group(1)) if py_match else []

    en_match = re.search(r'ENGLISH\s*\n(.*?)(?:VOCABULARY|$)', text, re.DOTALL)
    en_lines = parse_numbered_lines(en_match.group(1)) if en_match else []

    max_lines = max(len(cn_lines), len(py_lines), len(en_lines))
    for i in range(max_lines):
        cn = cn_lines[i] if i < len(cn_lines) else ""
        py = py_lines[i] if i < len(py_lines) else ""
        en = en_lines[i] if i < len(en_lines) else ""
        if cn or py or en:
            dialogue.append({"cn": cn.strip(), "pinyin": py.strip(), "en": en.strip()})

    return dialogue


def parse_numbered_lines(text):
    """Parse numbered lines from dialogue sections (format A)."""
    lines = []
    parts = re.split(r'(?:^|\n)\s*(\d+)\.\s*\n', text)

    for i in range(1, len(parts), 2):
        if i + 1 < len(parts):
            content = parts[i + 1].strip()
            content = re.sub(r'^[A-Z]:\s*\n?', '', content).strip()
            content = re.sub(r'\s*\n\s*', ' ', content).strip()
            content = re.sub(r'\s*\d+\.\s*$', '', content).strip()
            if content:
                lines.append(content)

    return lines


# ─── Format B: Level 5 ───

def parse_dialogue_format_b(lines):
    """Parse dialogue from format B PDFs (Level 5, dict-mode lines)."""
    dialogue = []

    # Find sections by scanning lines
    sections = {'cn': [], 'en': [], 'pinyin': []}
    current_section = None

    for raw_line in lines:
        line = clean_line(raw_line)
        upper = line.upper().strip()

        # Detect section headers
        if 'DIALOGUE' in upper and 'CHINESE' in upper:
            current_section = None  # Wait for SIMPLIFIED
            continue
        if upper == 'SIMPLIFIED':
            current_section = 'cn'
            continue
        if upper == 'ENGLISH':
            current_section = 'en'
            continue
        if upper == 'PINYIN':
            current_section = 'pinyin'
            continue
        if upper in ('VOCABULARY', 'VOCAB', 'SAMPLE SENTENCES', 'GRAMMAR', 'CULTURAL INSIGHT'):
            current_section = None
            continue

        if current_section and line:
            sections[current_section].append(line)

    # Parse each section's numbered lines
    cn_lines = parse_numbered_inline(sections['cn'])
    en_lines = parse_numbered_inline(sections['en'])
    py_lines = parse_numbered_inline(sections['pinyin'])

    max_count = max(len(cn_lines), len(en_lines), len(py_lines))
    for i in range(max_count):
        cn = cn_lines[i] if i < len(cn_lines) else ""
        py = py_lines[i] if i < len(py_lines) else ""
        en = en_lines[i] if i < len(en_lines) else ""
        if cn or py or en:
            dialogue.append({"cn": cn, "pinyin": py, "en": en})

    return dialogue


def parse_numbered_inline(lines):
    """Parse inline numbered dialogue lines like '1. A : text' or '1. text'."""
    result = []
    current_text = None

    for line in lines:
        # Check if line starts with a number like "1. A :" or "1."
        m = re.match(r'^\d+\.\s*(?:[A-Z]\s*:\s*)?(.*)$', line)
        if m:
            if current_text is not None:
                result.append(current_text.strip())
            current_text = m.group(1).strip()
        elif current_text is not None:
            # Continuation line
            current_text += ' ' + line.strip()

    if current_text is not None:
        result.append(current_text.strip())

    return result


# ─── Vocabulary & Sentences (shared) ───

def parse_vocabulary(text):
    """Extract vocabulary table entries."""
    vocab = []

    vocab_match = re.search(
        r'VOCABULARY\s*\n(.*?)(?:SAMPLE\s*SENTENCES|VOCABULARY\s*PHRASE\s*USAGE|GRAMMAR|CULTURAL\s*INSIGHT|$)',
        text, re.DOTALL
    )
    if not vocab_match:
        return vocab

    vocab_text = vocab_match.group(1)
    # Remove header row
    vocab_text = re.sub(r'Simpli[ﬁfi]ed\s+Traditional\s+Pinyin\s+English.*?\n', '', vocab_text)

    lines = [l.strip() for l in vocab_text.split('\n') if l.strip()]

    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith('#') or line.startswith('COPYRIGHT'):
            i += 1
            continue

        if has_chinese(line):
            simplified = line.strip()
            traditional = ""
            pinyin = ""
            english = ""

            j = i + 1
            if j < len(lines) and has_chinese(lines[j]):
                traditional = lines[j].strip()
                j += 1

            if j < len(lines) and is_pinyin(lines[j]):
                pinyin = lines[j].strip()
                j += 1

            en_parts = []
            while j < len(lines) and not has_chinese(lines[j]) and not lines[j].startswith('#'):
                en_parts.append(lines[j].strip())
                j += 1
                if en_parts and (j >= len(lines) or has_chinese(lines[j])):
                    break
            english = ' '.join(en_parts).strip()

            # Extract and remove part of speech
            pos_match = re.search(
                r'\b(noun|verb|adjective|adverb|pronoun|measure word|particle|preposition|conjunction|interjection|phrase)\s*$',
                english, re.IGNORECASE
            )
            pos = pos_match.group(1).lower() if pos_match else ""
            if pos:
                english = english[:pos_match.start()].strip()

            if simplified and (pinyin or english):
                vocab.append({"cn": simplified, "pinyin": pinyin, "en": english, "pos": pos})

            i = j
        else:
            i += 1

    return vocab


def parse_sample_sentences(text):
    """Extract sample sentences."""
    sentences = []

    ss_match = re.search(
        r'SAMPLE\s*SENTENCES\s*\n(.*?)(?:VOCABULARY\s*PHRASE\s*USAGE|GRAMMAR|CULTURAL\s*INSIGHT|$)',
        text, re.DOTALL
    )
    if not ss_match:
        return sentences

    ss_text = ss_match.group(1)
    lines = [l.strip() for l in ss_text.split('\n') if l.strip()]

    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith('#') or line.startswith('COPYRIGHT') or line.startswith('CONT'):
            i += 1
            continue

        if has_chinese(line):
            cn = line.strip()
            pinyin = ""
            en = ""
            j = i + 1

            # Chinese may wrap
            while j < len(lines) and has_chinese(lines[j]) and not is_pinyin_like(lines[j]):
                cn += lines[j].strip()
                j += 1

            # Pinyin
            if j < len(lines) and is_pinyin(lines[j]):
                pinyin = lines[j].strip()
                j += 1
                while j < len(lines) and is_pinyin(lines[j]) and not has_chinese(lines[j]):
                    pinyin += ' ' + lines[j].strip()
                    j += 1

            # English
            en_parts = []
            while j < len(lines) and not has_chinese(lines[j]):
                if lines[j].startswith('#') or lines[j].startswith('COPYRIGHT'):
                    break
                en_parts.append(lines[j].strip())
                j += 1
            en = ' '.join(en_parts).strip()

            # Strip leaked PDF headers from English
            en = re.sub(r'\s*(?:ABSOLUTE BEGINNER|BEGINNER|LOWER BEGINNER|ELEMENTARY|LOWER INTERMEDIATE|INTERMEDIATE|UPPER INTERMEDIATE)\s+(?:S(?:EASON)?\s*\d+\s*)?(?:S\d+\s*)?(?:#\d+)?.*$', '', en).strip()
            # Also strip spaced-out headers like "LOWER BEGINNER S 1 #2 - ..."
            en = re.sub(r'\s+[A-Z][A-Z\s]{20,}$', '', en).strip()

            if cn and (pinyin or en):
                sentences.append({"cn": cn, "pinyin": pinyin, "en": en})

            i = j
        else:
            i += 1

    return sentences


def has_chinese(text):
    """Check if text contains Chinese characters (including CJK compat range)."""
    for char in text:
        cp = ord(char)
        if (0x4E00 <= cp <= 0x9FFF or  # CJK Unified
            0x3400 <= cp <= 0x4DBF or  # CJK Extension A
            0x2E80 <= cp <= 0x2EFF or  # CJK Radicals Supplement
            0x2F00 <= cp <= 0x2FDF or  # Kangxi Radicals
            0xF900 <= cp <= 0xFAFF):   # CJK Compatibility
            return True
    return False


def is_pinyin(text):
    """Check if text looks like pinyin."""
    tone_chars = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'
    if any(c in text for c in tone_chars):
        return True
    if re.match(r'^[A-Z][a-z]', text) and not has_chinese(text) and len(text) > 3:
        pinyin_syllables = ['shi', 'zhi', 'chi', 'de', 'le', 'ma', 'ne',
                           'jiào', 'shénme', 'míng', 'wèi', 'fáng', 'zuò']
        text_lower = text.lower()
        for s in pinyin_syllables:
            if s in text_lower:
                return True
    return False


def is_pinyin_like(text):
    """Looser check for pinyin tone marks."""
    tone_chars = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'
    return any(c in text for c in tone_chars)


def split_pinyin_english(text):
    """Split concatenated pinyin+English text (e.g. 'Nǐhǎo. Hello.' -> ('Nǐhǎo.', 'Hello.'))"""
    if not text:
        return text, ""

    tone_chars = set('āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛ')

    # Common pinyin words that don't have tone marks (neutral tone / common finals)
    pinyin_no_tone = {'ma', 'ne', 'ba', 'le', 'de', 'ge', 'me', 'ya', 'a', 'o', 'e',
                      'er', 'en', 'an', 'ang', 'eng', 'ai', 'ei', 'ao', 'ou',
                      'la', 'na', 'da', 'ta', 'ka', 'ha', 'za', 'ca', 'sa',
                      'zhe', 'she', 'che', 'shi', 'chi', 'zhi', 'ri',
                      'wo', 'ni', 'ta', 'men', 'ren'}

    words = text.split()
    if len(words) <= 1:
        return text, ""

    # Check if text has any tone marks at all
    if not any(c in tone_chars for c in text):
        return text, ""

    # Find the split point: scan forward past tone-bearing words and common pinyin,
    # then look for where English starts (capital letter + no tone + not pinyin-like)
    last_pinyin_idx = -1
    for i, word in enumerate(words):
        clean_word = re.sub(r'[.,!?;:，。！？；：]', '', word).lower()
        has_tone = any(c in tone_chars for c in word)

        if has_tone:
            last_pinyin_idx = i
        elif clean_word in pinyin_no_tone and last_pinyin_idx >= 0 and i == last_pinyin_idx + 1:
            # This is a neutral-tone pinyin word right after a tone-bearing word
            last_pinyin_idx = i
        elif last_pinyin_idx >= 0 and i > last_pinyin_idx:
            # We're past the pinyin section - check if this starts English
            if word[0].isupper() and not any(c in tone_chars for c in word):
                # Verify the rest has no tone marks (confirming it's English)
                remaining = ' '.join(words[i:])
                if not any(c in tone_chars for c in remaining):
                    pinyin_part = ' '.join(words[:i])
                    return pinyin_part, remaining
            # If not clearly English, keep scanning
            # But if we've gone 2+ words past last tone with no more tones, it's English
            if i > last_pinyin_idx + 1 and not has_tone:
                remaining = ' '.join(words[i:])
                if remaining and remaining[0].isupper() and not any(c in tone_chars for c in remaining):
                    pinyin_part = ' '.join(words[:i])
                    return pinyin_part, remaining

    return text, ""


def strip_leaked_headers(text):
    """Remove leaked PDF page headers from any text field."""
    if not text:
        return text
    # Match any variation of level headers (with irregular spacing from PDF extraction)
    # Pattern: UPPER/LOWER/ABS + level name + S1/S2 + #number + rest of title
    text = re.sub(r'\s*(?:ABS\s*OLUTE\s+)?(?:UPPER\s+)?(?:LOWER\s+)?(?:BEGI\s*NNER|I\s*NTERMEDI\s*ATE|ELEMENTARY)\s+S(?:EASON)?\s*\d.*$', '', text, flags=re.IGNORECASE).strip()
    # Catch clean versions too
    text = re.sub(r'\s*(?:ABSOLUTE BEGINNER|UPPER BEGINNER|LOWER BEGINNER|BEGINNER|ELEMENTARY|LOWER INTERMEDIATE|INTERMEDIATE|UPPER INTERMEDIATE)\s+S(?:EASON)?\s*\d.*$', '', text, flags=re.IGNORECASE).strip()
    # Strip site name and lesson reference headers
    text = re.sub(r'\s*CHINESECLASS101\.COM.*$', '', text).strip()
    text = re.sub(r'\s*GENGO\s+CHI\s*NES\s*E\s+S\s*\d.*$', '', text).strip()
    return text


def post_process_cards(result):
    """Post-process all cards: split concatenated pinyin+English, strip headers."""
    for card_type in ['vocab', 'sentences', 'dialogue']:
        for card in result.get(card_type, []):
            # Strip leaked headers from all fields
            for field in ['cn', 'pinyin', 'en']:
                if card.get(field):
                    card[field] = strip_leaked_headers(card[field])

            # Split pinyin+English concatenations
            pinyin = card.get('pinyin', '')
            en = card.get('en', '')
            if pinyin and not en:
                # All content is in pinyin field, try to split
                new_pinyin, new_en = split_pinyin_english(pinyin)
                if new_en:
                    card['pinyin'] = new_pinyin
                    card['en'] = new_en
            elif pinyin and en:
                # Pinyin may also have English appended
                new_pinyin, extra_en = split_pinyin_english(pinyin)
                if extra_en:
                    card['pinyin'] = new_pinyin
                    # Don't overwrite existing English, but if it's the same, skip
                    if not en or en == extra_en:
                        card['en'] = extra_en

    return result


def process_lesson_pdf(pdf_path, level_num, lesson_num):
    """Process a single lesson PDF and extract all learning cards."""
    # Get both dict-mode lines and plain text
    dict_lines = extract_text_dict(pdf_path)
    plain_text = extract_text_plain(pdf_path)
    cleaned_text = clean_text(plain_text)

    # Detect format
    fmt = detect_pdf_format(dict_lines)

    # Title
    title = extract_lesson_title_from_lines(dict_lines)
    if not title:
        title = extract_lesson_title_plain(plain_text)

    # Dialogue
    if fmt == 'B':
        dialogue = parse_dialogue_format_b(dict_lines)
    else:
        dialogue = parse_dialogue_format_a(cleaned_text)

    # Vocabulary and sentences (work from cleaned plain text for both formats)
    vocab = parse_vocabulary(cleaned_text)
    sentences = parse_sample_sentences(cleaned_text)

    lesson_id = f"L{level_num}-{lesson_num:03d}"

    result = {
        "lessonTitle": title or f"Lesson {lesson_num}",
        "vocab": [],
        "sentences": [],
        "dialogue": []
    }

    for i, v in enumerate(vocab):
        v["id"] = f"{lesson_id}-V{i+1:02d}"
        result["vocab"].append(v)

    for i, s in enumerate(sentences):
        s["id"] = f"{lesson_id}-S{i+1:02d}"
        result["sentences"].append(s)

    for i, d in enumerate(dialogue):
        d["id"] = f"{lesson_id}-D{i+1:02d}"
        result["dialogue"].append(d)

    # Post-process: split concatenated pinyin+English, strip headers
    post_process_cards(result)

    return lesson_id, result


def main():
    all_cards = {}
    stats = {"levels": {}, "total_vocab": 0, "total_sentences": 0, "total_dialogue": 0, "total_lessons": 0}

    for level_num in range(1, 6):
        level_dir = RESOURCES_DIR / f"level-{level_num}" / "materials"
        if not level_dir.exists():
            print(f"  Skipping level {level_num} (no materials directory)")
            continue

        level_stats = {"lessons": 0, "vocab": 0, "sentences": 0, "dialogue": 0}
        lesson_pdfs = sorted(level_dir.glob("*-lesson.pdf"))

        for pdf_path in lesson_pdfs:
            num_match = re.match(r'(\d+)-lesson\.pdf', pdf_path.name)
            if not num_match:
                continue

            lesson_num = int(num_match.group(1))

            try:
                lesson_id, cards = process_lesson_pdf(pdf_path, level_num, lesson_num)
                total_cards = len(cards["vocab"]) + len(cards["sentences"]) + len(cards["dialogue"])

                if total_cards > 0:
                    all_cards[lesson_id] = cards
                    level_stats["lessons"] += 1
                    level_stats["vocab"] += len(cards["vocab"])
                    level_stats["sentences"] += len(cards["sentences"])
                    level_stats["dialogue"] += len(cards["dialogue"])

                    print(f"  L{level_num}-{lesson_num:03d}: {len(cards['vocab'])}V {len(cards['sentences'])}S {len(cards['dialogue'])}D = {total_cards} cards")
                else:
                    print(f"  L{level_num}-{lesson_num:03d}: (no extractable content)")

            except Exception as e:
                print(f"  L{level_num}-{lesson_num:03d}: ERROR - {e}")
                import traceback
                traceback.print_exc()

        stats["levels"][f"level-{level_num}"] = level_stats
        stats["total_vocab"] += level_stats["vocab"]
        stats["total_sentences"] += level_stats["sentences"]
        stats["total_dialogue"] += level_stats["dialogue"]
        stats["total_lessons"] += level_stats["lessons"]

        print(f"\nLevel {level_num}: {level_stats['lessons']} lessons, "
              f"{level_stats['vocab']}V {level_stats['sentences']}S {level_stats['dialogue']}D")

    # Write output
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_cards, f, ensure_ascii=False, indent=2)

    total_cards = stats["total_vocab"] + stats["total_sentences"] + stats["total_dialogue"]
    print(f"\n{'='*60}")
    print(f"TOTAL: {stats['total_lessons']} lessons, {total_cards} cards")
    print(f"  Vocabulary: {stats['total_vocab']}")
    print(f"  Sentences:  {stats['total_sentences']}")
    print(f"  Dialogue:   {stats['total_dialogue']}")
    print(f"\nOutput: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
