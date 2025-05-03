// scripts/calendar.js
document.addEventListener('DOMContentLoaded', function() {
  // Load tasks from localStorage
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
  // Initialize calendar
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: tasks.map(task => {
          return {
              title: task.title,
              start: task.dueDate || task.createdAt,
              end: task.dueDate || null,
              allDay: !task.dueDate || !task.dueDate.includes('T'),
              color: getPriorityColor(task.priority),
              extendedProps: {
                  description: task.description,
                  priority: task.priority,
                  completed: task.completed
              }
          };
      }),
      eventClick: function(info) {
          // Show task details when event is clicked
          showTaskDetails(info.event);
      },
      dateClick: function(info) {
          // Open add task modal with pre-filled date when date is clicked
          openAddTaskModal(info.dateStr);
      }
  });
  
  calendar.render();
  
  // Helper function to get priority color
  function getPriorityColor(priority) {
      switch(priority) {
          case 'high': return '#ef4444'; // red-500
          case 'medium': return '#f59e0b'; // amber-500
          case 'low': return '#10b981'; // emerald-500
          default: return '#3b82f6'; // blue-500
      }
  }
  
  // Show task details
  function showTaskDetails(event) {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
          <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-modal-in">
              <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-medium text-gray-900">${event.title}</h3>
                  <button class="text-gray-400 hover:text-gray-500 close-modal">
                      <i class="fas fa-times"></i>
                  </button>
              </div>
              <div class="space-y-4">
                  ${event.extendedProps.description ? `
                  <div>
                      <label class="block text-sm font-medium text-gray-700">Description</label>
                      <p class="mt-1 text-sm text-gray-600">${event.extendedProps.description}</p>
                  </div>` : ''}
                  <div>
                      <label class="block text-sm font-medium text-gray-700">Due Date</label>
                      <p class="mt-1 text-sm text-gray-600">${event.start ? new Date(event.start).toLocaleString() : 'No due date'}</p>
                  </div>
                  <div>
                      <label class="block text-sm font-medium text-gray-700">Priority</label>
                      <p class="mt-1 text-sm text-gray-600 capitalize">${event.extendedProps.priority}</p>
                  </div>
                  <div>
                      <label class="block text-sm font-medium text-gray-700">Status</label>
                      <p class="mt-1 text-sm text-gray-600">${event.extendedProps.completed ? 'Completed' : 'Pending'}</p>
                  </div>
              </div>
              <div class="mt-6 flex justify-end">
                  <button class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 close-modal">
                      Close
                  </button>
              </div>
          </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add event listeners to close buttons
      modal.querySelectorAll('.close-modal').forEach(btn => {
          btn.addEventListener('click', () => {
              modal.remove();
          });
      });
  }
  
  // Open add task modal with pre-filled date
  function openAddTaskModal(dateStr) {
      // You can reuse your existing task modal from dashboard.html
      // or create a similar one here
      const modal = document.createElement('div');
      modal.className = 'hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
          <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-modal-in">
              <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-medium text-gray-900">Add New Task</h3>
                  <button class="text-gray-400 hover:text-gray-500 close-modal">
                      <i class="fas fa-times"></i>
                  </button>
              </div>
              <form id="calendarTaskForm" class="space-y-4">
                  <input type="hidden" id="taskDueDate" value="${dateStr}">
                  <div>
                      <label for="taskTitle" class="block text-sm font-medium text-gray-700">Task Title</label>
                      <input type="text" id="taskTitle" name="taskTitle" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div>
                      <label for="taskDescription" class="block text-sm font-medium text-gray-700">Description</label>
                      <textarea id="taskDescription" name="taskDescription" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                  </div>
                  <div>
                      <label for="taskPriority" class="block text-sm font-medium text-gray-700">Priority</label>
                      <select id="taskPriority" name="taskPriority" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                          <option value="low">Low</option>
                          <option value="medium" selected>Medium</option>
                          <option value="high">High</option>
                      </select>
                  </div>
                  <div class="flex justify-end space-x-3">
                      <button type="button" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 close-modal">
                          Cancel
                      </button>
                      <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Save Task
                      </button>
                  </div>
              </form>
          </div>
      `;
      
      document.body.appendChild(modal);
      modal.classList.remove('hidden');
      
      // Form submission
      const form = modal.querySelector('#calendarTaskForm');
      form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const title = this.querySelector('#taskTitle').value.trim();
          const description = this.querySelector('#taskDescription').value.trim();
          const dueDate = this.querySelector('#taskDueDate').value;
          const priority = this.querySelector('#taskPriority').value;
          
          if (!title) {
              alert('Task title is required');
              return;
          }
          
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
          
          // Save to localStorage
          const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
          tasks.unshift(newTask);
          localStorage.setItem('tasks', JSON.stringify(tasks));
          
          // Refresh calendar
          calendar.refetchEvents();
          
          // Close modal
          modal.remove();
      });
      
      // Close buttons
      modal.querySelectorAll('.close-modal').forEach(btn => {
          btn.addEventListener('click', () => {
              modal.remove();
          });
      });
  }
  
  // Add task button event listener
  document.getElementById('addTaskBtn').addEventListener('click', function() {
      openAddTaskModal(new Date().toISOString().split('T')[0]);
  });
});






