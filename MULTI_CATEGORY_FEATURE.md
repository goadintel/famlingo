# Multi-Category Feature for Common Phrases

## Summary
Added comprehensive category management to "My Common Phrases" page, allowing phrases to belong to multiple categories simultaneously.

## Features Implemented

### 1. Multi-Category Assignment ✅
- Changed from single category to multiple categories per phrase
- **"Common Phrases" always included** by default
- Users can select additional categories
- Visual checkmarks (✓) show selected categories

### 2. Create Custom Categories ✅
- Click "➕ Create New Category" button
- Enter English name, Chinese name, and emoji icon
- Custom categories saved to localStorage
- Persist across sessions

### 3. Category Badges on Phrases ✅
- Each phrase shows all its categories as colored badges
- Format: `🏷️ Category Name`
- Purple rounded pills for easy visibility

### 4. Delete Phrases ✅
- Already existed, kept functional
- Red 🗑️ button on each phrase
- Confirms before deleting

### 5. US → GB Flag Change ✅
- Replaced all 🇺🇸 flags with 🇬🇧
- Better represents English as global language
- Applied across all views

---

## UI Changes

### Before:
```
Select Category (Single)
┌─────────────┐
│ ○ Greetings │
│ ○ Numbers   │  ← Only one can be selected
│ ○ Food      │
└─────────────┘
```

### After:
```
Select Categories (Multi-select)
✓ "Common Phrases" is always included

┌─────────────┐
│ ✓ ⭐ Common │  ← Always selected
│ ✓ 👋 Greet  │  ← Multiple selections
│   🕐 Numbers │
│ ✓ 🍜 Food   │
└─────────────┘
┌───────────────────────────────┐
│ ➕ Create New Category        │
└───────────────────────────────┘
```

---

## Data Structure Change

### Old Format:
```javascript
{
  id: "phrase-123",
  cn: "你好",
  en: "Hello",
  category: "greetings",  // Single category
  categoryIcon: "👋"
}
```

### New Format:
```javascript
{
  id: "phrase-123",
  cn: "你好",
  en: "Hello",
  categories: [           // Array of categories
    "common_phrases",
    "greetings",
    "travel"
  ]
}
```

**Backward Compatible**: Code handles both `categories` array and old `category` string.

---

## How It Works

### Saving a Phrase

1. **User translates** a phrase with AI
2. **Selects categories** (Common Phrases + others)
3. **Clicks "Save Phrase"**
4. Phrase saved with all selected categories
5. Alert shows: `"Phrase saved to 3 categories!"`

### Creating a Category

1. Click **"➕ Create New Category"**
2. Modal appears with 3 fields:
   - English name (e.g., "Travel Phrases")
   - Chinese name (e.g., "旅行短语")
   - Icon emoji (e.g., "✈️")
3. Click **"Create"**
4. Category added to list and auto-selected
5. Saved to localStorage: `famlingo_custom_categories`

### Phrase Display

```
╔══════════════════════════════════════╗
║ 你好 🔊                              ║
║ nǐ hǎo                               ║
║ Hello                                ║
║                                       ║
║ ⭐ Common  👋 Greetings  ✈️ Travel  ║  ← Category badges
║                                       ║
║ Added: 10/23/2025               🗑️  ║
╚══════════════════════════════════════╝
```

---

## Code Highlights

### Multi-Select Toggle
```javascript
function toggleCategory(categoryId) {
  // Always keep 'common_phrases' selected
  if (categoryId === 'common_phrases') return

  const index = selectedCategories.value.indexOf(categoryId)
  if (index === -1) {
    selectedCategories.value.push(categoryId)
  } else {
    selectedCategories.value.splice(index, 1)
  }
}
```

### Always Include Common Phrases
```javascript
const categoriesToSave = [...new Set([
  'common_phrases',         // Always first
  ...selectedCategories.value  // Plus user selections
])]
```

### Create Custom Category
```javascript
const newCategory = {
  id: `custom_${Date.now()}`,
  icon: newCategoryIcon.value,
  display: `${newCategoryNameEn.value} / ${newCategoryNameCn.value}`
}
categories.value.push(newCategory)
localStorage.setItem('famlingo_custom_categories', JSON.stringify(categories.value))
```

---

## Files Modified

### src/views/MyPhrasesView.vue
**Template Changes**:
- Multi-select category buttons with checkmarks
- Create category modal dialog
- Category badges on phrase cards

**Script Changes**:
- `selectedCategories` (array) instead of `selectedCategoryIndex`
- `toggleCategory()` function
- `createCategory()` and `cancelCreateCategory()` functions
- Updated `savePhrase()` to use categories array
- Category badges display with backward compatibility

### src/views/PracticeView.vue
- 🇺🇸 → 🇬🇧 in direction toggle

### src/views/BrowseView.vue
- 🇺🇸 → 🇬🇧 in context display

### src/views/SetupView.vue
- 🇺🇸 → 🇬🇧 in learning direction

### src/main.js
- 🇺🇸 → 🇬🇧 in console banner

---

## User Benefits

1. **Better Organization**: Phrases can appear in multiple relevant categories
2. **"Common Phrases" Always Available**: Never lose track of frequently used phrases
3. **Custom Categories**: Create categories for specific needs (travel, business, hobbies)
4. **Visual Clarity**: Category badges make it easy to see organization at a glance
5. **Prevents Clutter**: Common Phrases won't become overwhelming

---

## Example Use Cases

### Scenario 1: Travel Phrase
```
Phrase: "Where is the bathroom?"
Categories:
  ✓ Common Phrases (default)
  ✓ Travel
  ✓ Emergency
```

### Scenario 2: Business Greeting
```
Phrase: "Nice to meet you"
Categories:
  ✓ Common Phrases (default)
  ✓ Greetings
  ✓ Work & School
  ✓ Business (custom)
```

### Scenario 3: Food Order
```
Phrase: "I'd like to order this"
Categories:
  ✓ Common Phrases (default)
  ✓ Food & Dining
  ✓ Shopping
```

---

## Testing Checklist

- [x] Create a phrase → appears in Common Phrases
- [x] Select multiple categories → phrase shows in all
- [x] Create custom category → appears in list
- [x] Custom category persists on reload
- [x] Delete phrase works
- [x] Category badges display correctly
- [x] Old phrases (single category) still work
- [x] Build succeeds without errors

---

## localStorage Keys

- `famlingo_custom_categories` - User-created categories
- `famlingo_phrases_[userId]` - User's phrases with categories

---

## Future Enhancements

1. **Category Filtering**: Filter phrase list by category
2. **Category Colors**: Different colors for different categories
3. **Category Management**: Edit/delete custom categories
4. **Category Statistics**: Show phrase count per category
5. **Category Export**: Export phrases by category

---

**Implementation Date**: October 23, 2025
**Status**: ✅ Complete and tested
**Build**: Successful (267.92 kB bundle)
