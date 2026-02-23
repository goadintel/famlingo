#!/usr/bin/env python3
"""
Generate vocabulary group cards from pages 2-21 of the PDF.
These are well-structured topic-based vocab lists with clean Chinese characters.
Output: src/data/vocab-groups-cards.json
Also updates courses.json to prepend these lessons to the study-notes level.
"""

import json
import os

# Each group is a lesson with vocab and sentences extracted from the PDF pages.
# The Chinese characters extract cleanly from these pages (unlike later chapters).

vocab_groups = {
    "SN-VG01": {
        "lessonTitle": "Pronunciation, Tones & Basic Greetings",
        "vocab": [
            {"id": "VG01-V01", "cn": "你好", "pinyin": "nǐ hǎo", "en": "Hello", "pos": "phrase"},
            {"id": "VG01-V02", "cn": "早上好", "pinyin": "zǎo shàng hǎo", "en": "Good morning", "pos": "phrase"},
            {"id": "VG01-V03", "cn": "晚上好", "pinyin": "wǎn shàng hǎo", "en": "Good evening", "pos": "phrase"},
            {"id": "VG01-V04", "cn": "妈", "pinyin": "mā", "en": "Mother (1st tone)", "pos": "noun"},
            {"id": "VG01-V05", "cn": "麻", "pinyin": "má", "en": "Hemp (2nd tone)", "pos": "noun"},
            {"id": "VG01-V06", "cn": "马", "pinyin": "mǎ", "en": "Horse (3rd tone)", "pos": "noun"},
            {"id": "VG01-V07", "cn": "骂", "pinyin": "mà", "en": "Scold (4th tone)", "pos": "verb"},
        ],
        "sentences": []
    },
    "SN-VG02": {
        "lessonTitle": "Numbers & Counting",
        "vocab": [
            {"id": "VG02-V01", "cn": "一", "pinyin": "yī", "en": "One", "pos": "number"},
            {"id": "VG02-V02", "cn": "二", "pinyin": "èr", "en": "Two", "pos": "number"},
            {"id": "VG02-V03", "cn": "三", "pinyin": "sān", "en": "Three", "pos": "number"},
            {"id": "VG02-V04", "cn": "四", "pinyin": "sì", "en": "Four", "pos": "number"},
            {"id": "VG02-V05", "cn": "五", "pinyin": "wǔ", "en": "Five", "pos": "number"},
            {"id": "VG02-V06", "cn": "六", "pinyin": "liù", "en": "Six", "pos": "number"},
            {"id": "VG02-V07", "cn": "七", "pinyin": "qī", "en": "Seven", "pos": "number"},
            {"id": "VG02-V08", "cn": "八", "pinyin": "bā", "en": "Eight", "pos": "number"},
            {"id": "VG02-V09", "cn": "九", "pinyin": "jiǔ", "en": "Nine", "pos": "number"},
            {"id": "VG02-V10", "cn": "十", "pinyin": "shí", "en": "Ten", "pos": "number"},
            {"id": "VG02-V11", "cn": "十一", "pinyin": "shí yī", "en": "Eleven (10+1)", "pos": "number"},
            {"id": "VG02-V12", "cn": "二十", "pinyin": "èr shí", "en": "Twenty (2×10)", "pos": "number"},
            {"id": "VG02-V13", "cn": "二十一", "pinyin": "èr shí yī", "en": "Twenty-one (2×10+1)", "pos": "number"},
        ],
        "sentences": [
            {"id": "VG02-S01", "cn": "你几岁？", "pinyin": "nǐ jǐ suì?", "en": "How old are you?"},
            {"id": "VG02-S02", "cn": "我二十五岁。", "pinyin": "wǒ èr shí wǔ suì.", "en": "I'm 25 years old."},
            {"id": "VG02-S03", "cn": "请问", "pinyin": "qǐng wèn", "en": "May I ask...? / Excuse me"},
            {"id": "VG02-S04", "cn": "我不懂。", "pinyin": "wǒ bù dǒng.", "en": "I don't understand."},
        ]
    },
    "SN-VG03": {
        "lessonTitle": "Basic Vocabulary & Polite Phrases",
        "vocab": [
            {"id": "VG03-V01", "cn": "谢谢", "pinyin": "xiè xie", "en": "Thank you", "pos": "phrase"},
            {"id": "VG03-V02", "cn": "对不起", "pinyin": "duì bu qǐ", "en": "Sorry", "pos": "phrase"},
            {"id": "VG03-V03", "cn": "再见", "pinyin": "zài jiàn", "en": "Goodbye", "pos": "phrase"},
            {"id": "VG03-V04", "cn": "不客气", "pinyin": "bú kè qì", "en": "You're welcome", "pos": "phrase"},
            {"id": "VG03-V05", "cn": "请", "pinyin": "qǐng", "en": "Please", "pos": "adverb"},
            {"id": "VG03-V06", "cn": "没关系", "pinyin": "méi guān xì", "en": "No problem / It's okay", "pos": "phrase"},
            {"id": "VG03-V07", "cn": "是的", "pinyin": "shì de", "en": "Yes", "pos": "phrase"},
            {"id": "VG03-V08", "cn": "不是", "pinyin": "bù shì", "en": "No", "pos": "phrase"},
            {"id": "VG03-V09", "cn": "我不懂", "pinyin": "wǒ bù dǒng", "en": "I don't understand", "pos": "phrase"},
        ],
        "sentences": [
            {"id": "VG03-S01", "cn": "你叫什么名字？", "pinyin": "nǐ jiào shénme míngzì?", "en": "What is your name?"},
            {"id": "VG03-S02", "cn": "我叫...", "pinyin": "wǒ jiào...", "en": "My name is..."},
            {"id": "VG03-S03", "cn": "你从哪里来？", "pinyin": "nǐ cóng nǎlǐ lái?", "en": "Where are you from?"},
            {"id": "VG03-S04", "cn": "我来自...", "pinyin": "wǒ lái zì...", "en": "I am from..."},
            {"id": "VG03-S05", "cn": "多少钱？", "pinyin": "duō shǎo qián?", "en": "How much is it?"},
            {"id": "VG03-S06", "cn": "洗手间在哪里？", "pinyin": "xǐ shǒu jiān zài nǎlǐ?", "en": "Where is the bathroom?"},
            {"id": "VG03-S07", "cn": "这是什么？", "pinyin": "zhè shì shénme?", "en": "What is this?"},
        ]
    },
    "SN-VG04": {
        "lessonTitle": "Days of the Week & Time Words",
        "vocab": [
            {"id": "VG04-V01", "cn": "星期一", "pinyin": "xīngqī yī", "en": "Monday", "pos": "noun"},
            {"id": "VG04-V02", "cn": "星期二", "pinyin": "xīngqī èr", "en": "Tuesday", "pos": "noun"},
            {"id": "VG04-V03", "cn": "星期三", "pinyin": "xīngqī sān", "en": "Wednesday", "pos": "noun"},
            {"id": "VG04-V04", "cn": "星期四", "pinyin": "xīngqī sì", "en": "Thursday", "pos": "noun"},
            {"id": "VG04-V05", "cn": "星期五", "pinyin": "xīngqī wǔ", "en": "Friday", "pos": "noun"},
            {"id": "VG04-V06", "cn": "星期六", "pinyin": "xīngqī liù", "en": "Saturday", "pos": "noun"},
            {"id": "VG04-V07", "cn": "星期天", "pinyin": "xīngqī tiān", "en": "Sunday", "pos": "noun"},
            {"id": "VG04-V08", "cn": "今天", "pinyin": "jīn tiān", "en": "Today", "pos": "noun"},
            {"id": "VG04-V09", "cn": "昨天", "pinyin": "zuó tiān", "en": "Yesterday", "pos": "noun"},
            {"id": "VG04-V10", "cn": "明天", "pinyin": "míng tiān", "en": "Tomorrow", "pos": "noun"},
        ],
        "sentences": [
            {"id": "VG04-S01", "cn": "今天是星期三。", "pinyin": "jīntiān shì xīngqī sān.", "en": "Today is Wednesday."},
            {"id": "VG04-S02", "cn": "你明天下午有空吗？", "pinyin": "nǐ míngtiān xiàwǔ yǒu kòng ma?", "en": "Are you free tomorrow afternoon?"},
        ]
    },
    "SN-VG05": {
        "lessonTitle": "Months & Dates",
        "vocab": [
            {"id": "VG05-V01", "cn": "一月", "pinyin": "yī yuè", "en": "January", "pos": "noun"},
            {"id": "VG05-V02", "cn": "二月", "pinyin": "èr yuè", "en": "February", "pos": "noun"},
            {"id": "VG05-V03", "cn": "三月", "pinyin": "sān yuè", "en": "March", "pos": "noun"},
            {"id": "VG05-V04", "cn": "四月", "pinyin": "sì yuè", "en": "April", "pos": "noun"},
            {"id": "VG05-V05", "cn": "五月", "pinyin": "wǔ yuè", "en": "May", "pos": "noun"},
            {"id": "VG05-V06", "cn": "六月", "pinyin": "liù yuè", "en": "June", "pos": "noun"},
            {"id": "VG05-V07", "cn": "七月", "pinyin": "qī yuè", "en": "July", "pos": "noun"},
            {"id": "VG05-V08", "cn": "八月", "pinyin": "bā yuè", "en": "August", "pos": "noun"},
            {"id": "VG05-V09", "cn": "九月", "pinyin": "jiǔ yuè", "en": "September", "pos": "noun"},
            {"id": "VG05-V10", "cn": "十月", "pinyin": "shí yuè", "en": "October", "pos": "noun"},
            {"id": "VG05-V11", "cn": "十一月", "pinyin": "shí yī yuè", "en": "November", "pos": "noun"},
            {"id": "VG05-V12", "cn": "十二月", "pinyin": "shí èr yuè", "en": "December", "pos": "noun"},
        ],
        "sentences": [
            {"id": "VG05-S01", "cn": "今天是几号？", "pinyin": "jīntiān shì jǐ hào?", "en": "What's the date today?"},
            {"id": "VG05-S02", "cn": "今天是三月五号。", "pinyin": "jīntiān shì sān yuè wǔ hào.", "en": "Today is March 5th."},
            {"id": "VG05-S03", "cn": "我的生日是九月二十号。", "pinyin": "wǒ de shēngrì shì jiǔ yuè èr shí hào.", "en": "My birthday is September 20th."},
        ]
    },
    "SN-VG06": {
        "lessonTitle": "Home & Household",
        "vocab": [
            {"id": "VG06-V01", "cn": "客厅", "pinyin": "kètīng", "en": "Living room", "pos": "noun"},
            {"id": "VG06-V02", "cn": "卧室", "pinyin": "wòshì", "en": "Bedroom", "pos": "noun"},
            {"id": "VG06-V03", "cn": "厨房", "pinyin": "chúfáng", "en": "Kitchen", "pos": "noun"},
            {"id": "VG06-V04", "cn": "浴室", "pinyin": "yùshì", "en": "Bathroom", "pos": "noun"},
            {"id": "VG06-V05", "cn": "餐厅", "pinyin": "cāntīng", "en": "Dining room", "pos": "noun"},
            {"id": "VG06-V06", "cn": "书房", "pinyin": "shūfáng", "en": "Study", "pos": "noun"},
            {"id": "VG06-V07", "cn": "车库", "pinyin": "chēkù", "en": "Garage", "pos": "noun"},
            {"id": "VG06-V08", "cn": "阳台", "pinyin": "yángtái", "en": "Balcony", "pos": "noun"},
            {"id": "VG06-V09", "cn": "院子", "pinyin": "yuànzi", "en": "Garden / Yard", "pos": "noun"},
            {"id": "VG06-V10", "cn": "沙发", "pinyin": "shāfā", "en": "Sofa", "pos": "noun"},
            {"id": "VG06-V11", "cn": "椅子", "pinyin": "yǐzi", "en": "Chair", "pos": "noun"},
            {"id": "VG06-V12", "cn": "桌子", "pinyin": "zhuōzi", "en": "Table", "pos": "noun"},
            {"id": "VG06-V13", "cn": "床", "pinyin": "chuáng", "en": "Bed", "pos": "noun"},
            {"id": "VG06-V14", "cn": "电视", "pinyin": "diànshì", "en": "TV", "pos": "noun"},
            {"id": "VG06-V15", "cn": "冰箱", "pinyin": "bīngxiāng", "en": "Refrigerator", "pos": "noun"},
            {"id": "VG06-V16", "cn": "灯", "pinyin": "dēng", "en": "Light / Lamp", "pos": "noun"},
            {"id": "VG06-V17", "cn": "洗衣机", "pinyin": "xǐyījī", "en": "Washing machine", "pos": "noun"},
            {"id": "VG06-V18", "cn": "打扫", "pinyin": "dǎsǎo", "en": "Clean", "pos": "verb"},
            {"id": "VG06-V19", "cn": "做饭", "pinyin": "zuòfàn", "en": "Cook", "pos": "verb"},
            {"id": "VG06-V20", "cn": "洗衣服", "pinyin": "xǐ yīfú", "en": "Do laundry", "pos": "verb"},
            {"id": "VG06-V21", "cn": "吸尘", "pinyin": "xīchén", "en": "Vacuum", "pos": "verb"},
        ],
        "sentences": [
            {"id": "VG06-S01", "cn": "我在家。", "pinyin": "wǒ zài jiā.", "en": "I am at home."},
            {"id": "VG06-S02", "cn": "这是我的家。", "pinyin": "zhè shì wǒ de jiā.", "en": "This is my home."},
            {"id": "VG06-S03", "cn": "你住在哪里？", "pinyin": "nǐ zhù zài nǎlǐ?", "en": "Where do you live?"},
            {"id": "VG06-S04", "cn": "请进！", "pinyin": "qǐng jìn!", "en": "Come in!"},
            {"id": "VG06-S05", "cn": "我们要搬家。", "pinyin": "wǒmen yào bānjiā.", "en": "We are moving."},
        ]
    },
    "SN-VG07": {
        "lessonTitle": "School & Subjects",
        "vocab": [
            {"id": "VG07-V01", "cn": "数学", "pinyin": "shùxué", "en": "Mathematics", "pos": "noun"},
            {"id": "VG07-V02", "cn": "语文", "pinyin": "yǔwén", "en": "Chinese (language)", "pos": "noun"},
            {"id": "VG07-V03", "cn": "英语", "pinyin": "yīngyǔ", "en": "English", "pos": "noun"},
            {"id": "VG07-V04", "cn": "科学", "pinyin": "kēxué", "en": "Science", "pos": "noun"},
            {"id": "VG07-V05", "cn": "历史", "pinyin": "lìshǐ", "en": "History", "pos": "noun"},
            {"id": "VG07-V06", "cn": "地理", "pinyin": "dìlǐ", "en": "Geography", "pos": "noun"},
            {"id": "VG07-V07", "cn": "体育", "pinyin": "tǐyù", "en": "Physical Education", "pos": "noun"},
            {"id": "VG07-V08", "cn": "美术", "pinyin": "měishù", "en": "Art", "pos": "noun"},
            {"id": "VG07-V09", "cn": "书", "pinyin": "shū", "en": "Book", "pos": "noun"},
            {"id": "VG07-V10", "cn": "铅笔", "pinyin": "qiān bǐ", "en": "Pencil", "pos": "noun"},
            {"id": "VG07-V11", "cn": "橡皮", "pinyin": "xiàng pí", "en": "Eraser", "pos": "noun"},
            {"id": "VG07-V12", "cn": "纸", "pinyin": "zhǐ", "en": "Paper", "pos": "noun"},
        ],
        "sentences": [
            {"id": "VG07-S01", "cn": "我在上学。", "pinyin": "wǒ zài shàngxué.", "en": "I am at school."},
            {"id": "VG07-S02", "cn": "我在学中文。", "pinyin": "wǒ zài xué zhōngwén.", "en": "I am learning Chinese."},
            {"id": "VG07-S03", "cn": "你在学什么？", "pinyin": "nǐ zài xué shénme?", "en": "What are you studying?"},
            {"id": "VG07-S04", "cn": "今天有课吗？", "pinyin": "jīntiān yǒu kè ma?", "en": "Do we have class today?"},
            {"id": "VG07-S05", "cn": "我喜欢这个科目。", "pinyin": "wǒ xǐhuān zhè ge kēmù.", "en": "I like this subject."},
            {"id": "VG07-S06", "cn": "今天几号？", "pinyin": "jīntiān jǐ hào?", "en": "What is the date today?"},
            {"id": "VG07-S07", "cn": "今天是星期几？", "pinyin": "jīntiān shì xīngqī jǐ?", "en": "What day is it today?"},
            {"id": "VG07-S08", "cn": "什么时候放学？", "pinyin": "shénme shíhou fàngxué?", "en": "When is school over?"},
            {"id": "VG07-S09", "cn": "我可以去厕所吗？", "pinyin": "wǒ kěyǐ qù cèsuǒ ma?", "en": "Can I go to the restroom?"},
            {"id": "VG07-S10", "cn": "你有作业吗？", "pinyin": "nǐ yǒu zuòyè ma?", "en": "Do you have homework?"},
        ]
    },
    "SN-VG08": {
        "lessonTitle": "Basic Grammar Patterns",
        "vocab": [
            {"id": "VG08-V01", "cn": "是", "pinyin": "shì", "en": "To be (identifying)", "pos": "verb"},
            {"id": "VG08-V02", "cn": "不", "pinyin": "bù", "en": "Not (negation)", "pos": "adverb"},
            {"id": "VG08-V03", "cn": "吗", "pinyin": "ma", "en": "Question particle (yes/no)", "pos": "particle"},
            {"id": "VG08-V04", "cn": "学生", "pinyin": "xuéshēng", "en": "Student", "pos": "noun"},
            {"id": "VG08-V05", "cn": "老师", "pinyin": "lǎoshī", "en": "Teacher", "pos": "noun"},
            {"id": "VG08-V06", "cn": "苹果", "pinyin": "píngguǒ", "en": "Apple", "pos": "noun"},
            {"id": "VG08-V07", "cn": "肉", "pinyin": "ròu", "en": "Meat", "pos": "noun"},
        ],
        "sentences": [
            {"id": "VG08-S01", "cn": "我吃苹果。", "pinyin": "wǒ chī píngguǒ.", "en": "I eat an apple. (SVO word order)"},
            {"id": "VG08-S02", "cn": "他看书。", "pinyin": "tā kàn shū.", "en": "He reads a book."},
            {"id": "VG08-S03", "cn": "我是学生。", "pinyin": "wǒ shì xuéshēng.", "en": "I am a student."},
            {"id": "VG08-S04", "cn": "这是我的书。", "pinyin": "zhè shì wǒ de shū.", "en": "This is my book."},
            {"id": "VG08-S05", "cn": "我不吃肉。", "pinyin": "wǒ bù chī ròu.", "en": "I do not eat meat."},
            {"id": "VG08-S06", "cn": "她不是老师。", "pinyin": "tā bù shì lǎoshī.", "en": "She is not a teacher."},
            {"id": "VG08-S07", "cn": "你是学生吗？", "pinyin": "nǐ shì xuéshēng ma?", "en": "Are you a student?"},
            {"id": "VG08-S08", "cn": "他吃苹果吗？", "pinyin": "tā chī píngguǒ ma?", "en": "Does he eat apples?"},
        ]
    },
    "SN-VG09": {
        "lessonTitle": "Food & Ordering",
        "vocab": [
            {"id": "VG09-V01", "cn": "饭", "pinyin": "fàn", "en": "Rice / Meal", "pos": "noun"},
            {"id": "VG09-V02", "cn": "包子", "pinyin": "bāo zi", "en": "Steamed bun", "pos": "noun"},
            {"id": "VG09-V03", "cn": "饺子", "pinyin": "jiǎo zi", "en": "Dumplings", "pos": "noun"},
            {"id": "VG09-V04", "cn": "鱼", "pinyin": "yú", "en": "Fish", "pos": "noun"},
            {"id": "VG09-V05", "cn": "鸡肉", "pinyin": "jī ròu", "en": "Chicken", "pos": "noun"},
            {"id": "VG09-V06", "cn": "牛肉", "pinyin": "niú ròu", "en": "Beef", "pos": "noun"},
            {"id": "VG09-V07", "cn": "蔬菜", "pinyin": "shū cài", "en": "Vegetables", "pos": "noun"},
            {"id": "VG09-V08", "cn": "水果", "pinyin": "shuǐ guǒ", "en": "Fruit", "pos": "noun"},
            {"id": "VG09-V09", "cn": "面包", "pinyin": "miàn bāo", "en": "Bread", "pos": "noun"},
            {"id": "VG09-V10", "cn": "牛奶", "pinyin": "niú nǎi", "en": "Milk", "pos": "noun"},
            {"id": "VG09-V11", "cn": "水", "pinyin": "shuǐ", "en": "Water", "pos": "noun"},
            {"id": "VG09-V12", "cn": "果汁", "pinyin": "guǒ zhī", "en": "Fruit juice", "pos": "noun"},
            {"id": "VG09-V13", "cn": "炒饭", "pinyin": "chǎo fàn", "en": "Fried rice", "pos": "noun"},
            {"id": "VG09-V14", "cn": "炒面", "pinyin": "chǎo miàn", "en": "Fried noodles", "pos": "noun"},
            {"id": "VG09-V15", "cn": "火锅", "pinyin": "huǒ guō", "en": "Hot pot", "pos": "noun"},
            {"id": "VG09-V16", "cn": "宫保鸡丁", "pinyin": "gōng bǎo jī dīng", "en": "Kung Pao chicken", "pos": "noun"},
            {"id": "VG09-V17", "cn": "麻婆豆腐", "pinyin": "má pó dòu fǔ", "en": "Mapo tofu", "pos": "noun"},
        ],
        "sentences": [
            {"id": "VG09-S01", "cn": "我要这个。", "pinyin": "wǒ yào zhè ge.", "en": "I want this."},
            {"id": "VG09-S02", "cn": "你们有寿司吗？", "pinyin": "nǐmen yǒu shòu sī ma?", "en": "Do you have sushi?"},
            {"id": "VG09-S03", "cn": "有点辣吗？", "pinyin": "yǒu diǎn là ma?", "en": "Is it spicy?"},
            {"id": "VG09-S04", "cn": "可以打包吗？", "pinyin": "kě yǐ dǎ bāo ma?", "en": "Can I get it to-go?"},
        ]
    },
    "SN-VG10": {
        "lessonTitle": "Books & Reading",
        "vocab": [
            {"id": "VG10-V01", "cn": "书本", "pinyin": "shū běn", "en": "Book", "pos": "noun"},
            {"id": "VG10-V02", "cn": "书包", "pinyin": "shū bāo", "en": "School bag / Backpack", "pos": "noun"},
            {"id": "VG10-V03", "cn": "背包", "pinyin": "bèi bāo", "en": "Backpack", "pos": "noun"},
            {"id": "VG10-V04", "cn": "小说", "pinyin": "xiǎo shuō", "en": "Novel", "pos": "noun"},
            {"id": "VG10-V05", "cn": "教材", "pinyin": "jiào cái", "en": "Textbook", "pos": "noun"},
            {"id": "VG10-V06", "cn": "笔记本", "pinyin": "bǐ jì běn", "en": "Notebook", "pos": "noun"},
            {"id": "VG10-V07", "cn": "书架", "pinyin": "shū jià", "en": "Bookshelf", "pos": "noun"},
            {"id": "VG10-V08", "cn": "图书馆", "pinyin": "tú shū guǎn", "en": "Library", "pos": "noun"},
            {"id": "VG10-V09", "cn": "字典", "pinyin": "zì diǎn", "en": "Dictionary", "pos": "noun"},
            {"id": "VG10-V10", "cn": "漫画", "pinyin": "mànhuà", "en": "Comic book / Manga", "pos": "noun"},
        ],
        "sentences": [
            {"id": "VG10-S01", "cn": "这本书很好。", "pinyin": "zhè běn shū hěn hǎo.", "en": "This book is very good."},
            {"id": "VG10-S02", "cn": "你喜欢看书吗？", "pinyin": "nǐ xǐ huān kàn shū ma?", "en": "Do you like to read books?"},
            {"id": "VG10-S03", "cn": "我正在读一本书。", "pinyin": "wǒ zhèng zài dú yì běn shū.", "en": "I am reading a book."},
            {"id": "VG10-S04", "cn": "这本书有趣吗？", "pinyin": "zhè běn shū yǒu qù ma?", "en": "Is this book interesting?"},
            {"id": "VG10-S05", "cn": "我喜欢读小说。", "pinyin": "wǒ xǐ huān dú xiǎo shuō.", "en": "I like reading novels."},
            {"id": "VG10-S06", "cn": "你在读什么书？", "pinyin": "nǐ zài dú shénme shū?", "en": "What book are you reading?"},
            {"id": "VG10-S07", "cn": "漫画书很有趣。", "pinyin": "mànhuà shū hěn yǒu qù.", "en": "Comic books are very interesting."},
        ]
    },
    "SN-VG11": {
        "lessonTitle": "Soccer Vocabulary",
        "vocab": [
            {"id": "VG11-V01", "cn": "足球", "pinyin": "zúqiú", "en": "Soccer", "pos": "noun"},
            {"id": "VG11-V02", "cn": "比赛", "pinyin": "bǐsài", "en": "Match / Game", "pos": "noun"},
            {"id": "VG11-V03", "cn": "场地", "pinyin": "chǎng dì", "en": "Field", "pos": "noun"},
            {"id": "VG11-V04", "cn": "门将", "pinyin": "ménjiàng", "en": "Goalkeeper", "pos": "noun"},
            {"id": "VG11-V05", "cn": "中场", "pinyin": "zhōngchǎng", "en": "Midfielder", "pos": "noun"},
            {"id": "VG11-V06", "cn": "前锋", "pinyin": "qiánfēng", "en": "Forward", "pos": "noun"},
            {"id": "VG11-V07", "cn": "裁判", "pinyin": "cáipàn", "en": "Referee", "pos": "noun"},
            {"id": "VG11-V08", "cn": "球员", "pinyin": "qiúyuán", "en": "Player", "pos": "noun"},
            {"id": "VG11-V09", "cn": "角球", "pinyin": "jiǎoqiú", "en": "Corner kick", "pos": "noun"},
            {"id": "VG11-V10", "cn": "点球", "pinyin": "diǎnqiú", "en": "Penalty kick", "pos": "noun"},
            {"id": "VG11-V11", "cn": "任意球", "pinyin": "rènyìqiú", "en": "Free kick", "pos": "noun"},
            {"id": "VG11-V12", "cn": "越位", "pinyin": "yuèwèi", "en": "Offside", "pos": "noun"},
        ],
        "sentences": [
            {"id": "VG11-S01", "cn": "你喜欢踢足球吗？", "pinyin": "nǐ xǐhuān tī zúqiú ma?", "en": "Do you like playing soccer?"},
            {"id": "VG11-S02", "cn": "比赛什么时候开始？", "pinyin": "bǐsài shénme shíhòu kāishǐ?", "en": "When does the match start?"},
            {"id": "VG11-S03", "cn": "我们赢了吗？", "pinyin": "wǒmen yíng le ma?", "en": "Did we win?"},
            {"id": "VG11-S04", "cn": "今天有足球比赛吗？", "pinyin": "jīntiān yǒu zúqiú bǐsài ma?", "en": "Is there a soccer match today?"},
        ]
    },
    "SN-VG12": {
        "lessonTitle": "Drinks & Ordering",
        "vocab": [
            {"id": "VG12-V01", "cn": "水", "pinyin": "shuǐ", "en": "Water", "pos": "noun"},
            {"id": "VG12-V02", "cn": "果汁", "pinyin": "guǒ zhī", "en": "Juice", "pos": "noun"},
            {"id": "VG12-V03", "cn": "咖啡", "pinyin": "kā fēi", "en": "Coffee", "pos": "noun"},
            {"id": "VG12-V04", "cn": "奶茶", "pinyin": "nǎi chá", "en": "Milk tea", "pos": "noun"},
            {"id": "VG12-V05", "cn": "绿茶", "pinyin": "lǜ chá", "en": "Green tea", "pos": "noun"},
            {"id": "VG12-V06", "cn": "红茶", "pinyin": "hóng chá", "en": "Black tea", "pos": "noun"},
            {"id": "VG12-V07", "cn": "苏打水", "pinyin": "sū dǎ shuǐ", "en": "Soda", "pos": "noun"},
            {"id": "VG12-V08", "cn": "热巧克力", "pinyin": "rè qiǎo kè lì", "en": "Hot chocolate", "pos": "noun"},
            {"id": "VG12-V09", "cn": "热", "pinyin": "rè", "en": "Hot", "pos": "adjective"},
            {"id": "VG12-V10", "cn": "冷", "pinyin": "lěng", "en": "Cold", "pos": "adjective"},
            {"id": "VG12-V11", "cn": "甜", "pinyin": "tián", "en": "Sweet", "pos": "adjective"},
            {"id": "VG12-V12", "cn": "无糖", "pinyin": "wú táng", "en": "Sugar-free", "pos": "adjective"},
            {"id": "VG12-V13", "cn": "加冰", "pinyin": "jiā bīng", "en": "With ice", "pos": "phrase"},
            {"id": "VG12-V14", "cn": "不加冰", "pinyin": "bù jiā bīng", "en": "Without ice", "pos": "phrase"},
        ],
        "sentences": [
            {"id": "VG12-S01", "cn": "我想要...", "pinyin": "wǒ xiǎng yào...", "en": "I would like..."},
            {"id": "VG12-S02", "cn": "我想点...", "pinyin": "wǒ xiǎng diǎn...", "en": "I would like to order..."},
            {"id": "VG12-S03", "cn": "你有...吗？", "pinyin": "nǐ yǒu...ma?", "en": "Do you have...?"},
            {"id": "VG12-S04", "cn": "请给我...", "pinyin": "qǐng gěi wǒ...", "en": "Please give me..."},
        ]
    },
    "SN-VG13": {
        "lessonTitle": "Vegetables",
        "vocab": [
            {"id": "VG13-V01", "cn": "菜", "pinyin": "cài", "en": "Vegetable", "pos": "noun"},
            {"id": "VG13-V02", "cn": "土豆", "pinyin": "tǔ dòu", "en": "Potato", "pos": "noun"},
            {"id": "VG13-V03", "cn": "胡萝卜", "pinyin": "hú luó bo", "en": "Carrot", "pos": "noun"},
            {"id": "VG13-V04", "cn": "番茄", "pinyin": "fān qié", "en": "Tomato", "pos": "noun"},
            {"id": "VG13-V05", "cn": "洋葱", "pinyin": "yáng cōng", "en": "Onion", "pos": "noun"},
            {"id": "VG13-V06", "cn": "菠菜", "pinyin": "bō cài", "en": "Spinach", "pos": "noun"},
            {"id": "VG13-V07", "cn": "生菜", "pinyin": "shēng cài", "en": "Lettuce", "pos": "noun"},
            {"id": "VG13-V08", "cn": "黄瓜", "pinyin": "huáng guā", "en": "Cucumber", "pos": "noun"},
            {"id": "VG13-V09", "cn": "南瓜", "pinyin": "nán guā", "en": "Pumpkin", "pos": "noun"},
            {"id": "VG13-V10", "cn": "青椒", "pinyin": "qīng jiāo", "en": "Green pepper", "pos": "noun"},
            {"id": "VG13-V11", "cn": "白菜", "pinyin": "bái cài", "en": "Chinese cabbage", "pos": "noun"},
            {"id": "VG13-V12", "cn": "香菇", "pinyin": "xiāng gū", "en": "Shiitake mushroom", "pos": "noun"},
        ],
        "sentences": [
            {"id": "VG13-S01", "cn": "我喜欢吃蔬菜。", "pinyin": "wǒ xǐ huān chī shū cài.", "en": "I like to eat vegetables."},
            {"id": "VG13-S02", "cn": "你吃过这个蔬菜吗？", "pinyin": "nǐ chī guò zhè ge shū cài ma?", "en": "Have you eaten this vegetable before?"},
            {"id": "VG13-S03", "cn": "这道菜有很多蔬菜。", "pinyin": "zhè dào cài yǒu hěn duō shū cài.", "en": "This dish has many vegetables."},
            {"id": "VG13-S04", "cn": "你喜欢吃什么蔬菜？", "pinyin": "nǐ xǐ huān chī shénme shū cài?", "en": "What vegetables do you like to eat?"},
            {"id": "VG13-S05", "cn": "这些蔬菜贵吗？", "pinyin": "zhè xiē shū cài guì ma?", "en": "Are these vegetables expensive?"},
        ]
    },
    "SN-VG14": {
        "lessonTitle": "Sports",
        "vocab": [
            {"id": "VG14-V01", "cn": "运动", "pinyin": "yùndòng", "en": "Sports", "pos": "noun"},
            {"id": "VG14-V02", "cn": "足球", "pinyin": "zúqiú", "en": "Soccer", "pos": "noun"},
            {"id": "VG14-V03", "cn": "篮球", "pinyin": "lánqiú", "en": "Basketball", "pos": "noun"},
            {"id": "VG14-V04", "cn": "游泳", "pinyin": "yóuyǒng", "en": "Swimming", "pos": "noun"},
            {"id": "VG14-V05", "cn": "跑步", "pinyin": "pǎobù", "en": "Running", "pos": "noun"},
            {"id": "VG14-V06", "cn": "高尔夫", "pinyin": "gāo'ěrfū", "en": "Golf", "pos": "noun"},
            {"id": "VG14-V07", "cn": "排球", "pinyin": "páiqiú", "en": "Volleyball", "pos": "noun"},
            {"id": "VG14-V08", "cn": "健身", "pinyin": "jiànshēn", "en": "Fitness / Working out", "pos": "noun"},
            {"id": "VG14-V09", "cn": "胜利", "pinyin": "shènglì", "en": "Victory", "pos": "noun"},
            {"id": "VG14-V10", "cn": "失败", "pinyin": "shībài", "en": "Defeat", "pos": "noun"},
            {"id": "VG14-V11", "cn": "队", "pinyin": "duì", "en": "Team", "pos": "noun"},
            {"id": "VG14-V12", "cn": "教练", "pinyin": "jiàoliàn", "en": "Coach", "pos": "noun"},
        ],
        "sentences": [
            {"id": "VG14-S01", "cn": "我喜欢...", "pinyin": "wǒ xǐhuān...", "en": "I like playing..."},
            {"id": "VG14-S02", "cn": "你会游泳吗？", "pinyin": "nǐ huì yóuyǒng ma?", "en": "Can you swim?"},
            {"id": "VG14-S03", "cn": "我在健身房锻炼。", "pinyin": "wǒ zài jiànshēnfáng duànliàn.", "en": "I am working out at the gym."},
        ]
    },
    "SN-VG15": {
        "lessonTitle": "Weather",
        "vocab": [
            {"id": "VG15-V01", "cn": "天气", "pinyin": "tiān qì", "en": "Weather", "pos": "noun"},
            {"id": "VG15-V02", "cn": "雨", "pinyin": "yǔ", "en": "Rain", "pos": "noun"},
            {"id": "VG15-V03", "cn": "雪", "pinyin": "xuě", "en": "Snow", "pos": "noun"},
            {"id": "VG15-V04", "cn": "风", "pinyin": "fēng", "en": "Wind", "pos": "noun"},
            {"id": "VG15-V05", "cn": "云", "pinyin": "yún", "en": "Cloud", "pos": "noun"},
            {"id": "VG15-V06", "cn": "雷", "pinyin": "léi", "en": "Thunder", "pos": "noun"},
            {"id": "VG15-V07", "cn": "冰", "pinyin": "bīng", "en": "Ice", "pos": "noun"},
            {"id": "VG15-V08", "cn": "湿", "pinyin": "shī", "en": "Wet", "pos": "adjective"},
            {"id": "VG15-V09", "cn": "热", "pinyin": "rè", "en": "Hot", "pos": "adjective"},
            {"id": "VG15-V10", "cn": "冷", "pinyin": "lěng", "en": "Cold", "pos": "adjective"},
            {"id": "VG15-V11", "cn": "暖和", "pinyin": "nuǎn huo", "en": "Warm", "pos": "adjective"},
            {"id": "VG15-V12", "cn": "凉快", "pinyin": "liáng kuai", "en": "Cool", "pos": "adjective"},
        ],
        "sentences": [
            {"id": "VG15-S01", "cn": "今天天气怎么样？", "pinyin": "jīn tiān tiān qì zěn me yàng?", "en": "How's the weather today?"},
            {"id": "VG15-S02", "cn": "今天天气很热。", "pinyin": "jīn tiān hěn rè.", "en": "It's hot today."},
            {"id": "VG15-S03", "cn": "明天会下雨吗？", "pinyin": "míng tiān huì xià yǔ ma?", "en": "Will it rain tomorrow?"},
            {"id": "VG15-S04", "cn": "今天天气很冷。", "pinyin": "jīn tiān hěn lěng.", "en": "It's cold today."},
        ]
    },
    "SN-VG16": {
        "lessonTitle": "Medicine & Health",
        "vocab": [
            {"id": "VG16-V01", "cn": "药", "pinyin": "yào", "en": "Medicine", "pos": "noun"},
            {"id": "VG16-V02", "cn": "医生", "pinyin": "yī shēng", "en": "Doctor", "pos": "noun"},
            {"id": "VG16-V03", "cn": "护士", "pinyin": "hù shì", "en": "Nurse", "pos": "noun"},
            {"id": "VG16-V04", "cn": "医院", "pinyin": "yī yuàn", "en": "Hospital", "pos": "noun"},
            {"id": "VG16-V05", "cn": "药店", "pinyin": "yào diàn", "en": "Pharmacy", "pos": "noun"},
            {"id": "VG16-V06", "cn": "处方", "pinyin": "chǔ fāng", "en": "Prescription", "pos": "noun"},
            {"id": "VG16-V07", "cn": "头痛", "pinyin": "tóu tòng", "en": "Headache", "pos": "noun"},
            {"id": "VG16-V08", "cn": "胃痛", "pinyin": "wèi tòng", "en": "Stomachache", "pos": "noun"},
            {"id": "VG16-V09", "cn": "发烧", "pinyin": "fā shāo", "en": "Fever", "pos": "noun"},
            {"id": "VG16-V10", "cn": "咳嗽", "pinyin": "ké sou", "en": "Cough", "pos": "noun"},
            {"id": "VG16-V11", "cn": "打喷嚏", "pinyin": "dǎ pēn tì", "en": "Sneeze", "pos": "verb"},
            {"id": "VG16-V12", "cn": "疼", "pinyin": "téng", "en": "Pain", "pos": "adjective"},
            {"id": "VG16-V13", "cn": "痒", "pinyin": "yǎng", "en": "Itchy", "pos": "adjective"},
            {"id": "VG16-V14", "cn": "打针", "pinyin": "dǎ zhēn", "en": "Injection", "pos": "noun"},
            {"id": "VG16-V15", "cn": "药片", "pinyin": "yào piàn", "en": "Tablet / Pill", "pos": "noun"},
            {"id": "VG16-V16", "cn": "药水", "pinyin": "yào shuǐ", "en": "Liquid medicine", "pos": "noun"},
            {"id": "VG16-V17", "cn": "退烧药", "pinyin": "tuì shāo yào", "en": "Fever medicine", "pos": "noun"},
            {"id": "VG16-V18", "cn": "服药", "pinyin": "fú yào", "en": "Take medicine", "pos": "verb"},
        ],
        "sentences": []
    },
    "SN-VG17": {
        "lessonTitle": "Pronouns",
        "vocab": [
            {"id": "VG17-V01", "cn": "我", "pinyin": "wǒ", "en": "I / me", "pos": "pronoun"},
            {"id": "VG17-V02", "cn": "你", "pinyin": "nǐ", "en": "You", "pos": "pronoun"},
            {"id": "VG17-V03", "cn": "他", "pinyin": "tā", "en": "He / him", "pos": "pronoun"},
            {"id": "VG17-V04", "cn": "她", "pinyin": "tā", "en": "She / her", "pos": "pronoun"},
            {"id": "VG17-V05", "cn": "它", "pinyin": "tā", "en": "It", "pos": "pronoun"},
            {"id": "VG17-V06", "cn": "我们", "pinyin": "wǒmen", "en": "We / us", "pos": "pronoun"},
            {"id": "VG17-V07", "cn": "你们", "pinyin": "nǐmen", "en": "You (plural)", "pos": "pronoun"},
            {"id": "VG17-V08", "cn": "他们", "pinyin": "tāmen", "en": "They / them", "pos": "pronoun"},
            {"id": "VG17-V09", "cn": "自己", "pinyin": "zìjǐ", "en": "Oneself", "pos": "pronoun"},
            {"id": "VG17-V10", "cn": "这", "pinyin": "zhè", "en": "This", "pos": "pronoun"},
            {"id": "VG17-V11", "cn": "那", "pinyin": "nà", "en": "That", "pos": "pronoun"},
            {"id": "VG17-V12", "cn": "这些", "pinyin": "zhè xiē", "en": "These", "pos": "pronoun"},
            {"id": "VG17-V13", "cn": "那些", "pinyin": "nà xiē", "en": "Those", "pos": "pronoun"},
            {"id": "VG17-V14", "cn": "我的", "pinyin": "wǒ de", "en": "My / mine", "pos": "pronoun"},
            {"id": "VG17-V15", "cn": "你的", "pinyin": "nǐ de", "en": "Your / yours", "pos": "pronoun"},
            {"id": "VG17-V16", "cn": "他的", "pinyin": "tā de", "en": "His", "pos": "pronoun"},
            {"id": "VG17-V17", "cn": "她的", "pinyin": "tā de", "en": "Her / hers", "pos": "pronoun"},
            {"id": "VG17-V18", "cn": "我们的", "pinyin": "wǒmen de", "en": "Our / ours", "pos": "pronoun"},
        ],
        "sentences": [
            {"id": "VG17-S01", "cn": "我喜欢自己。", "pinyin": "wǒ xǐ huān zìjǐ.", "en": "I like myself."},
            {"id": "VG17-S02", "cn": "他在照顾自己。", "pinyin": "tā zài zhào gù zìjǐ.", "en": "He is taking care of himself."},
        ]
    },
    "SN-VG18": {
        "lessonTitle": "Grammar: Word Order, Plurals & Classifiers",
        "vocab": [
            {"id": "VG18-V01", "cn": "们", "pinyin": "men", "en": "Plural marker (for people)", "pos": "suffix"},
            {"id": "VG18-V02", "cn": "本", "pinyin": "běn", "en": "Measure word (books)", "pos": "measure word"},
            {"id": "VG18-V03", "cn": "只", "pinyin": "zhī", "en": "Measure word (animals)", "pos": "measure word"},
            {"id": "VG18-V04", "cn": "个", "pinyin": "gè", "en": "Measure word (general)", "pos": "measure word"},
            {"id": "VG18-V05", "cn": "什么", "pinyin": "shénme", "en": "What", "pos": "question word"},
            {"id": "VG18-V06", "cn": "谁", "pinyin": "shéi", "en": "Who", "pos": "question word"},
            {"id": "VG18-V07", "cn": "怎么", "pinyin": "zěnme", "en": "How", "pos": "question word"},
        ],
        "sentences": [
            {"id": "VG18-S01", "cn": "我爱中文。", "pinyin": "wǒ ài zhōngwén.", "en": "I love Chinese. (SVO)"},
            {"id": "VG18-S02", "cn": "一本书", "pinyin": "yī běn shū", "en": "One book (measure word: 本)"},
            {"id": "VG18-S03", "cn": "三只猫", "pinyin": "sān zhī māo", "en": "Three cats (measure word: 只)"},
            {"id": "VG18-S04", "cn": "两个人", "pinyin": "liǎng gè rén", "en": "Two people (measure word: 个)"},
            {"id": "VG18-S05", "cn": "学生们", "pinyin": "xuésheng men", "en": "Students (们 for plural people)"},
        ]
    },
}

