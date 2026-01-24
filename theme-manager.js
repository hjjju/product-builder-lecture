document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.textContent = 'Toggle Theme';

    // Find the main-container to append the button to
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
        mainContainer.appendChild(themeToggle);
    } else {
        // Fallback if main-container is not found (e.g., for very simple pages)
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
