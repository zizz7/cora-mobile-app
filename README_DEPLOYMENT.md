# Cora Mobile App - Deployment & Architecture Documentation

## Overview
This document outlines the major architectural changes, UI/UX overhauls, and backend deployments implemented to achieve feature parity between the Cora Web Portal and the Cora Mobile Application.

## 1. Backend Architecture & Live Deployment

To ensure the mobile application can retrieve all necessary data without relying on static mock objects, several new API controllers were created and deployed to the live production server.

### 1.1 Live Server Details
*   **Host**: Hostinger
*   **Domain**: `portal.coracoraresorts.com`
*   **Path**: `/home/u835987630/domains/portal.coracoraresorts.com/`

### 1.2 Added API Controllers
The following controllers were uploaded to `app/Http/Controllers/Api/`:
*   `CityLedgerController.php` (Live City Ledger tracking)
*   `EmployeeController.php` (Employee Directory with RBAC)
*   `EventController.php` (Event listings)
*   `LeaveRequestController.php` (Leave workflows)
*   `MentionController.php` (TripAdvisor Mentions)
*   `ProfileController.php` (Profile updates & Notification Preferences)
*   `ServiceChargeController.php` (Historical Service Charge tracking)
*   `TaskController.php` (Assigned Tasks)
*   `TransportController.php` (Transport & Schedule)
*   `TripController.php` (Company Trips & RSVPs)

### 1.3 Routing & Security (Sanctum)
All new endpoints were registered in `routes/api.php` under the Laravel Sanctum `auth:sanctum` middleware, ensuring only authenticated users with valid Bearer tokens can access this data.
*   **RBAC (Role-Based Access Control)**: Enforced specifically on the `EmployeeController.php` index route, restricting employee directory lookups to `Admin`, `Super Admin`, `HOD`, and users in the `Human Resources` department.

---

## 2. Mobile App Changes

The mobile application structural and stylistic modifications are located within `mobile/app` and `mobile/src`.

### 2.1 Navigation & Structure
*   **Tab Navigation System (`app/(tabs)/_layout.tsx`)**: Reconfigured to include standard navigational tabs: `Home`, `Calendar`, `City Ledger`, `Directory`, and a generalized `Menu` tab pointing to secondary applications.
*   **Application Launcher (`app/(tabs)/menu.tsx`)**: An interactive 3x3 grid was created to serve secondary application routes like `Trips`, `Leave Requests`, `Transport`, `Tasks`, `Service Charge`, and `Settings`.

### 2.2 Replaced Mock Data with Live APIs
*   **React Query Custom Hooks**: Added targeted data fetching hooks for each specialized section (e.g., `useLedger.ts`, `useMentions.ts`, `useTransportTrips.ts`).
*   **City Ledger Integration (`app/(tabs)/ledger.tsx`)**: Disconnected static `MOCK_LEDGER` values, wiring the animated UI directly into the authenticated `useLedger` response stream. The progress bars and remaining limits compute automatically.

### 2.3 Premium UI/UX Implementation
All major components have been rebuilt with modern cross-platform design paradigms (glassmorphism overlays, distinct iconography, rounded corners, drop shadows, responsive Flexboxing).

Notable rebuilds:
1.  **Feed Cards (`src/components/FeedCard.tsx`)**: Upgraded to dynamically parse generic textual "body" content and reconstruct it into specialized visual cards:
    *   **Trips**: Auto-extracts `DEPARTURE`, `RETURN`, and `LOCATION` tags directly from the feed message string, building an interactive "slots available" interface native to the app matching Figma mockups.
    *   **Mentions**: Converts plain list strings into bulleted modern UI modules.
2.  **Notifications Center (`app/notifications/index.tsx`)**: Maps differing notification types (`LeaveApproved`, `NewMention`) to unique dynamic icon colors and manages explicit read/unread status payloads natively.
3.  **Profile / Settings (`app/profile.tsx`)**: Full profile manager allowing real-time edits to phone numbers and cross-channel SMS/WhatsApp notification preferences.

## 3. Recent Fixes & Enhancements

### 3.1 Notification Preferences Update
**Files Changed**: `src/types/index.ts`, `app/(tabs)/profile.tsx`
*   Removed `sms` and `both` notification channel options.
*   Added `email` (Email notifications) and `push` (Mobile App push notifications) as replacements.
*   The `User.notification_channel` type is now `'email' | 'whatsapp' | 'push' | 'none'`.
*   Profile screen shows four options: **None**, **Email**, **WhatsApp**, **Mobile App** — each with distinct icons.

### 3.2 Login Screen UX Improvements
**Files Changed**: `app/login.tsx`
*   **Remember Me**: Checkbox that persists Employee ID and password to `expo-secure-store`. On next launch, credentials are auto-filled and the checkbox is pre-checked.
*   **Forgot Password**: Tappable link that displays an alert instructing the user to contact HR (`hr@coracoramaldives.com`).
*   **Password Visibility Toggle**: Eye icon button to show/hide password text.

