document.addEventListener('DOMContentLoaded', () => {
    const clearCacheBtn = document.getElementById('clear-cache');
    
    clearCacheBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
            // Clear all localStorage data
            localStorage.clear();
            
            // Show success message
            alert('Cache cleared successfully! The page will now reload.');
            
            // Reload the page
            window.location.reload();
        }
    });
}); 