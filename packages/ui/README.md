# @while-building/ui

React UI shared by While Building apps. No routing, no authentication, no business logic — those
stay in the apps. It has three parts:

| Entry                                              | What                                                                                                       | Used by     |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- |
| `@while-building/ui/components/*`, `…/globals.css` | [shadcn/ui](https://ui.shadcn.com/) components (style `base-nova`: Base UI + Tailwind CSS 4) and the theme | CMS         |
| `@while-building/ui` (root), `…/styles.css`        | The original CSS Modules kit (below), in `src/legacy/`                                                     | public site |
| `@while-building/ui/rich-text`, `…/rich-text.css`  | The shared BlockNote schema, `toEditorContent()` and the read-only `RichTextViewer`                        | both        |

## shadcn/ui (CMS)

```css
/* the app's global CSS (the app also needs @tailwindcss/vite) */
@import '@while-building/ui/globals.css';
```

```tsx
import { Button } from '@while-building/ui/components/button';
import { cn } from '@while-building/ui/lib/utils';
```

Add components with the shadcn CLI from the app (`components.json` in `apps/cms` points here), e.g.
`npx shadcn@latest add tabs` run in `apps/cms`. Only add what an app uses. `globals.css` maps the
While Building palette (ink, warm neutrals, orange `brand`, plus `success`/`warning`/`info`) to the
shadcn variables. Dark mode follows `prefers-color-scheme`.

## Rich text

Article bodies are BlockNote documents (JSON). `richTextSchema` lists the block types both the CMS
editor and the renderers accept: paragraph, heading, lists, checklist, quote, code, divider and
image. `RichTextViewer` renders a document read-only with BlockNote itself (no UI kit, no Tailwind).
Import it lazily, since it pulls in the editor engine.

## CSS Modules kit (public site)

```tsx
// Once per app, before the app's own styles:
import '@while-building/ui/styles.css';

import { Button, Card, FormField, Input } from '@while-building/ui';
```

| Group    | Components                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Actions  | `Button`, `buttonClassName()` (to style a router `<Link>` as a button), `Dropdown`                                                   |
| Forms    | `FormField`, `Input`, `Textarea`, `Select`                                                                                           |
| Layout   | `PageContainer`, `PageHeader`, `Card`, `CardHeader`                                                                                  |
| Overlays | `Dialog`, `DialogBody`, `DialogFooter` (native `<dialog>`)                                                                           |
| Data     | `Table`, `TableContainer`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`, `Badge`, `Tag`, `TagList`, `Avatar` |
| Feedback | `Alert`, `EmptyState`, `LoadingState`, `ErrorState`, `Spinner`                                                                       |

## Theming

Components are styled with CSS Modules that read CSS custom properties. `styles.css` provides the
brand defaults (`src/styles/tokens.css`: colors with a dark variant, type scale, spacing, radii,
layout and component tokens) plus a small reset (`src/styles/base.css`).

Apps override tokens in their own global CSS instead of restyling components. The public site uses
the defaults (editorial); the CMS overrides surfaces, density and header sizes (e.g.
`--text-body`, `--control-height`, `--page-header-title-size`).

## Guidelines

- Add a component here only when both apps need it (or it is clearly generic).
- Keep components accessible: native elements first, labelled controls (`FormField`), keyboard
  support (`Dropdown` follows the WAI-ARIA menu pattern), visible focus.
