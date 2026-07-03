# short.link - Client

A minimal, fast short.link frontend built with React + Vite.

## Tech Stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev) | UI framework |
| [Vite 8](https://vite.dev) | Dev server & bundler (OXC transformer) |
| [React Router v8](https://reactrouter.com) | Client-side routing |
| [TanStack Query v5](https://tanstack.com/query) | Server state, data fetching & caching |
| [Redux Toolkit](https://redux-toolkit.js.org) | Client state (auth token, user info) |
| [Axios](https://axios-http.com) | HTTP client with auth interceptor |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling |
| [Inter](https://fonts.google.com/specimen/Inter) | UI font (via Google Fonts) |

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
```

---

## Project Structure

```
src/
├── api/                  # Axios instance & API call functions
│   ├── axios.js          # Configured Axios instance with auth interceptor
│   ├── auth.js           # Login, signup, update user endpoints
│   ├── links.js          # Create & fetch shortened links
│   └── refresh.js        # Silent token refresh
│
├── components/
│   ├── layout/           # Persistent layout pieces
│   │   ├── Nav.jsx
│   │   └── Footer.jsx
│   ├── shared/           # Route-level wrappers
│   │   └── Layout.jsx    # Wraps Nav + <Outlet> + Footer; runs token refresh
│   └── ui/               # Reusable design system components
│       ├── Avatar.jsx
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Chip.jsx
│       ├── StatCard.jsx
│       ├── Table.jsx
│       └── Toast.jsx     # Toast UI (ToastItem + ToastContainer)
│
├── features/             # Domain slices (Redux + custom hooks)
│   ├── auth/
│   │   ├── authSlice.js        # Stores accessToken in Redux
│   │   └── useAuthActions.js   # useAuthToken(), useAuthActions()
│   ├── user/
│   │   ├── userSlice.js        # Stores name, email, created_at
│   │   └── useUserActions.js   # useUserInfo(), useUserActions()
│   └── toast/
│       └── useToast.jsx        # ToastProvider + useToast() hook
│
├── pages/
│   ├── Home.jsx          # Landing page with URL shortener form
│   ├── Dashboard.jsx     # Authenticated user dashboard & link management
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── NotFound.jsx
│
├── router/
│   └── router.js         # All route definitions
│
├── store/
│   └── store.js          # Redux store (auth + user reducers)
│
├── index.css             # Global styles, Tailwind import, keyframe animations
└── main.jsx              # App entry point
```

---

## Design System

The UI follows a **minimalist boxy aesthetic**:

- **No border-radius** — `rounded-none` everywhere for sharp, geometric shapes
- **Monochromatic palette** — `gray-900` primary, `gray-50`/`white` backgrounds
- **Accent colours** — emerald (success), red (error), amber (warning), blue (info) — used sparingly
- **Typography** — Inter, with tight tracking on headings
- **Shadows** — `shadow-sm` / `shadow-md` only, no glow effects

### UI Components (`src/components/ui/`)

#### `Button`
```jsx
<Button variant="primary" size="large" tooltip="Click me">Submit</Button>
```
Props: `variant` (`primary` | `secondary` | `ghost` | `destructive`), `size` (`small` | `medium` | `large`), `disabled`, `tooltip`, `as` (polymorphic).

#### `Card`
```jsx
<Card className="flex flex-col gap-3">...</Card>
```
White background, `border-gray-100`, `shadow-sm`, sharp corners.

#### `Chip`
```jsx
<Chip status="active">Active</Chip>
```
Statuses: `active` (emerald), `warning` (amber), `error` (red), `default` (gray).

#### `Table`
```jsx
<Table>
  <TableHeader><TableHead>Name</TableHead></TableHeader>
  <TableBody>
    <TableRow><TableCell>Value</TableCell></TableRow>
  </TableBody>
</Table>
```

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
    <button onClick={() => toast.success("Saved!", "Your changes have been applied.")}>
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
toast({ variant: "success", title: "Done!", message: "All good.", duration: 6000 });

// Title only, no message
toast.error("Something went wrong.");
```

### Variant Reference

| Method | Accent | Use for |
|---|---|---|
| `toast.success()` | Emerald | Completed actions (saved, copied, created) |
| `toast.error()` | Red | Failed operations, API errors |
| `toast.warning()` | Amber | Caution, destructive confirmations |
| `toast.info()` | Blue | Neutral information, tips |

Toasts **auto-dismiss** after 4 seconds (the progress bar shows time remaining) and can be dismissed early with the ✕ button. Multiple toasts stack vertically.

---

## State Management

### Server State — TanStack Query
Used for all API data (links list, refresh token). Queries are cached and re-fetched automatically.

```js
const { data } = useQuery({ queryKey: ["LINKS_INFO"], queryFn: getAllLinks });
const mutation = useMutation({ mutationFn: createLink });
```

### Client State — Redux Toolkit
Used only for in-memory session data that doesn't need to be fetched.

| Slice | State | Hooks |
|---|---|---|
| `auth` | `accessToken` | `useAuthToken()`, `useAuthActions()` |
| `user` | `name`, `email`, `created_at` | `useUserInfo()`, `useUserActions()` |

> **Note:** The access token is stored in memory (Redux), not `localStorage`, for security. A silent refresh runs on every page load via `Layout.jsx`.

### HTTP Client — Axios
The configured instance at `src/api/axios.js` automatically attaches the `Authorization: Bearer <token>` header to every request by reading directly from the Redux store.

---

## Routing

| Path | Component | Auth required |
|---|---|---|
| `/` | `Home` | No |
| `/dashboard` | `Dashboard` | Yes |
| `/login` | `Login` | No |
| `/signup` | `Signup` | No |
| `*` | `NotFound` | — |

---

## Scripts

```bash
pnpm dev        # Start dev server with HMR
pnpm build      # Build for production
pnpm preview    # Preview production build locally
pnpm lint       # Run ESLint
```
