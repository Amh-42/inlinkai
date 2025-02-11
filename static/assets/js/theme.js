document.addEventListener("DOMContentLoaded", function () {
    // On page load, check if a theme has been saved in localStorage
    var savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        // Remove any previously applied theme classes
        document.body.classList.forEach(function (cls) {
            if (cls.startsWith('bg-theme')) {
                document.body.classList.remove(cls);
            }
        });
        // Apply the saved theme
        document.body.classList.add(savedTheme);
    }

    // Add a click event listener to all theme list items
    document.querySelectorAll('.switcher li').forEach(function (item) {
        item.addEventListener('click', function () {
            var theme = this.id;
            // Remove any currently applied theme classes
            document.body.classList.forEach(function (cls) {
                if (cls.startsWith('bg-theme')) {
                    document.body.classList.remove(cls);
                }
            });
            // Add the new theme class to the body
            document.body.classList.add(theme);
            // Save the selected theme in localStorage
            localStorage.setItem('selectedTheme', theme);
        });
    });
}); 