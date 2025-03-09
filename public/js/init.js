// Export global variables as a single object to avoid polluting the global scope
export const appState = {
    currentLatitude: null,
    currentLongitude: null,
    currentTimezone: null,
    targetTimezone: null
};

export function updateClock() {
    const clockDiv = document.getElementById('clock');
    const now = appState.currentTimezone ? moment().tz(appState.currentTimezone) : moment();
    clockDiv.innerHTML = `Current Time: ${now.format('h:mm:ss A')} (${appState.currentTimezone || 'Local Time'})`;
}

// Export the initialization function
export function initializeApp() {
    console.log('Window loaded, initializing app');
    const today = new Date();
    document.getElementById('date').value = today.toISOString().split('T')[0];
    updateClock();
    setInterval(updateClock, 1000);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    document.getElementById('month-selector').value = currentMonth;
    document.getElementById('year-selector').value = currentYear;

    // Dynamically import and call other functions
    import('./calendar.js').then(module => {
        module.generateCalendar(currentMonth, currentYear);
    });
    import('./location.js').then(module => {
        module.calculateSelected();
    });
}