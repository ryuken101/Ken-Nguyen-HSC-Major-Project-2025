// Theme Changer 
document.addEventListener('DOMContentLoaded', function() {

    const savedTheme = localStorage.getItem("theme") || "light";
    
    document.documentElement.setAttribute("theme", savedTheme);

    const purpleToggle = document.querySelector('.purple-toggle');
    const blueToggle = document.querySelector('.default-toggle');
    const greenToggle = document.querySelector('.green-toggle');

    if(purpleToggle) {
        purpleToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute("theme") === "purple" ? "light" : "purple";
            document.documentElement.setAttribute("theme", newTheme);
            localStorage.setItem("theme", newTheme);

        });
    }

    if(blueToggle) {
        blueToggle.addEventListener('click', ()=> {
            const newTheme = document.documentElement.getAttribute("theme") === "light";
            document.documentElement.setAttribute("theme", newTheme);
            localStorage.setItem('theme', newTheme);
        })
    }

    if(greenToggle) {
        greenToggle.addEventListener('click', ()=> {
            const newTheme = document.documentElement.getAttribute("theme") === "green" ? "light": "green";
            document.documentElement.setAttribute("theme", newTheme);
            localStorage.setItem('theme', newTheme);
        })
    }

})