/* ============================================================
   js/admin.js
   Handles the Admin Panel page:
   - Shows platform stats (listings, users, interactions, pending)
   - Lists pending listings for approval
   - Lists ALL listings with flag/delete controls
   - Lists all users

   NOTE: Requires js/config.js and js/auth.js to be loaded first.
   Only admin accounts can access this page.
   ============================================================ */


/* Redirect to login if not logged in, and to dashboard if not admin */
requireLogin();
requireAdmin();


/* ----------------------------------------------------------
   loadStats()
   Fetches platform statistics from the admin route.
   Fills in the 4 stat boxes at the top of the page.
   ---------------------------------------------------------- */
function loadStats() {
    apiGet('/api/admin/stats')
        .then(function(data) {
            /* Fill in each stat box */
            document.getElementById('stat-listings').textContent    = data.total_listings;
            document.getElementById('stat-users').textContent       = data.total_users;
            document.getElementById('stat-interactions').textContent = data.total_interactions;
            document.getElementById('stat-pending').textContent     = data.pending;
        })
        .catch(function(err) {
            console.log('Could not load stats: ' + err.message);
        });
}


/* ----------------------------------------------------------
   loadPendingListings()
   Gets all listings that are NOT yet approved.
   Admin can approve or delete these.
   ---------------------------------------------------------- */
function loadPendingListings() {
    apiGet('/api/admin/listings/pending')
        .then(function(listings) {
            var container  = document.getElementById('pending-list');
            var countBadge = document.getElementById('pending-count');

            /* Show count in header badge */
            countBadge.textContent = listings.length + ' pending';

            if (listings.length === 0) {
                container.innerHTML = '<p style="color:#006600; font-size:13px;">No pending listings. All clear!</p>';
                return;
            }

            /* Build a table for pending listings */
            var html = '<table>';
            html += '<tr><th>Title</th><th>Category</th><th>Posted By</th><th>Date</th><th>Actions</th></tr>';

            for (var i = 0; i < listings.length; i++) {
                var l    = listings[i];
                var date = new Date(l.created_at).toLocaleDateString();

                /* Trim long descriptions for the table */
                var shortDesc = l.description;
                if (shortDesc.length > 80) {
                    shortDesc = shortDesc.substring(0, 80) + '...';
                }

                html += '<tr id="pending-row-' + l.id + '">';
                html += '  <td><strong>' + escapeHtml(l.title) + '</strong><br><small style="color:#555;">' + escapeHtml(shortDesc) + '</small></td>';
                html += '  <td><span class="badge badge-' + l.category + '">' + l.category + '</span></td>';
                html += '  <td>' + escapeHtml(l.owner_name) + '</td>';
                html += '  <td>' + date + '</td>';
                html += '  <td>';
                html += '    <button class="btn btn-success" onclick="approveListing(' + l.id + ')">Approve</button> ';
                html += '    <button class="btn btn-danger"  onclick="adminDeleteListing(' + l.id + ', true)">Delete</button>';
                html += '  </td>';
                html += '</tr>';
            }

            html += '</table>';
            container.innerHTML = html;
        });
}


/* ----------------------------------------------------------
   loadAllListings()
   Gets every listing on the platform so admin can moderate.
   ---------------------------------------------------------- */
function loadAllListings() {
    apiGet('/api/admin/listings')
        .then(function(listings) {
            var container = document.getElementById('all-listings-list');

            if (listings.length === 0) {
                container.innerHTML = '<p style="color:#666; font-size:13px;">No listings yet.</p>';
                return;
            }

            var html = '<table>';
            html += '<tr><th>Title</th><th>Category</th><th>Status</th><th>Approved</th><th>Flagged</th><th>Posted By</th><th>Actions</th></tr>';

            for (var i = 0; i < listings.length; i++) {
                var l = listings[i];

                html += '<tr id="listing-row-' + l.id + '">';
                html += '  <td>' + escapeHtml(l.title) + '</td>';
                html += '  <td><span class="badge badge-' + l.category + '">' + l.category + '</span></td>';
                html += '  <td><span class="badge badge-' + l.status + '">' + l.status + '</span></td>';

                /* Show YES (green) or NO (red) for approved */
                html += '  <td>' + (l.is_approved ? '<span style="color:green;">Yes</span>' : '<span style="color:#cc0000;">No</span>') + '</td>';

                /* Show YES (red) or NO (green) for flagged */
                html += '  <td>' + (l.is_flagged  ? '<span style="color:#cc0000;">Yes</span>' : '<span style="color:green;">No</span>') + '</td>';

                html += '  <td>' + escapeHtml(l.owner_name) + '</td>';
                html += '  <td>';

                /* Only show Approve if not yet approved */
                if (!l.is_approved) {
                    html += '<button class="btn btn-success" onclick="approveListing(' + l.id + ')">Approve</button> ';
                }

                /* Only show Flag if not already flagged */
                if (!l.is_flagged) {
                    html += '<button class="btn btn-warn" onclick="flagListing(' + l.id + ')">Flag</button> ';
                }

                /* Edit button — always available */
                html += '<button class="btn btn-primary" onclick="editListing(' + l.id + ', \'' + escapeHtml(l.title) + '\', \'' + escapeHtml(l.category) + '\')" style="font-size:12px; padding:4px 8px;">Edit</button> ';

                html += '<button class="btn btn-danger" onclick="adminDeleteListing(' + l.id + ', false)">Delete</button>';
                html += '  </td>';
                html += '</tr>';
            }

            html += '</table>';
            container.innerHTML = html;
        });
}


