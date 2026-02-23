#!/bin/bash
# sanitize-resources.sh
# Copies Mandarin learning resources from ../Learn_Mandarin into a clean ./resources/ directory
# with normalized filenames, and generates catalog JSON files for the frontend.
#
# Usage: ./sanitize-resources.sh

set -euo pipefail

SRC="/home/cmantra/Learn_Mandarin"
DEST="/home/cmantra/famlingo/resources"
TUTORIAL="$SRC/Chinese Language Tutorial Bundle"
EBOOKS="$SRC/Chinese Language eBooks Collection"

# Clean slate
rm -rf "$DEST"

# Create directory structure
mkdir -p "$DEST/courses/level-"{1,2,3,4,5}/{audio,materials}
mkdir -p "$DEST/courses/vocab"
mkdir -p "$DEST/library/"{reference,characters,grammar,textbooks,phrasebooks,specialized,study-notes}

echo "=== Sanitize Resources ==="
echo "Source: $SRC"
echo "Destination: $DEST"
echo ""

# Helper: clean a string into a filename slug
slugify() {
  echo "$1" | \
    sed 's/[—–]/-/g' | \
    tr '[:upper:]' '[:lower:]' | \
    sed "s/[^a-z0-9 -]//g" | \
    sed 's/  */ /g' | \
    sed 's/^ *//;s/ *$//' | \
    sed 's/ /-/g' | \
    sed 's/--*/-/g' | \
    sed 's/-$//'
}

# Helper: safely pad a number to 3 digits (avoids octal issues)
pad3() {
  printf "%03d" "$((10#$1))"
}

# ============================================================
# PART 1: Course Audio Lessons (Levels 1-5)
# ============================================================
echo "--- Processing Course Audio Lessons ---"

# We'll build JSON for courses incrementally
COURSES_JSON="/home/cmantra/famlingo/src/data/courses.json"
mkdir -p "$(dirname "$COURSES_JSON")"

# Start JSON
echo '{' > "$COURSES_JSON"
echo '  "version": "1.0",' >> "$COURSES_JSON"
echo '  "levels": [' >> "$COURSES_JSON"

