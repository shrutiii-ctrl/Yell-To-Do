document.addEventListener('DOMContentLoaded', function() {
    const alarmSound = document.getElementById('alarmSound');
    let alarmInterval;
    let activeAlarms = [];
    
    // Initialize alarm checking
    function initAlarms() {
        // Clear any existing interval
        if (alarmInterval) {
            clearInterval(alarmInterval);
        }
        
        // Check every 30 seconds
        alarmInterval = setInterval(checkForDueTasks, 30000);
        
        // Check immediately on load
        checkForDueTasks();
    }
    
    // Check for due tasks
    function checkForDueTasks() {
        const now = new Date();
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        tasks.forEach(task => {
            if (task.dueDate && !task.completed) {
                const dueDate = new Date(task.dueDate);
                const timeDiff = dueDate - now;
                
                // If task is due within 1 minute and not already alerted
                if (timeDiff > 0 && timeDiff < 60000 && !activeAlarms.includes(task.id)) {
                    showAlarmNotification(task);
                    activeAlarms.push(task.id);
                }
            }
        });
    }
    
    // Show alarm notification
    function showAlarmNotification(task) {
        // Play alarm sound
        alarmSound.currentTime = 0;
        alarmSound.play();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border-l-4 border-red-500 z-50 max-w-sm animate-pop-in';
        notification.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0 pt-0.5">
                    <i class="fas fa-bell text-red-500 text-xl"></i>
                </div>
                <div class="ml-3 w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900">Task Due Soon!</p>
                    <p class="mt-1 text-sm text-gray-500">${task.title} is due at ${formatTime(new Date(task.dueDate))}</p>
                    <div class="mt-4 flex">
                        <button type="button" class="mr-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 alarm-dismiss">
                            Dismiss
                        </button>
                        <button type="button" class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 alarm-complete" data-id="${task.id}">
                            Mark Complete
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add event listeners
        notification.querySelector('.alarm-dismiss').addEventListener('click', function() {
            alarmSound.pause();
            notification.remove();
            removeAlarmFromActive(task.id);
        });
        
        notification.querySelector('.alarm-complete').addEventListener('click', function() {
            const taskId = this.getAttribute('data-id');
            toggleTaskComplete(taskId);
            alarmSound.pause();
            notification.remove();
            removeAlarmFromActive(task.id);
        });
        
        // Auto-dismiss after 1 minute
        setTimeout(() => {
            if (document.body.contains(notification)) {
                alarmSound.pause();
                notification.remove();
                removeAlarmFromActive(task.id);
            }
        }, 60000);
    }
    
    // Format time for display
    function formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Remove alarm from active list
    function removeAlarmFromActive(taskId) {
        activeAlarms = activeAlarms.filter(id => id !== taskId);
    }
    
    // Toggle task completion (connected to main app)
    function toggleTaskComplete(taskId) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        
        // Refresh if on dashboard
        if (typeof renderTaskList === 'function') {
            renderTaskList();
        }
    }
    
    // Initialize alarms
    initAlarms();
    
    // Export function to be called when new tasks are added
    window.checkAlarms = initAlarms;
});