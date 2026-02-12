# Development Roadmap — Beautiful Shadows Design System

> Extending Beautiful Shadows from a shadow tool into a comprehensive design system toolkit for Figma.

---

## Phase 1 — Shadow System Foundations

High-value extensions that build directly on the existing shadow engine with minimal architectural changes.

### 1.1 Elevation Scale Generator

Generate a complete, consistent elevation scale (e.g. 5 levels) from a single light source configuration. The user sets the light once, and the plugin outputs a harmonious set of shadows at increasing elevations.

- [ ] Define default scale stops (e.g. `elevation-1` through `elevation-5`)
- [ ] Allow custom number of stops and naming
- [ ] Preview all scale levels side-by-side in the plugin UI
- [ ] Store scale configuration in plugin data for reuse

### 1.2 Shadow Token Export

Let users save named shadow presets and export them as design tokens in standard formats.

- [ ] Named preset system (save/load/delete shadow configurations)
- [ ] Export to CSS custom properties (`--shadow-elevation-1: ...`)
- [ ] Export to JSON design tokens (Style Dictionary compatible)
- [ ] Export to Tailwind CSS config (`boxShadow` / `dropShadow`)
- [ ] Copy-to-clipboard for individual values

### 1.3 Figma Styles & Variables Sync

Publish generated shadows as native Figma constructs so they become reusable across the file and shared libraries.

- [ ] Create/update Figma Effect Styles from generated shadows
- [ ] Sync elevation scale to a set of named styles
- [ ] Support Figma Variables (for token-based workflows)
- [ ] Detect and update existing styles on regeneration

---

## Phase 2 — Theming & Color Intelligence

Extend shadow generation to be theme-aware and color-intelligent.

### 2.1 Light / Dark Theme Shadow Pairs

Define shadow behavior for both light and dark backgrounds simultaneously. Dark mode shadows need different opacity, color, and sometimes an ambient glow layer.

- [ ] Side-by-side light/dark preview mode
- [ ] Independent shadow color and opacity per theme
- [ ] Optional ambient glow layer for dark mode
- [ ] Export paired tokens (`shadow-elevation-1-light`, `shadow-elevation-1-dark`)

### 2.2 Color-Derived Shadows

Auto-derive shadow colors from the element's fill color for modern colored shadow effects.

- [ ] Read fill color from the selected Figma node
- [ ] Derive shadow color via Chroma.js (darken + desaturate)
- [ ] User-adjustable derivation parameters (amount, saturation shift)
- [ ] Toggle between neutral and color-derived modes

---

## Phase 3 — Depth & Motion System

Expand from shadows alone into a complete depth and motion language.

### 3.1 Layered Depth System (Z-Index + Shadow + Blur)

Combine shadow generation with z-index recommendations, backdrop blur values, and border treatments for a complete depth token.

- [ ] Map elevation levels to z-index ranges
- [ ] Suggest backdrop-filter blur for overlays at each level
- [ ] Optional subtle border/separator recommendations
- [ ] Export as composite depth tokens

### 3.2 Motion & Transition Recommendations

For each shadow elevation, suggest appropriate transition timing and easing for animating between states (e.g. card hover lift).

- [ ] Recommend CSS transition duration and easing per elevation change
- [ ] Preview hover/press animations in the plugin
- [ ] Export as motion tokens (duration, easing, property)
- [ ] Leverage existing `d3-ease` knowledge for curve suggestions

### 3.3 Border Radius + Shadow Harmony

Preview how shadows interact with different border radii and recommend pairings.

- [ ] Add border-radius control to preview target element
- [ ] Visual guidance for radius/shadow compatibility
- [ ] Suggest shadow adjustments for large radii
- [ ] Include border-radius in exported tokens

---

## Phase 4 — Advanced Lighting & Scale Tools

More ambitious features that push the plugin toward a full design system generator.

### 4.1 Multi-Light Source Support

Support 2+ light sources (key light, fill light, ambient) for more realistic shadow compositions.

- [ ] Multiple light instances in `createLight` store
- [ ] Composite shadow output from all light sources
- [ ] Individual light controls (brightness, color, position)
- [ ] Preset lighting rigs (e.g. "Material", "Soft", "Dramatic")

### 4.2 Spacing & Sizing Scale Generator

Apply the same interactive, visual approach to generate spacing and sizing scales — a new tool within the plugin.

- [ ] Interactive base-unit and ratio configuration
- [ ] Visual preview of the generated scale
- [ ] Export as spacing/sizing tokens
- [ ] Reuse existing gesture/animation infrastructure

---

## Technical Notes

### Current Architecture Strengths

These make the above extensions feasible without major rewrites:

| Asset | Enables |
|---|---|
| `getCastedShadows` in `shadow.ts` | Elevation scale — just sample at multiple elevation values |
| Zustand modular stores | Multi-light — add more `createLight` instances |
| Chroma.js dependency | Color-derived shadows — darken/desaturate transforms |
| `d3-ease` dependency | Motion recommendations — easing curve knowledge |
| Figma Plugin API in `main.ts` | Styles/Variables sync — API already available |
| React Spring + use-gesture | New interactive tools — infrastructure is ready |

### Suggested Implementation Order

```
Phase 1.1 (Elevation Scale) ─┐
Phase 1.2 (Token Export)     ├─► Phase 2 (Theming) ──► Phase 3 (Depth & Motion)
Phase 1.3 (Figma Sync)      ─┘                                │
                                                               ▼
                                                        Phase 4 (Advanced)
```

Phase 1 items can be developed in parallel. Phase 2 depends on the token/export infrastructure from Phase 1.2. Phases 3 and 4 can be prioritized independently based on user demand.