for LEVEL in 1 2 3 4 5; do
  LEVEL_DIR="$TUTORIAL/Level $LEVEL Chinese Mandarin"
  AUDIO_DEST="$DEST/courses/level-$LEVEL/audio"
  MAT_DEST="$DEST/courses/level-$LEVEL/materials"

  echo "  Level $LEVEL:"

  # Level metadata
  case $LEVEL in
    1) LEVEL_EN="Level 1 - Absolute Beginner"; LEVEL_CN="第一级 - 零基础"; LEVEL_DESC_EN="Essential daily situations and basic phrases"; LEVEL_DESC_CN="基本日常情景和常用短语"; ICON="🌱" ;;
    2) LEVEL_EN="Level 2 - Beginner"; LEVEL_CN="第二级 - 初学者"; LEVEL_DESC_EN="Daily life and cultural immersion"; LEVEL_DESC_CN="日常生活和文化体验"; ICON="🌿" ;;
    3) LEVEL_EN="Level 3 - Lower Intermediate"; LEVEL_CN="第三级 - 中级入门"; LEVEL_DESC_EN="Social interactions and deeper conversations"; LEVEL_DESC_CN="社交互动和深入对话"; ICON="🌳" ;;
    4) LEVEL_EN="Level 4 - Intermediate"; LEVEL_CN="第四级 - 中级"; LEVEL_DESC_EN="Advanced daily topics and cultural nuances"; LEVEL_DESC_CN="高级日常话题和文化细节"; ICON="🏔️" ;;
    5) LEVEL_EN="Level 5 - Upper Intermediate"; LEVEL_CN="第五级 - 中高级"; LEVEL_DESC_EN="Complex topics, business, and society"; LEVEL_DESC_CN="复杂话题、商务和社会"; ICON="⭐" ;;
  esac

  [ "$LEVEL" -gt 1 ] && echo '    ,' >> "$COURSES_JSON"

  cat >> "$COURSES_JSON" << LEVELHEADER
    {
      "id": "level-$LEVEL",
      "name": {"en": "$LEVEL_EN", "cn": "$LEVEL_CN"},
      "description": {"en": "$LEVEL_DESC_EN", "cn": "$LEVEL_DESC_CN"},
      "icon": "$ICON",
      "lessons": [
LEVELHEADER

  # --- Process MP3 files ---
  # Collect into temp file to avoid subshell issues
  > /tmp/fl_audio_list.txt

  if [ -d "$LEVEL_DIR" ]; then
    while IFS= read -r mp3; do
      BASENAME=$(basename "$mp3" .mp3)

      # Extract number prefix and title
      NUM=$(echo "$BASENAME" | grep -oP '^\d+' || echo "0")
      TITLE=$(echo "$BASENAME" | sed 's/^[0-9]* *//')

      # Create slug
      SLUG=$(slugify "$TITLE")
      [ -z "$SLUG" ] && SLUG="lesson"

      PADDED=$(pad3 "$NUM")
      CLEAN_NAME="${PADDED}-${SLUG}.mp3"

      # Copy file
      cp "$mp3" "$AUDIO_DEST/$CLEAN_NAME"

      # Escape title for JSON (double quotes and backslashes)
      JSON_TITLE=$(echo "$TITLE" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')

      echo "${PADDED}|${CLEAN_NAME}|${JSON_TITLE}" >> /tmp/fl_audio_list.txt
    done < <(find "$LEVEL_DIR" -maxdepth 1 -name "*.mp3" ! -name "*Zone.Identifier*" ! -name "*(1)*" | sort)
  fi

  # Build lesson JSON entries
  LESSON_ORDER=0
  if [ -s /tmp/fl_audio_list.txt ]; then
    while IFS='|' read -r PADDED CLEAN_NAME JSON_TITLE; do
      LESSON_ORDER=$((LESSON_ORDER + 1))
      [ "$LESSON_ORDER" -gt 1 ] && echo ',' >> "$COURSES_JSON"

      # Write JSON without trailing newline on last field
      echo -n "        {\"id\": \"L${LEVEL}-${PADDED}\", \"title\": \"${JSON_TITLE}\", \"audioPath\": \"courses/level-${LEVEL}/audio/${CLEAN_NAME}\", \"order\": ${LESSON_ORDER}}" >> "$COURSES_JSON"
    done < <(sort /tmp/fl_audio_list.txt)
    echo "" >> "$COURSES_JSON"
    echo "    $LESSON_ORDER audio lessons copied"
  else
    echo "    0 audio lessons found"
  fi
  rm -f /tmp/fl_audio_list.txt

  # Close lessons, start materials
  echo '      ],' >> "$COURSES_JSON"
  echo '      "materials": [' >> "$COURSES_JSON"

  # --- Process PDFs ---
  PDF_DIR="$LEVEL_DIR/PDF"
  > /tmp/fl_mat_list.txt

  if [ -d "$PDF_DIR" ]; then
    while IFS= read -r pdf; do
      BASENAME=$(basename "$pdf" .pdf)

      NUM=$(echo "$BASENAME" | grep -oP '^\d+' || echo "0")
      PADDED=$(pad3 "$NUM")

      # Determine PDF type
      if echo "$BASENAME" | grep -qi "hanzi_closeup\|honzi_closeup"; then
        TYPE="hanzi"
        SUFFIX="-hanzi-closeup"
      elif echo "$BASENAME" | grep -qi "recordingscript\|recording_script"; then
        TYPE="script"
        SUFFIX="-recording-script"
      else
        TYPE="lesson"
        SUFFIX="-lesson"
      fi

      CLEAN_NAME="${PADDED}${SUFFIX}.pdf"

      # Handle duplicates
      if [ -f "$MAT_DEST/$CLEAN_NAME" ]; then
        COUNTER=2
        while [ -f "$MAT_DEST/${PADDED}${SUFFIX}-${COUNTER}.pdf" ]; do
          COUNTER=$((COUNTER + 1))
        done
        CLEAN_NAME="${PADDED}${SUFFIX}-${COUNTER}.pdf"
      fi

      cp "$pdf" "$MAT_DEST/$CLEAN_NAME"
      echo "${PADDED}|${CLEAN_NAME}|${TYPE}" >> /tmp/fl_mat_list.txt
    done < <(find "$PDF_DIR" -maxdepth 1 -name "*.pdf" ! -name "*Zone.Identifier*" | sort)
  fi

  MAT_ORDER=0
  if [ -s /tmp/fl_mat_list.txt ]; then
    while IFS='|' read -r PADDED CLEAN_NAME TYPE; do
      MAT_ORDER=$((MAT_ORDER + 1))
      [ "$MAT_ORDER" -gt 1 ] && echo ',' >> "$COURSES_JSON"

      case $TYPE in
        hanzi) TYPE_LABEL="Hanzi Closeup $PADDED" ;;
        script) TYPE_LABEL="Recording Script $PADDED" ;;
        *) TYPE_LABEL="Lesson Notes $PADDED" ;;
      esac

      echo -n "        {\"id\": \"L${LEVEL}-M${PADDED}-${TYPE}\", \"title\": \"${TYPE_LABEL}\", \"type\": \"${TYPE}\", \"path\": \"courses/level-${LEVEL}/materials/${CLEAN_NAME}\"}" >> "$COURSES_JSON"
    done < <(sort /tmp/fl_mat_list.txt)
    echo "" >> "$COURSES_JSON"
    echo "    $MAT_ORDER PDF materials copied"
  fi
  rm -f /tmp/fl_mat_list.txt

  # Close materials and level
  echo '      ]' >> "$COURSES_JSON"
  echo -n '    }' >> "$COURSES_JSON"
