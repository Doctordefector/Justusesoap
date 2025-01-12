document.addEventListener('DOMContentLoaded', () => {
    let goals = JSON.parse(localStorage.getItem('persistentGoals')) || [];
    const form = document.getElementById('goal-form');
    const modal = document.getElementById('goal-modal');
    const addGoalBtn = document.getElementById('add-goal');
    const cancelBtn = document.getElementById('cancel-goal');
    const closeBtn = document.getElementById('close-modal');

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

    addGoalBtn.addEventListener('click', openModal);
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
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
});

function calculateProgress(current, target) {
    return Math.min(100, Math.max(0, (current / target) * 100));
} 