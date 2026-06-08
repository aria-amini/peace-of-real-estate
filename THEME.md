# Theme

Source: <https://peace-of-real-estate.vercel.app/style-guide>

## Brand

Peace of Real Estate uses a clean, professional, data-driven real estate visual
identity. The system should feel trustworthy, calm, transparent, and polished.

## Logo

### Primary Logo

The primary logo combines the logomark with the logotype. Use this version
whenever space allows.

- Full color logo: use on white or light gray backgrounds.
- Light logo: use on dark backgrounds.
- Logomark only: use for small spaces, favicons, and app icons.

### Logo Rules

- Maintain clear space around the logo equal to the height of the `P` in
  `Peace`.
- Do not stretch, rotate, recolor, or otherwise alter the logo.
- Use only approved logo variants for their intended background colors.

### Logo Assets

- `assets/logo-exports/svg/logo-fullColor.svg`: full logo, color, for light
  backgrounds.
- `assets/logo-exports/svg/logo-light.svg`: full logo, light, for dark
  backgrounds.
- `assets/logo-exports/svg/logo-dark.svg`: full logo, monochrome.
- `assets/logo-exports/svg/logomark-fullColor.svg`: logomark, color.
- `assets/logo-exports/svg/logomark-light.svg`: logomark, light, for dark
  backgrounds.
- `assets/logo-exports/svg/logomark-dark.svg`: logomark, monochrome.

## Color Palette

### Brand Colors

| Token           | Role    | Hex       |
| --------------- | ------- | --------- |
| `--brand-navy`  | Primary | `#024A70` |
| `--brand-sky`   | Accent  | `#74D4FF` |
| `--brand-amber` | Accent  | `#FFB86A` |
| `--brand-gray`  | Neutral | `#CAD5E2` |

### Sky Scale

Use Sky for backgrounds, links, interactive states, focus rings, selected
states, and cool brand gradients.

| Token       | Hex       |
| ----------- | --------- |
| `--sky-50`  | `#f0f9ff` |
| `--sky-100` | `#e0f2fe` |
| `--sky-200` | `#bae6fd` |
| `--sky-300` | `#7dd3fc` |
| `--sky-400` | `#38bdf8` |
| `--sky-500` | `#0ea5e9` |
| `--sky-600` | `#0284c7` |
| `--sky-700` | `#0369a1` |
| `--sky-800` | `#075985` |
| `--sky-900` | `#0c4a6e` |

### Slate Scale

Use Slate for text, borders, neutral backgrounds, surfaces, and dark sections.

| Token         | Hex       |
| ------------- | --------- |
| `--slate-50`  | `#f8fafc` |
| `--slate-100` | `#f1f5f9` |
| `--slate-200` | `#e2e8f0` |
| `--slate-300` | `#cbd5e1` |
| `--slate-400` | `#94a3b8` |
| `--slate-500` | `#64748b` |
| `--slate-600` | `#475569` |
| `--slate-700` | `#334155` |
| `--slate-800` | `#1e293b` |
| `--slate-900` | `#0f172a` |

### Amber Scale

Use Amber sparingly for warm accents and medium-priority status indicators.

| Token         | Hex       |
| ------------- | --------- |
| `--amber-50`  | `#fffbeb` |
| `--amber-100` | `#fef3c7` |
| `--amber-200` | `#fde68a` |
| `--amber-300` | `#fcd34d` |
| `--amber-400` | `#fbbf24` |
| `--amber-500` | `#f59e0b` |

### Semantic Colors

| Token          | Role                        | Hex       |
| -------------- | --------------------------- | --------- |
| `--green-500`  | Success                     | `#22c55e` |
| `--green-600`  | Success emphasis            | `#16a34a` |
| `--orange-500` | Warning / negative          | `#f97316` |
| `--orange-600` | Warning / negative emphasis | `#ea580c` |

## Typography

### Typefaces

| Typeface       | Use                                | Weights | Source        | Notes                                              |
| -------------- | ---------------------------------- | ------- | ------------- | -------------------------------------------------- |
| TT Commons Pro | Headings, buttons, navigation      | 500-600 | Adobe Typekit | Enable `ss02` alternate characters.                |
| DM Sans        | Body text, paragraphs, UI elements | 400-600 | Google Fonts  | Use for readable long-form and supporting UI text. |

