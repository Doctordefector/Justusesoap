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
        custom: '<i class="fas fa-star"></i>'
    };

    // Modal handlers
    function openModal() {
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
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const dayDiv = createDayElement(prevMonthDays - i, true);
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
            const dayDiv = createDayElement(i, true);
            calendarDays.appendChild(dayDiv);
        }
    }

    function createDayElement(day, isOtherMonth, date) {
        const dayDiv = document.createElement('div');
        dayDiv.className = `calendar-day${isOtherMonth ? ' other-month' : ''}`;
        
        if (date) {
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayDiv.classList.add('today');
            }
            
            const dateKey = date.toISOString().split('T')[0];
            if (progressData[dateKey]) {
                dayDiv.innerHTML = `
                    <div class="date">${day}</div>
                    ${progressData[dateKey].image ? 
                        `<img src="${progressData[dateKey].image}" class="progress-image" alt="Progress">` : 
                        ''}
                    ${progressData[dateKey].notes ? 
                        '<div class="progress-indicator"><i class="fas fa-sticky-note"></i></div>' : 
                        ''}
                `;
            } else {
                dayDiv.innerHTML = `<div class="date">${day}</div>`;
            }
            
            dayDiv.addEventListener('click', () => openProgressModal(date));
        } else {
            dayDiv.innerHTML = `<div class="date">${day}</div>`;
        }
        
        return dayDiv;
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
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                progressData[dateKey] = {
                    image: e.target.result,
                    notes: document.getElementById('progress-notes').value,
                    goalId: progressGoalSelect.value,
                    timestamp: new Date().toISOString()
                };
                
                localStorage.setItem('progressData', JSON.stringify(progressData));
                closeProgressModal();
                generateCalendar(currentDate);
            };
            reader.readAsDataURL(file);
        } else if (progressData[dateKey]?.image) {
            // Update existing progress without changing the image
            progressData[dateKey] = {
                ...progressData[dateKey],
                notes: document.getElementById('progress-notes').value,
                goalId: progressGoalSelect.value,
                timestamp: new Date().toISOString()
            };
            
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
            const isCompleted = goal.currentValue >= goal.targetValue;
            const container = isCompleted ? pastContainer : currentContainer;
            
            if (!container) return;

            const progress = calculateProgress(goal.currentValue, goal.targetValue);
            const goalElement = document.createElement('div');
            goalElement.className = `goal-card ${isCompleted ? 'completed' : ''}`;
            
            goalElement.innerHTML = `
                <div class="goal-header">
                    <div class="goal-icon ${isCompleted ? 'completed' : ''}">
                        ${goalIcons[goal.type] || goalIcons.custom}
                        ${isCompleted ? '<i class="fas fa-check check-mark"></i>' : ''}
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
                ${!isCompleted ? `
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
            createdAt: new Date().toISOString()
        };

        // Validate input
        if (newGoal.currentValue > newGoal.targetValue) {
            alert('Current value cannot be greater than target value');
            return;
        }

        if (newGoal.currentValue < 0 || newGoal.targetValue < 0) {
            alert('Values cannot be negative');
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

        if (parsedValue > goal.targetValue) {
            alert('Current value cannot be greater than target value');
            return;
        }

        goal.currentValue = parsedValue;
        
        if (goal.currentValue >= goal.targetValue) {
            goal.completed = true;
            alert("Congratulations! You've achieved your goal!");
        }

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