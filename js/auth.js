/*
   js/auth.js
   Handles: login, register, logout, and checking if user
   is logged in. Also loads the navbar admin link.

   NOTE: This file must be loaded AFTER js/config.js
*/


/*
   getToken()
   Returns the JWT token saved in localStorage.
   Returns null if the user is not logged in.
*/
function getToken() {
    return localStorage.getItem('token');
}


/*
   getUser()
   Returns the user object saved in localStorage.
   Returns null if no user is saved.
*/
function getUser() {
    var userData = localStorage.getItem('user');
    if (userData) {
        return JSON.parse(userData);    // convert JSON string back to object
    }
    return null;
}


/*
   requireLogin()
   Call this at the top of any page that needs the user
   to be logged in. If they're not, send them to login page.
*/
function requireLogin() {
    if (!getToken()) {
        window.location.href = 'login.html';    // redirect to login
    }
}


/*
   requireAdmin()
   Call on admin pages. Redirects non-admins away.
*/
function requireAdmin() {
    var user = getUser();
    if (!user || user.role !== 'admin') {
        window.location.href = 'dashboard.html';
    }
}


/*
   showAdminLink()
   Shows the "Admin" link in the navbar if user is admin.
   Call this on every page that has a navbar.
*/
function showAdminLink() {
    var user = getUser();
    var adminLink = document.getElementById('admin-nav-link');
    if (adminLink && user && user.role === 'admin') {
        adminLink.classList.remove('hidden');
    }
}


/*
   logout()
   Clears saved login data and sends user to login page.
*/
function logout() {
    localStorage.removeItem('token');    // delete the token
    localStorage.removeItem('user');     // delete the user data
    window.location.href = 'login.html'; // go back to login page
}


/*
   login(email, password)
   Sends login request to the backend.
   Saves token and user on success.
   Throws an error message on failure.
*/
function login(email, password) {
    // fetch() sends an HTTP request to the server
    return fetch(API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },   // tell server we're sending JSON
        body: JSON.stringify({ email: email, password: password })  // convert to JSON string
    })
    .then(function(response) {
        return response.json();    // parse the response as JSON
    })
    .then(function(data) {
        if (data.error) {
            throw new Error(data.error);    // if the server sent an error, raise it
        }

        // Save the token and user info for later use
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Go to the marketplace page
        window.location.href = 'dashboard.html';
    });
}


/*
   register(fullName, email, password)
   Sends registration request to the backend.
*/
function register(fullName, email, password) {
    return fetch(API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email: email, password: password })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.error) {
            throw new Error(data.error);
        }

        // Save the token and user, then go to dashboard
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
    });
}


/*
   apiGet(path)
   Makes a GET request to the API with the user's token.
   Returns a Promise that resolves to the data.
*/
function apiGet(path) {
    return fetch(API_URL + path, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + getToken() }   // attach the token
    })
    .then(function(response) { return response.json(); });
}


/*
   apiPost(path, body)
   Makes a POST request to the API with JSON data.
*/
function apiPost(path, body) {
    return fetch(API_URL + path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify(body)
    })
    .then(function(response) { return response.json(); });
}


/*
   apiPut(path, body)
   Makes a PUT request to the API (used for updates).
*/
function apiPut(path, body) {
    return fetch(API_URL + path, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify(body)
    })
    .then(function(response) { return response.json(); });
}


/*
   apiDelete(path)
   Makes a DELETE request to the API.
*/
function apiDelete(path) {
    return fetch(API_URL + path, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + getToken() }
    })
    .then(function(response) { return response.json(); });
}