done

echo '' >> "$COURSES_JSON"

# ============================================================
# PART 2: Vocabulary Audio
# ============================================================
echo ""
echo "--- Processing Vocabulary Audio ---"

# Find the vocab directory (has unicode bold math chars in name)
VOCAB_DIR=$(find "$TUTORIAL" -maxdepth 1 -type d -name "*ocab*" 2>/dev/null | head -1)

echo '  ],' >> "$COURSES_JSON"
echo '  "vocab": [' >> "$COURSES_JSON"

if [ -n "$VOCAB_DIR" ] && [ -d "$VOCAB_DIR" ]; then
  > /tmp/fl_vocab_list.txt

  while IFS= read -r mp3; do
    BASENAME=$(basename "$mp3" .mp3)
    CLEAN_NAME=$(echo "$BASENAME" | tr '[:upper:]' '[:lower:]').mp3
    cp "$mp3" "$DEST/courses/vocab/$CLEAN_NAME"
    echo "${CLEAN_NAME}|${BASENAME}" >> /tmp/fl_vocab_list.txt
  done < <(find "$VOCAB_DIR" -maxdepth 1 -name "*.mp3" ! -name "*Zone.Identifier*" | sort)

  VOCAB_COUNT=0
  if [ -s /tmp/fl_vocab_list.txt ]; then
    while IFS='|' read -r CLEAN_NAME ORIG_NAME; do
      VOCAB_COUNT=$((VOCAB_COUNT + 1))
      [ "$VOCAB_COUNT" -gt 1 ] && echo ',' >> "$COURSES_JSON"
      ID=$(echo "$CLEAN_NAME" | sed 's/\.mp3//' | tr '[:lower:]' '[:upper:]')
      echo -n "    {\"id\": \"V-${ID}\", \"title\": \"Vocabulary ${ID}\", \"audioPath\": \"courses/vocab/${CLEAN_NAME}\"}" >> "$COURSES_JSON"
    done < <(sort /tmp/fl_vocab_list.txt)
    echo "" >> "$COURSES_JSON"
    echo "  $VOCAB_COUNT vocabulary audio files copied"
  fi
  rm -f /tmp/fl_vocab_list.txt
