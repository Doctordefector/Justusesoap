document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('reminder-modal');
    const addReminderBtn = document.getElementById('add-reminder');
    const cancelBtn = document.getElementById('cancel-reminder');
    const form = document.getElementById('reminder-form');
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    let checklists = JSON.parse(localStorage.getItem('checklists')) || [];

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-checklists`).classList.add('active');
        });
    });

    // Modal handlers
    addReminderBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        setDefaultDates();
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        form.reset();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            form.reset();
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newChecklist = {
            id: Date.now(),
            task: document.getElementById('task-name').value,
            frequency: parseInt(document.getElementById('frequency').value),
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value,
            progress: 0,
            completed: false
        };

        checklists.push(newChecklist);
        localStorage.setItem('checklists', JSON.stringify(checklists));
        
        modal.style.display = 'none';
        form.reset();
        updateChecklistDisplay();
    });

    function setDefaultDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayFormatted = today.toISOString().split('T')[0];
        const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

        document.getElementById('start-date').value = todayFormatted;
        document.getElementById('end-date').value = tomorrowFormatted;

        document.getElementById('start-date').min = todayFormatted;
        document.getElementById('end-date').min = todayFormatted;
    }

    function updateChecklistDisplay() {
        const activeContainer = document.getElementById('checklist-container');
        const pastContainer = document.getElementById('past-checklist-container');
        
        if (activeContainer) activeContainer.innerHTML = '';
        if (pastContainer) pastContainer.innerHTML = '';
        
        const today = new Date();
        
        checklists.forEach(checklist => {
            const endDate = new Date(checklist.endDate);
            const isPast = endDate < today || checklist.completed;
            const container = isPast ? pastContainer : activeContainer;
            
            if (!container) return;
            
            const checklistElement = document.createElement('div');
            checklistElement.className = 'checklist-item';
            
            const circleClass = checklist.completed ? 
                'checklist-circle completed' : 
                'checklist-circle filling';
            
            checklistElement.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <div class="${circleClass}" style="--fill-percent: ${checklist.progress}%"></div>
                    <div>
                        <h4>${checklist.task}</h4>
                        <p>${checklist.frequency} times per day</p>
                        <p>From: ${checklist.startDate} To: ${checklist.endDate}</p>
                        ${isPast ? `<p class="status">${checklist.completed ? 'Completed' : 'Expired'}</p>` : ''}
                    </div>
                </div>
                ${!isPast ? `
                    <button class="delete-btn" onclick="deleteChecklist(${checklist.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                ` : ''}
            `;
            
            if (!isPast) {
                const circle = checklistElement.querySelector('.checklist-circle');
                circle.addEventListener('click', () => {
                    if (!checklist.completed) {
                        const increment = 100 / checklist.frequency;
                        checklist.progress = Math.min(100, checklist.progress + increment);
                        
                        if (checklist.progress >= 100) {
                            checklist.completed = true;
                            circle.classList.remove('filling');
                            circle.classList.add('completed');
                        } else {
                            circle.style.setProperty('--fill-percent', `${checklist.progress}%`);
                        }
                        
                        localStorage.setItem('checklists', JSON.stringify(checklists));
                        updateChecklistDisplay();
                    }
                });
            }
            
            container.appendChild(checklistElement);
        });

        // Show empty state messages
        if (activeContainer && activeContainer.children.length === 0) {
            activeContainer.innerHTML = '<p class="empty-message">No active checklists</p>';
        }
        if (pastContainer && pastContainer.children.length === 0) {
            pastContainer.innerHTML = '<p class="empty-message">No past checklists</p>';
        }
    }

    window.deleteChecklist = function(id) {
        if (confirm('Are you sure you want to delete this checklist?')) {
            checklists = checklists.filter(checklist => checklist.id !== id);
            localStorage.setItem('checklists', JSON.stringify(checklists));
            updateChecklistDisplay();
        }
    };

    // Initial display
    updateChecklistDisplay();
}); 