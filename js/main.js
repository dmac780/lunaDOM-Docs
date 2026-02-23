// Scroll active item into view in sidebar (desktop only, smooth)
function scrollActiveIntoView() {
  const activeLink = document.querySelector('.sidebar-nav a.active');
  if (activeLink) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      // Wait for layout to fully settle (fonts, web components, etc.)
      setTimeout(() => {
        requestAnimationFrame(() => {
          const linkTop = activeLink.offsetTop;
          const sidebarHeight = sidebar.clientHeight;
          const linkHeight = activeLink.offsetHeight;
          
          // Center the active link in the sidebar with smooth scroll
          const scrollTo = linkTop - (sidebarHeight / 2) + (linkHeight / 2);
          sidebar.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
          });
        });
      }, 100); // Let everything settle before scrolling
    }
  }
}

// Scroll on page load (desktop only - mobile uses drawer)
window.addEventListener('load', scrollActiveIntoView);

// Hamburger → open nav drawer
const navToggle = document.getElementById('navToggle');
const navDrawer = document.getElementById('navDrawer');
if (navToggle && navDrawer) {
  navToggle.addEventListener('click', () => {
    navDrawer.show();
    
    // Also scroll to active item in drawer when opened
    setTimeout(() => {
      const drawerActive = navDrawer.querySelector('.sidebar-nav a.active');
      if (drawerActive) {
        const drawerBody = navDrawer.shadowRoot.querySelector('main');
        if (drawerBody) {
          const linkTop = drawerActive.offsetTop;
          const bodyHeight = drawerBody.clientHeight;
          const linkHeight = drawerActive.offsetHeight;
          const scrollTo = linkTop - (bodyHeight / 2) + (linkHeight / 2);
          drawerBody.scrollTop = scrollTo;
        }
      }
    }, 100); // Wait for drawer animation
  });
}
