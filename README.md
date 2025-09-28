# TaskManager

A production-minded task management web app built with **Next.js 14**, **TailwindCSS v4**, **Redux Toolkit**, **Firebase**, and **IndexedDB**.  
The app allows users to create lists, add/manage tasks with due dates, priorities, statuses, and tags — while working offline-first and syncing with Firebase when online.

---

## 🚀 Live Demo
🔗 [Deployed on Vercel](https://taskmanagerr1.vercel.app/)

Demo account:  
- Email: test@intern.com
- Password: hello12

🎥 Demo Recording 
📹 [Demo Video](https://drive.google.com/file/d/1Np1w6Cc2Mp-Q3qVa8WwYN06OcqcGzYfs/view?usp=sharing)
---

## 📦 Tech Stack
- **Frontend:** Next.js 14 (App Router), React (hooks), TailwindCSS v4  
- **State Management:** Redux Toolkit (slices + async thunks)  
- **Backend:** Firebase Firestore + Firebase Auth  
- **Offline Persistence:** IndexedDB (Dexie.js)  
- **Authentication:** Firebase Auth + JWT stored in httpOnly cookies  
- **Deployment:** Vercel  

---

## ✨ Features
- User signup & login (Firebase Auth, JWT via cookies)  
- Create, rename, delete **Lists**  
- Add, edit, delete **Tasks** per list  
- Task attributes: title, description, due date, priority, status, tags  
- Filter tasks by tags / status  
- Sort tasks by due date & priority  
- Global search across all lists  
- Offline-first: IndexedDB caching with sync on reconnect  
- Responsive UI (desktop, tablet, mobile)  
- Secure auth (httpOnly cookies, no plain localStorage storage)  

---

## 📂 Folder Structure
📦 app/
├── login/
├── signup/
├── lists/
│   ├── page.jsx
│   └── alllists/
│       └── [id]/page.jsx
├── page.jsx
├── api/
│   ├── set-cookie/
│   │   └── route.js
│   └── logout/
│       └── route.js

📦 components/
├── Navbar.jsx
├── ListsUI.jsx
└── TasksUI.jsx

📦 redux/
├── store.js
├── listsSlice.js
└── tasksSlice.js

📦 lib/
├── firebase.js
├── auth.js
└── indexedDB.js
✅ Usage Instructions
1. Clone the repository
bash
Copy code
git clone https://github.com/codedirector/TaskManager.git
cd TaskManager
2. Install dependencies
bash
Copy code
npm install
3. Run the app locally
bash
Copy code
npm run dev
Then open: http://localhost:3000

⚠️ Known Issues
First load while offline shows empty lists until IndexedDB syncs with Firestore.

✅ .env.local Configuration
🔐 Firebase Client SDK (frontend)
env
Copy code
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
🔐 Firebase Admin SDK (for server-side use like API routes)
env
Copy code
TYPE=service_account
PROJECT_ID=your_project_id
PRIVATE_KEY_ID=your_private_key_id
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
CLIENT_EMAIL=your_service_account_email
CLIENT_ID=your_client_id
AUTH_URI=https://accounts.google.com/o/oauth2/auth
TOKEN_URI=https://oauth2.googleapis.com/token
AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_service_account_email


👨‍💻 Author

Built by Shobhit as part of Frontend Intern Assignment @ Credes TechLabs.
