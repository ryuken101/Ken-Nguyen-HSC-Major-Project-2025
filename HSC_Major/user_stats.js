const chart = document.getElementById('user_stats');

new Chart(chart, {
    type: 'radar',
    data: {
        labels: ['Study', 'Physical Health', 'Sleep', 'Mental Health', 'Leisure'],
        datasets: [{
            label: 'Value',
            data: [15, 13, 14, 15, 14,], 
            borderWidth: 1

        }]
    }
})