/* ----------------------------------------------------------
   loadUsers()
   Gets all registered users and shows them in a table.
   ---------------------------------------------------------- */
function loadUsers() {
    apiGet('/api/admin/users')
        .then(function(users) {
            var container = document.getElementById('users-list');

            if (users.length === 0) {
                container.innerHTML = '<p style="color:#666;">No users found.</p>';
                return;
            }

            var html = '<table>';
            html += '<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>';

            for (var i = 0; i < users.length; i++) {
                var u    = users[i];
                var date = new Date(u.created_at).toLocaleDateString();

                html += '<tr>';
                html += '  <td>' + u.id + '</td>';
                html += '  <td>' + escapeHtml(u.full_name) + '</td>';
                html += '  <td>' + escapeHtml(u.email) + '</td>';
                html += '  <td><span class="badge ' + (u.role === 'admin' ? 'badge-flagged' : 'badge-available') + '">' + u.role + '</span></td>';
                html += '  <td>' + date + '</td>';
                html += '</tr>';
            }

            html += '</table>';
            container.innerHTML = html;
        });
}


/* ----------------------------------------------------------
   approveListing(listingId)
   Approves a listing so it shows in the marketplace.
   Refreshes both the pending list and full list.
   ---------------------------------------------------------- */
function approveListing(listingId) {
    apiPut('/api/admin/listings/' + listingId + '/approve', {})
        .then(function(data) {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('Listing approved and is now visible in the marketplace.');
                /* Reload all sections to reflect the change */
                loadStats();
                loadPendingListings();
                loadAllListings();
            }
        });
}


/* ----------------------------------------------------------
   flagListing(listingId)
   Flags a listing as inappropriate — hides it from the marketplace.
   ---------------------------------------------------------- */
function flagListing(listingId) {
    if (!confirm('Flag this listing as inappropriate? It will be hidden from the marketplace.')) {
        return;
    }

    apiPut('/api/admin/listings/' + listingId + '/flag', {})
        .then(function(data) {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('Listing has been flagged and hidden.');
                loadAllListings();
            }
        });
}


/* ----------------------------------------------------------
   editListing(listingId, currentTitle, currentCategory)
   Opens simple prompt boxes for the admin to edit a listing.
   Uses browser prompt() — keeps it beginner-friendly.
   ---------------------------------------------------------- */
function editListing(listingId, currentTitle, currentCategory) {
    /* Ask for new title — pre-filled with current value */
    var newTitle = prompt('Edit Title:\n(Leave blank to keep current)', currentTitle);

    /* If user pressed Cancel on the title prompt, stop */
    if (newTitle === null) { return; }

    /* Ask for new description */
    var newDesc = prompt('Edit Description:\n(Leave blank to keep current)', '');

    /* Ask for new category */
    var newCategory = prompt('Edit Category (item or skill):\n(Leave blank to keep current)', currentCategory);

    /* If user pressed Cancel on category, stop */
    if (newCategory === null) { return; }

    /* Only send fields that were actually changed (not empty) */
    var body = {};
    if (newTitle.trim())    { body.title       = newTitle.trim(); }
    if (newDesc.trim())     { body.description = newDesc.trim(); }
    if (newCategory.trim()) { body.category    = newCategory.trim(); }

    /* Nothing changed — no point sending a request */
    if (Object.keys(body).length === 0) {
        alert('No changes were made.');
        return;
    }

    /* Send the update to the server */
    apiPut('/api/admin/listings/' + listingId + '/edit', body)
        .then(function(data) {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('Listing updated successfully.');
                loadAllListings();    /* reload to show changes */
            }
        });
}


/* ----------------------------------------------------------
   adminDeleteListing(listingId, fromPending)
   Permanently deletes a listing.
   fromPending: true if called from the pending list
   ---------------------------------------------------------- */
function adminDeleteListing(listingId, fromPending) {
    if (!confirm('Permanently delete this listing? This cannot be undone.')) {
        return;
    }

    apiDelete('/api/admin/listings/' + listingId)
        .then(function(data) {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('Listing deleted.');
                loadStats();
                if (fromPending) {
                    loadPendingListings();
                }
                loadAllListings();
            }
        });
}


/* ----------------------------------------------------------
   escapeHtml — safety function
   ---------------------------------------------------------- */
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}


/* ----------------------------------------------------------
   Run all load functions when the page opens
   ---------------------------------------------------------- */
loadStats();
loadPendingListings();
loadAllListings();
loadUsers();
