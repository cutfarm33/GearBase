# Gear Base Design System

## Color Palette

### Primary Colors
- **Emerald Green**: `emerald-600` (#059669) - Primary brand color
- **Teal**: `teal-600` (#0d9488) - Secondary accent
- **Gradient**: `from-emerald-600 to-teal-600` - Hero text accent

### Accent Colors
- **Amber**: `amber-600` (#d97706) - Warnings, damage tracking
- **Blue**: `blue-600` (#2563eb) - Information, mobile features
- **Red**: `red-600` (#dc2626) - Errors, alerts
- **Green**: `green-600` (#16a34a) - Success states

### Neutral Colors
- **Slate-50**: Background (light mode)
- **Slate-900**: Background (dark mode)
- **Slate-600**: Body text (light mode)
- **Slate-400**: Body text (dark mode)

## Typography

### Headings
- **Hero**: `text-5xl md:text-6xl lg:text-7xl font-bold`
- **Section**: `text-4xl md:text-5xl font-bold`
- **Card Title**: `text-xl font-bold`

### Body Text
- **Large**: `text-xl md:text-2xl`
- **Regular**: `text-base`
- **Small**: `text-sm`

## Components

### Buttons

#### Primary Button
```tsx
className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
```

#### Secondary Button
```tsx
className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-2.5 px-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all"
```

### Cards

#### Feature Card
```tsx
className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700 group hover:-translate-y-1"
```

#### Icon Container
```tsx
className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform"
```

### Badges

#### Status Badge
```tsx
className="px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold border border-emerald-200 dark:border-emerald-700"
```

## Spacing

- **Section Padding**: `py-24 px-6`
- **Card Padding**: `p-8`
- **Button Padding**: `py-2.5 px-5` (small), `py-4 px-8` (large)
- **Gap Between Elements**: `gap-6` (standard), `gap-4` (tight)

## Border Radius

- **Small**: `rounded-xl` (0.75rem)
- **Medium**: `rounded-2xl` (1rem)
- **Large**: `rounded-3xl` (1.5rem)
- **Pill**: `rounded-full`

## Shadows

- **Light**: `shadow-sm`
- **Medium**: `shadow-md`
- **Large**: `shadow-lg`
- **Colored**: `shadow-emerald-500/20` (20% opacity)

## Transitions

- **Standard**: `transition-all duration-300`
- **Fast**: `transition-colors`
- **Transform**: `hover:-translate-y-1` (lift effect)
- **Scale**: `hover:scale-110` (icon zoom)

## Implementation Checklist

### Landing Page ✅
- [x] Hero section with gradient text
- [x] Primary buttons (emerald green)
- [x] Feature cards with hover effects
- [x] Navigation bar styling
- [x] Status badges

### App Interface 🔄
- [ ] Dashboard cards
- [ ] Inventory list items
- [ ] Job cards
- [ ] Form inputs
- [ ] Modal dialogs
- [ ] Action buttons
- [ ] Status indicators
- [ ] Navigation sidebar

## Next Steps

1. Update Dashboard component with new card styles
2. Update button components across all forms
3. Standardize all color references to emerald/green
4. Apply rounded-3xl to major cards
5. Add hover effects and transitions
6. Update status badges and pills
