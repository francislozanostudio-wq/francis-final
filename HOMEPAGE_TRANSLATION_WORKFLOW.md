# Homepage Translation Workflow

## How It Works Now ✅

The homepage content system now uses **TWO COMPLEMENTARY systems**:

1. **Homepage Content (Admin → Edit Homepage)** - Primary source of truth for text content
2. **Translations (Admin → Translations)** - Provides Spanish versions of that content

## The New Smart Translation System

### How Text is Displayed:

```
1. Admin edits text in "Edit Homepage Content"
2. Text is saved to database in English
3. System checks: Does this exact English text have a translation?
   ├─ YES → Show Spanish version when language = Spanish
   └─ NO  → Show English version (no translation exists)
```

## Step-by-Step Workflow

### Step 1: Edit Content in Admin Dashboard

1. Go to **Admin Dashboard** → **Edit Homepage Content**
2. Edit any section (Hero, About, Services, etc.)
3. Update the text in English
4. Click **Save**

**Result:** Content updates immediately on the homepage in English ✅

---

### Step 2: Add Spanish Translation (Optional)

If you want Spanish version to appear when users switch language:

1. Go to **Admin Dashboard** → **Translations**
2. Click **Add Translation**
3. Fill in the form:
   - **Key**: Any unique key (e.g., `custom.hero.title.v2`)
   - **Category**: `homepage`
   - **English Text**: **Copy the EXACT text from Edit Homepage** (must match perfectly!)
   - **Spanish Text**: Type the Spanish translation
   - **Active**: ✓ Checked
4. Click **Save**

**Result:** When user selects Spanish, the Spanish version appears! 🇪🇸

---

## Example Workflow

### Scenario: Update Hero Title

#### Step 1: Update in Edit Homepage
```
Admin → Edit Homepage → Hero Section
Title: "Welcome to Francis Lozano Nail Studio"
[Save Changes]
```

✅ Homepage now shows: "Welcome to Francis Lozano Nail Studio" (English)

#### Step 2: Add Spanish Translation
```
Admin → Translations → Add Translation

Key: homepage.hero.custom.title
Category: homepage
English Text: "Welcome to Francis Lozano Nail Studio"  ← MUST MATCH EXACTLY!
Spanish Text: "Bienvenido al Estudio de Uñas Francis Lozano"
Active: ✓
[Save]
```

✅ **Result:**
- English users see: "Welcome to Francis Lozano Nail Studio"
- Spanish users see: "Bienvenido al Estudio de Uñas Francis Lozano"

---

## Important Rules ⚠️

### 1. English Text Must Match EXACTLY
The English text in the Translation must match the text from Edit Homepage **character-by-character**:

❌ **Wrong:**
- Edit Homepage: `"Welcome to Francis Lozano Nail Studio"`
- Translation: `"Welcome to francis lozano nail studio"` (different capitalization)

✅ **Correct:**
- Edit Homepage: `"Welcome to Francis Lozano Nail Studio"`
- Translation: `"Welcome to Francis Lozano Nail Studio"` (exact match!)

### 2. Translations are Optional
- If no translation exists → Shows English text
- If translation exists → Shows Spanish when language = Spanish

### 3. Edit Homepage = Source of Truth
- Always edit content in **Edit Homepage** first
- Then add translation in **Translations** if you want Spanish version

---

## What Sections Can Be Translated?

All homepage sections support this system:

### Hero Section
- Title
- Subtitle  
- Button Text

### About Section
- Title
- Subtitle

### Services Section
- Title
- Subtitle
- Button Text

### Testimonial Section
- Quote
- Author Name

### CTA (Call to Action) Section
- Title
- Subtitle
- Button Text

---

## Testing Your Translations

1. **Edit content** in Edit Homepage → Save
2. Visit homepage → Content appears in English ✅
3. **Add translation** in Translations → Save
4. Visit homepage → Click language selector (Globe icon)
5. Select **Español**
6. Content switches to Spanish ✅
7. Select **English**
8. Content switches back to English ✅

---

## Benefits of This System

✅ **Single Source of Truth**: Edit content once in Edit Homepage  
✅ **Optional Translations**: Spanish is optional, not required  
✅ **No Duplication**: Don't need to maintain content in two places  
✅ **Flexible**: Can translate only some sections, not all  
✅ **Real-time Updates**: Changes appear immediately  
✅ **No Conflicts**: Database content and translations work together  

---

## Troubleshooting

### Translation not appearing in Spanish?

**Check:**
1. Is the English text in Translation **exactly** the same as in Edit Homepage?
2. Is the translation marked as **Active** (✓)?
3. Is Spanish text filled in?
4. Did you select **Español** in the language selector?

### Text reverts to old version?

- This is now fixed! The system always prioritizes the latest content from Edit Homepage
- Translations overlay on top only when they exist

---

## Technical Details

The system uses a new `translateByText()` function that:

1. Takes English text from database (`homepage_content` table)
2. Searches for matching translation in `translations` table
3. If found AND language is Spanish → Returns Spanish text
4. If not found OR language is English → Returns English text

This ensures database content is always the primary source, with translations as an optional layer.
