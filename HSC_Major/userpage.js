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

// Firebase configuration
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

document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let currentUserId = null;
  let tasks = [];
  let level = 1;
  let xp = 0;
  const xp_max = 10;
  
  // DOM elements
  const currentLevelElement = document.getElementById('level');
  const currentXpElement = document.getElementById('xp');
  const userNameElement = document.getElementById('user_name');
  const taskList = document.getElementById('task-list');
  const searchInput = document.getElementById('search');
  const searchForm = document.querySelector('.task_container form');
  const menubar = document.querySelector('#content nav .material-symbols--menu-rounded');
  const sidebar = document.getElementById('sidebar');

  // Initialize the app
  initApp();

  function initApp() {
    setupAuthStateListener();
    setupEventListeners();
    updateLevelDisplay();
  }

  function setupAuthStateListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUserId = user.uid;
        await loadUserData(user);
        setupTaskRealTimeUpdates();
      } else {
        window.location.href = 'login.html';
      }
    });
  }

  async function loadUserData(user) {
    await loadUserStats();
    await loadUserProfile(user);
    await loadUserTasks();
  }

  function setupEventListeners() {
    // Sidebar menu
    const allSideMenu = document.querySelectorAll('#sidebar .side_menu.top li a');
    allSideMenu.forEach(item => {
      const li = item.parentElement;
      item.addEventListener('click', function() {
        allSideMenu.forEach(i => i.parentElement.classList.remove('active'));
        li.classList.add('active');
      });
    });

    // Toggle sidebar
    menubar.addEventListener('click', () => sidebar.classList.toggle('hide'));

    // Window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth < 600) sidebar.classList.add('hide');
    });

    // Logout
    document.getElementById('logout').addEventListener('click', handleLogout);

    // Search
    searchForm.addEventListener('submit', handleSearchSubmit);
    searchInput.addEventListener('input', handleSearchInput);
  }

  // XP and Level System Functions
  function updateLevelDisplay() {
    if (currentLevelElement && currentXpElement) {
      currentLevelElement.textContent = `Level: ${level}`;
      currentXpElement.textContent = `XP: ${xp} / ${xp_max}`;
      updateProgressBar(xp);
    }
  }

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
        level: 1,
        XP: 0,
        lastUpdated: new Date().toISOString()
      };

      if (docSnap.exists()) {
        statsData = { ...statsData, ...docSnap.data() };
      }

      if (statsData.hasOwnProperty(eventType)) {
        statsData[eventType] += 1;
        statsData.XP += 1;
        
        
        if (statsData.XP >= xp_max) {
          statsData.level += 1;
          statsData.XP = 0;
          showLevelUpNotification(statsData.level);
        }
        
        statsData.lastUpdated = new Date().toISOString();
        await setDoc(userStatsRef, statsData);
        
        level = statsData.level;
        xp = statsData.XP;
        updateLevelDisplay();
      }
    } catch (error) {
      console.error("Error updating stats:", error);
      throw error;
    }
  }

  function showLevelUpNotification(newLevel) {
    const levelUpNotification = document.createElement('div');
    levelUpNotification.className = 'level-up-notification';
    levelUpNotification.innerHTML = `
      <span class="material-symbols--celebration"></span>
      <h3>Level Up!</h3>
      <p>You've reached level ${newLevel}!</p>
    `;
    document.body.appendChild(levelUpNotification);
    
    setTimeout(() => levelUpNotification.remove(), 3000);
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
        updateLevelDisplay();
        updateProgressBar(xp);
      } else {
        await initializeUserStats();
        updateProgressBar(0);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  async function initializeUserStats() {
    const userStatsRef = doc(db, "users", currentUserId, "data", "stats");
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

  // User Profile Functions
  async function loadUserProfile(user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userNameElement) {
        console.error("User name element not found in DOM");
        return;
      }

      if (userDoc.exists()) {
        const userData = userDoc.data();
        userNameElement.textContent = getUserDisplayName(userData);
      } else {
        userNameElement.textContent = user.email || '';
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      if (userNameElement) {
        userNameElement.textContent = user?.email || '';
      }
    }
  }

  function getUserDisplayName(userData) {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    } 
    if (userData.name) {
      return userData.name;
    }
    return '';
  }

  // Task Management Functions
  async function loadUserTasks() {
    if (!currentUserId) return;
    
    const userTasksRef = doc(db, "users", currentUserId, "data", "events");
    
    try {
      const docSnap = await getDoc(userTasksRef);
      if (docSnap.exists()) {
        tasks = docSnap.data().events || [];
        renderTasks(tasks);
      } else {
        renderTasks([]);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  }

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

  function renderTasks(tasksToRender) {
    taskList.innerHTML = '';
    
    const scheduledTasks = tasksToRender.filter(task => task.date);
    
    if (scheduledTasks.length === 0) {
      taskList.innerHTML = '<p class="no-tasks">No scheduled tasks found</p>';
      return;
    }
    
    scheduledTasks.forEach(task => {
      const taskElement = createTaskElement(task);
      taskList.appendChild(taskElement);
    });
  }

  function createTaskElement(task) {
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
    
    taskElement.querySelector('.complete-task').addEventListener('click', () => handleTaskCompletion(task));
    
    return taskElement;
  }

  async function handleTaskCompletion(task) {
    if (confirm('Mark this task as complete?')) {
      try {
        await updateUserStats(task.type);
        await removeCompletedTask(task.id);
        showTaskCompleteNotification(); 
      } catch (error) {
        console.error("Error completing task:", error);
        alert("Error completing task. Please try again.");
      }
    }
  }

  async function removeCompletedTask(taskId) {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    const userTasksRef = doc(db, "users", currentUserId, "data", "events");
    await setDoc(userTasksRef, { events: updatedTasks }, { merge: true });
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

  function formatTaskDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Search Functions
  function handleSearchSubmit(e) {
    e.preventDefault();
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      renderTasks(tasks);
      return;
    }
    
    const filteredTasks = tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) || 
      (task.description && task.description.toLowerCase().includes(searchTerm)) ||
      task.type.toLowerCase().includes(searchTerm)
    );
    
    renderTasks(filteredTasks);
  }

  function handleSearchInput() {
    if (this.value.trim() === '') {
      renderTasks(tasks);
    }
  }

  // Progress bar 
  function updateProgressBar(currentXP) {
    const xp_bar = document.getElementById('xp_bar');
    if (!xp_bar) {
        console.error("XP bar element not found");
        return;
    }
    
   
    const percentage = Math.min(100, Math.max(0, (currentXP / xp_max) * 100));
    xp_bar.style.width = `${percentage}%`;
  }

  // Logout Function
  async function handleLogout(e) {
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
  }
});