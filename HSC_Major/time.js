function updateClock() {
    const now = new Date();
    
    // Time elements
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // Date elements
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = dayNames[now.getDay()];
    const month = monthNames[now.getMonth()];
    const dayNum = now.getDate();
    const year = now.getFullYear();
    
 
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
    document.getElementById('ampm').textContent = ampm;
    
    document.getElementById('dayname').textContent = dayName;
    document.getElementById('month').textContent = month;
    document.getElementById('daynum').textContent = dayNum;
    document.getElementById('year').textContent = year;

    
    // Call this function again in 1 second
    setTimeout(updateClock, 1000);
}


// Initial call
updateClock();