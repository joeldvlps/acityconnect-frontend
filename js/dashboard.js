/*
   js/dashboard.js
   Handles the Marketplace page:
   - Loading all approved listings
   - Searching and filtering
   - Creating a new listing (modal)
   - "Interested" button

   NOTE: Requires js/config.js and js/auth.js to be loaded first.
*/


/*
   STEP 1: Redirect to login if not logged in,
   and show the admin link if the user is an admin.
*/
requireLogin();
showAdminLink();


/*
   allListings — stores every listing fetched from the server.
   We keep a copy so we can filter without re-fetching.
*/
var allListings = [];


/*
   loadListings()
   Fetches all approved listings from the API and displays them.
*/
function loadListings() {
    /* Show a loading message while we wait for the server */
    document.getElementById('listings-grid').innerHTML = '<p class="loading-msg">Loading listings...</p>';

    /* GET /api/listings — no token needed for public listings */
    fetch(API_URL + '/api/listings')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            allListings = data;    /* save a copy for filtering */
            displayListings(data);
        })
        .catch(function(err) {
            document.getElementById('listings-grid').innerHTML =
                '<p class="loading-msg">Could not load listings. Please refresh the page.</p>';
        });
}


/*
   displayListings(listings)
   Takes an array of listing objects and builds the HTML cards.
*/
function displayListings(listings) {
    var grid = document.getElementById('listings-grid');

    /* If there are no results, show a friendly message */
    if (listings.length === 0) {
        grid.innerHTML = '<p class="loading-msg">No listings found. Try a different search.</p>';
        return;
    }

    /* Build HTML for all cards */
    var html = '';

    for (var i = 0; i < listings.length; i++) {
        var listing = listings[i];

        /* Trim the description to 100 characters to keep cards short */
        var shortDesc = listing.description;
        if (shortDesc.length > 100) {
            shortDesc = shortDesc.substring(0, 100) + '...';
        }

        /* Format the date in a readable way */
        var date = new Date(listing.created_at).toLocaleDateString();

        /* Build one card */
        html += '<div class="card">';
        html += '  <h3>' + escapeHtml(listing.title) + '</h3>';
        html += '  <p>' + escapeHtml(shortDesc) + '</p>';

        html += '  <div class="card-footer">';
        html += '    <span class="badge badge-' + listing.category + '">' + listing.category + '</span>';
        html += '    <span class="badge badge-' + listing.status + '">' + listing.status + '</span>';
        html += '  </div>';

        html += '  <div style="margin-top: 8px; font-size: 12px; color: #666;">By: ' + escapeHtml(listing.owner_name) + ' &bull; ' + date + '</div>';

        /* Show the "Interested" button.
           We pass the listing ID and owner's user_id to the function. */
        var currentUser = getUser();
        if (currentUser && listing.user_id !== currentUser.id) {
            /* Only show the button if it's not YOUR OWN listing */
            html += '  <div style="margin-top: 10px;">';
            html += '    <button class="btn btn-success" onclick="expressInterest(' + listing.id + ', \'' + escapeHtml(listing.owner_name) + '\')">';
            html += '      I am Interested';
            html += '    </button>';
            html += '  </div>';
        }

        html += '</div>';  /* end .card */
    }

    /* Put all the cards into the grid */
    grid.innerHTML = html;
}


/*
   filterListings()
   Called every time the user types in search or changes filters.
   Filters the allListings array and re-displays results.
*/
function filterListings() {
    /* Get the current filter values */
    var searchText = document.getElementById('search-input').value.toLowerCase();
    var category   = document.getElementById('category-filter').value;
    var status     = document.getElementById('status-filter').value;

    /* Filter the array using conditions */
    var filtered = allListings.filter(function(listing) {
        var matchesSearch   = true;
        var matchesCategory = true;
        var matchesStatus   = true;

        /* Check if search text appears in title or description */
        if (searchText) {
            matchesSearch =
                listing.title.toLowerCase().includes(searchText) ||
                listing.description.toLowerCase().includes(searchText);
        }

        /* Check category */
        if (category) {
            matchesCategory = (listing.category === category);
        }

        /* Check status */
        if (status) {
            matchesStatus = (listing.status === status);
        }

        /* Listing must match ALL filters */
        return matchesSearch && matchesCategory && matchesStatus;
    });

    /* Show the filtered results */
    displayListings(filtered);
}


/*
   expressInterest(listingId, ownerName)
   Called when a user clicks the "Interested" button.
   Sends a request to the server which creates an interaction
   and notifies the listing owner.
*/
function expressInterest(listingId, ownerName) {
    /* Send POST request with the listing ID */
    apiPost('/api/interactions', { listing_id: listingId })
        .then(function(data) {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('Your interest has been noted! ' + ownerName + ' will be notified.');
            }
        })
        .catch(function(err) {
            alert('Something went wrong. Please try again.');
        });
}


/*
   closeModal()
   Hides the new listing popup.
   Still used by submitListing() after a successful post.
*/
function closeModal() {
    document.getElementById('listing-modal').classList.add('hidden');
}



/*
   submitListing()
   Called when the user clicks "Submit Listing" in the modal.
   Sends the new listing to the server.
*/
function submitListing() {
    var title       = document.getElementById('listing-title').value.trim();
    var description = document.getElementById('listing-desc').value.trim();
    var category    = document.getElementById('listing-category').value;

    var modalError = document.getElementById('modal-error');

    /* Basic validation */
    if (!title || !description) {
        modalError.textContent = 'Please fill in the title and description.';
        modalError.classList.remove('hidden');
        return;
    }

    /* Send to the server */
    apiPost('/api/listings', { title: title, description: description, category: category })
        .then(function(data) {
            if (data.error) {
                modalError.textContent = data.error;
                modalError.classList.remove('hidden');
            } else {
                /* Success — close modal and tell the user */
                closeModal();
                alert('Listing submitted! It will appear in the marketplace after admin approval.');
            }
        })
        .catch(function(err) {
            modalError.textContent = 'Something went wrong. Please try again.';
            modalError.classList.remove('hidden');
        });
}


/*
   escapeHtml(text)
   Safely inserts user-provided text into HTML.
   Prevents XSS (cross-site scripting) attacks where
   someone could inject harmful code into your page.
*/
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}





/*
   Run loadListings when the page first opens.
*/
loadListings();
