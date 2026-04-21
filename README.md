# ACity Connect — Smart Campus Marketplace & Skill Exchange

## Project Overview

ACity Connect is a web platform that enables students at Academic City University College to:
- **Buy and sell second-hand items** (textbooks, electronics, etc.)
- **Exchange skills** (tutoring, design, coding, etc.)
- **Send messages** and receive notifications when someone expresses interest in a listing
- **Admins** can moderate all content: approve, edit, flag, or delete listings

Registration is restricted to **@acity.edu.gh** institutional emails only.

---

## Deployment Links

| Part | Link |
|------|------|
| **Frontend (GitHub Pages)** | https://joeldvlps.github.io/acityconnect-frontend |
| **Backend (Render)** | https://acityconnect.onrender.com |
| **Backend GitHub Repo** | https://github.com/joeldvlps/acityconnect-backend |
| **Frontend GitHub Repo** | https://github.com/joeldvlps/acityconnect-frontend |


---

## Login Details

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@acity.edu.gh | admin123 |
| **Student** | Register with any @acity.edu.gh email | Your chosen password |

---

## Feature Checklist

### 1. User System & Profiles (15 marks)
-  Secure registration and login (passwords hashed with bcrypt, JWT sessions)
-  Registration restricted to @acity.edu.gh emails
-  User profile page with personal info, skills offered, and skills needed
-  Users can update their profile information

### 2. Marketplace & Listings (15 marks)
-  Users can post items for sale (textbooks, electronics, etc.)
-  Users can offer or request skill exchanges
-  Each listing includes: Title, Description, Category (Item or Skill), Status (Available / Swapped / Sold)
-  Searchable and filterable feed of listings

### 3. Interaction & Communication (15 marks)
-  "Interested" button on each listing
-  Notification system — listing owner is notified when someone expresses interest
-  Direct messaging system between users
-  Users can track the status of their interactions (My Profile page)

### 4. Admin Features (15 marks)
- Admin can approve listings before they appear in the marketplace
- Admin can edit listing title, description, and category
- Admin can delete any listing
- Admin can flag inappropriate content (hides listing from marketplace)
- Admin dashboard with platform stats: total listings, users, interactions, pending

---

## Installation Instructions (Run Locally)

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher)
- A PostgreSQL database (free on [Render.com](https://render.com))

### Steps

**1. Clone the backend repository:**
```bash
git clone https://github.com/joeldvlps/acityconnect-backend.git
cd acityconnect-backend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Create a `.env` file:**
```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=anyLongRandomString
NODE_ENV=development
```

**4. Set up the database (run once):**
```bash
node setup-db.js
```

**5. (Optional) Add sample listings:**
```bash
node seed-listings.js
```

**6. Start the server:**
```bash
node server.js
```
Server runs at: `http://localhost:5000`

**7. Open the frontend:**  
Open `index.html` in your browser (or use VS Code Live Server).  
Make sure `js/config.js` has `var API_URL = 'http://localhost:5000';`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Hosting | Render.com (backend), GitHub Pages (frontend) |
