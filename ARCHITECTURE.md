# Architecture Overview

This document explains the **data flow, architecture layers, and design decisions** behind the Task Manager app.

---

## 🏗️ High-Level Architecture

```
UI Components → Redux (slices/thunks) → Repository Layer → Persistence (Firebase/IndexedDB)
```

---

## 🔹 Layers

### 1. **UI Layer**

* Next.js App Router pages (`/login`, `/signup`, `/lists`, `/lists/[id]`).
* React components (ListsUI, TasksUI, Navbar).
* Client-side form validation (title required, due date valid).
* Responsive + accessible with Tailwind CSS.

### 2. **State Management (Redux Toolkit)**

* `listsSlice` manages lists (CRUD, status, errors).
* `tasksSlice` manages tasks (CRUD, filters, sorting, status toggles).
* Async thunks used for fetching/syncing data from Firebase.
* Normalized state (arrays of entities).

### 3. **Repository / Sync Layer**

* Handles data access & synchronization.
* All Firebase and IndexedDB calls abstracted here.
* IndexedDB (Dexie.js) used for offline-first caching.
* Sync logic ensures:

  * On online → Firestore is source of truth.
  * On offline → IndexedDB serves cached tasks.

### 4. **Persistence Layer**

* **Firebase Firestore** → canonical storage for lists & tasks.
* **Firebase Auth** → signup/login, JWT issued per session.
* **IndexedDB (Dexie.js)** → local persistence for tasks.
* **Cookies** → httpOnly cookie stores JWT securely.

---

## 🔒 Authentication & Security

* Firebase Auth issues JWT after signup/login.
* Token stored in **httpOnly cookie** via Next.js API route.
* Verified server-side using Firebase Admin SDK (`verifySession`).
* Protects routes (`/lists`, `/tasks`).
* Logout clears session cookie.

---

## 🔄 Offline & Sync Strategy

* Tasks cached in IndexedDB.
* On reconnect → local tasks merged with Firebase.
* Example migration included (schema upgrade handling).

---

## 📊 Data Flow Example

1. User creates a new Task.
2. UI dispatches `createTask` thunk.
3. Thunk → writes to Firestore & IndexedDB.
4. Redux updates state → UI re-renders instantly.
5. On offline → only IndexedDB updates, Firestore syncs later.

---

## ✅ Trade-offs

* Chose **Redux Toolkit** instead of Context API → easier async handling.
* Chose **httpOnly cookies** instead of localStorage →more secure.
* Chose **Dexie.js** wrapper for IndexedDB → easier than raw API.
