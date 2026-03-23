# Design System Specification: The Obsidian Interface

## 1. Overview & Creative North Star
**Creative North Star: "The Ethereal Terminal"**

This design system moves away from the clunky, utility-first aesthetic of traditional server management. Instead, it treats the mailserver dashboard as a high-end command center. By blending the precision of a code editor with the depth of a premium editorial layout, we create an experience that feels both authoritative and lightweight. 

The system rejects the "flat web" in favor of **Atmospheric Depth**. We break the standard grid using intentional asymmetry: wide data views paired with narrow, high-density telemetry sidebars. Content is not "contained" by boxes; it floats within a curated space of light and shadow, using transparency and blur to suggest a continuous, living environment.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "Dark Mode First" architecture, utilizing deep charcoal foundations (`surface`) contrasted against vibrant, functional glass.

### Surface Hierarchy & Nesting
To achieve high-end polish, we strictly follow the **"No-Line" Rule**. Sectioning must never be done with 1px solid borders. Instead, boundaries are defined by shifting between surface tiers:
- **Base Layer:** `surface` (#0f1419) – The infinite background.
- **Sectional Shift:** Use `surface_container_low` (#171c22) for large layout regions (like a sidebar or a secondary content area).
- **Interactive Layers:** Use `surface_container_high` (#252a30) for interactive elements that need to feel "elevated" from the base.

### The Glass & Gradient Rule
Standard containers are replaced with **Glassmorphism**. 
- **Floating Cards:** Use `surface_variant` at 60% opacity with a `backdrop-filter: blur(12px)`. This allows the "glow" of underlying status indicators or charts to bleed through.
- **Vibrant Accents:** Use `secondary` (#4edea3) for "Safe/Active" states and `tertiary` (#ffb4ac) for "Alert/Blocked" states. 
- **Signature Glow:** Apply a subtle `0px 0px 20px` outer glow to primary CTAs using a 20% opacity version of the `primary` token.

---

## 3. Typography
The typography system balances the readability of **Inter** with the technical soul of **Roboto Mono**.

- **Display & Headlines (Inter):** Set with tight letter-spacing (-0.02em) and heavy weights to act as an anchor for the layout.
- **Technical Metadata (Roboto Mono):** Used for server logs, IP addresses, and throughput data. This creates a "UI within a UI" feel.
- **Visual Hierarchy:**
    - **Display-LG:** 3.5rem. Used sparingly for high-level "System Health" percentages.
    - **Title-SM:** 1rem. The workhorse for card headers and navigation labels.
    - **Label-SM:** 0.6875rem. All-caps with 0.05em tracking for secondary technical metadata (e.g., "LAST CRON RUN").

---

## 4. Elevation & Depth
Depth in this system is an atmospheric quality, not a structural one.

### The Layering Principle
Avoid shadows on nested elements. If a card sits on a `surface_container_low` background, the card itself should be `surface_container_highest`. The contrast in luminance provides all the separation required.

### Ambient Shadows & Ghost Borders
- **Ambient Shadows:** For floating modals, use a large-spread shadow: `0 24px 48px -12px rgba(0, 0, 0, 0.5)`.
- **The Ghost Border:** For accessibility on glass cards, use a `1px` stroke of `outline_variant` (#414754) at **15% opacity**. This creates a "knife-edge" definition that catches the light without looking like a heavy stroke.

---

## 5. Components

### Buttons & Inputs
- **Primary Button:** Solid `primary_container` with `on_primary_container` text. Apply a `0.5rem` (lg) corner radius. On hover, increase the `surface_tint` glow.
- **Tertiary/Ghost Button:** No background or border. Use `primary` text. Separation is achieved through `6` (1.5rem) horizontal padding to give the text breathing room.
- **Input Fields:** Use `surface_container_highest` with a 15% `outline_variant` ghost border. Focus states should transition the border to `primary` (#acc7ff) and add a subtle `2px` inner glow.

### Data Tables & Lists
- **The Divider-Free Rule:** Prohibit 1px lines between rows. Use `spacing.4` (1rem) of vertical padding and a subtle `surface_container_low` hover state to define rows.
- **Status Indicators:** High-contrast "pills." A "Safe" status uses a `secondary_container` background with a `secondary` 4px solid circle icon (The "Active Glow").

### Interactive Charts
- **The "Pulse" Line:** Charts should use `primary` for the stroke, featuring a gradient fade that fills the area below the line with 5% opacity `primary`.
- **Telemetry Cards:** Small, translucent squares using `surface_container_lowest` for a "inset" look, housing `display-sm` technical metrics.

---

## 6. Do’s and Don’ts

### Do
- **Do use "Breathable" Spacing:** Use `spacing.8` (2rem) or `spacing.10` (2.5rem) between major functional groups to prevent the dashboard from feeling cramped.
- **Do use Tonal Shifts:** If a component feels "lost," change its background color to a different `surface_container` tier instead of adding a border.
- **Do use Monospace for Data:** Use Roboto Mono for any string that contains numbers, hashes, or paths.

### Don’t
- **Don’t use Pure Black:** Never use `#000000`. It kills the "glass" effect. Always use the `surface` token.
- **Don’t use 100% Opaque Borders:** This shatters the illusion of depth. Always use the "Ghost Border" at 10-20% opacity.
- **Don’t use Standard Shadows:** Avoid small, dark, offset shadows. They look "cheap" in a dark-mode environment. Use large, soft, ambient glows or nothing at all.