// Requirements modal functionality for all application forms
function acceptRequirements() {
    document.getElementById('requirementsModal').style.display = 'none';
    document.getElementById('applicationFormSection').style.display = 'block';
}

function declineRequirements() {
    window.history.back();
}

// Show modal on page load
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('requirementsModal').style.display = 'flex';
});