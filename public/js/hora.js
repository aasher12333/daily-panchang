export function renderHoraSchedule(data, selectedDate, horaDiv, currentTimezone) {
    let horaHTML = '<h3>Hora Schedule</h3>';
    for (const period of ['dayHoras', 'nightHoras']) {
        horaHTML += `<h4>${period === 'dayHoras' ? 'Day Horas (Sunrise to Sunset)' : 'Night Horas (Sunset to Sunrise)'}</h4>
                     <table class="hora-table">
                     <tr><th>Time</th><th>Planet</th><th>Auspiciousness</th></tr>`;
        data[period].forEach(hora => {
            const start = moment.tz(`${selectedDate} ${hora.start}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
            const end = moment.tz(`${selectedDate} ${hora.end}`, 'YYYY-MM-DD h:mm:ss A', currentTimezone);
            horaHTML += `<tr class="${hora.auspiciousness?.toLowerCase()}">
                            <td>${start.format('h:mm A')} - ${end.format('h:mm A')}</td>
                            <td>${hora.planet}</td>
                            <td>${hora.auspiciousness}</td>
                         </tr>`;
        });
        horaHTML += '</table>';
    }
    horaDiv.innerHTML = horaHTML;
}