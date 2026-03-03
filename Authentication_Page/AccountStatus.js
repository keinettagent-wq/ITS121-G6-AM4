document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    
    const authTab = document.getElementById('user-auth-tab');
    const authLink = authTab ? authTab.querySelector('a') : null;
    const navUsername = document.getElementById('nav-username');

    if (loggedInUser && authLink) {
        // --- RESTORED LOGIC ---
        if (navUsername) {
            navUsername.innerText = loggedInUser;
            navUsername.style.display = 'inline';
        }

        // Send to Dashboard if logged in
        authLink.href = "../Authentication_Page/Dashboard.html";

        // --- ADMIN VIEW INJECTION ---
        if (role === 'admin' && !document.getElementById('admin-view-link')) {
            const adminLi = document.createElement('li');
            adminLi.className = 'nav-item';
            adminLi.id = 'admin-view-link';
            adminLi.innerHTML = `
                <a class="nav-link" href="../Admin_Page/AdminPanel.html">
                    Admin Panel
                </a>
            `;
            // Insert before the user icon
            authTab.parentNode.insertBefore(adminLi, authTab);
        }
    } else if (authLink) {
        // Guest Mode
        authLink.href = "../Authentication_Page/Login.html";
        if (navUsername) navUsername.style.display = 'none';
    }
});