// Store checklists in localStorage
let checklists = JSON.parse(localStorage.getItem('checklists')) || [];

// Modal functionality
const modal = document.getElementById('reminder-modal');
const addReminderBtn = document.getElementById('add-reminder');
const cancelBtn = document.getElementById('cancel-reminder');
const reminderForm = document.getElementById('reminder-form');

addReminderBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    setDefaultDates();
});

cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle form submission
reminderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const successAnimation = document.getElementById('success-animation');
    successAnimation.style.display = 'block';
    
    const newChecklist = {
        id: Date.now(),
        task: document.getElementById('task-name').value,
        frequency: document.getElementById('frequency').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        completed: false,
        progress: 0
    };
    
    setTimeout(() => {
        checklists.push(newChecklist);
        localStorage.setItem('checklists', JSON.stringify(checklists));
        updateChecklistDisplay();
        modal.style.display = 'none';
        reminderForm.reset();
        successAnimation.style.display = 'none';
    }, 1500);
});

// Display checklists
function updateChecklistDisplay() {
    const container = document.getElementById('checklist-container');
    container.innerHTML = '';
    
    checklists.forEach(checklist => {
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
                </div>
            </div>
            <button class="delete-btn" onclick="deleteChecklist(${checklist.id})">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        
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
            }
        });
        
        container.appendChild(checklistElement);
    });
}

// Delete checklist
function deleteChecklist(id) {
    checklists = checklists.filter(checklist => checklist.id !== id);
    localStorage.setItem('checklists', JSON.stringify(checklists));
    updateChecklistDisplay();
}

// Initial display
updateChecklistDisplay();

// Add this function to set default dates
function setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format dates to YYYY-MM-DD
    const todayFormatted = today.toISOString().split('T')[0];
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

    // Set default values for date inputs
    document.getElementById('start-date').value = todayFormatted;
    document.getElementById('end-date').value = tomorrowFormatted;

    // Set min dates to prevent selecting past dates
    document.getElementById('start-date').min = todayFormatted;
    document.getElementById('end-date').min = todayFormatted;
}

// Add event listener to start date to update end date min value
document.getElementById('start-date').addEventListener('change', (e) => {
    document.getElementById('end-date').min = e.target.value;
    // If end date is before new start date, update it
    if (document.getElementById('end-date').value < e.target.value) {
        document.getElementById('end-date').value = e.target.value;
    }
});

// Check for expired checklists and move them to past
function updateChecklistStatus() {
    const today = new Date();
    const activeChecklists = checklists.filter(checklist => {
        const endDate = new Date(checklist.endDate);
        return endDate >= today;
    });

    const pastChecklists = checklists.filter(checklist => {
        const endDate = new Date(checklist.endDate);
        return endDate < today;
    });

    // Update localStorage
    localStorage.setItem('activeChecklists', JSON.stringify(activeChecklists));
    localStorage.setItem('pastChecklists', JSON.stringify(pastChecklists));

    return { activeChecklists, pastChecklists };
}

// Tab switching functionality
document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        if (tabId === 'active') {
            document.getElementById('active-checklists').classList.add('active');
            updateChecklistDisplay(document.getElementById('checklist-container'), checklists);
        } else {
            document.getElementById('past-checklists').classList.add('active');
            const pastChecklists = JSON.parse(localStorage.getItem('pastChecklists')) || [];
            updatePastChecklistDisplay(document.getElementById('past-checklist-container'), pastChecklists);
        }
    });
});

// Display past checklists
function updatePastChecklistDisplay(container, pastChecklists) {
    container.innerHTML = '';
    
    if (pastChecklists.length === 0) {
        container.innerHTML = '<p class="no-items">No past checklists</p>';
        return;
    }

    pastChecklists.forEach(checklist => {
        const checklistElement = document.createElement('div');
        checklistElement.className = 'checklist-item past';
        
        checklistElement.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div class="checklist-circle ${checklist.completed ? 'completed' : ''}"</div>
                <div>
                    <h4>${checklist.task}</h4>
                    <p>${checklist.frequency} times per day</p>
                    <p>From: ${checklist.startDate} To: ${checklist.endDate}</p>
                    <p class="completion-status">${checklist.completed ? 'Completed' : 'Incomplete'}</p>
                </div>
            </div>
        `;
        
        container.appendChild(checklistElement);
    });
}

// Update the original updateChecklistDisplay function to work with container parameter
function updateChecklistDisplay(container, checklists) {
    // ... existing updateChecklistDisplay code ...
}

// Check for expired checklists when loading the page
document.addEventListener('DOMContentLoaded', () => {
    const { activeChecklists, pastChecklists } = updateChecklistStatus();
    checklists = activeChecklists; // Update current checklists
    updateChecklistDisplay(document.getElementById('checklist-container'), activeChecklists);
}); 