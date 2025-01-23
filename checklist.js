document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('reminder-modal');
    const addReminderBtn = document.getElementById('add-reminder');
    const cancelBtn = document.getElementById('cancel-reminder');
    const closeBtn = document.getElementById('close-reminder-modal');
    const form = document.getElementById('reminder-form');
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    let checklists = JSON.parse(localStorage.getItem('checklists')) || [];

    // Modal handlers
    function openModal() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Format dates as YYYY-MM-DD for input fields
        const formattedToday = today.toISOString().split('T')[0];
        const formattedTomorrow = tomorrow.toISOString().split('T')[0];

        // Set default dates
        document.getElementById('start-date').value = formattedToday;
        document.getElementById('end-date').value = formattedTomorrow;

        modal.style.display = 'flex';
        modal.classList.add('active');
        form.reset();
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.style.display = 'none';
        modal.classList.remove('active');
        form.reset();
        document.body.style.overflow = '';
    }

    function setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('start-date').value = today;
        document.getElementById('end-date').value = today;
    }

    // Event Listeners
    addReminderBtn.addEventListener('click', openModal);
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

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
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Validate dates
        const start = new Date(newChecklist.startDate);
        const end = new Date(newChecklist.endDate);
        
        if (end < start) {
            alert('End date cannot be before start date');
            return;
        }

        if (newChecklist.frequency <= 0) {
            alert('Frequency must be greater than 0');
            return;
        }

        checklists.push(newChecklist);
        localStorage.setItem('checklists', JSON.stringify(checklists));
        
        closeModal();
        updateChecklistDisplay();
    });

    function updateChecklistDisplay() {
        const activeContainer = document.getElementById('checklist-container');
        const pastContainer = document.getElementById('past-checklist-container');
        
        if (activeContainer) activeContainer.innerHTML = '';
        if (pastContainer) pastContainer.innerHTML = '';
        
        const today = new Date();
        const activeChecklists = checklists.filter(checklist => !checklist.completed && new Date(checklist.endDate) >= today);
        const pastChecklists = checklists.filter(checklist => checklist.completed || new Date(checklist.endDate) < today);

        if (activeContainer && activeChecklists.length === 0) {
            activeContainer.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No active reminders</p>
                    <button class="btn-primary" onclick="document.getElementById('add-reminder').click()">
                        <i class="fas fa-plus"></i> Add Your First Reminder
                    </button>
                </div>`;
        }

        if (pastContainer && pastChecklists.length === 0) {
            pastContainer.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-check-circle"></i>
                    <p>No completed reminders</p>
                </div>`;
        }
        
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
                    <button class="delete-goal" onclick="deleteChecklist(${checklist.id})">
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
    }

    // Delete checklist
    window.deleteChecklist = function(id) {
        if (confirm('Are you sure you want to delete this reminder?')) {
            checklists = checklists.filter(checklist => checklist.id !== id);
            localStorage.setItem('checklists', JSON.stringify(checklists));
            updateChecklistDisplay();
        }
    };

    // Initial display
    updateChecklistDisplay();
}); 