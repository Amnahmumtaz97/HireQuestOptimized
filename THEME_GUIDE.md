# HireQuest Theme & Style Guide

## 🎨 Design System Overview

Your HireQuest application now uses a sophisticated **Dark Purple/Blue Futuristic Theme** inspired by modern SaaS dashboards. This guide covers all available components and utilities.

---

## 📌 Color Palette

### Primary Colors
- **Purple**: `#7c3aed` (Primary CTAs)
- **Blue**: `#4f6ef7` (Secondary, Dashboard references)
- **Cyan**: `#06b6d4` (Accents)

### Status Colors
- **Green**: `#10d98c` (Completed, Success)
- **Amber**: `#f59e0b` (Warnings, In Progress)
- **Red**: `#ef4444` (Destructive, Errors)

### Backgrounds
- **Dark Base**: `#0f1419` (Main background)
- **Card Surface**: `#1a1f2e` (Card backgrounds)
- **Surface**: `#252c40` (Elevated surfaces)

### CSS Variables
All colors are available as CSS variables:
```css
--hq-purple: #7c3aed
--hq-blue: #4f6ef7
--hq-green: #10d98c
--hq-amber: #f59e0b
--hq-red: #ef4444
--hq-cyan: #06b6d4
--hq-dark: #0f1419
--hq-darker: #0a0e14
--hq-card: #1a1f2e
--hq-surface: #252c40
```

---

## 🎯 Button Variants

### Primary Button (Purple Gradient)
```jsx
<button className="btn-primary-glow">
  Create Interview
</button>
```
**Use for:** Main CTAs, high-priority actions

### Secondary Blue Button
```jsx
<button className="btn-secondary-blue">
  View Details
</button>
```
**Use for:** Secondary actions, non-destructive operations

### Success Button (Green)
```jsx
<button className="btn-success">
  Confirm
</button>
```

### Warning Button (Amber)
```jsx
<button className="btn-warning">
  Attention
</button>
```

### Destructive Button (Red)
```jsx
<button className="btn-destructive">
  Delete
</button>
```

---

## 🏷️ Badges & Status Indicators

### Status Badges
```jsx
// Completed
<span className="badge-completed">
  <CheckCircle className="h-3 w-3" />
  Completed
</span>

// In Progress
<span className="badge-in-progress">
  <Clock className="h-3 w-3" />
  In Progress
</span>

// Scheduled
<span className="badge-scheduled">
  <Calendar className="h-3 w-3" />
  Scheduled
</span>

// Cancelled
<span className="badge-cancelled">
  <X className="h-3 w-3" />
  Cancelled
</span>
```

### Difficulty Badges
```jsx
<span className="badge-difficulty-easy">Easy</span>
<span className="badge-difficulty-medium">Medium</span>
<span className="badge-difficulty-hard">Hard</span>
```

### Inline Badges
```jsx
<span className="inline-badge inline-badge-primary">Primary</span>
<span className="inline-badge inline-badge-success">Success</span>
<span className="inline-badge inline-badge-warning">Warning</span>
<span className="inline-badge inline-badge-danger">Danger</span>
```

---

## 🎪 Icon Wrappers

Icon wrappers with colored backgrounds and glows:

```jsx
// Blue Icon
<div className="icon-wrap-blue">
  <BriefcaseIcon className="h-5 w-5" />
</div>

// Purple Icon
<div className="icon-wrap-purple">
  <SparklesIcon className="h-5 w-5" />
</div>

// Green Icon
<div className="icon-wrap-green">
  <CheckIcon className="h-5 w-5" />
</div>

// Amber Icon
<div className="icon-wrap-amber">
  <AlertIcon className="h-5 w-5" />
</div>

// Red Icon
<div className="icon-wrap-red">
  <TrashIcon className="h-5 w-5" />
</div>

// Cyan Icon
<div className="icon-wrap-cyan">
  <SyncIcon className="h-5 w-5" />
</div>
```

**Features:**
- Colored backgrounds with transparency
- Subtle borders
- Shadow glow effects
- Perfect for 40x40px or 44x44px

---

## 💳 Card Styles

### Enhanced Card with Hover Glow
```jsx
<div className="card-enhanced p-6 rounded-xl">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-sm text-muted-foreground mt-2">Description</p>
</div>
```

**Features:**
- Border glow on hover
- Background gradient effect
- Smooth transitions
- Glass morphism support

### Dashboard Card (Existing)
```jsx
<div className="dashboard-card">
  {/* Content */}
</div>
```

---

## 📊 Statistics Display

### Large Metric Display
```jsx
<div>
  <div className="stat-metric-large stat-metric-large-blue">72</div>
  <div className="stat-label-sm">Total Interviews</div>
  <div className="text-xs text-muted-foreground mt-1">↑ 12% vs last month</div>
</div>
```

### Progress Bar
```jsx
<div className="progress-bar-blue" style={{ '--progress': '65%' }}>
  {/* Bar fills to 65% */}
</div>
```

---

## ✨ Animations

### Glow Pulse
```jsx
<div className="animate-glow-pulse">
  Glowing element
</div>
```

### Soft Pulse (Status dots)
```jsx
<div className="status-dot status-dot-completed animate-pulse-soft" />
```

