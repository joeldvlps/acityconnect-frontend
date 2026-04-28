# ACity Connect

This is my final project for the Web Technologies course. It's a platform called ACity Connect—basically a smart campus marketplace for Academic City University students. It lets us buy and sell second-hand stuff like textbooks and gadgets, or arrange skill exchanges with each other. It also has a built-in messaging and notification system, plus an admin dashboard to keep everything moderated. Oh, and you can only sign up if you use an official `@acity.edu.gh` email.

## Important Links
- **Frontend Live Site:** https://joeldvlps.github.io/acityconnect-frontend
- **Backend Live Server:** https://acityconnect.onrender.com
- **Frontend Code:** https://github.com/joeldvlps/acityconnect-frontend
- **Backend Code:** https://github.com/joeldvlps/acityconnect-backend

## Test Logins
If you want to test out the admin dashboard right away:
- **Email:** admin@acity.edu.gh
- **Password:** admin123

To test the normal student flow, just register a new account. Remember that the email must end with `@acity.edu.gh`.

## Feature Checklist
Here’s a breakdown of the required project features that have been successfully implemented:

### 1. User System & Profiles
- [x] Secure registration and login flow
- [x] Signups restricted to `@acity.edu.gh` domains
- [x] User profile pages showing personal info, offered skills, and needed skills
- [x] Users can edit and update their profile info

### 2. Marketplace & Listings
- [x] Users can easily post items for sale
- [x] Support for offering or requesting specific skills
- [x] Listings display title, description, category, and status (available, swapped, or sold)
- [x] A solid search and filter system for the listings feed

### 3. Interaction & Communication
- [x] An "Interested" button on every listing
- [x] A notification system AND a direct messaging system for trade requests
- [x] Users can track all their interactions right from their profile

### 4. Admin Features
- [x] Admins can moderate listings (approving them before they go public)
- [x] Admins can edit or completely delete posts
- [x] Admins can flag inappropriate content
- [x] A statistics dashboard to monitor overall platform activity

## Running It Locally

Want to spin this up on your own machine? Here’s how:

**1. Clone the backend repository**
```bash
git clone https://github.com/joeldvlps/acityconnect-backend.git
cd acityconnect-backend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure your environment**
Create a `.env` file in the root folder and add your database info:
```env
DATABASE_URL=your_postgres_connection_url_here
JWT_SECRET=some_super_secret_string
NODE_ENV=development
```

**4. Set up the database**
Run the setup script to create the necessary tables and the default admin account:
```bash
node setup-db.js
```

**5. Start up the backend server**
```bash
node server.js
```
*The API will start running on `http://localhost:5000`.*

**6. Fire up the frontend**
Open `index.html` in your browser, or use VS Code's Live Server. Make sure the API url in `js/config.js` is set to point to `http://localhost:5000` so it connects to your local instance instead of Render.
