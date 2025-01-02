document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('goal-modal');
    const addGoalBtn = document.getElementById('add-goal');
    const cancelBtn = document.getElementById('cancel-goal');
    const goalForm = document.getElementById('goal-form');
    let goals = JSON.parse(localStorage.getItem('persistentGoals')) || [];

    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Add goal type icons mapping
    const goalIcons = {
        weight: '<i class="fas fa-user"></i>',
        hair: '<i class="fas fa-user-hair"></i>',
        skin: '<i class="fas fa-circle-dot"></i>',
        custom: '<i class="fas fa-star"></i>'
    };

    addGoalBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        goalForm.reset();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            goalForm.reset();
        }
    });

    goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newGoal = {
            id: Date.now(),
            type: document.getElementById('goal-type').value,
            title: document.getElementById('goal-title').value,
            currentValue: parseFloat(document.getElementById('current-value').value),
            targetValue: parseFloat(document.getElementById('target-value').value),
            unit: document.getElementById('unit').value,
            notes: document.getElementById('goal-notes').value,
            createdAt: new Date().toISOString(),
            progress: 0
        };

        goals.push(newGoal);
        localStorage.setItem('persistentGoals', JSON.stringify(goals));
        
        modal.style.display = 'none';
        goalForm.reset();
        displayGoals();
    });

    function displayGoals() {
        const currentContainer = document.getElementById('current-goals-container');
        const pastContainer = document.getElementById('past-goals-container');
        currentContainer.innerHTML = '';
        pastContainer.innerHTML = '';

        goals.forEach(goal => {
            const progress = calculateProgress(goal.currentValue, goal.targetValue);
            const isCompleted = goal.currentValue >= goal.targetValue;
            const container = isCompleted ? pastContainer : currentContainer;
            
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
                <div class="goal-notes">${goal.notes}</div>
                ${!isCompleted ? `
                    <button class="update-value" onclick="updateGoalValue(${goal.id})">
                        <i class="fas fa-edit"></i> Update Progress
                    </button>
                ` : ''}
            `;
            container.appendChild(goalElement);
        });
    }

    function calculateProgress(current, target) {
        return Math.min(100, Math.max(0, (current / target) * 100));
    }

    window.deleteGoal = function(goalId) {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        if (confirm(`Are you sure you want to delete the goal "${goal.title}"?`)) {
            goals = goals.filter(g => g.id !== goalId);
            localStorage.setItem('persistentGoals', JSON.stringify(goals));
            displayGoals();
        }
    };

    window.updateGoalValue = function(goalId) {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const newValue = prompt(`Update current value for ${goal.title} (${goal.unit}):`, goal.currentValue);
        if (newValue !== null) {
            goal.currentValue = parseFloat(newValue);
            
            // Check if goal is completed
            if (goal.currentValue >= goal.targetValue) {
                goal.completedAt = new Date().toISOString();
                // Show completion message
                alert(`Congratulations! You've achieved your goal: ${goal.title}`);
            }
            
            localStorage.setItem('persistentGoals', JSON.stringify(goals));
            displayGoals();
        }
    };

    // Initial display
    displayGoals();
}); 