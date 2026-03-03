document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                alert("Account Created! Redirecting to Login...");
                window.location.href = "Login.html";
            } else {
                alert(data.message); //For checking if uh email taken
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Registration failed. Is the server running?");
        }
    });