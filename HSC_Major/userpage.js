import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  onSnapshot, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Your Firebase configuration and initialization remains the same
const firebaseConfig = {
  apiKey: "AIzaSyAUU2wXBEWT8c-6pOS2iyEjvgQlGzmolRo",
  authDomain: "purrsue-login.firebaseapp.com",
  projectId: "purrsue-login",
  storageBucket: "purrsue-login.appspot.com",
  messagingSenderId: "329901830629",
  appId: "1:329901830629:web:ba907e54131d88ea21bf0c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  let currentUserId = null;
  let tasks = [];

  // Check auth state and load tasks
  onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        
        // Display the user's name with proper error handling
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            const userNameElement = document.getElementById('user_name');
            if (!userNameElement) {
                console.error("User name element not found in DOM");
                return;
            }

            if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // Check for different possible name field formats
                let displayName = '';
                
                if (userData.firstName && userData.lastName) {
                    displayName = `${userData.firstName} ${userData.lastName}`;
                } 

                else if (userData.name) {
                    displayName = userData.name;
                }


                
                userNameElement.textContent = displayName;
            } else {

                userNameElement.textContent = user.email || 'User';
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            const userNameElement = document.getElementById('user_name');
            if (userNameElement) {
                userNameElement.textContent = user.email || 'User';
            }
        }
      
      // Load and set up real-time updates for tasks
      loadUserTasks();
      setupTaskRealTimeUpdates();
    } else {
      window.location.href = 'login.html';
    }
  });

  // Dashboard menu functionality
  const allSideMenu = document.querySelectorAll('#sidebar .side_menu.top li a');
  allSideMenu.forEach(item => {
    const li = item.parentElement;
    item.addEventListener('click', function() {
      allSideMenu.forEach(i => i.parentElement.classList.remove('active'));
      li.classList.add('active');
    });
  });

  // Toggle sidebar
  const menubar = document.querySelector('#content nav .material-symbols--menu-rounded');
  const sidebar = document.getElementById('sidebar');
  menubar.addEventListener('click', function() {
    sidebar.classList.toggle('hide');
  });

window.onresize = function(){
  if (window.innerWidth < 600) {
    sidebar.classList.toggle('hide');
  }
} 




  // Logout Functionality
  document.getElementById('logout').addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to log out?')) {
      try {
        await signOut(auth);
        localStorage.removeItem('loggedInUserId');
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Error during logout:', error);
        alert('There was an error logging out. Please try again.');
      }
    }
  });

  // Load tasks from Firebase
  async function loadUserTasks() {
    if (!currentUserId) return;
    
    const userTasksRef = doc(db, "users", currentUserId, "data", "events");
    
    try {
      const docSnap = await getDoc(userTasksRef);
      if (docSnap.exists()) {
        tasks = docSnap.data().events || [];
        renderTasks(tasks);
      } else {
        console.log("No tasks found");
        renderTasks([]);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  }

  // Set up real-time updates for tasks
  function setupTaskRealTimeUpdates() {
    if (!currentUserId) return;
    
    const userTasksRef = doc(db, "users", currentUserId, "data", "events");
    
    onSnapshot(userTasksRef, (doc) => {
      if (doc.exists()) {
        tasks = doc.data().events || [];
        renderTasks(tasks);
      }
    });
  }

  // Render tasks to the task list
  function renderTasks(tasksToRender) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    // Filter only scheduled tasks (those with a date)
    const scheduledTasks = tasksToRender.filter(task => task.date);
    
    if (scheduledTasks.length === 0) {
      taskList.innerHTML = '<p class="no-tasks">No scheduled tasks found</p>';
      return;
    }
    
    scheduledTasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.className = `task-card ${task.type}`;
      taskElement.dataset.taskId = task.id;
      
      taskElement.innerHTML = `
        <div class="task-header">
          <span class="task-type">${task.type}</span>
          <span class="task-date">${formatTaskDate(task.date)}</span>
        </div>
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description || 'No description'}</div>
        <div class="task-actions">
          <button class="complete-task" data-id="${task.id}">
            <span class="material-symbols--check-circle"></span> Complete
          </button>
        </div>
      `;
      
      taskElement.querySelector('.complete-task').addEventListener('click', async function() {
        if (confirm('Mark this task as complete?')) {
          try {
            await updateUserStats(task.type);
            const taskId = parseInt(this.dataset.id);
            const updatedTasks = tasks.filter(t => t.id !== taskId);
            const userTasksRef = doc(db, "users", currentUserId, "data", "events");
            await setDoc(userTasksRef, { events: updatedTasks }, { merge: true });
            showNotification('Task completed!');
          } catch (error) {
            console.error("Error completing task:", error);
            showNotification("Error completing task. Please try again.");
          }
        }
      });
      
      taskList.appendChild(taskElement);
    });
  }

  // Helper function to format task date
  function formatTaskDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Search functionality
  const searchInput = document.getElementById('search');
  const searchForm = document.querySelector('.task_container form');

  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm.trim() === '') {
      renderTasks(tasks);
      return;
    }
    
    const filteredTasks = tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) || 
      (task.description && task.description.toLowerCase().includes(searchTerm)) ||
      task.type.toLowerCase().includes(searchTerm)
    );
    
    renderTasks(filteredTasks);
  });

  searchInput.addEventListener('input', function() {
    if (this.value.trim() === '') {
      renderTasks(tasks);
    }
  });

  async function updateUserStats(eventType) {
    if (!currentUserId) return;
    
    const userStatsRef = doc(db, "users", currentUserId, "data", "stats");
    
    try {
      const docSnap = await getDoc(userStatsRef);
      let statsData = {
        study: 0,
        leisure: 0,
        physical: 0,
        mental: 0,
        sleep: 0,
        lastUpdated: new Date().toISOString()
      };

      if (docSnap.exists()) {
        statsData = {
          ...statsData,
          ...docSnap.data()
        };
      }

      if (statsData.hasOwnProperty(eventType)) {
        statsData[eventType] += 1;
        statsData.lastUpdated = new Date().toISOString();
        await setDoc(userStatsRef, statsData);
      }
    } catch (error) {
      console.error("Error updating stats:", error);
      throw error;
    }
  }

  function showNotification(message) {
    alert(message);
  }
});

