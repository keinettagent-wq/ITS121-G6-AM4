// Modal
function openChangePassModal() {
    const overlay = document.getElementById('pass-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        // Prevent background scrolling while modal is open
        document.body.style.overflow = 'hidden';
    }
}

function closePassModal() {
    const overlay = document.getElementById('pass-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        // Restore scrolling
        document.body.style.overflow = 'auto';
    }
}

// Optional: Close modal if user clicks the dark background
window.onclick = function(event) {
    const overlay = document.getElementById('pass-overlay');
    if (event.target == overlay) {
        closePassModal();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the main user object and parse it
    const userData = JSON.parse(localStorage.getItem('user'));

    // If no user is found, redirect to login
    if (!userData) {
        window.location.href = "../Authentication_Page/Login.html";
        return;
    }

    // 2. Extract values from the object
    const username = userData.username || "Guest";
    const userId = userData.id || "000";
    const email = userData.email || "Unknown";
    const role = userData.role || "customer";
    const password = userData.password || ""; 

    // 3. Map values to your HTML elements
    document.getElementById('display-username').textContent = username;
    document.getElementById('user-id').textContent = `#${userId}`;
    document.getElementById('user-email').textContent = email;
    document.getElementById('display-role').textContent = role.charAt(0).toUpperCase() + role.slice(1);
    

    const roleBadge = document.getElementById('user-role');
    if (roleBadge) {
        roleBadge.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    }
    // 4. Setup Password Field
    const passInput = document.getElementById('user-pass');
    passInput.value = password; 
    
    // Ensure it starts as masked (bullets)
    passInput.setAttribute('type', 'password');

    // 5. Visibility Toggle Logic
    const toggleBtn = document.getElementById('togglePass');
    if (toggleBtn) {
        toggleBtn.style.opacity = "0.4"; // Start faded because it's hidden
    }

    toggleBtn.addEventListener('click', function() {
        const isHidden = passInput.getAttribute('type') === 'password';
        
        if (isHidden) {
            passInput.setAttribute('type', 'text');
            this.style.opacity = "1"; // Bright when showing password
        } else {
            passInput.setAttribute('type', 'password');
            this.style.opacity = "0.4"; // Faded when showing bullets
        }
    });

    // Logout Function
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = "../Main_Page/index.html";
    });

    // Password change
    const changePassForm = document.getElementById('changePassForm');
    if (changePassForm) {
        changePassForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentPass = document.getElementById('currentPass').value;
            const newPass = document.getElementById('newPass').value;
            const confirmNewPass = document.getElementById('confirmNewPass').value;

            if (newPass !== confirmNewPass) {
                alert("New passwords do not match!");
                return;
            }

            if (currentPass === newPass) {
                alert("New password cannot be the same as the current one!");
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: username, 
                        currentPassword: currentPass,
                        newPassword: newPass
                    })
                });

                const data = await response.json();

                if (data.success) {
                    alert("Password updated successfully!");
                    
                    const userData = JSON.parse(localStorage.getItem('user'));
                    userData.password = newPass; 
                    localStorage.setItem('user', JSON.stringify(userData)); 
                    
                    closePassModal(); 
                    location.reload();
                } else {
                    alert(data.message || "Failed to update password.");
                }
            } catch (error) {
                console.error("Error updating password:", error);
                alert("Server error. Try again later.");
            }
        });
    }
});