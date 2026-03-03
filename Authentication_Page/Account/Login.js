document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
         
            localStorage.setItem("user", JSON.stringify(data.user)); 
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('role', data.user.role);
            localStorage.setItem('userId', data.user.id);   
            localStorage.setItem('email', data.user.email);
            
            alert(`Successful Login! Welcome ${data.user.username}!`);

          
            window.location.href = "Dashboard.html"; 

        } else {
            alert(data.message || "Invalid Username or Password");
        }

    } catch (error) {
        console.error('Login Error:', error);
        alert("Server is offline. Please try again later.");
    }
});