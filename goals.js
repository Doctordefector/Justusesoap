document.addEventListener('DOMContentLoaded', () => {
    let goals = JSON.parse(localStorage.getItem('persistentGoals')) || [];
    let progressData = JSON.parse(localStorage.getItem('progressData')) || {};
    let currentDate = new Date();

    const form = document.getElementById('goal-form');
    const modal = document.getElementById('goal-modal');
    const progressModal = document.getElementById('progress-modal');
    const addGoalBtn = document.getElementById('add-goal');
    const cancelBtn = document.getElementById('cancel-goal');
    const closeBtn = document.getElementById('close-modal');
    const closeProgressBtn = document.getElementById('close-progress-modal');
    const cancelProgressBtn = document.getElementById('cancel-progress');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const calendarMonth = document.getElementById('calendar-month');
    const progressForm = document.getElementById('progress-form');
    const progressImage = document.getElementById('progress-image');
    const imagePreview = document.getElementById('image-preview');
    const selectedDateSpan = document.getElementById('selected-date');
    const progressGoalSelect = document.getElementById('progress-goal');

    // Goal type icons
    const goalIcons = {
        weight: '<i class="fas fa-weight-scale"></i>',
        hair: '<i class="fas fa-scissors"></i>',
        skin: '<i class="fas fa-face-smile"></i>',
        exercise: '<i class="fas fa-dumbbell"></i>',
        nutrition: '<i class="fas fa-apple-whole"></i>',
        sleep: '<i class="fas fa-bed"></i>',
        meditation: '<i class="fas fa-om"></i>',
        reading: '<i class="fas fa-book"></i>',
        learning: '<i class="fas fa-graduation-cap"></i>',
        custom: '<i class="fas fa-star"></i>'
    };

    // Modal handlers
    function openModal() {
        modal.style.display = 'flex';
        modal.classList.add('active');
        form.reset();
        
        // Set default due date to 30 days from now
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('due-date').value = dueDate.toISOString().split('T')[0];
        
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.style.display = 'none';
        modal.classList.remove('active');
        form.reset();
        document.body.style.overflow = '';
    }

    function openProgressModal(date) {
        progressModal.style.display = 'flex';
        progressModal.classList.add('active');
        progressForm.reset();
        imagePreview.innerHTML = '';
        document.body.style.overflow = 'hidden';
        selectedDateSpan.textContent = date.toLocaleDateString();
        progressForm.dataset.date = date.toISOString().split('T')[0];
        
        // Populate goals dropdown
        const activeGoals = goals.filter(g => !g.completed);
        progressGoalSelect.innerHTML = '<option value="">Select a goal</option>' +
            activeGoals.map(g => `<option value="${g.id}">${g.title}</option>`).join('');

        // Load existing progress data
        const dateKey = date.toISOString().split('T')[0];
        if (progressData[dateKey]) {
            if (progressData[dateKey].image) {
                imagePreview.innerHTML = `<img src="${progressData[dateKey].image}" alt="Progress">`;
            }
            document.getElementById('progress-notes').value = progressData[dateKey].notes || '';
            progressGoalSelect.value = progressData[dateKey].goalId || '';
        }
    }

    function closeProgressModal() {
        progressModal.style.display = 'none';
        progressModal.classList.remove('active');
        progressForm.reset();
        document.body.style.overflow = '';
    }

    // Event listeners for modals
    addGoalBtn.addEventListener('click', openModal);
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    closeProgressBtn.addEventListener('click', closeProgressModal);
    cancelProgressBtn.addEventListener('click', closeProgressModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
        if (e.target === progressModal) closeProgressModal();
    });

    // Calendar functions
    function createDayElement(day, isOtherMonth, date) {
        const dayDiv = document.createElement('div');
        dayDiv.className = `calendar-day${isOtherMonth ? ' other-month' : ''}`;
        
        if (date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            
            if (date.toDateString() === today.toDateString()) {
                dayDiv.classList.add('today');
            }
            
            const dateKey = date.toISOString().split('T')[0];
            if (progressData[dateKey] && progressData[dateKey].entries && progressData[dateKey].entries.length > 0) {
                const entries = progressData[dateKey].entries;
                const lastEntry = entries[entries.length - 1];
                
                dayDiv.innerHTML = `
                    <div class="date">${day}</div>
                    ${lastEntry.image ? 
                        `<img src="${lastEntry.image}" class="progress-image" alt="Progress">` : 
                        ''}
                    ${entries.length > 1 ? 
                        `<div class="progress-indicator">+${entries.length}</div>` : 
                        entries[0].notes ? 
                        '<div class="progress-indicator"><i class="fas fa-sticky-note"></i></div>' : 
                        ''}
                `;

                // Show all entries when clicking on a day with multiple entries
                dayDiv.addEventListener('click', () => {
                    const entriesHtml = entries.map(entry => `
                        <div class="progress-entry">
                            ${entry.image ? `<img src="${entry.image}" alt="Progress">` : ''}
                            ${entry.notes ? `<p>${entry.notes}</p>` : ''}
                            ${entry.goalId ? `<p>Related to: ${goals.find(g => g.id === parseInt(entry.goalId))?.title || 'Unknown Goal'}</p>` : ''}
                            <p class="entry-time">${new Date(entry.timestamp).toLocaleString()}</p>
                        </div>
                    `).join('<hr>');

                    const viewEntriesModal = document.createElement('div');
                    viewEntriesModal.className = 'modal active';
                    viewEntriesModal.innerHTML = `
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3>Progress Entries for ${date.toLocaleDateString()}</h3>
                                <button class="close-modal">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="progress-entries">
                                ${entriesHtml}
                            </div>
                            <div class="form-actions">
                                <button class="btn-primary" onclick="document.getElementById('add-progress').click()">
                                    <i class="fas fa-plus"></i> Add New Entry
                                </button>
                            </div>
                        </div>
                    `;

                    document.body.appendChild(viewEntriesModal);
                    
                    const closeBtn = viewEntriesModal.querySelector('.close-modal');
                    closeBtn.addEventListener('click', () => {
                        document.body.removeChild(viewEntriesModal);
                    });

                    viewEntriesModal.addEventListener('click', (e) => {
                        if (e.target === viewEntriesModal) {
                            document.body.removeChild(viewEntriesModal);
                        }
                    });
                });
            } else {
                dayDiv.innerHTML = `<div class="date">${day}</div>`;
                dayDiv.addEventListener('click', () => openProgressModal(date));
            }
        } else {
            dayDiv.innerHTML = `<div class="date">${day}</div>`;
        }
        
        return dayDiv;
    }

    function generateCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const monthLength = lastDay.getDate();
        
        calendarMonth.textContent = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
        
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';
        
        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0);
        const prevMonthDays = prevMonthLastDay.getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const dayNumber = prevMonthDays - i;
            const dayDate = new Date(year, month - 1, dayNumber);
            const dayDiv = createDayElement(dayNumber, true, dayDate);
            calendarDays.appendChild(dayDiv);
        }
        
        // Current month days
        for (let i = 1; i <= monthLength; i++) {
            const currentDate = new Date(year, month, i);
            const dayDiv = createDayElement(i, false, currentDate);
            calendarDays.appendChild(dayDiv);
        }
        
        // Next month days
        const remainingDays = 42 - (startingDay + monthLength); // 42 = 6 rows × 7 days
        for (let i = 1; i <= remainingDays; i++) {
            const dayDate = new Date(year, month + 1, i);
            const dayDiv = createDayElement(i, true, dayDate);
            calendarDays.appendChild(dayDiv);
        }
    }

    // Calendar navigation
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate);
    });

    // Image handling
    progressImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Progress form submission
    progressForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dateKey = progressForm.dataset.date;
        const file = progressImage.files[0];
        
        if (!progressData[dateKey]) {
            progressData[dateKey] = {
                entries: []
            };
        }

        const newEntry = {
            id: Date.now(),
            notes: document.getElementById('progress-notes').value,
            goalId: progressGoalSelect.value,
            timestamp: new Date().toISOString()
        };
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                newEntry.image = e.target.result;
                progressData[dateKey].entries.push(newEntry);
                localStorage.setItem('progressData', JSON.stringify(progressData));
                closeProgressModal();
                generateCalendar(currentDate);
            };
            reader.readAsDataURL(file);
        } else {
            progressData[dateKey].entries.push(newEntry);
            localStorage.setItem('progressData', JSON.stringify(progressData));
            closeProgressModal();
            generateCalendar(currentDate);
        }
    });

    function displayGoals() {
        const currentContainer = document.getElementById('current-goals-container');
        const pastContainer = document.getElementById('past-goals-container');
        
        if (currentContainer) currentContainer.innerHTML = '';
        if (pastContainer) pastContainer.innerHTML = '';

        const currentGoals = goals.filter(goal => !goal.completed);
        const pastGoals = goals.filter(goal => goal.completed);

        if (currentContainer && currentGoals.length === 0) {
            currentContainer.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-bullseye"></i>
                    <p>No active goals</p>
                    <button class="btn-primary" onclick="document.getElementById('add-goal').click()">
                        <i class="fas fa-plus"></i> Add Your First Goal
                    </button>
                </div>`;
        }

        if (pastContainer && pastGoals.length === 0) {
            pastContainer.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-trophy"></i>
                    <p>No completed goals yet</p>
                    <p class="empty-subtitle">Complete your active goals to see them here!</p>
                </div>`;
        }

        goals.forEach(goal => {
            const container = goal.completed ? pastContainer : currentContainer;
            if (!container) return;

            const progress = calculateProgress(goal.currentValue, goal.targetValue);
            const dueDate = new Date(goal.dueDate);
            const isOverdue = !goal.completed && dueDate < new Date();
            
            const goalElement = document.createElement('div');
            goalElement.className = `goal-card ${goal.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
            
            goalElement.innerHTML = `
                <div class="goal-header">
                    <div class="goal-icon ${goal.completed ? 'completed' : ''}">
                        ${goalIcons[goal.type] || goalIcons.custom}
                        ${goal.completed ? '<i class="fas fa-check check-mark"></i>' : ''}
                    </div>
                    <div class="goal-type">${goal.type}</div>
                    <button class="delete-goal" onclick="deleteGoal(${goal.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <h3 class="goal-title">${goal.title}</h3>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="goal-values">
                        <span>Current: ${goal.currentValue}${goal.unit}</span>
                        <span>Target: ${goal.targetValue}${goal.unit}</span>
                    </div>
                </div>
                ${goal.notes ? `<div class="goal-notes">${goal.notes}</div>` : ''}
                <div class="goal-dates">
                    <span>Started: ${new Date(goal.startDate).toLocaleDateString()}</span>
                    ${goal.completed ? 
                        `<span>Completed: ${new Date(goal.completedAt).toLocaleDateString()}</span>` :
                        `<span class="${isOverdue ? 'overdue' : ''}">Due: ${dueDate.toLocaleDateString()}</span>`
                    }
                </div>
                ${!goal.completed ? `
                    <button class="update-value" onclick="updateGoalValue(${goal.id})">
                        <i class="fas fa-edit"></i> Update Progress
                    </button>
                ` : ''}
            `;
            
            container.appendChild(goalElement);
        });
    }

    // Add goal form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newGoal = {
            id: Date.now(),
            type: document.getElementById('goal-type').value,
            title: document.getElementById('goal-title').value,
            currentValue: parseFloat(document.getElementById('current-value').value),
            targetValue: parseFloat(document.getElementById('target-value').value),
            unit: document.getElementById('unit').value,
            notes: document.getElementById('notes').value || '',
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: document.getElementById('due-date').value,
            completedAt: null,
            startDate: new Date().toISOString().split('T')[0]
        };

        // Validate input
        if (newGoal.currentValue >= newGoal.targetValue) {
            alert('Current value must be lower than target value');
            return;
        }

        if (newGoal.currentValue < 0 || newGoal.targetValue < 0) {
            alert('Values cannot be negative');
            return;
        }

        const dueDate = new Date(newGoal.dueDate);
        if (dueDate < new Date()) {
            alert('Due date cannot be in the past');
            return;
        }

        goals.push(newGoal);
        localStorage.setItem('persistentGoals', JSON.stringify(goals));
        
        closeModal();
        displayGoals();
    });

    // Update goal value
    window.updateGoalValue = function(goalId) {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const newValue = prompt(`Update current value for ${goal.title} (${goal.unit}):`, goal.currentValue);
        if (newValue === null) return;

        const parsedValue = parseFloat(newValue);
        if (isNaN(parsedValue)) {
            alert('Please enter a valid number');
            return;
        }

        if (parsedValue < 0) {
            alert('Value cannot be negative');
            return;
        }

        if (parsedValue >= goal.targetValue && !goal.completed) {
            goal.completed = true;
            goal.completedAt = new Date().toISOString();
            alert("Congratulations! You've achieved your goal!");
        }

        goal.currentValue = parsedValue;
        localStorage.setItem('persistentGoals', JSON.stringify(goals));
        displayGoals();
    };

    // Delete goal
    window.deleteGoal = function(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            goals = goals.filter(g => g.id !== goalId);
            localStorage.setItem('persistentGoals', JSON.stringify(goals));
            displayGoals();
        }
    };

    // Tab switching
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-goals`).classList.add('active');
        });
    });

    // Initial display
    displayGoals();
    generateCalendar(currentDate);

    // Export data function update
    window.exportData = function() {
        const data = {
            goals: goals,
            progress: progressData
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'goals-and-progress.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Import data function update
    window.importData = function(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.goals && data.progress) {
                    goals = data.goals;
                    progressData = data.progress;
                    localStorage.setItem('persistentGoals', JSON.stringify(goals));
                    localStorage.setItem('progressData', JSON.stringify(progressData));
                    displayGoals();
                    generateCalendar(currentDate);
                    alert('Data imported successfully!');
                } else {
                    alert('Invalid data format');
                }
            } catch (error) {
                alert('Error importing data');
                console.error(error);
            }
        };
        reader.readAsText(file);
    };
});

function calculateProgress(current, target) {
    return Math.min(100, Math.max(0, (current / target) * 100));
} 