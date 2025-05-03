document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logout-btn');
  const userMenuButton = document.getElementById('user-menu-button');
  const userMenu = document.getElementById('user-menu');

  // Toggle user menu
  if (userMenuButton && userMenu) {
      userMenuButton.addEventListener('click', function(e) {
          e.stopPropagation();
          const isExpanded = this.getAttribute('aria-expanded') === 'true';
          this.setAttribute('aria-expanded', !isExpanded);
          userMenu.classList.toggle('hidden');
      });
  }

  // Handle logout
  if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
          e.preventDefault();
          
          if (confirm('Are you sure you want to sign out?')) {
              // Add loading state
              logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Signing out...';
              
              // Clear auth data
              localStorage.removeItem('userEmail');
              localStorage.removeItem('userLoggedIn');
              
              // Redirect after delay
              setTimeout(() => {
                  window.location.href = 'index.html';
              }, 500);
          }
      });
  }

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
      if (userMenu && !userMenu.contains(e.target) && 
          userMenuButton && !userMenuButton.contains(e.target)) {
          userMenu.classList.add('hidden');
          userMenuButton.setAttribute('aria-expanded', 'false');
      }
  });

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && userMenu && !userMenu.classList.contains('hidden')) {
          userMenu.classList.add('hidden');
          userMenuButton.setAttribute('aria-expanded', 'false');
      }
  });
});