# Count totals
total_vocab = sum(len(g["vocab"]) for g in vocab_groups.values())
total_sentences = sum(len(g["sentences"]) for g in vocab_groups.values())
print(f"Generated {len(vocab_groups)} vocab group lessons")
print(f"Total: {total_vocab} vocab cards + {total_sentences} sentence cards = {total_vocab + total_sentences} cards")

# Write cards JSON
cards_path = "src/data/vocab-groups-cards.json"
with open(cards_path, "w", encoding="utf-8") as f:
    json.dump(vocab_groups, f, ensure_ascii=False, indent=2)
print(f"Written to {cards_path}")

# Now update courses.json to add vocab group lessons to the study-notes level
courses_path = "src/data/courses.json"
with open(courses_path, "r", encoding="utf-8") as f:
    courses = json.load(f)

# Find the study-notes level
sn_level = None
for level in courses["levels"]:
    if level["id"] == "study-notes":
        sn_level = level
        break

if sn_level:
    # Build new lesson entries for vocab groups (prepend before existing lessons)
    vg_lessons = []
    order = 1
    for lesson_id, data in vocab_groups.items():
        vg_lessons.append({
            "id": lesson_id,
            "title": data["lessonTitle"],
            "order": order
        })
        order += 1

    # Re-number existing lessons
    existing_lessons = sn_level.get("lessons", [])
    for ls in existing_lessons:
        ls["order"] = order
        order += 1

    # Prepend vocab groups
    sn_level["lessons"] = vg_lessons + existing_lessons

    with open(courses_path, "w", encoding="utf-8") as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)

    print(f"Updated {courses_path}: added {len(vg_lessons)} vocab group lessons (total: {len(sn_level['lessons'])} lessons)")
else:
    print("ERROR: study-notes level not found in courses.json")