else
  echo "  WARNING: Vocabulary directory not found!"
fi

echo '  ]' >> "$COURSES_JSON"
echo '}' >> "$COURSES_JSON"

echo "  Generated: src/data/courses.json"

# ============================================================
# PART 3: Library eBooks (Mandarin only)
# ============================================================
echo ""
echo "--- Processing Library eBooks ---"

LIBRARY_JSON="/home/cmantra/famlingo/src/data/library.json"
BOOK_COUNT=0

# Helper: copy ebook and count
copy_ebook() {
  local SRC_FILE="$EBOOKS/$1"
  local CLEAN_NAME="$2"
  local CATEGORY="$3"

  if [ -f "$SRC_FILE" ]; then
    cp "$SRC_FILE" "$DEST/library/$CATEGORY/$CLEAN_NAME"
    BOOK_COUNT=$((BOOK_COUNT + 1))
    echo "    [$CATEGORY] $CLEAN_NAME"
    return 0
  else
    echo "    WARNING: Not found: $1"
    return 1
  fi
}

# Copy all Mandarin eBooks
copy_ebook "A Chinese Measure Word Dictionary. A Chinese-English English-Chinese User Guide  _.pdf" "chinese-measure-word-dictionary.pdf" "reference" || true
copy_ebook "Chinese Characters Dictionary with English Annotations (English and Chinese Edition).pdf" "chinese-characters-dictionary.pdf" "reference" || true
copy_ebook "Periplus Pocket Mandarin Chinese Dictionary Chinese-English English-Chinese (Fully Romanized).pdf" "periplus-pocket-dictionary.pdf" "reference" || true

copy_ebook "250 Essential Chinese Characters Volume 1 Revised Edition.pdf" "250-essential-characters-v1.pdf" "characters" || true
copy_ebook "Chinese Characters - Learn _ Remember 2,178 Characters and Their Meanings.pdf" "learn-remember-2178-characters.pdf" "characters" || true
copy_ebook "Learning Chinese Characters - A Revolutionary New Way to Learn and Remember the 800 Most Basic Chinese Characters. HSK level A.pdf" "learning-characters-hsk-a.pdf" "characters" || true
copy_ebook "The First 100 Chinese Characters - The Quick and Easy Method to Learn the 100 Most Basic Chinese Characters.pdf" "first-100-characters.pdf" "characters" || true
copy_ebook "Tuttle Learning Chinese Characters - A Revolutionary New Way to Learn and Remember the 800 Most Basic Chinese Characters.pdf" "tuttle-learning-characters.pdf" "characters" || true
copy_ebook "Tuttle More Chinese for Kids Flash Cards Simplified Character. Includes 64 Flash Cards, Wall Chart _ Learning Guide.pdf" "tuttle-kids-flash-cards.pdf" "characters" || true

copy_ebook "Basic Mandarin Chinese - Reading _ Writing Textbook - An Introduction to Written Chinese for Beginners.pdf" "basic-mandarin-reading-writing-textbook.pdf" "grammar" || true
copy_ebook "Basic Mandarin Chinese - Reading _ Writing Practice Book - A Workbook for Beginning Learners of Written Chinese.pdf" "basic-mandarin-reading-writing-practice.pdf" "grammar" || true
copy_ebook "Basic Spoken Chinese Practice Essentials - An Introduction to Speaking and Listening for Beginners.pdf" "basic-spoken-chinese-practice.pdf" "grammar" || true
copy_ebook "Intermediate Written Chinese Practice Essentials _ Read and Write Mandarin Chinese as the Chinese Do.pdf" "intermediate-written-chinese-practice.pdf" "grammar" || true

