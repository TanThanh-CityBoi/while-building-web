# @while-building/ui

Application-agnostic React primitives shared by the public site and the CMS. No routing, no
authentication, no business logic — those stay in the apps.

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
