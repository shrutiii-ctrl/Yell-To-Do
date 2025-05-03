document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Check auth state on load
    checkAuth();
    
    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            // Simulate login
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userLoggedIn', 'true');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        });
    }
    
    // Auth state checker
    function checkAuth() {
        const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        const isLoginPage = window.location.pathname.endsWith('index.html');
        
        if (isLoggedIn && isLoginPage) {
            window.location.href = 'dashboard.html';
        }
        
        if (!isLoggedIn && !isLoginPage) {
            window.location.href = 'index.html';
        }
    }
});