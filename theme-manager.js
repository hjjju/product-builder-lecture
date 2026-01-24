document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    // Text content will be set by language-manager.js

    const topRightControls = document.querySelector('.top-right-controls');
    if (topRightControls) {
        topRightControls.appendChild(themeToggle);
    } else {
        // Fallback if .top-right-controls is not found
        document.body.appendChild(themeToggle);
    }

    const body = document.body;

    // Set initial theme based on local storage or default to light
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
});
