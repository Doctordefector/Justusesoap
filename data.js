document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importInput = document.getElementById('import-input');

    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', importData);

    function exportData() {
        const data = {
            goals: JSON.parse(localStorage.getItem('persistentGoals')) || [],
            checklists: JSON.parse(localStorage.getItem('checklists')) || [],
            activeChecklists: JSON.parse(localStorage.getItem('activeChecklists')) || []
        };

        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `just-use-soap-data-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    function importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('This will replace your current data. Are you sure?')) {
                    if (data.goals) localStorage.setItem('persistentGoals', JSON.stringify(data.goals));
                    if (data.checklists) localStorage.setItem('checklists', JSON.stringify(data.checklists));
                    if (data.activeChecklists) localStorage.setItem('activeChecklists', JSON.stringify(data.activeChecklists));
                    
                    alert('Data imported successfully!');
                    location.reload();
                }
            } catch (error) {
                alert('Invalid data file. Please use a properly exported data file.');
            }
        };
        reader.readAsText(file);
    }
}); 