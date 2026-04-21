/*
   js/profile.js
   Handles the My Profile page:
   - Loading the user's profile data
   - Saving profile changes
   - Loading their listings with status controls
   - Loading the listings they expressed interest in

   NOTE: Requires js/config.js and js/auth.js to be loaded first.
*/


/* Redirect to login if not logged in */
requireLogin();
showAdminLink();


/* Get the current user from localStorage */
var currentUser = getUser();


/*
   loadProfile()
   Fetches the user's profile from the server and fills
   in their name, email, bio, and skills on the page.
*/
function loadProfile() {
    apiGet('/api/users/' + currentUser.id)
        .then(function(data) {

            /* Fill in the avatar letter (first letter of name) */
            document.getElementById('profile-avatar').textContent =
                data.full_name ? data.full_name.charAt(0).toUpperCase() : '?';

            /* Display name and email */
            document.getElementById('profile-name').textContent  = data.full_name;
            document.getElementById('profile-email').textContent = data.email;

            /* Show the user's role with a badge */
            var roleEl = document.getElementById('profile-role');
            roleEl.textContent = data.role;
            roleEl.className = 'badge badge-' + (data.role === 'admin' ? 'flagged' : 'available');

            /* Fill in the edit form with current values */
            document.getElementById('edit-name').value           = data.full_name     || '';
            document.getElementById('edit-skills-offered').value = data.skills_offered || '';
            document.getElementById('edit-skills-needed').value  = data.skills_needed  || '';
            document.getElementById('edit-bio').value            = data.bio            || '';
        })
        .catch(function(err) {
            document.getElementById('save-error').textContent = 'Could not load profile data.';
            document.getElementById('save-error').classList.remove('hidden');
        });
}


/*
   saveProfile()
   Reads the form values and sends them to the server
   to update the user's profile.
*/
function saveProfile() {
    var body = {
        full_name:      document.getElementById('edit-name').value,
        skills_offered: document.getElementById('edit-skills-offered').value,
        skills_needed:  document.getElementById('edit-skills-needed').value,
        bio:            document.getElementById('edit-bio').value
    };

    /* Send PUT request to update the profile */
    apiPut('/api/users/' + currentUser.id, body)
        .then(function(data) {
            if (data.error) {
                /* Show error message */
                var errEl = document.getElementById('save-error');
                errEl.textContent = data.error;
                errEl.classList.remove('hidden');
                setTimeout(function() { errEl.classList.add('hidden'); }, 4000);
            } else {
                /* Show success message for 3 seconds */
                var sucEl = document.getElementById('save-success');
                sucEl.classList.remove('hidden');
                setTimeout(function() { sucEl.classList.add('hidden'); }, 3000);

                /* Update the name in localStorage so the navbar shows correct info */
                currentUser.full_name = data.full_name;
                localStorage.setItem('user', JSON.stringify(currentUser));

                /* Refresh the profile card */
                loadProfile();
            }
        });
}


/*
   loadMyListings()
   Fetches and displays listings posted by this user.
   Shows status controls and a delete button.
*/
function loadMyListings() {
    apiGet('/api/listings/mine')
        .then(function(listings) {
            var container = document.getElementById('my-listings');

            if (listings.length === 0) {
                container.innerHTML = '<p style="color:#666; font-size:13px;">You have not posted any listings yet.</p>';
                return;
            }

            /* Build a simple HTML list for each listing */
            var html = '<table>';
            html += '<tr><th>Title</th><th>Category</th><th>Status</th><th>Approved?</th><th>Actions</th></tr>';

            for (var i = 0; i < listings.length; i++) {
                var l = listings[i];
                html += '<tr>';
                html += '  <td>' + escapeHtml(l.title) + '</td>';
                html += '  <td><span class="badge badge-' + l.category + '">' + l.category + '</span></td>';

                /* Status dropdown — lets the user change their listing's status */
                html += '  <td>';
                html += '    <select onchange="updateStatus(' + l.id + ', this.value)" style="padding:3px 6px; font-size:12px;">';
                html += '      <option value="available"' + (l.status === 'available' ? ' selected' : '') + '>Available</option>';
                html += '      <option value="swapped"'   + (l.status === 'swapped'   ? ' selected' : '') + '>Swapped</option>';
                html += '      <option value="sold"'      + (l.status === 'sold'       ? ' selected' : '') + '>Sold</option>';
                html += '    </select>';
                html += '  </td>';

                /* Show whether the listing is approved by admin */
                html += '  <td>';
                html += l.is_approved
                    ? '<span class="badge badge-available">Approved</span>'
                    : '<span class="badge badge-pending">Pending</span>';
                html += '  </td>';

                /* Delete button */
                html += '  <td><button class="btn btn-danger" onclick="deleteListing(' + l.id + ')">Delete</button></td>';
                html += '</tr>';
            }

            html += '</table>';
            container.innerHTML = html;
        });
}


/*
   updateStatus(listingId, newStatus)
   Called when the user changes the status dropdown.
   Sends a PUT request to update the listing's status.
*/
function updateStatus(listingId, newStatus) {
    apiPut('/api/listings/' + listingId + '/status', { status: newStatus })
        .then(function(data) {
            if (data.error) {
                alert('Error: ' + data.error);
                loadMyListings();  /* reload to reset the dropdown */
            }
        });
}


/*
   deleteListing(listingId)
   Asks for confirmation then deletes the listing.
*/
function deleteListing(listingId) {
    /* confirm() shows a browser dialog with OK / Cancel */
    if (!confirm('Are you sure you want to delete this listing?')) {
        return;  /* user clicked Cancel */
    }

    apiDelete('/api/listings/' + listingId)
        .then(function(data) {
            alert('Listing deleted.');
            loadMyListings();  /* reload the list after deleting */
        });
}


/*
   loadMyInteractions()
   Shows a list of listings the current user clicked "Interested" on.
*/
function loadMyInteractions() {
    apiGet('/api/interactions/mine')
        .then(function(interactions) {
            var container = document.getElementById('my-interactions');

            if (interactions.length === 0) {
                container.innerHTML = '<p style="color:#666; font-size:13px;">You have not expressed interest in any listings yet.</p>';
                return;
            }

            var html = '<table>';
            html += '<tr><th>Listing</th><th>Status</th><th>Date</th></tr>';

            for (var i = 0; i < interactions.length; i++) {
                var item = interactions[i];
                var date = new Date(item.created_at).toLocaleDateString();

                html += '<tr>';
                html += '  <td>' + escapeHtml(item.listing_title) + '</td>';
                html += '  <td><span class="badge badge-' + item.listing_status + '">' + item.listing_status + '</span></td>';
                html += '  <td>' + date + '</td>';
                html += '</tr>';
            }

            html += '</table>';
            container.innerHTML = html;
        });
}


/*
   escapeHtml — safety function (same as in dashboard.js)
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
   Run all load functions when page opens
*/
loadProfile();
loadMyListings();
loadMyInteractions();