### 3.3 Trip Join Button Fix
**Files Changed**: `src/components/FeedCard.tsx`, `app/(tabs)/index.tsx`
*   **Before**: Button said "Login to Join" even when the user was authenticated, and pressing it triggered the double-tap handler (no-op).
*   **After**: Button now says **"Join Trip"** with an `account-plus` icon. It calls the real `POST /api/trips/{id}/join` endpoint via the `useJoinTrip` React Query mutation.
*   Success shows a confirmation alert; failure shows an error alert (e.g., trip full or already joined).
*   The feed auto-refreshes after a successful join.

### 3.4 Tab Bar Redesign & City Ledger Rebuild
**Files Changed**: `app/(tabs)/_layout.tsx`, `app/(tabs)/ledger.tsx`, `src/hooks/useLedger.ts`

#### Tab Bar
*   Changed from a flat top-bordered bar to a **floating pill** with rounded corners, shadow, and active icon background highlights.
*   Tab order: **Home → Ledger → Directory → More**.
*   Calendar and Profile tabs hidden from navigation but still accessible via programmatic routing.
*   Icons switched from `MaterialCommunityIcons` to `Ionicons` for cleaner silhouettes.

#### City Ledger Screen
*   Complete UI rewrite to match the web portal's data model.
*   **Balance Card**: Large total-used amount with color-coded progress bar (green/amber/red by %) and limit/remaining display.
*   **Outlet Breakdown**: Groups transactions by outlet (Freedom Shop, restaurant, bar, etc.) with categorized icons and color coding.
*   **Transaction Table**: Web-parity layout showing item names (from `items[]` array), check numbers, amounts, and formatted dates.
*   **LedgerTransaction interface** updated to include all web model fields: `staff_id`, `posted_at`, `check_num`, `amount`, `outlet`, `items`, `receipt_text`.

### 3.5 Bug Fixes — Trip Join, Push Notification, City Ledger
**Files Changed**: `src/types/feed.ts`, `src/components/FeedCard.tsx`, `app/(tabs)/index.tsx`, `src/utils/notifications.ts`, `src/hooks/useLedger.ts`

*   **Trip Join State**: Added `has_joined` to `FeedItem`. FeedCard now shows an "Already Joined ✓" green badge when joined. Home screen tracks joins locally via a `Set` for instant UI feedback.
*   **Push Notification Error**: Wrapped `registerForPushNotificationsAsync` in a top-level try-catch and removed the hardcoded invalid `projectId`. Silently returns `null` in dev builds.
*   **City Ledger Loading (Backend Fix)**: The API `CityLedgerController.php` had wrong column names — `user_id` instead of `staff_id`, `date` instead of `posted_at`, `total_amount` instead of `amount`, and `billing_cycle` instead of `month`. Fixed and redeployed to the live server. Also made the mobile `useLedger` hook defensive with response normalization, retry, and caching.

### 3.6 Dedicated Mobile API Layer (`/api/mobile/*`)
**Files Created**: `app/Http/Controllers/Api/MobileApiController.php` (server)
**Files Modified**: `routes/api.php` (server), 6 mobile hooks

Created a dedicated `MobileApiController` with verified DB column names, deployed under `/api/mobile/*` prefix. This isolates mobile endpoints from the existing API without modifying any legacy controllers.

