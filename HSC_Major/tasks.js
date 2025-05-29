import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
        import { 
            getFirestore, 
            collection, 
            doc, 
            setDoc, 
            getDoc, 
            updateDoc, 
            deleteDoc, 
            onSnapshot 
        } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



        const firebaseConfig = {
            apiKey: "AIzaSyAUU2wXBEWT8c-6pOS2iyEjvgQlGzmolRo",
            authDomain: "purrsue-login.firebaseapp.com",
            projectId: "purrsue-login",
            storageBucket: "purrsue-login.appspot.com",
            messagingSenderId: "329901830629",
            appId: "1:329901830629:web:ba907e54131d88ea21bf0c"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        window.firebaseAuth = auth;
        window.firebaseDb = db;
        window.firebaseFunctions = {
            collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, onAuthStateChanged
        };
      
        
        document.addEventListener('DOMContentLoaded', function() {
        // Calendar elements
        const currentMonthYear = document.getElementById('current-month-year');
        const calendarDays = document.getElementById('calendar-days');
        const prevMonthBtn = document.getElementById('prev-month');
        const nextMonthBtn = document.getElementById('next-month');
        const monthYearInput = document.getElementById('month-year-input');
        const goToDateBtn = document.getElementById('go-to-date');
        const goToTodayBtn = document.getElementById('go-to-today');

        // Event elements
        const addEventBtn = document.getElementById('add-event-btn');
        const eventForm = document.getElementById('event-form');
        const saveEventBtn = document.getElementById('save-event-btn');
        const draggableEvents = document.getElementById('draggable-events');
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notification-message');
        const closeNotification = document.getElementById('close-notification');

        // Current date
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();
        let events = [];
        let activeEvent = null;
        let currentUserId = null;
        let stats = [];

       //Level Up System 
        let level = 1;
        let xp = 0;
        const xp_max = 10;
        const currentLevel = document.getElementById('level');
        const currentXp = document.getElementById('xp'); 

        // Firebase setup
        const auth = window.firebaseAuth;
        const db = window.firebaseDb;
        const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, onAuthStateChanged } = window.firebaseFunctions;

        // Months array
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // Check authentication state
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUserId = user.uid;
                loadUserEvents();
                setupRealTimeUpdates();
                await loadUserStats();
                setTimeout(checkForOverdueTasks, 1000);
            } else {
                window.location.href = 'index.html';
            }
        });

        // Load events from Firebase
        async function loadUserEvents() {
            if (!currentUserId) return;
            
            const userEventsRef = doc(db, "users", currentUserId, "data", "events");
            
            try {
                const docSnap = await getDoc(userEventsRef);
                if (docSnap.exists()) {
                    events = docSnap.data().events || [];
                    renderCalendar();
                    renderDraggableEvents();
                    checkEventNotifications();
                } else {
                    await setDoc(userEventsRef, { events: [] });
                    events = [];
                    renderCalendar();
                    renderDraggableEvents();
                }
            } catch (error) {
                console.error("Error loading events:", error);
                showNotification("Error loading your events. Please try again.");
            }
        }

        // Set up real-time updates
        function setupRealTimeUpdates() {
            if (!currentUserId) return;
            
            const userEventsRef = doc(db, "users", currentUserId, "data", "events");
            
            onSnapshot(userEventsRef, (doc) => {
                if (doc.exists()) {
                    events = doc.data().events || [];
                    renderCalendar();
                    renderDraggableEvents();
                    
                    // Refresh modal if open
                    const modal = document.getElementById('event-details-modal');
                    if (modal.style.display === 'flex') {
                        const activeDate = document.querySelector('.day.active')?.dataset.date;
                        if (activeDate) showEventDetails(activeDate);
                    }
                }
            });
        }

    
        // Save events to Firebase
        async function saveEvents() {
            if (!currentUserId) return;
            
            const userEventsRef = doc(db, "users", currentUserId, "data", "events");
            
            try {
                await setDoc(userEventsRef, { events }, { merge: true });
            } catch (error) {
                console.error("Error saving events:", error);
                showNotification("Error saving your events. Please try again.");
                // Revert changes if save fails
                await loadUserEvents();
            }
        }


        // Initialize calendar
        function renderCalendar() {
            calendarDays.innerHTML = '';
            currentMonthYear.textContent = `${months[currentMonth]} ${currentYear}`;

            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

            // Previous month days
            for (let i = firstDay; i > 0; i--) {
                const dayElement = document.createElement('div');
                dayElement.className = 'day prev-date';
                dayElement.textContent = daysInPrevMonth - i + 1;
                calendarDays.appendChild(dayElement);
            }

            // Current month days
            for (let i = 1; i <= daysInMonth; i++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'day';
                dayElement.textContent = i;
                dayElement.dataset.date = `${currentYear}-${currentMonth+1}-${i}`;

                // Highlight today
                if (i === currentDate.getDate() && 
                    currentMonth === currentDate.getMonth() && 
                    currentYear === currentDate.getFullYear()) {
                    dayElement.classList.add('today');
                }

                // Add existing events
                const dateStr = `${currentYear}-${currentMonth+1}-${i}`;
                const dayEvents = events.filter(e => e.date === dateStr);
                
                if (dayEvents.length > 0) {
                    dayElement.classList.add('has-event');
                    dayElement.title = `${dayEvents.length} event(s) scheduled`;
                }

                // Click handler for date selection
                dayElement.addEventListener('click', function() {
                    document.querySelectorAll('.day').forEach(d => {
                        d.classList.remove('active');
                    });
                    this.classList.add('active');
                    if (this.dataset.date) {
                        showEventDetails(this.dataset.date);
                    }
                });

                // Drag-and-drop handlers
                dayElement.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dayElement.classList.add('drag-over');
                });

                dayElement.addEventListener('dragleave', () => {
                    dayElement.classList.remove('drag-over');
                });

                dayElement.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    dayElement.classList.remove('drag-over');
                    
                    if (activeEvent) {
                        const eventId = activeEvent.dataset.eventId;
                        const eventIndex = events.findIndex(e => e.id == eventId);
                        
                        if (eventIndex !== -1) {
                            // Update the event with the scheduled date
                            events[eventIndex].date = dayElement.dataset.date;
                            events[eventIndex].isScheduled = true; // Add this flag
                            
                            try {
                                await saveEvents();
                                checkEventNotifications();
                                renderCalendar();
                                renderDraggableEvents(); // This will now filter out scheduled tasks
                                dayElement.click();
                                showNotification(`Event scheduled for ${formatDateForDisplay(dayElement.dataset.date)}`);
                            } catch (error) {
                                console.error("Error updating event:", error);
                                showNotification("Error scheduling event. Please try again.");
                            }
                        }
                    }
                });

                calendarDays.appendChild(dayElement);
            }

            // Next month days
            const totalDays = firstDay + daysInMonth;
            const daysFromNextMonth = totalDays <= 35 ? 35 - totalDays : 42 - totalDays;

            for (let i = 1; i <= daysFromNextMonth; i++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'day next-date';
                dayElement.textContent = i;
                calendarDays.appendChild(dayElement);
            }
        }

        

        // Helper function to format dates for display
        function formatDateForDisplay(dateStr) {
            const [year, month, day] = dateStr.split('-');
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
            });
        }

        // Show event details modal
        function showEventDetails(dateStr) {
            console.log("Showing event details for:", dateStr);
            const modal = document.getElementById('event-details-modal');
            const modalContent = document.getElementById('event-details-content');
            const modalTitle = document.getElementById('modal-date-title');
            
            const [year, month, day] = dateStr.split('-');
            const dateObj = new Date(year, month - 1, day);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            });
            
            modalTitle.textContent = `Events for ${formattedDate}`;
            
            const dayEvents = events.filter(e => e.date === dateStr);
            console.log("Found events for this date:", dayEvents);
            
            if (dayEvents.length === 0) {
                modalContent.innerHTML = '<p>No events scheduled for this date</p>';
            } else {
                modalContent.innerHTML = dayEvents.map(event => {
                    return `
                    <div class="event-detail ${event.type}" data-event-id="${event.id}">
                        <h3>${event.title}</h3>
                        <p>${event.description || 'No description'}</p>
                        <div class="event-meta">
                            <span class="event-type-tag">${event.type}</span>
                            <span style="color: var(--blue)">Created: ${new Date(event.createdAt).toLocaleString()}</span>
                        </div>
                        <div class="event-actions">
                            <button id="complete-${event.id}" class="complete-event" data-id="${event.id}">
                                <i class='bx bx-check-circle'></i> Complete
                            </button>
                            <button class="delete-event" data-id="${event.id}">
                                <i class='bx bx-trash'></i> Delete
                            </button>
                        </div>
                    </div>
                    `;
                }).join('');

                
                document.querySelectorAll('.delete-event').forEach(btn => {
                    btn.addEventListener('click', async function(e) {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this task?')) {
                            const eventId = parseInt(this.dataset.id);
                            events = events.filter(e => e.id !== eventId);
                            try {
                                await saveEvents();
                                renderCalendar();
                                showEventDetails(dateStr); // Refresh the modal
                                renderDraggableEvents();
                                showNotification('Task deleted successfully');
                            } catch (error) {
                                console.error("Error deleting event:", error);
                                showNotification("Error deleting event. Please try again.");
                            }
                        }
                    });
                });

                // Add event listeners to all complete buttons
                dayEvents.forEach(event => {
                    const completeBtn = document.getElementById(`complete-${event.id}`);
                    if (completeBtn) {
                        completeBtn.addEventListener('click', async function(e) {
                            e.stopPropagation();
                            console.log(`Complete button clicked for event ${event.id}`);
                            
                            try {
                                // Update stats
                                await updateUserStats(event.type);
                                console.log("Stats updated for type:", event.type);
                                
                                // Remove the completed event
                                events = events.filter(e => e.id !== event.id);
                                await saveEvents();
                                console.log("Event removed and saved");
                                
                                // Update UI
                                renderCalendar();
                                showEventDetails(dateStr);
                                renderDraggableEvents();
                            } catch (error) {
                                console.error("Error completing event:", error);
                                showNotification("Error completing event. Please try again.");
                            }
                        });
                    } else {
                        console.error(`Complete button not found for event ${event.id}`);
                    }
                });
            }
            
            modal.style.display = 'flex';
        }


        // Event form toggle
        addEventBtn.addEventListener('click', () => {
            eventForm.style.display = eventForm.style.display === 'none' ? 'block' : 'none';

        });

        // Function to initialize or update user stats
        async function updateUserStats(eventType) {
            if (!currentUserId) {
                console.error("No user ID found");
                throw new Error("User not authenticated");
            }
            
            const userStatsRef = doc(db, "users", currentUserId, "data", "stats");
            console.log("Updating stats for event type:", eventType);
            
            try {
                const docSnap = await getDoc(userStatsRef);
                let statsData = {
                    study: 0,
                    leisure: 0,
                    physical: 0,
                    mental: 0,
                    sleep: 0,
                    level: 1,
                    XP: 0,
                    lastUpdated: new Date().toISOString()
                };

                if (docSnap.exists()) {
                    console.log("Existing stats found:", docSnap.data());
                    statsData = {
                        ...statsData,
                        ...docSnap.data()
                    };
                }

                // Increment the specific stat
                if (statsData.hasOwnProperty(eventType)) {
                    statsData[eventType] += 1;
                    statsData.XP += 1;
                    if (statsData.XP >= xp_max) {
                        statsData.level += 1;
                        statsData.XP = 0;
                        alert(`Congratulations! You have leveled up! You're now level ${statsData.level}`);
                    }
                    statsData.lastUpdated = new Date().toISOString();
                    console.log("New stats value:", statsData);
                } else {
                    console.error("Invalid event type:", eventType);
                    throw new Error("Invalid event type");
                }

                await setDoc(userStatsRef, statsData);
                level = statsData.level;
                xp = statsData.XP;
                updateDisplay();
                showTaskCompleteNotification();
                console.log("Stats document successfully written");
                return true;
            } catch (error) {
                console.error("Error in updateUserStats:", error);
                throw error;
            }
        }

        function updateDisplay() {
            currentLevel.textContent = `Level: ${level}`;
            currentXp.textContent = `XP: ${xp} / 10`;
        }

        function showTaskCompleteNotification() {
            const notification = document.createElement('div');
            notification.className = 'task-complete-notification';
            notification.innerHTML = `
              <span class="material-symbols--check-circle"></span>
              <p>Task completed! +1 XP</p>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), 2000);
          }

        async function loadUserStats() {
            if (!currentUserId) return;
            
            const userStatsRef = doc(db, "users", currentUserId, "data", "stats");
            
            try {
                const docSnap = await getDoc(userStatsRef);
                if (docSnap.exists()) {
                    const statsData = docSnap.data();
                    level = statsData.level || 1;
                    xp = statsData.XP || 0;
                    updateDisplay();
                } else {
                    // Initialize stats if they don't exist
                    await setDoc(userStatsRef, {
                        level: 1,
                        XP: 0,
                        study: 0,
                        leisure: 0,
                        physical: 0,
                        mental: 0,
                        sleep: 0,
                        lastUpdated: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error("Error loading stats:", error);
            }
        }

        // Save new event
        saveEventBtn.addEventListener('click', async () => {
            const title = document.getElementById('event-title').value;
            const description = document.getElementById('event-description').value;
            const type = document.getElementById('event-type').value;

            if (!title) {
                alert('Please enter a title for your event');
                return;
            }

            const newEvent = {
                id: Date.now(),
                title,
                description,
                type,
                date: null,
                createdAt: new Date().toISOString()
            };

            events.push(newEvent);
            
            try {
                await saveEvents();
                renderDraggableEvents();
                document.getElementById('event-title').value = '';
                document.getElementById('event-description').value = '';
                document.getElementById('event-type').value = 'study';
                eventForm.style.display = 'none';
            } catch (error) {
                console.error("Error creating event:", error);
                showNotification("Error creating event. Please try again.");
            }
        });



        // Render draggable events
        function renderDraggableEvents() {
            draggableEvents.innerHTML = '';
            
            // Only show unscheduled tasks (no date and not marked as scheduled)
            const unscheduledEvents = events.filter(e => !e.date && !e.isScheduled);
            
            if (unscheduledEvents.length === 0) {
                draggableEvents.innerHTML = '<p style="color: var(--blue)">No scheduled tasks. Add some!</p>';
                return;
            }

            unscheduledEvents.forEach(event => {
                const eventElement = createEventElement(event, false);
                draggableEvents.appendChild(eventElement);
            });
        }

        function createEventElement(event, isScheduled) {
            const eventElement = document.createElement('div');
            eventElement.className = `draggable-event ${event.type}`;
            eventElement.dataset.eventId = event.id;
            
            if (!isScheduled) {
                eventElement.draggable = true;
            }
            
            eventElement.innerHTML = `
                <div class="event-header">
                    <span class="event-type-tag">${event.type}</span>
                    <div class="event-actions">
                        ${isScheduled ? `<button class="complete-event" data-id="${event.id}">
                            <span class="material-symbols--check-circle"></span>
                        </button>` : ''}
                        <button class="delete-event" data-id="${event.id}">
                            <span class="material-symbols--delete-rounded"></span>
                        </button>
                    </div>
                </div>
                <strong>${event.title}</strong>
                <p>${event.description || 'No description'}</p>
                ${isScheduled ? `<small>Scheduled for: ${formatDateForDisplay(event.date)}</small>` : ''}
            `;

            // Add event listener for delete button
            eventElement.querySelector('.delete-event').addEventListener('click', async function(e) {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this task?')) {
                    const eventId = parseInt(this.dataset.id);
                    events = events.filter(e => e.id !== eventId);
                    try {
                        await saveEvents();
                        renderDraggableEvents();
                        renderCalendar();
                        showNotification('Task deleted successfully');
                        
                        // If the modal is open, refresh it
                        const modal = document.getElementById('event-details-modal');
                        if (modal.style.display === 'flex') {
                            const activeDate = document.querySelector('.day.active')?.dataset.date;
                            if (activeDate) showEventDetails(activeDate);
                        }
                    } catch (error) {
                        console.error("Error deleting event:", error);
                        showNotification("Error deleting event. Please try again.");
                    }
                }
            });

            if (!isScheduled) {
                eventElement.addEventListener('dragstart', () => {
                    activeEvent = eventElement;
                    eventElement.classList.add('dragging');
                    eventElement.style.opacity = '1';
                });

                eventElement.addEventListener('dragend', () => {
                    eventElement.classList.remove('dragging');
                    eventElement.style.opacity = '1';
                    activeEvent = null;
                });
            }

            

            return eventElement;
        }

        // Check for event notifications
        function checkEventNotifications() {
            const todayStr = `${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${currentDate.getDate()}`;
            const todaysEvents = events.filter(e => e.date === todayStr);
            
            if (todaysEvents.length > 0) {
                showNotification(`You have ${todaysEvents.length} event(s) scheduled for today!`);
            }
        }

        // Show notification
        function showNotification(message) {
            notificationMessage.textContent = message;
            notification.style.display = 'flex';
        }

        // Close notification
        closeNotification.addEventListener('click', () => {
            notification.style.display = 'none';
        });

        // Navigation event listeners
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });

        goToDateBtn.addEventListener('click', () => {
            const input = monthYearInput.value.split('/');
            if (input.length === 2) {
                const month = parseInt(input[0]) - 1;
                const year = parseInt(input[1]);
                if (month >= 0 && month <= 11 && !isNaN(year)) {
                    currentMonth = month;
                    currentYear = year;
                    renderCalendar();
                    return;
                }
            }
            alert('Please enter a valid date in MM/YYYY format');
        });

        goToTodayBtn.addEventListener('click', () => {
            currentDate = new Date();
            currentMonth = currentDate.getMonth();
            currentYear = currentDate.getFullYear();
            renderCalendar();
        });

        // Modal close button
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('event-details-modal').style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('event-details-modal')) {
                document.getElementById('event-details-modal').style.display = 'none';
            }
        });


        function checkForOverdueTasks() {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for comparison
            
            const overdueTasks = events.filter(event => {
                if (!event.date) return false;
                
                const [year, month, day] = event.date.split('-');
                const taskDate = new Date(year, month - 1, day);
                taskDate.setHours(0, 0, 0, 0);
                
                return taskDate < today && !event.completed;
            });
            
            if (overdueTasks.length > 0) {
                showOverdueTasksModal(overdueTasks);
            }
        }

        // Add this function to show the overdue tasks modal
        function showOverdueTasksModal(overdueTasks) {
            const modal = document.createElement('div');
            modal.id = 'overdue-tasks-modal';
            modal.className = 'modal';
            modal.style.display = 'flex';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <h2><i class='bx bx-alarm-exclamation'></i> Overdue Tasks</h2>
                    <p>You have ${overdueTasks.length} task(s) that are overdue:</p>
                    
                    <div class="overdue-tasks-list">
                        ${overdueTasks.map(task => `
                            <div class="overdue-task ${task.type}" data-id="${task.id}">
                                <h3>${task.title}</h3>
                                <p>${task.description || 'No description'}</p>
                                <small>Scheduled for: ${formatDateForDisplay(task.date)}</small>
                                <div class="overdue-actions">
                                    <button class="complete-overdue" data-id="${task.id}">
                                        <i class='bx bx-check-circle'></i> Complete
                                    </button>
                                    <button class="delete-overdue" data-id="${task.id}">
                                        <i class='bx bx-trash'></i> Delete
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="modal-footer">
                        <button id="close-overdue-modal">OK, I'll handle them later</button>
                    </div>
                </div>
                <div class="modal-overlay"></div>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listeners
            document.querySelectorAll('.complete-overdue').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const taskId = parseInt(e.target.dataset.id);
                    const taskIndex = events.findIndex(e => e.id === taskId);
                    
                    if (taskIndex !== -1) {
                        try {
                            // Update stats
                            await updateUserStats(events[taskIndex].type);
                            
                            // Mark as completed
                            events[taskIndex].completed = true;
                            await saveEvents();
                            
                            // Refresh UI
                            renderCalendar();
                            renderDraggableEvents();
                            showNotification('Task marked as completed');
                            
                            // Close modal if no more overdue tasks
                            const remainingOverdue = events.filter(e => 
                                !e.completed && 
                                new Date(e.date.split('-').join('-')) < new Date()
                            );
                            
                            if (remainingOverdue.length === 0) {
                                modal.remove();
                            } else {
                                // Refresh modal
                                showOverdueTasksModal(remainingOverdue);
                            }
                        } catch (error) {
                            console.error("Error completing overdue task:", error);
                            showNotification("Error completing task. Please try again.");
                        }
                    }
                });
            });
            
            document.querySelectorAll('.delete-overdue').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const taskId = parseInt(e.target.dataset.id);
                    events = events.filter(e => e.id !== taskId);
                    
                    try {
                        await saveEvents();
                        renderCalendar();
                        renderDraggableEvents();
                        showNotification('Task deleted successfully');
                        
                        // Close modal if no more overdue tasks
                        const remainingOverdue = events.filter(e => 
                            !e.completed && 
                            new Date(e.date.split('-').join('-')) < new Date()
                        );
                        
                        if (remainingOverdue.length === 0) {
                            modal.remove();
                        } else {
                            // Refresh modal
                            showOverdueTasksModal(remainingOverdue);
                        }
                    } catch (error) {
                        console.error("Error deleting overdue task:", error);
                        showNotification("Error deleting task. Please try again.");
                    }
                });
            });
            
            document.getElementById('close-overdue-modal').addEventListener('click', () => {
                modal.remove();
            });
            
            document.querySelector('.modal-overlay').addEventListener('click', () => {
                modal.remove();
            });
        }

    });