copy_ebook "Teach Yourself Beginner_s Mandarin Chinese.pdf" "teach-yourself-beginners-mandarin.pdf" "textbooks" || true
copy_ebook "Happy Chinese (Kuaile Hanyu) Student_s Book. Volume 1 _ _).pdf" "happy-chinese-vol-1.pdf" "textbooks" || true
copy_ebook "I Love Learning Chinese. Specially Designed for Primary School. Volume 1 _ _1_.pdf" "i-love-learning-chinese-vol-1.pdf" "textbooks" || true
copy_ebook "Chinese for Dummies.pdf" "chinese-for-dummies.pdf" "textbooks" || true

copy_ebook "Instant Chinese - A Mandarin Chinese Phrasebook _ Dictionary.pdf" "instant-chinese-phrasebook.pdf" "phrasebooks" || true
copy_ebook "Instant Chinese - How To Express Over 1,000 Different Ideas With Just 100 Key Words And Phrases! (A Mandarin Chinese Language Phrasebook).pdf" "instant-chinese-1000-ideas.pdf" "phrasebooks" || true
copy_ebook "Essential Chinese - Speak Chinese with Confidence!.pdf" "essential-chinese.pdf" "phrasebooks" || true
copy_ebook "Survival Chinese - How to Communicate without Fuss or Fear - Instantly!.pdf" "survival-chinese.pdf" "phrasebooks" || true
copy_ebook "Mandarin Chinese - Visual Phrase Book (Eyewitness Travel Guides).pdf" "visual-phrase-book.pdf" "phrasebooks" || true

copy_ebook "Chinese Vocabulary for English Speakers - 9000 Words.pdf" "chinese-vocab-9000-words.pdf" "specialized" || true
copy_ebook "Student Approaches to Learning Chinese Vocabulary.pdf" "student-approaches-vocab.pdf" "specialized" || true
copy_ebook "Teaching and Learning Chinese as a Foreign Language - A Pedagogical Grammar.pdf" "teaching-learning-chinese-foreign-language.pdf" "specialized" || true
copy_ebook "Understanding the Chinese Language - A Comprehensive Linguistic Introduction (English and Chinese Edition).pdf" "understanding-chinese-language.pdf" "specialized" || true
copy_ebook "Thinking Chinese Translation- A Course in Translation Method.Chinese to English (Thinking Translation).pdf" "thinking-chinese-translation.pdf" "specialized" || true
copy_ebook "Learn to Read Chinese - An Introduction to the Language and Concepts of Current Zhongyi Literature, Vol. 2.pdf" "learn-to-read-chinese-vol-2.pdf" "specialized" || true

# Study notes (from top-level)
if [ -f "$SRC/Updated Mandarin Study Notes + Extras in One.pdf" ]; then
  cp "$SRC/Updated Mandarin Study Notes + Extras in One.pdf" "$DEST/library/study-notes/mandarin-study-notes.pdf"
  BOOK_COUNT=$((BOOK_COUNT + 1))
  echo "    [study-notes] mandarin-study-notes.pdf (630MB)"
fi

echo ""
echo "  $BOOK_COUNT eBooks copied"

