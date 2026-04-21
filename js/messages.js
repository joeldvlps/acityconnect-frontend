/* ============================================================
   js/messages.js
   Handles the Notifications & Messages page:
   - Loading notifications (interest alerts)
   - Marking notifications as read
   - Loading received messages
   - Sending a new message
/* Redirect to login if not logged in */
requireLogin();
showAdminLink();


/* ----------------------------------------------------------
   loadNotifications()
   Fetches all notifications for the logged-in user.
   Shows them in a list. Unread ones are highlighted.
   ---------------------------------------------------------- */
function loadNotifications() {
    apiGet('/api/notifications')
        .then(function(notifications) {
            var container  = document.getElementById('notifications-list');
            var countLabel = document.getElementById('unread-count');

            if (notifications.length === 0) {
                container.innerHTML = '<p style="color:#666; font-size:13px;">You have no notifications yet.</p>';
                countLabel.textContent = '';
                return;
            }

            /* Count how many are unread */
            var unreadCount = 0;
            for (var i = 0; i < notifications.length; i++) {
                if (!notifications[i].is_read) {
                    unreadCount++;
                }
            }

            countLabel.textContent = unreadCount + ' unread notification(s).';

            /* Build HTML for each notification */
            var html = '';
            for (var j = 0; j < notifications.length; j++) {
                var notif = notifications[j];
                var date  = new Date(notif.created_at).toLocaleString();  /* date + time */

                /* Add the 'unread' class for blue highlighting */
                var cssClass = notif.is_read ? 'msg-item' : 'msg-item unread';

                html += '<div class="' + cssClass + '">';
                html += '  <span>' + escapeHtml(notif.message) + '</span>';

                /* Only show "Mark as Read" button if it hasn't been read yet */
                if (!notif.is_read) {
                    html += '  <button class="btn btn-success" style="margin-left:10px; font-size:12px;" onclick="markRead(' + notif.id + ')">Mark as Read</button>';
                }

                html += '  <div class="msg-date">' + date + '</div>';
                html += '</div>';
            }

            container.innerHTML = html;
        })
        .catch(function(err) {
            document.getElementById('notifications-list').innerHTML =
                '<p style="color:#cc0000;">Could not load notifications.</p>';
        });
}


/* ----------------------------------------------------------
   markRead(notifId)
   Marks a single notification as read, then reloads the list.
   ---------------------------------------------------------- */
function markRead(notifId) {
    apiPut('/api/notifications/' + notifId + '/read', {})
        .then(function() {
            loadNotifications();  /* reload to update the display */
        });
}


/* ----------------------------------------------------------
   loadMessages()
   Fetches all direct messages received by the logged-in user.
   ---------------------------------------------------------- */
function loadMessages() {
    apiGet('/api/messages')
        .then(function(messages) {
            var container = document.getElementById('messages-list');

            if (messages.length === 0) {
                container.innerHTML = '<p style="color:#666; font-size:13px;">You have no messages yet.</p>';
                return;
            }

            /* Build a table of messages */
            var html = '<table>';
            html += '<tr><th>From</th><th>Message</th><th>Date</th></tr>';

            for (var i = 0; i < messages.length; i++) {
                var msg  = messages[i];
                var date = new Date(msg.created_at).toLocaleString();

                html += '<tr>';
                html += '  <td>' + escapeHtml(msg.sender_name) + '</td>';
                html += '  <td>' + escapeHtml(msg.body) + '</td>';
                html += '  <td style="font-size:12px; white-space:nowrap;">' + date + '</td>';
                html += '</tr>';
            }

            html += '</table>';
            container.innerHTML = html;
        })
        .catch(function(err) {
            document.getElementById('messages-list').innerHTML =
                '<p style="color:#cc0000;">Could not load messages.</p>';
        });
}


/* ----------------------------------------------------------
   sendMessage()
   Reads the form inputs and sends a direct message.
   ---------------------------------------------------------- */
function sendMessage() {
    var toUserId = document.getElementById('to-user-id').value;
    var body     = document.getElementById('msg-body').value.trim();

    var sendError   = document.getElementById('send-error');
    var sendSuccess = document.getElementById('send-success');

    /* Hide old messages */
    sendError.classList.add('hidden');
    sendSuccess.classList.add('hidden');

    /* Validate fields */
    if (!toUserId || !body) {
        sendError.textContent = 'Please enter a User ID and a message.';
        sendError.classList.remove('hidden');
        return;
    }

    /* Send POST request */
    apiPost('/api/messages', { to_user_id: parseInt(toUserId), body: body })
        .then(function(data) {
            if (data.error) {
                sendError.textContent = data.error;
                sendError.classList.remove('hidden');
            } else {
                /* Clear form and show success */
                document.getElementById('to-user-id').value = '';
                document.getElementById('msg-body').value   = '';
                sendSuccess.classList.remove('hidden');
                setTimeout(function() { sendSuccess.classList.add('hidden'); }, 3000);
            }
        })
        .catch(function(err) {
            sendError.textContent = 'Something went wrong. Please try again.';
            sendError.classList.remove('hidden');
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
   Load everything when the page opens
   ---------------------------------------------------------- */
loadNotifications();
loadMessages();
