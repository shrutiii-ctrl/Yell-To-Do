document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const taskList = document.getElementById('taskList');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskModal = document.getElementById('taskModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelTaskBtn = document.getElementById('cancelTaskBtn');
  const taskForm = document.getElementById('taskForm');
  const notificationToast = document.getElementById('notificationToast');
  const totalTasksEl = document.getElementById('totalTasks');
  const completedTasksEl = document.getElementById('completedTasks');
  const pendingTasksEl = document.getElementById('pendingTasks');
  const filterPriority = document.getElementById('filterPriority');
  const filterStatus = document.getElementById('filterStatus');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const welcomeBack = document.getElementById('welcomeBack');
  const usernameDisplay = document.getElementById('usernameDisplay');
  
  // Task data
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
  // Initialize app
  function init() {
      renderTaskList();
      updateStats();
      showWelcomeBack();
      
      // Load user data
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
          usernameDisplay.textContent = userEmail.split('@')[0];
      }
  }
  
  // Show welcome back animation
  function showWelcomeBack() {
      welcomeBack.classList.remove('hidden');
      setTimeout(() => {
          welcomeBack.classList.add('hidden');
      }, 3000);
  }
  
  // Close welcome back animation
  window.closeWelcome = function() {
      welcomeBack.classList.add('hidden');
  }
  
  // Render task list
  function renderTaskList(filteredTasks = null) {
      const tasksToRender = filteredTasks || tasks;
      
      if (tasksToRender.length === 0) {
          taskList.innerHTML = '<li class="p-4 text-center text-gray-500">No tasks found. Add your first task!</li>';
          return;
      }
      
      taskList.innerHTML = '';
      
      tasksToRender.forEach((task, index) => {
          const taskItem = document.createElement('li');
          taskItem.className = `task-item px-4 py-4 sm:px-6 ${task.priority}-priority ${task.completed ? 'bg-gray-50' : 'bg-white'}`;
          
          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
          const now = new Date();
          const isOverdue = dueDate && !task.completed && dueDate < now;
          
          taskItem.innerHTML = `
              <div class="flex items-center justify-between">
                  <div class="flex items-center">
                      <input type="checkbox" ${task.completed ? 'checked' : ''} 
                          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer mr-3 task-complete" 
                          data-id="${task.id}">
                      <div class="min-w-0 flex-1">
                          <div class="flex items-center">
                              <p class="text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-indigo-600'} truncate">
                                  ${task.title}
                              </p>
                              ${isOverdue ? '<span class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Overdue</span>' : ''}
                          </div>
                          <p class="text-sm text-gray-500 truncate">${task.description || 'No description'}</p>
                          ${dueDate ? `
                          <div class="mt-1 flex items-center text-sm text-gray-500">
                              <i class="far fa-clock mr-1"></i>
                              <span>Due: ${formatDate(dueDate)}</span>
                          </div>` : ''}
                      </div>
                  </div>
                  <div class="flex items-center space-x-3">
                      <span class="px-2 py-1 text-xs rounded-full ${getPriorityClass(task.priority)}">
                          ${capitalizeFirstLetter(task.priority)}
                      </span>
                      <button class="text-gray-400 hover:text-gray-500 task-edit" data-id="${task.id}">
                          <i class="fas fa-edit"></i>
                      </button>
                      <button class="text-gray-400 hover:text-red-500 task-delete" data-id="${task.id}">
                          <i class="fas fa-trash"></i>
                      </button>
                  </div>
              </div>
          `;
          
          taskList.appendChild(taskItem);
      });
      
      // Add event listeners to new elements
      addTaskEventListeners();
  }
  
  // Format date for display
  function formatDate(date) {
      return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      });
  }
  
  // Get priority class for styling
  function getPriorityClass(priority) {
      switch (priority) {
          case 'high': return 'bg-red-100 text-red-800';
          case 'medium': return 'bg-yellow-100 text-yellow-800';
          case 'low': return 'bg-green-100 text-green-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  }
  
  // Capitalize first letter
  function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // Add event listeners to task elements
  function addTaskEventListeners() {
      // Complete task
      document.querySelectorAll('.task-complete').forEach(checkbox => {
          checkbox.addEventListener('change', function() {
              const taskId = this.getAttribute('data-id');
              toggleTaskComplete(taskId);
          });
      });
      
      // Edit task
      document.querySelectorAll('.task-edit').forEach(button => {
          button.addEventListener('click', function() {
              const taskId = this.getAttribute('data-id');
              editTask(taskId);
          });
      });
      
      // Delete task
      document.querySelectorAll('.task-delete').forEach(button => {
          button.addEventListener('click', function() {
              const taskId = this.getAttribute('data-id');
              deleteTask(taskId);
          });
      });
  }
  
  // Toggle task completion status
  function toggleTaskComplete(taskId) {
      tasks = tasks.map(task => {
          if (task.id === taskId) {
              return { ...task, completed: !task.completed };
          }
          return task;
      });
      
      saveTasks();
      renderTaskList();
      updateStats();
      
      // Show notification
      showNotification('Task status updated!');
  }
  
  // Edit task
  function editTask(taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      // Fill the form with task data
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskDescription').value = task.description || '';
      document.getElementById('taskDueDate').value = task.dueDate ? formatDateTimeForInput(new Date(task.dueDate)) : '';
      document.getElementById('taskPriority').value = task.priority;
      
      // Open modal
      openTaskModal();
      
      // Change form to edit mode
      taskForm.setAttribute('data-edit-id', taskId);
      document.querySelector('#taskModal h3').textContent = 'Edit Task';
  }
  
  // Format date for datetime-local input
  function formatDateTimeForInput(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  // Delete task
  function deleteTask(taskId) {
      if (confirm('Are you sure you want to delete this task?')) {
          tasks = tasks.filter(task => task.id !== taskId);
          saveTasks();
          renderTaskList();
          updateStats();
          showNotification('Task deleted!');
      }
  }
  
  // Save tasks to localStorage
  function saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  // Update stats
  function updateStats() {
      totalTasksEl.textContent = tasks.length;
      completedTasksEl.textContent = tasks.filter(task => task.completed).length;
      pendingTasksEl.textContent = tasks.filter(task => !task.completed).length;
  }
  
  // Show notification
  function showNotification(message) {
      notificationToast.classList.remove('hidden');
      document.getElementById('notificationMessage').textContent = message;
      
      // Animate in
      setTimeout(() => {
          notificationToast.style.transform = 'translateY(0)';
      }, 10);
      
      // Hide after 3 seconds
      setTimeout(() => {
          notificationToast.style.transform = 'translateY(10px)';
          setTimeout(() => {
              notificationToast.classList.add('hidden');
          }, 300);
      }, 3000);
  }
  
  // Open task modal
  function openTaskModal() {
      taskModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
  }
  
  // Close task modal
  function closeTaskModal() {
      taskModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
      
      // Reset form
      taskForm.reset();
      taskForm.removeAttribute('data-edit-id');
      document.querySelector('#taskModal h3').textContent = 'Add New Task';
  }
  
  // Filter tasks
  function filterTasks() {
      const priorityFilter = filterPriority.value;
      const statusFilter = filterStatus.value;
      
      let filteredTasks = [...tasks];
      
      // Apply priority filter
      if (priorityFilter !== 'all') {
          filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
          const completed = statusFilter === 'completed';
          filteredTasks = filteredTasks.filter(task => task.completed === completed);
      }
      
      renderTaskList(filteredTasks);
  }
  
  // Add a task from voice command
  window.addTaskFromVoice = function(title, description, dueDate, priority) {
      const newTask = {
          id: Date.now().toString(),
          title,
          description,
          dueDate,
          priority: priority || 'medium',
          completed: false,
          createdAt: new Date().toISOString()
      };
      
      tasks.unshift(newTask);
      saveTasks();
      renderTaskList();
      updateStats();
      showNotification('Task added via voice command!');
  }
  
  // Event Listeners
  addTaskBtn.addEventListener('click', openTaskModal);
  closeModalBtn.addEventListener('click', closeTaskModal);
  cancelTaskBtn.addEventListener('click', closeTaskModal);
  
  taskForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const title = document.getElementById('taskTitle').value.trim();
      const description = document.getElementById('taskDescription').value.trim();
      const dueDate = document.getElementById('taskDueDate').value;
      const priority = document.getElementById('taskPriority').value;
      const editId = this.getAttribute('data-edit-id');
      
      if (!title) {
          alert('Task title is required');
          return;
      }
      
      if (editId) {
          // Update existing task
          tasks = tasks.map(task => {
              if (task.id === editId) {
                  return {
                      ...task,
                      title,
                      description: description || null,
                      dueDate: dueDate || null,
                      priority
                  };
              }
              return task;
          });
          
          showNotification('Task updated successfully!');
      } else {
          // Add new task
          const newTask = {
              id: Date.now().toString(),
              title,
              description: description || null,
              dueDate: dueDate || null,
              priority,
              completed: false,
              createdAt: new Date().toISOString()
          };
          
          tasks.unshift(newTask);
          showNotification('Task added successfully!');
      }
      
      saveTasks();
      renderTaskList();
      updateStats();
      closeTaskModal();
  });
  
  // Filter events
  filterPriority.addEventListener('change', filterTasks);
  filterStatus.addEventListener('change', filterTasks);
  clearFiltersBtn.addEventListener('click', function() {
      filterPriority.value = 'all';
      filterStatus.value = 'all';
      filterTasks();
  });
  
  // Initialize the app
  init();
});