| Endpoint | Mobile Hook | Key Fix |
|----------|-------------|---------|
| `GET /api/mobile/city-ledger` | `useLedger.ts` | `staff_id`, `posted_at`, `amount`, `month` (was `user_id`, `date`, `total_amount`, `billing_cycle`) |
| `GET /api/mobile/service-charge` | `useServiceCharge.ts` | Removed non-existent `year` column sort |
| `GET /api/mobile/transport` | `useTransportTrips.ts` | Removed non-existent `driver_id` filter |
| `GET /api/mobile/mentions` | `useMentions.ts` | Uses `mentioned_user_id` with `batch` relation |
| `GET /api/mobile/tasks` | `useTasks.ts` | Unchanged logic, isolated route |
| `PATCH /api/mobile/tasks/{id}/status` | `useTasks.ts` | Isolated from legacy |
| `GET /api/mobile/calendar` | `useCalendar.ts` | Uses `start_at` (was `date` which doesn't exist) |
| `POST /api/mobile/city-ledger/settings` | `useLedger.ts` | Saves limit, notify_enabled, notify_methods |

### 3.7 Stack Navigation & Back Buttons
**Files Changed**: `app/_layout.tsx`

Replaced `<Slot />` with `<Stack>` navigator. All sub-screens (exit-passes, gate-passes, trips, events, leaves, tasks, transport, mentions, service-charge, notifications) now automatically get:
- Styled headers with back buttons
- White background, dark navy text, 700-weight titles
- `headerShadowVisible: false` for a clean modern look

### 3.8 Directory Tab — Role-Based Access
**Files Changed**: `app/(tabs)/_layout.tsx`

Directory tab in the bottom navigation is now restricted to authorised roles:
- **Visible to**: Admin, Super Admin, HOD, Human Resources
- **Hidden from**: Employee, Security, and all other roles
- Implementation: uses `useAuth()` to check `user.role_name` against `DIRECTORY_ALLOWED_ROLES` and sets `href: null` to hide the tab

### 3.9 City Ledger Settings Modal
**Files Changed**: `app/(tabs)/ledger.tsx`, `src/hooks/useLedger.ts`, `src/types/index.ts`

Added a settings gear icon (⚙) to the City Ledger header that opens a bottom-sheet modal with:
- **Spending Limit**: Numeric input to set personal spending limit (stored in `city_ledger_limit` on users table)
- **Notification Toggle**: Enable/disable alerts when approaching limit
- **Notification Methods**: Checkbox options for Email and WhatsApp
- **Save**: Calls `POST /api/mobile/city-ledger/settings` to persist settings

The `User` type was extended with `city_ledger_limit`, `city_ledger_notify_enabled`, and `city_ledger_notify_methods` fields.

---

## 4. Mobile API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with user_id + password, returns Sanctum token |
| GET | `/api/auth/me` | Get authenticated user profile |
| POST | `/api/auth/logout` | Revoke current token |

### Feed
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feed` | Paginated feed items |
| GET | `/api/feed/{id}` | Single feed item |
| POST | `/api/feed/{id}/react` | Toggle reaction |
| GET | `/api/feed/{id}/reactors` | List reactors |

### Exit Passes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exit-passes` | List exit passes |
| POST | `/api/exit-passes` | Create exit pass |
| GET | `/api/exit-passes/{id}` | Show details |
| POST | `/api/exit-passes/{id}/hod-approve` | HOD approval |
| POST | `/api/exit-passes/{id}/hod-reject` | HOD rejection |
| POST | `/api/exit-passes/{id}/hr-approve` | HR approval |
| POST | `/api/exit-passes/{id}/hr-reject` | HR rejection |
| POST | `/api/exit-passes/{id}/security-check` | Security checkpoint |

### Gate Passes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gate-passes` | List gate passes |
| POST | `/api/gate-passes` | Create gate pass |
| GET | `/api/gate-passes/{id}` | Show details |

### Trips & Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | List trips |
| GET | `/api/trips/{id}` | Show trip details |
| POST | `/api/trips/{id}/join` | Join a trip |
| GET | `/api/events` | List events |
| GET | `/api/events/{id}` | Show event details |
| POST | `/api/events/{id}/rsvp` | RSVP to event |

### Leave Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaves` | List leave requests |
| POST | `/api/leaves` | Submit leave request |

### Employees & Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Employee directory (RBAC) |
| GET | `/api/employees/{id}` | Employee details |
| GET | `/api/notifications` | List notifications |
| POST | `/api/notifications/{id}/read` | Mark as read |
| PUT | `/api/profile` | Update profile settings |

### Mobile-Specific API (`/api/mobile/*`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mobile/city-ledger` | City Ledger with correct columns, deduplication, limit_settings |
| POST | `/api/mobile/city-ledger/settings` | Save limit, notification preferences |
| GET | `/api/mobile/service-charge` | Last 12 months service charges |
| GET | `/api/mobile/transport` | Recent 30 transport trips |
| GET | `/api/mobile/mentions` | TripAdvisor mentions for current user |
| GET | `/api/mobile/tasks` | Tasks assigned to/created by user |
| GET | `/api/mobile/tasks/{id}` | Single task details |
| PATCH | `/api/mobile/tasks/{id}/status` | Update task status |
| GET | `/api/mobile/calendar` | Upcoming activities |

### Device Tokens
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/device-token` | Register push token |
| DELETE | `/api/device-token` | Unregister push token |

---

## 5. Deployment Notes for Future Developers
1.  **Local API Configuration:** Check `utils/api.ts` for the core fetch wrapper and `expo-secure-store` token logic. Base URL: `https://portal.coracoraresorts.com/api`.
2.  **Mobile API vs Legacy API**: New mobile features should use `/api/mobile/*` endpoints via `MobileApiController.php`. Legacy endpoints under `/api/` remain for backward compatibility.
3.  **Live DB Mapping**: Ensure TypeScript interfaces strictly map DB column names. Use `php artisan tinker` with `Schema::getColumnListing('table')` to verify.
4.  **Authentication**: Sanctum Bearer tokens via `auth/login`. Token stored in SecureStore under key `auth_token`.
5.  **Remember Me**: Credentials stored under SecureStore key `remember_credentials`.
6.  **Notification Channels**: Valid values: `email`, `whatsapp`, `push`, `none`.
7.  **City Ledger Billing Cycle**: 21st-of-previous-month to 20th-of-current-month. Transactions deduplicated per `check_num`.
8.  **Directory RBAC**: Tab visibility controlled by `DIRECTORY_ALLOWED_ROLES` in `_layout.tsx`. API-level RBAC in `EmployeeController.php`.

