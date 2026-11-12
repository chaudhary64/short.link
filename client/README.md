# short.link - Client

A minimal, fast short.link frontend built with React + Vite.

## Tech Stack

| Tool                                             | Purpose                                |
| ------------------------------------------------ | -------------------------------------- |
| [React 19](https://react.dev)                    | UI framework                           |
| [Vite 8](https://vite.dev)                       | Dev server & bundler (OXC transformer) |
| [React Router v8](https://reactrouter.com)       | Client-side routing                    |
| [TanStack Query v5](https://tanstack.com/query)  | Server state, data fetching & caching  |
| [Redux Toolkit](https://redux-toolkit.js.org)    | Client state (auth token, user info)   |
| [Axios](https://axios-http.com)                  | HTTP client with auth interceptor      |
| [Tailwind CSS v4](https://tailwindcss.com)       | Utility-first styling                  |
| [Geist](https://fonts.google.com/specimen/Geist) | UI font (with Geist Mono, via Google Fonts) |

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

The app runs at `http://localhost:5173` by default.

### Environment Variables

Create a `.env` file in the `client/` root:

```env
VITE_API_BASE_URL=YOUR_API_URL
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID
```

`VITE_GOOGLE_CLIENT_ID` is optional — the Google sign-in button is only usable when it is set.

---

## Project Structure

```
src/
├── api/                       # Axios instance & endpoint modules
│   ├── axios.js               # Configured instance with auth interceptor
│   ├── auth.js                # Login, signup, update user endpoints
│   ├── keys.js                # Create, list & revoke API keys
│   ├── links.js               # Create, fetch & update links
│   ├── analytics.js           # Click analytics endpoints
│   └── refresh.js             # Silent token refresh
│
├── components/
│   ├── analytics/             # Charts, world map, click timeline, skeleton
│   │   ├── AnalyticsSkeleton.jsx, ClickTimeline.jsx, WorldMap.jsx
│   │   ├── charts.jsx, CountryFlag.jsx, DeviceIcons.jsx, Favicon.jsx
│   ├── app/                   # Authenticated frame
│   │   ├── AppShell.jsx       # Sidebar + topbar shell for signed-in routes
│   │   └── AccountMenu.jsx
│   ├── dashboard/             # Link management pieces
│   │   ├── LinkManagement.jsx # Table/list container + row actions
│   │   ├── LinksTable.jsx, LinksMobileList.jsx, LinksFilterBar.jsx
│   ├── layout/                # Nav.jsx, Footer.jsx
│   ├── links/                 # CreateLinkSheet.jsx — new-link drawer
│   ├── settings/              # ApiKeysPanel.jsx — developer keys
│   ├── shared/                # Route-level wrappers
│   │   ├── Layout.jsx         # Nav + <Outlet> + Footer; runs token refresh
│   │   ├── MarketingLayout.jsx, AuthLayout.jsx
│   │   ├── ProtectedRoute.jsx, GuestRoute.jsx
│   │   └── ScrollToTop.jsx, KeyboardShortcuts.jsx
│   └── ui/                    # Reusable design system components
│       ├── Button.jsx, Card.jsx, Chip.jsx, StatCard.jsx
│       ├── Sheet.jsx, ModalSheet.jsx, DeleteLinkModal.jsx, QRCodeModal.jsx
│       ├── Menu.jsx, SearchableSelect.jsx, SegmentedToggle.jsx, StatusSwitch.jsx
│       ├── Collapse.jsx, InfoTooltip.jsx, Avatar.jsx, Logo.jsx, PageHeader.jsx
│       └── Toast.jsx, Loading.jsx, PasswordStrength.jsx, AliasAvailabilityHint.jsx
│
├── config/                    # Shared client configuration
│
├── features/                  # Domain slices (Redux + hooks)
│   ├── auth/                  # authSlice.js + useAuthActions.js
│   ├── user/                  # userSlice.js + useUserActions.js
│   ├── theme/                 # ThemeProvider.jsx — light / dark / system
│   └── toast/                 # ToastProvider + useToast() hook
│
├── pages/
│   ├── Home.jsx               # Marketing landing page with the shortener form
│   ├── Dashboard.jsx          # Overview: stats + recent links
│   ├── Links.jsx              # Full link management
│   ├── Analytics.jsx          # Click analytics per link
│   ├── Settings.jsx           # Profile, security & sessions
│   ├── Login.jsx / Signup.jsx / ForgotPassword.jsx / Verify.jsx
│   └── NotFound.jsx, ErrorPage.jsx
│
├── router/                    # router.jsx (all routes) + lazyPages.js
├── store/                     # store.js — Redux store (auth + user reducers)
├── hooks/                     # useCountUp, useScrollSpy, useDragToDismiss,
│                              # useAnalyticsFilters, useAliasAvailability, useStickyFallback
├── utils/                     # format, exportCsv, countryCodes, dashboardUtils,
│                              # keyboard, motion, timeline
│
├── styles/
│   ├── tokens.css             # Design tokens: colour, type, space, radius, motion
│   ├── app.css                # Dashboard & app surfaces
│   ├── auth.css               # Login / signup / verify pages
│   └── marketing.css          # Landing page + marketing shell
│
├── design.css                 # Legacy component styles, loaded before the token styles
├── index.css                  # Tailwind import, fonts, global keyframes
├── loader.css                 # Boot loader shown before React mounts
└── main.jsx                   # Entry point: providers, router, theme, toasts
```

---

## Design System

The UI is driven by CSS custom properties in `src/styles/tokens.css` — one file defines colour, type, space, radius, elevation and motion for both themes. Components reference tokens (`var(--r-lg)`, `var(--ink-3)`) instead of hard-coded values.

- **Two themes, one token set** — light is the default; `[data-theme="dark"]` redefines the same variables. `features/theme/ThemeProvider.jsx` applies the attribute and persists `light` / `dark` / `system` in `localStorage` under `shortlink-theme`.
- **Rounded surfaces** — the radius scale runs `--r-xs` 3px → `--r-sm` 5px → `--r-md` 7px → `--r-lg` 10px → `--r-xl` 14px → `--r-full` 999px. Panels and feature cards use `--r-lg`, controls use `--r-sm`, chips and toggles use `--r-full`.
- **Warm paper palette** — `--bg` `#f6f5f1`, white surfaces, ink `#191810`, hairline `--line` / `--line-2`. A single accent red (`--accent` `#d63a25`; `#f2705a` in dark) carries emphasis, while `--success`, `--warning`, `--danger` and `--info` are reserved for status.
- **Type** — Geist, with Geist Mono for numerals and code-ish labels. The scale spans `--text-2xs` 10.5px to `--text-3xl` 32px, with tracked uppercase labels via `--tracking-label`.
- **Space** — a 4px rhythm, `--space-1` through `--space-20`.
- **Motion** — `--dur-1`…`--dur-4` and `--ease-out` / `--ease-in-out`. `MotionConfig reducedMotion="user"` plus the `prefers-reduced-motion` block in `index.css` disable animation for users who ask for it.
- **Elevation** — `--shadow-xs`…`--shadow-overlay`; panels rely on hairlines first, shadows second.

Stylesheet load order lives in `main.jsx`: `index.css` → `styles/tokens.css` → `design.css` → `styles/app.css` → `styles/auth.css`, with `styles/marketing.css` imported by the marketing and auth layouts.

### UI Components (`src/components/ui/`)

#### `Button`

```jsx
<Button variant="primary" size="large" tooltip="Shorten this link">
  Shorten
</Button>
```

Props: `variant` (`primary` | `secondary` | `ghost` | `destructive`), `size` (`small` | `medium` | `large`), `disabled`, `tooltip`, `as` (polymorphic).

#### `Card`

```jsx
<Card title="Recent clicks" right={<Chip status="active">Live</Chip>}>
  ...
</Card>
```

Props: `title`, `icon`, `right`, `className`, `titleClassName`, `children`. Renders the `g-panel` head/body structure.

#### `Chip`

```jsx
<Chip status="active">Active</Chip>
```

Props: `status` (`active` | `disabled` | `warning` | `error` | `default`), `dot`, `pulse`, `size` (`md` | `sm`). The `active` dot pulses unless `pulse` is false.

#### `Sheet`

```jsx
<Sheet open={open} onClose={close} title="Create link" footer={<Button>Save</Button>}>
  ...
</Sheet>
```

Right-hand drawer rendered in a portal. Traps focus while open, closes on Escape or backdrop click, and restores focus on exit.

#### `StatCard`

```jsx
<StatCard title="Clicks" value={1_204} delta={12.4} info="Total redirects" spark={<Sparkline />} />
```

Props: `title`, `value`, `description`, `delta`, `spark`, `sparkMax`, `info`, `titleClassName`.

---

## Toast Notifications

The toast system is globally available. No prop drilling — just call the hook.

### Setup (already done in `main.jsx`)

`<ToastProvider>` wraps the entire app and renders the toast stack in the bottom-right corner. No additional setup is needed.

### Usage

```jsx
import { useToast } from "../features/toast/useToast.jsx";

const MyComponent = () => {
  const toast = useToast();

  return (
    <button
      onClick={() => toast.success("Saved!", "Your changes have been applied.")}
    >
      Save
    </button>
  );
};
```

### Methods

```js
toast.success("Title", "Optional message body.");
toast.error("Title", "Optional message body.");
toast.warning("Title", "Optional message body.");
toast.info("Title", "Optional message body.");

// Full control (custom duration in ms, default is 4000)
toast({
  variant: "success",
  title: "Done!",
  message: "All good.",
  duration: 6000,
});

// Title only, no message
toast.error("Something went wrong.");
```

### Variant Reference

| Method            | Accent  | Use for                                    |
| ----------------- | ------- | ------------------------------------------ |
| `toast.success()` | Emerald | Completed actions (saved, copied, created) |
| `toast.error()`   | Red     | Failed operations, API errors              |
| `toast.warning()` | Amber   | Caution, destructive confirmations         |
| `toast.info()`    | Blue    | Neutral information, tips                  |

Toasts **auto-dismiss** after 4 seconds (the progress bar shows time remaining) and can be dismissed early with the ✕ button. Multiple toasts stack vertically.

---

## State Management

### Server State — TanStack Query

Used for all API data (links list, analytics, refresh token). Queries are cached and re-fetched automatically.

```js
const { data } = useQuery({ queryKey: ["LINKS_INFO"], queryFn: getAllLinks });
const mutation = useMutation({ mutationFn: createLink });
```

### Client State — Redux Toolkit

Used only for in-memory session data that doesn't need to be fetched.

| Slice   | State                         | Hooks                                |
| ------- | ----------------------------- | ------------------------------------ |
| `auth`  | `accessToken`                 | `useAuthToken()`, `useAuthActions()` |
| `user`  | `name`, `email`, `created_at` | `useUserInfo()`, `useUserActions()`  |
| `theme` | light / dark / system         | via `ThemeProvider` (React context)  |

> **Note:** The access token is stored in memory (Redux), not `localStorage`, for security. A silent refresh runs on every page load via `Layout.jsx`.

### HTTP Client — Axios

The configured instance at `src/api/axios.js` automatically attaches the `Authorization: Bearer <token>` header to every request by reading directly from the Redux store.

---

## Routing

Route definitions live in `src/router/router.jsx`; page components are lazily loaded through `lazyPages.js`.

| Path               | Component        | Auth required |
| ------------------ | ---------------- | ------------- |
| `/`                | `Home`           | No            |
| `/dashboard`       | `Dashboard`      | Yes           |
| `/links`           | `Links`          | Yes           |
| `/analytics`       | `Analytics`      | Yes           |
| `/settings`        | `Settings`       | Yes           |
| `/login`           | `Login`          | Guest only    |
| `/signup`          | `Signup`         | Guest only    |
| `/verify`          | `Verify`         | Guest only    |
| `/forgot-password` | `ForgotPassword` | No            |
| `*`                | `NotFound`       | —             |

`ErrorPage` is not a route — it is the router's `errorElement`.

---

## Scripts

```bash
pnpm dev        # Start dev server with HMR
pnpm build      # Build for production
pnpm preview    # Preview production build locally
pnpm lint       # Run ESLint
```