# Now write library.json (static content since we know exactly what we're including)
cat > "$LIBRARY_JSON" << 'LIBJSON'
{
  "version": "1.0",
  "categories": [
    {
      "id": "reference",
      "name": {"en": "Reference & Dictionaries", "cn": "参考与词典"},
      "icon": "📖",
      "books": [
        {
          "id": "ref-measure-words",
          "title": {"en": "Chinese Measure Word Dictionary", "cn": "中文量词词典"},
          "description": {"en": "Chinese-English/English-Chinese guide to measure words", "cn": "中英量词使用指南"},
          "path": "library/reference/chinese-measure-word-dictionary.pdf",
          "level": "intermediate"
        },
        {
          "id": "ref-characters-dict",
          "title": {"en": "Chinese Characters Dictionary", "cn": "汉英字典"},
          "description": {"en": "Dictionary with English annotations", "cn": "带英文注释的字典"},
          "path": "library/reference/chinese-characters-dictionary.pdf",
          "level": "all"
        },
        {
          "id": "ref-periplus",
          "title": {"en": "Periplus Pocket Mandarin Dictionary", "cn": "随身普通话词典"},
          "description": {"en": "Chinese-English/English-Chinese, fully romanized", "cn": "中英双向，带拼音"},
          "path": "library/reference/periplus-pocket-dictionary.pdf",
          "level": "beginner"
        }
      ]
    },
    {
      "id": "characters",
      "name": {"en": "Character Learning", "cn": "汉字学习"},
      "icon": "🀄",
      "books": [
        {
          "id": "char-250-essential",
          "title": {"en": "250 Essential Chinese Characters Vol. 1", "cn": "250个基本汉字（第1卷）"},
          "description": {"en": "Revised edition of essential character learning", "cn": "基本汉字学习修订版"},
          "path": "library/characters/250-essential-characters-v1.pdf",
          "level": "beginner"
        },
        {
          "id": "char-2178",
          "title": {"en": "Learn & Remember 2,178 Characters", "cn": "学记2178个汉字"},
          "description": {"en": "Characters and their meanings", "cn": "汉字及其含义"},
          "path": "library/characters/learn-remember-2178-characters.pdf",
          "level": "intermediate"
        },
        {
          "id": "char-hsk-a",
          "title": {"en": "Learning Chinese Characters - HSK Level A", "cn": "学习汉字 - HSK A级"},
          "description": {"en": "800 most basic characters for HSK preparation", "cn": "HSK备考800个基本汉字"},
          "path": "library/characters/learning-characters-hsk-a.pdf",
          "level": "beginner"
        },
        {
          "id": "char-first-100",
          "title": {"en": "The First 100 Chinese Characters", "cn": "第一批100个汉字"},
          "description": {"en": "Quick and easy method for the most basic characters", "cn": "最基本汉字的快速简单方法"},
          "path": "library/characters/first-100-characters.pdf",
          "level": "beginner"
        },
        {
          "id": "char-tuttle-800",
          "title": {"en": "Tuttle Learning Chinese Characters", "cn": "Tuttle学汉字"},
          "description": {"en": "Revolutionary way to learn 800 basic characters", "cn": "学习800个基本汉字的新方法"},
          "path": "library/characters/tuttle-learning-characters.pdf",
          "level": "beginner"
        },
        {
          "id": "char-kids-flash",
          "title": {"en": "Tuttle Chinese for Kids Flash Cards", "cn": "儿童汉字闪卡"},
          "description": {"en": "64 flash cards with wall chart and learning guide", "cn": "64张闪卡附挂图和学习指南"},
          "path": "library/characters/tuttle-kids-flash-cards.pdf",
          "level": "beginner"
        }
      ]
    },
    {
      "id": "grammar",
      "name": {"en": "Grammar & Workbooks", "cn": "语法与练习册"},
      "icon": "📝",
      "books": [
        {
          "id": "gram-reading-writing-text",
          "title": {"en": "Basic Mandarin - Reading & Writing Textbook", "cn": "基础普通话 - 读写教材"},
          "description": {"en": "Introduction to written Chinese for beginners", "cn": "初学者书面中文入门"},
          "path": "library/grammar/basic-mandarin-reading-writing-textbook.pdf",
          "level": "beginner"
        },
        {
          "id": "gram-reading-writing-practice",
          "title": {"en": "Basic Mandarin - Reading & Writing Practice", "cn": "基础普通话 - 读写练习"},
          "description": {"en": "Workbook for beginning learners of written Chinese", "cn": "书面中文初学者练习册"},
          "path": "library/grammar/basic-mandarin-reading-writing-practice.pdf",
          "level": "beginner"
        },
        {
          "id": "gram-spoken-practice",
          "title": {"en": "Basic Spoken Chinese Practice", "cn": "基础口语练习"},
          "description": {"en": "Introduction to speaking and listening for beginners", "cn": "初学者口语和听力入门"},
          "path": "library/grammar/basic-spoken-chinese-practice.pdf",
          "level": "beginner"
        },
        {
          "id": "gram-intermediate-written",
          "title": {"en": "Intermediate Written Chinese Practice", "cn": "中级书面中文练习"},
          "description": {"en": "Read and write Mandarin Chinese as the Chinese do", "cn": "像中国人一样读写普通话"},
          "path": "library/grammar/intermediate-written-chinese-practice.pdf",
          "level": "intermediate"
        }
      ]
    },
    {
      "id": "textbooks",
      "name": {"en": "Textbooks & Courses", "cn": "教材与课程"},
      "icon": "🎓",
      "books": [
        {
          "id": "text-teach-yourself",
          "title": {"en": "Teach Yourself Beginner's Mandarin", "cn": "自学初级普通话"},
          "description": {"en": "Complete self-study course for beginners", "cn": "初学者完整自学课程"},
          "path": "library/textbooks/teach-yourself-beginners-mandarin.pdf",
          "level": "beginner"
        },
        {
          "id": "text-happy-chinese",
          "title": {"en": "Happy Chinese (Kuaile Hanyu) Vol. 1", "cn": "快乐汉语（第1卷）"},
          "description": {"en": "Student's book for structured Chinese learning", "cn": "结构化汉语学习学生用书"},
          "path": "library/textbooks/happy-chinese-vol-1.pdf",
          "level": "beginner"
        },
        {
          "id": "text-i-love-learning",
          "title": {"en": "I Love Learning Chinese Vol. 1", "cn": "我爱学中文（第1卷）"},
          "description": {"en": "Specially designed for primary school students", "cn": "专为小学生设计"},
          "path": "library/textbooks/i-love-learning-chinese-vol-1.pdf",
          "level": "beginner"
        },
        {
          "id": "text-for-dummies",
          "title": {"en": "Chinese for Dummies", "cn": "中文入门"},
          "description": {"en": "Accessible introduction to the Chinese language", "cn": "轻松入门中文"},
          "path": "library/textbooks/chinese-for-dummies.pdf",
          "level": "beginner"
        }
      ]
    },
    {
      "id": "phrasebooks",
      "name": {"en": "Phrasebooks", "cn": "短语手册"},
      "icon": "💬",
      "books": [
        {
          "id": "phrase-instant",
          "title": {"en": "Instant Chinese Phrasebook", "cn": "即时中文短语手册"},
          "description": {"en": "Mandarin Chinese phrasebook and dictionary", "cn": "普通话短语手册和词典"},
          "path": "library/phrasebooks/instant-chinese-phrasebook.pdf",
          "level": "beginner"
        },
        {
          "id": "phrase-1000-ideas",
          "title": {"en": "Instant Chinese - 1,000 Ideas", "cn": "即时中文 - 1000个表达"},
          "description": {"en": "Express 1,000+ ideas with 100 key words and phrases", "cn": "用100个关键词表达1000多个意思"},
          "path": "library/phrasebooks/instant-chinese-1000-ideas.pdf",
          "level": "beginner"
        },
        {
          "id": "phrase-essential",
          "title": {"en": "Essential Chinese", "cn": "必备中文"},
          "description": {"en": "Speak Chinese with confidence", "cn": "自信说中文"},
          "path": "library/phrasebooks/essential-chinese.pdf",
          "level": "beginner"
        },
        {
          "id": "phrase-survival",
          "title": {"en": "Survival Chinese", "cn": "生存中文"},
          "description": {"en": "Communicate without fuss or fear", "cn": "轻松无压力地交流"},
          "path": "library/phrasebooks/survival-chinese.pdf",
          "level": "beginner"
        },
        {
          "id": "phrase-visual",
          "title": {"en": "Mandarin Visual Phrase Book", "cn": "普通话视觉短语手册"},
          "description": {"en": "Eyewitness Travel Guide visual phrasebook", "cn": "旅行视觉短语手册"},
          "path": "library/phrasebooks/visual-phrase-book.pdf",
          "level": "beginner"
        }
      ]
    },
    {
      "id": "specialized",
      "name": {"en": "Vocabulary & Specialized", "cn": "词汇与专项"},
      "icon": "🧠",
      "books": [
        {
          "id": "spec-vocab-9000",
          "title": {"en": "Chinese Vocabulary - 9,000 Words", "cn": "中文词汇 - 9000个词"},
          "description": {"en": "Comprehensive vocabulary for English speakers", "cn": "英语使用者综合词汇"},
          "path": "library/specialized/chinese-vocab-9000-words.pdf",
          "level": "intermediate"
        },
        {
          "id": "spec-student-approaches",
          "title": {"en": "Student Approaches to Chinese Vocabulary", "cn": "学生学习中文词汇的方法"},
          "description": {"en": "Research on effective vocabulary learning strategies", "cn": "有效词汇学习策略研究"},
          "path": "library/specialized/student-approaches-vocab.pdf",
          "level": "all"
        },
        {
          "id": "spec-teaching-learning",
          "title": {"en": "Teaching Chinese as a Foreign Language", "cn": "对外汉语教学"},
          "description": {"en": "Pedagogical grammar for Chinese language teaching", "cn": "汉语教学语法"},
          "path": "library/specialized/teaching-learning-chinese-foreign-language.pdf",
          "level": "advanced"
        },
        {
          "id": "spec-understanding",
          "title": {"en": "Understanding the Chinese Language", "cn": "理解中文"},
          "description": {"en": "Comprehensive linguistic introduction", "cn": "综合语言学介绍"},
          "path": "library/specialized/understanding-chinese-language.pdf",
          "level": "advanced"
        },
        {
          "id": "spec-translation",
          "title": {"en": "Thinking Chinese Translation", "cn": "中文翻译思维"},
          "description": {"en": "Course in translation method: Chinese to English", "cn": "中译英翻译方法课程"},
          "path": "library/specialized/thinking-chinese-translation.pdf",
          "level": "advanced"
        },
        {
          "id": "spec-read-chinese",
          "title": {"en": "Learn to Read Chinese Vol. 2", "cn": "学习阅读中文（第2卷）"},
          "description": {"en": "Introduction to Zhongyi literature and concepts", "cn": "中医文献和概念入门"},
          "path": "library/specialized/learn-to-read-chinese-vol-2.pdf",
          "level": "advanced"
        }
      ]
    },
    {
      "id": "study-notes",
      "name": {"en": "Study Notes", "cn": "学习笔记"},
      "icon": "📓",
      "books": [
        {
          "id": "notes-mandarin-complete",
          "title": {"en": "Mandarin Study Notes + Extras", "cn": "普通话学习笔记及附加内容"},
          "description": {"en": "Comprehensive compiled study notes (large file: ~630MB)", "cn": "综合编纂学习笔记（大文件：约630MB）"},
          "path": "library/study-notes/mandarin-study-notes.pdf",
          "level": "all",
          "sizeWarning": true
        }
      ]
    }
  ]
}
LIBJSON

echo "  Generated: src/data/library.json"

# ============================================================
# Summary
# ============================================================
echo ""
echo "=== Done ==="
echo "Resources directory: $DEST"
echo ""
echo "Directory sizes:"
du -sh "$DEST/courses/"* 2>/dev/null || true
du -sh "$DEST/library/"* 2>/dev/null || true
echo ""
du -sh "$DEST" 2>/dev/null || true
echo ""
echo "Next steps:"
echo "  1. Review the generated catalog files"
echo "  2. Run: ./upload-resources.sh"
echo "  3. Update nginx config on server"
echo "  4. Deploy frontend: ./deploy.sh"
