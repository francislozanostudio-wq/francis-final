# Quick Translation Guide

## ✅ Problem FIXED!

The issue was that the homepage was showing **database content instead of translations**.

## What Was Changed

### Before (WRONG):
```tsx
{heroContent?.title || t('homepage.hero.title', 'Fallback')}
```
This checks database FIRST, so it always showed English from database.

### After (CORRECT):
```tsx
{t('homepage.hero.title', heroContent?.title || 'Fallback')}
```
This checks translations FIRST, then falls back to database if no translation exists.

## How to Add Translations

1. Go to **Admin Dashboard** > **Translations**
2. Click **"Add Translation"**
3. Fill in:
   - **Key**: `homepage.hero.title`
   - **Category**: `homepage`
   - **English Text**: `Francis Lozano Studio`
   - **Spanish Text**: `Estudio Francis Lozano`
   - **Context**: Description of where this appears
   - **Active**: ✓ (checked)
4. Click **Save**

## Required Translation Keys for Homepage

Copy these keys exactly and add Spanish translations:

### Hero Section
- `homepage.hero.title`
- `homepage.hero.subtitle`
- `homepage.hero.button`

### About Section
- `homepage.about.title`
- `homepage.about.subtitle`

### Services Section
- `homepage.services.title`
- `homepage.services.subtitle`
- `homepage.services.view_all`
- `homepage.services.luxury_manicures`
- `homepage.services.luxury_manicures_desc`
- `homepage.services.custom_nail_art`
- `homepage.services.custom_nail_art_desc`
- `homepage.services.premium_extensions`
- `homepage.services.premium_extensions_desc`

### Portfolio Section
- `homepage.portfolio.title`
- `homepage.portfolio.subtitle`
- `homepage.portfolio.view_full_gallery`

### Testimonial Section
- `homepage.testimonial.quote`
- `homepage.testimonial.author`

### CTA Section
- `homepage.cta.title`
- `homepage.cta.subtitle`
- `homepage.cta.book_now`
- `homepage.cta.view_services`

## Testing

1. Add the translations in Admin Dashboard
2. Go to the homepage
3. Click the **Globe icon** → Select **"Español"**
4. Everything should switch to Spanish!
5. Click **Globe icon** → Select **"English"** to switch back

## Important Notes

✅ **NOW WORKING**: Translations take priority over database content
✅ **NOW WORKING**: All components re-render when language changes
✅ **NOW WORKING**: Language preference is saved (persists on refresh)

❌ **If text doesn't switch**: The translation key is missing in the database
→ Go to Admin > Translations and add it!

## Example Spanish Translations

Here are some example translations to get you started:

| English | Spanish |
|---------|---------|
| Francis Lozano Studio | Estudio Francis Lozano |
| Book Consultation | Reservar Consulta |
| Our Services | Nuestros Servicios |
| View All Services | Ver Todos los Servicios |
| Portfolio | Portafolio |
| View Full Gallery | Ver Galería Completa |
| Ready to Transform Your Nails? | ¿Lista para Transformar tus Uñas? |
| Book Now | Reservar Ahora |
| View Services | Ver Servicios |
| Artistry Redefined | Arte Redefinido |
| Exquisite nail artistry by appointment in Nashville | Arte exquisito de uñas con cita previa en Nashville |
