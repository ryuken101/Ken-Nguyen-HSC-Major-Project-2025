// Theme Changer 
document.addEventListener('DOMContentLoaded', function() {

    const savedTheme = localStorage.getItem("theme") || "light";
    
    document.documentElement.setAttribute("theme", savedTheme);

    const purpleToggle = document.querySelector('.purple-toggle');
    const blueToggle = document.querySelector('.default-toggle');
    const greenToggle = document.querySelector('.green-toggle');
    const pinkToggle = document.querySelector('.pink-toggle');
    const amberToggle = document.querySelector('.amber-toggle');


    colorChange(purpleToggle, "purple");
    colorChange(blueToggle, "light");
    colorChange(greenToggle, "green");
    colorChange(pinkToggle, "pink");
    colorChange(amberToggle, "amber");

})

function colorChange(button, color) {
    button.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute("theme") === color ? "light" : color;
        document.documentElement.setAttribute("theme", newTheme);
        localStorage.setItem('theme', newTheme);
    })
}