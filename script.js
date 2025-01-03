document.addEventListener('DOMContentLoaded', () => {
    // Update goals overview
    const goals = JSON.parse(localStorage.getItem('persistentGoals')) || [];
    const goalsOverview = document.getElementById('goals-overview');
    
    if (goalsOverview) {
        if (goals.length === 0) {
            goalsOverview.innerHTML = '<p class="empty-message">No active goals</p>';
        } else {
            goalsOverview.innerHTML = goals
                .filter(goal => !goal.completed)
                .slice(0, 3)
                .map(goal => `
                    <div class="overview-item">
                        <div class="overview-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="overview-details">
                            <h4>${goal.title}</h4>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${calculateProgress(goal.currentValue, goal.targetValue)}%"></div>
                            </div>
                        </div>
                    </div>
                `).join('');
        }
    }

    // Update checklists overview
    const checklists = JSON.parse(localStorage.getItem('checklists')) || [];
    const checklistsOverview = document.getElementById('checklists-overview');
    
    if (checklistsOverview) {
        if (checklists.length === 0) {
            checklistsOverview.innerHTML = '<p class="empty-message">No active checklists</p>';
        } else {
            checklistsOverview.innerHTML = checklists
                .filter(checklist => !checklist.completed)
                .slice(0, 3)
                .map(checklist => `
                    <div class="overview-item">
                        <div class="overview-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="overview-details">
                            <h4>${checklist.task}</h4>
                            <p>${checklist.frequency} times per day</p>
                        </div>
                    </div>
                `).join('');
        }
    }
});

function calculateProgress(current, target) {
    return Math.min(100, Math.max(0, (current / target) * 100));
}
