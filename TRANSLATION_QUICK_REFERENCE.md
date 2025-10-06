# 🚀 Quick Reference - Translation System

## ONE Simple Rule for ALL Pages

```
1. Edit content in Admin
2. Add translation with EXACT matching text
3. Done! ✅
```

---

## Pages That Auto-Translate Database Content

| Page | Admin Location | What Translates |
|------|----------------|-----------------|
| 🏠 **Homepage** | Edit Homepage Content | All sections |
| 💅 **Services** | Services | Names, descriptions |
| 🖼️ **Gallery** | Gallery | Titles, descriptions |
| 👤 **About** | About | All sections |
| ⭐ **Testimonials** | Testimonials | Text, names |
| 📧 **Contact** | - | Static text only |
| 📅 **Booking** | - | Static text only |

---

## Quick Workflow

### Example: Update Service Name

```
Step 1: Admin → Services → Edit Service
   Name: "Luxury Gel Manicure"
   [Save] ✅

Step 2: Admin → Translations → Add Translation
   English Text: "Luxury Gel Manicure"  ← EXACT match!
   Spanish Text: "Manicura de Gel de Lujo"
   Active: ✓
   [Save] ✅

Step 3: Test
   Visit /services → See English ✅
   Switch to Spanish → See Spanish ✅
```

---

## Important: Text Must Match EXACTLY

### ✅ Correct:
```
Database: "Luxury Gel Manicure"
Translation English Text: "Luxury Gel Manicure"  ← Perfect match!
```

### ❌ Wrong:
```
Database: "Luxury Gel Manicure"
Translation English Text: "luxury gel manicure"  ← Won't work! (different capitalization)
```

---

## Pro Tips

1. **Copy-Paste** - Always copy exact text from database to translation
2. **Test Both Languages** - Switch to Spanish to verify translation shows
3. **Mark as Active** - Always check the Active (✓) checkbox
4. **Start Small** - Translate most important content first

---

## Troubleshooting in 3 Steps

```
Translation not showing?

1. Check database: Is content saved? ✅
2. Check translation: Does text match exactly? ✅
3. Check active: Is translation active (✓)? ✅
```

---

## Language Switching

**For Visitors:**
- Click **Globe icon** (🌐) in navigation
- Select **"Español"** for Spanish
- Select **"English"** for English

---

## Remember

✅ **Edit in Admin FIRST**
✅ **Then add translation**
✅ **Text must match EXACTLY**
✅ **Mark as Active (✓)**
✅ **Test in both languages**

**That's it!** The system does the rest automatically. 🎉

---

## Need Help?

📖 See full documentation:
- `ALL_PAGES_TRANSLATION_GUIDE.md` - Complete guide
- `HOMEPAGE_TRANSLATION_WORKFLOW.md` - Homepage details
- `QUICK_HOMEPAGE_EDIT_GUIDE.md` - Quick start
- `TRANSLATION_SYSTEM_COMPLETE.md` - Technical overview
