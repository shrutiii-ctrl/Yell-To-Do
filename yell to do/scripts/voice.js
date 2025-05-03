document.addEventListener('DOMContentLoaded', function() {
  const voiceCommandBtn = document.getElementById('voiceCommandBtn');
  const voiceStatus = document.getElementById('voiceStatus');
  
  // Check if browser supports speech recognition
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      voiceCommandBtn.style.display = 'none';
      return;
  }
  
  // Create speech recognition object
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  
  // Voice command handler
  voiceCommandBtn.addEventListener('click', function() {
      if (voiceStatus.classList.contains('hidden')) {
          // Start listening
          recognition.start();
          voiceStatus.classList.remove('hidden');
          voiceCommandBtn.classList.add('voice-active');
      } else {
          // Stop listening
          recognition.stop();
          voiceStatus.classList.add('hidden');
          voiceCommandBtn.classList.remove('voice-active');
      }
  });
  
  // Speech recognition results
  recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Voice command:', transcript);
      
      // Process the command
      processVoiceCommand(transcript);
      
      // Stop listening after getting a result
      voiceStatus.classList.add('hidden');
      voiceCommandBtn.classList.remove('voice-active');
  };
  
  // Error handling
  recognition.onerror = function(event) {
      console.error('Speech recognition error', event.error);
      voiceStatus.classList.add('hidden');
      voiceCommandBtn.classList.remove('voice-active');
      
      let errorMessage = 'Error occurred in recognition';
      if (event.error === 'no-speech') {
          errorMessage = 'No speech was detected';
      } else if (event.error === 'audio-capture') {
          errorMessage = 'No microphone was found';
      } else if (event.error === 'not-allowed') {
          errorMessage = 'Permission to use microphone is blocked';
      }
      
      alert(errorMessage);
  };
  
  // End of recognition
  recognition.onend = function() {
      voiceStatus.classList.add('hidden');
      voiceCommandBtn.classList.remove('voice-active');
  };
  
  // Process voice commands
  function processVoiceCommand(command) {
      // Add task command
      if  (command.includes('add task') || command.includes('create task') || command.includes('new task')) {
        const titleMatch = command.match(/(?:called|named|titled|title)\s(.+?)(?:\s(?:with|description|due|priority)|$)/);
        const descriptionMatch = command.match(/(?:description\s(.+?))(?:\s(?:due|priority)|$)/);
        const dueDateMatch = command.match(/(?:due\s(.+?)(?:\spriority|$))/);
        const priorityMatch = command.match(/(?:priority\s(high|medium|low))/);
          
          const title = titleMatch ? titleMatch[1] : 'Task from voice command';
          const description = descriptionMatch ? descriptionMatch[1] : '';
          let dueDate = null;
          
          // Simple due date parsing (for demo purposes)
          if (dueDateMatch) {
              const dueText = dueDateMatch[1];
              const now = new Date();
              
              if (dueText.includes('today')) {
                  dueDate = new Date(now.setHours(23, 59, 0, 0)).toISOString();
              } else if (dueText.includes('tomorrow')) {
                  const tomorrow = new Date(now);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  dueDate = new Date(tomorrow.setHours(23, 59, 0, 0)).toISOString();
              } else if (dueText.includes('next week')) {
                  const nextWeek = new Date(now);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  dueDate = new Date(nextWeek.setHours(23, 59, 0, 0)).toISOString();
              }
              // Add more date parsing as needed
          }
          
          const priority = priorityMatch ? priorityMatch[1] : 'medium';
          
          // Add the task
          window.addTaskFromVoice(title, description, dueDate, priority);
          return;
      }
      
      // Complete task command
      if (command.includes('complete task') || command.includes('finish task') || command.includes('mark task as done')) {
          const taskMatch = command.match(/(?:complete|finish|mark)\s(?:task\s)?(.+)/);
          if (taskMatch) {
              const taskTitle = taskMatch[1];
              const task = tasks.find(t => t.title.toLowerCase().includes(taskTitle.toLowerCase()));
              
              if (task) {
                  toggleTaskComplete(task.id);
                  return;
              }
          }
      }
      
      // Delete task command
      if (command.includes('delete task') || command.includes('remove task')) {
          const taskMatch = command.match(/(?:delete|remove)\s(?:task\s)?(.+)/);
          if (taskMatch) {
              const taskTitle = taskMatch[1];
              const task = tasks.find(t => t.title.toLowerCase().includes(taskTitle.toLowerCase()));
              
              if (task) {
                  deleteTask(task.id);
                  return;
              }
          }
      }
      
      // Show help if command not recognized
      alert(`Command not recognized: "${command}". Try saying "Add task called [title] with description [description] due [date] priority [high/medium/low]"`);
  }
});