### Neon Glow (Active indicators)
```jsx
<div className="status-dot status-dot-in-progress animate-neon-glow" />
```

### Glow Border
```jsx
<div className="animate-glow-border">
  Border glows
</div>
```

---

## 🎬 Floating Action Button

```jsx
<button className="fab-primary">
  <Plus className="h-6 w-6" />
</button>
```

**Features:**
- Fixed position (bottom-right)
- Purple-to-blue gradient
- Hover scale effect
- Active press animation
- Z-index: 40 (customize as needed)

---

## 🎨 Usage Examples

### Complete Interview Card
```jsx
<div className="card-enhanced">
  <div className="flex items-start justify-between">
    <div className="flex gap-4">
      <div className="icon-wrap-blue">
        <BriefcaseIcon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">Backend Developer</h3>
        <p className="text-xs text-muted-foreground">Created on May 10, 2026</p>
      </div>
    </div>
    <span className="badge-completed">Completed</span>
  </div>
  
  <div className="mt-4 flex gap-2">
    <button className="btn-secondary-blue text-xs py-1.5 px-3">View Results</button>
    <button className="btn-primary-glow text-xs py-1.5 px-3">Retake</button>
  </div>
</div>
```

### Status Panel
```jsx
<div className="space-y-3">
  <div className="flex items-center gap-3">
    <div className="status-dot status-dot-completed" />
    <span className="text-sm font-medium">Completed</span>
    <span className="ml-auto text-xs text-muted-foreground">22 interviews</span>
  </div>
  
  <div className="flex items-center gap-3">
    <div className="status-dot status-dot-in-progress" />
    <span className="text-sm font-medium">In Progress</span>
    <span className="ml-auto text-xs text-muted-foreground">3 interviews</span>
  </div>
  
  <div className="flex items-center gap-3">
    <div className="status-dot status-dot-scheduled" />
    <span className="text-sm font-medium">Scheduled</span>
    <span className="ml-auto text-xs text-muted-foreground">1 interview</span>
  </div>
</div>
```

---

## 🌓 Light Mode Support

All components automatically support light mode with `data-theme="light"` on the root element.

```jsx
// Apply to root element
<html data-theme="light">
```

---

## 📱 Responsive Considerations

Most components use Tailwind's responsive modifiers:
- `sm:` (640px)
- `md:` (768px)
- `lg:` (1024px)
- `xl:` (1280px)

Example:
```jsx
<div className="grid sm:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
```

---

## 🔮 Advanced: Creating Custom Glows

To create custom glows on elements:

```css
.custom-glow {
  box-shadow: 0 0 30px rgba(124, 58, 237, 0.4),
              0 0 60px rgba(79, 110, 247, 0.2);
}
```

Or use Tailwind shadows:
```jsx
<div className="shadow-lg shadow-hq-purple/40">
  Element with glow
</div>
```

---

## 🎭 Glass Morphism

Apply glass effect to elements:

```jsx
<div className="glass">
  {/* Blurred background, subtle border, card shadow */}
</div>

<div className="glass-strong">
  {/* Stronger blur and border */}
</div>

<div className="glass-panel">
  {/* Panel variant with maximum blur */}
</div>
```

---

## 📋 Gradient Utilities

```jsx
// Primary gradient (purple to blue)
<div className="bg-gradient-primary">
  {/* Purple to blue gradient */}
</div>

// Text gradient
<h1 className="text-gradient">
  Gradient text
</h1>

// Blue text gradient
<h1 className="text-gradient-blue">
  Blue gradient text
</h1>
```

---

## 🚀 Performance Tips

1. **Use Tailwind classes** instead of inline styles for consistency
2. **Reuse component variants** to maintain theme consistency
3. **Leverage CSS variables** for dynamic theming
4. **Enable GPU acceleration** with `transform` classes on hover

---

## 📝 Component Quick Reference

| Component | Class | Use Case |
|-----------|-------|----------|
| Primary Button | `btn-primary-glow` | Main CTAs |
| Secondary Button | `btn-secondary-blue` | Secondary actions |
| Success Button | `btn-success` | Confirmations |
| Warning Button | `btn-warning` | Warnings |
| Destructive Button | `btn-destructive` | Delete, dangerous actions |
| Icon Wrapper | `icon-wrap-*` (blue, purple, green, amber, red, cyan) | Icon containers |
| Badge | `badge-*` (completed, in-progress, scheduled, cancelled) | Status indicators |
| Card | `card-enhanced` | Content containers |
| FAB | `fab-primary` | Floating action button |
| Progress Bar | `progress-bar-*` | Progress indication |

---

## 🎓 Best Practices

1. **Consistency**: Use the same button type for similar actions
2. **Color meaning**: 
   - Green = Success/Completed
   - Blue = Info/In Progress
   - Amber = Warning
   - Red = Danger/Destructive
3. **Spacing**: Use Tailwind spacing (gap-3, p-4, etc.)
4. **Hierarchy**: Use size and color to establish visual hierarchy
5. **Accessibility**: Ensure sufficient contrast and provide alt text for icons

---

## 🔗 Related Files

- **Tailwind Config**: `tailwind.config.js`
- **Global Styles**: `src/app/globals.css`
- **Color Tokens**: Defined in `globals.css` CSS variables section

---

*Last updated: May 2026*
*HireQuest Design System v1.0*
