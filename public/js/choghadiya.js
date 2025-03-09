export function renderChoghadiyaSchedule(data, selectedDate, choghadiyaDiv, currentTimezone) {
    const now = moment().tz(currentTimezone);
    let choghadiyaHTML = `
        <h3>Choghadiya Schedule</h3>
        <div class="choghadiya-wrapper">
            <div class="choghadiya-section">
                <h4>Day Choghadiya</h4>
                <table class="choghadiya-table">
                    <tr><th style="width: 25%;">Time</th><th>Name</th><th>Type</th></tr>`;

    data.dayChoghadiya.forEach(chog => {
        const start = moment.tz(`${selectedDate} ${chog.start}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
        const end = moment.tz(`${selectedDate} ${chog.end}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
        const isCurrent = now.isBetween(start, end);

        const special = chog.special ? ` (${chog.special})` : '';
        choghadiyaHTML += `
            <tr class="${chog.type?.toLowerCase() || 'neutral'}${isCurrent ? ' current-choghadiya' : ''}">
                <td>${start.format('h:mm A')} - ${end.format('h:mm A')}</td>
                <td>${chog.name || 'Unknown'}</td>
                <td>${chog.type || 'Neutral'}</td>
            </tr>`;
    });

    choghadiyaHTML += `
                </table>
            </div>
            <div class="choghadiya-section">
                <h4>Night Choghadiya</h4>
                <table class="choghadiya-table">
                    <tr><th style="width: 25%;">Time</th><th>Name</th><th>Type</th></tr>`;

    let nightDate = moment(selectedDate).clone();
    data.nightChoghadiya.forEach((chog, index) => {
        if (index && moment(chog.start, 'h:mm:ss A').hour() < 12) nightDate.add(1, 'day');

        const start = moment.tz(`${nightDate.format('YYYY-MM-DD')} ${chog.start}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
        const end = moment.tz(`${nightDate.format('YYYY-MM-DD')} ${chog.end}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
        const isCurrent = now.isBetween(start, end);

        const special = chog.special ? ` (${chog.special})` : '';
        choghadiyaHTML += `
            <tr class="${chog.type?.toLowerCase() || 'neutral'}${isCurrent ? ' current-choghadiya' : ''}">
                <td>${start.format('h:mm A')} - ${end.format('h:mm A')}</td>
                <td>${chog.name || 'Unknown'}</td>
                <td>${chog.type || 'Neutral'}</td>
            </tr>`;
    });

    choghadiyaHTML += `
                </table>
            </div>
        </div>`;

    choghadiyaDiv.innerHTML = choghadiyaHTML;
}
