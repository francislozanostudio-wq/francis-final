# Quick Homepage Edit Guide

## TL;DR - How to Update Homepage Text

### English Only (Simple)
1. Admin → **Edit Homepage Content**
2. Edit the text
3. **Save** ✅ Done!

### English + Spanish (Two Steps)
1. Admin → **Edit Homepage Content** → Edit text → **Save**
2. Admin → **Translations** → **Add Translation**:
   - English Text: **Copy EXACT text from step 1**
   - Spanish Text: Type Spanish version
   - **Save** ✅ Done!

---

## Visual Guide

```
┌─────────────────────────────────────────┐
│  Step 1: Edit Homepage Content          │
│  ─────────────────────────────────────  │
│  Title: "Welcome to Our Studio"         │
│         [Save Changes]                   │
└─────────────────────────────────────────┘
                 ↓
        ✅ Shows in English
                 ↓
┌─────────────────────────────────────────┐
│  Step 2: Add Translation (Optional)     │
│  ─────────────────────────────────────  │
│  English Text: "Welcome to Our Studio"  │  ← Must match exactly!
│  Spanish Text: "Bienvenido a Nuestro    │
│                 Estudio"                 │
│         [Save]                           │
└─────────────────────────────────────────┘
                 ↓
   ✅ Shows Spanish when user selects 🇪🇸
```

---

## Critical Rules

### ✅ DO
- Edit content in **Edit Homepage** first
- Copy the **EXACT** text to Translations
- Match capitalization, punctuation, and spacing

### ❌ DON'T
- Edit text only in Translations (won't work!)
- Use different capitalization/spacing
- Forget to mark translation as **Active**

---

## Example: Change Hero Title

### Current
```
Title: "Francis Lozano Studio"
```

### Want to Change To
```
English: "Premium Nail Artistry"
Spanish: "Arte de Uñas Premium"
```

### Steps

**1. Edit Homepage Content:**
```
Admin → Edit Homepage Content → Hero Section
Title: "Premium Nail Artistry"
[Save Changes]
```

**2. Add Translation:**
```
Admin → Translations → Add Translation

English Text: "Premium Nail Artistry"  ← Copy exactly!
Spanish Text: "Arte de Uñas Premium"
Active: ✓
[Save]
```

**Done!** ✅

---

## Testing

1. Open homepage in browser
2. Text shows in English ✅
3. Click **Globe icon** → Select **Español**
4. Text changes to Spanish ✅
5. Click **Globe icon** → Select **English**
6. Text changes back to English ✅

---

## Need Help?

- Text not changing? Check the English text matches **exactly**
- Spanish not showing? Make sure translation is **Active** (✓)
- Still stuck? Check `HOMEPAGE_TRANSLATION_WORKFLOW.md` for detailed guide