### Type Scale

Sizes are responsive. Values shown are desktop / tablet / mobile where
applicable.

| Style | Use                          | Size           | Line Height | Letter Spacing | Weight  |
| ----- | ---------------------------- | -------------- | ----------- | -------------- | ------- |
| H1    | Page headlines               | 48 / 36 / 30px | 1.2         | -0.02em        | 600     |
| H2    | Section headlines            | 30 / 24px      | 1.2         | -0.02em        | 600     |
| H3    | Card titles                  | 24 / 20px      | 1.2         | -0.02em        | 600     |
| Body  | Primary body text            | 18px           | 1.7         | normal         | 400     |
| Small | Supporting text and captions | 14px           | 1.5         | normal         | 400-500 |
| Nav   | Navigation links             | 15px           | normal      | normal         | 500     |

### Heading Defaults

```css
h1,
h2,
h3,
h4,
h5,
h6 {
	font-family: var(--font-heading);
	font-weight: 600;
	line-height: 1.2;
	letter-spacing: -0.02em;
	font-feature-settings: 'ss02' on;
	text-wrap: balance;
}
```

## UI Style

### Surfaces

- Default page background is white.
- Alternate sections use `--slate-50`.
- Dark sections use `--slate-800` or Sky gradients.
- Cards use white backgrounds, rounded corners, subtle borders or shadows, and
  Slate text.

### Buttons

- Primary buttons use `--brand-navy` with white text.
- Primary hover state uses `--sky-800` and a slight upward transform.
- Outline buttons use white backgrounds, `--brand-navy` text, and a
  `--brand-navy` border.
- Button typography uses TT Commons Pro, weight 500, with `ss02` enabled.
- Use `0.5rem` border radius for buttons.

### Links And Interaction

- Interactive navy: `--brand-navy`.
- Link hover on dark backgrounds: `--brand-sky` or `--sky-300`.
- Focus rings use white plus `--brand-navy`, or translucent `--brand-sky` on
  dark backgrounds.
- Motion should be subtle: short ease-out transitions, slight `translateY(-2px)`
  hover lifts, and reduced-motion support.

### Shadows

```css
--shadow-sm: 0 0 0 1px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md:
	0 0 0 1px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.05),
	0 12px 24px rgba(0, 0, 0, 0.05);
--shadow-lg:
	0 0 0 1px rgba(0, 0, 0, 0.03), 0 4px 8px rgba(0, 0, 0, 0.05),
	0 24px 48px rgba(0, 0, 0, 0.08);
--shadow-btn: 0 1px 2px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(2, 74, 112, 0.15);
```

## CSS Variables

```css
:root {
	--font-heading: 'tt-commons-pro', system-ui, sans-serif;
	--font-body: 'DM Sans', system-ui, sans-serif;

	--brand-navy: #024a70;
	--brand-sky: #74d4ff;
	--brand-amber: #ffb86a;
	--brand-gray: #cad5e2;

	--sky-50: #f0f9ff;
	--sky-100: #e0f2fe;
	--sky-200: #bae6fd;
	--sky-300: #7dd3fc;
	--sky-400: #38bdf8;
	--sky-500: #0ea5e9;
	--sky-600: #0284c7;
	--sky-700: #0369a1;
	--sky-800: #075985;
	--sky-900: #0c4a6e;

	--slate-50: #f8fafc;
	--slate-100: #f1f5f9;
	--slate-200: #e2e8f0;
	--slate-300: #cbd5e1;
	--slate-400: #94a3b8;
	--slate-500: #64748b;
	--slate-600: #475569;
	--slate-700: #334155;
	--slate-800: #1e293b;
	--slate-900: #0f172a;
}
```

## Font Imports

```html
<!-- Google Fonts -->
<link
	href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
	rel="stylesheet"
/>

<!-- Adobe Typekit -->
<link rel="stylesheet" href="https://use.typekit.net/whm7mgx.css" />
```
