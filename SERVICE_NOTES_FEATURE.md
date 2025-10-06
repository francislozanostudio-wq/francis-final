# Service Page Notes Feature

## Overview

This feature adds customizable notes to the Services page that can be edited from the Admin panel. The notes support automatic translation to Spanish and are stored in Supabase.

## Features Added

### 1. Two Configurable Service Notes

- **Pricing Note**: Explains that final prices may vary based on design complexity
  - Default: "💫 Important Note: Final prices may vary depending on nail length, complexity level, and type of design requested."

- **Hand Treatment Note**: Highlights the complimentary paraffin treatment
  - Default: "🌸 Note: All our hand services include a free paraffin treatment to hydrate and soften the skin. 💆‍♀"

### 2. Admin Panel Controls

Located in: **Admin → Service Page Settings**

- Edit both service notes with multi-line text areas
- Real-time preview of current text
- Automatic translation support to Spanish
- Save changes instantly

### 3. Frontend Display

- Notes appear at the top of the Services page (after the hero section)
- Displayed in attractive cards with accent borders
- Automatically translated based on user's language preference
- Responsive design for mobile and desktop

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content of `supabase/migrations/20251006140000_add_service_notes.sql`
5. Paste it into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. You should see "Success. No rows returned" message

### Option 2: Using Supabase CLI

```bash
# Make sure you're in the project directory
cd c:/Users/asus/OneDrive/Desktop/FRANCIS-main

# Link your project (if not already linked)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all pending migrations
npx supabase db push
```

## Verification Steps

After running the migration:

1. **Check Database**:
   - In Supabase Dashboard → **Table Editor**
   - Open `studio_settings` table
   - You should see two new columns:
     - `service_note_pricing`
     - `service_note_hand_treatment`

2. **Test in Admin Panel**:
   - Log in to Admin Dashboard
   - Go to **Service Page Settings**
   - Scroll to "Service Page Notes" section
   - You should see two text areas with default values
   - Try editing and saving

3. **Test on Services Page**:
   - Visit the public Services page
   - Notes should appear at the top in styled cards
   - Switch language to Spanish to test translation

## Files Modified

### Database
- `supabase/migrations/20251006140000_add_service_notes.sql` - New migration file

### Backend/Services
- `src/lib/studioService.ts`:
  - Added `service_note_pricing` and `service_note_hand_treatment` to `StudioSettings` interface
  - Added default values for both notes
  - Updated `mapStudioSettings` to include new fields
  - Updated `updateStudioSettings` to handle new fields

### Frontend - Services Page
- `src/pages/Services.tsx`:
  - Added new section to display service notes
  - Notes appear between hero section and services menu
  - Styled cards with automatic translation

### Frontend - Admin Panel
- `src/pages/admin/AdminServicePageSettings.tsx`:
  - Added state management for both notes
  - Added UI controls (text areas) for editing notes
  - Integrated save functionality
  - Added helpful descriptions for each field

## Usage Guide

### For Administrators

1. **Edit Service Notes**:
   - Login to Admin Dashboard
   - Navigate to **Service Page Settings**
   - Scroll to "Service Page Notes" card
   - Edit either or both notes
   - Click "Save Changes" at the top or bottom

2. **Translation**:
   - Write notes in English
   - The system automatically translates to Spanish
   - Translations are powered by the existing translation system

3. **Tips**:
   - Use emojis to make notes more eye-catching (💫, 🌸, 💆‍♀, etc.)
   - Keep notes concise and clear
   - Highlight important information customers should know upfront

### For Developers

1. **Accessing Notes in Code**:
```typescript
const { service_note_pricing, service_note_hand_treatment } = studioSettings;
```

2. **Display Pattern**:
```tsx
{studioSettings.service_note_pricing && (
  <div className="bg-card border border-accent/20 rounded-lg p-6 text-center">
    <p className="text-lg text-card-foreground font-medium">
      {translateByText(studioSettings.service_note_pricing)}
    </p>
  </div>
)}
```

## Database Schema

### New Columns in `studio_settings`

```sql
service_note_pricing text DEFAULT '💫 Important Note: Final prices may vary depending on nail length, complexity level, and type of design requested.'

service_note_hand_treatment text DEFAULT '🌸 Note: All our hand services include a free paraffin treatment to hydrate and soften the skin. 💆‍♀'
```

## Troubleshooting

### Notes not appearing on Services page
- Check that the migration ran successfully
- Verify `studioSettings` is loaded in Services.tsx
- Check browser console for errors

### Can't edit notes in Admin panel
- Ensure you're logged in as admin
- Check that `updateStudioSettings` function is working
- Verify Supabase connection

### Translation not working
- Ensure translation system is properly configured
- Check that `translateByText` function is available
- Verify language switching works on other pages

## Future Enhancements

Possible improvements:
- Add more note types (e.g., seasonal promotions, special offers)
- Rich text editor for formatting
- Ability to enable/disable individual notes
- Preview mode to see notes before publishing
- Schedule notes to appear on specific dates
