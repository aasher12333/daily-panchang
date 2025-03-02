function calculateTimeSegments(startTime, endTime, numSegments) {
    const totalMs = endTime - startTime;
    const segmentLengthMs = totalMs / numSegments;
    const segments = [];

    let currentTime = new Date(startTime);
    for (let i = 0; i < numSegments; i++) {
        const segmentStart = new Date(currentTime);
        currentTime = new Date(currentTime.getTime() + segmentLengthMs);
        segments.push({
            start: segmentStart.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }),
            end: currentTime.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })
        });
    }

    return segments;
}

function mapPlanetaryOrder(startIndex, numSegments, planetaryOrder, typeMap = null) {
    const sequence = [];
    let planetIndex = startIndex;

    for (let i = 0; i < numSegments; i++) {
        const idx = planetIndex % planetaryOrder.length;
        const planet = planetaryOrder[idx];
        sequence.push(typeMap ? { planet, name: typeMap[idx][0], type: typeMap[idx][1] } : planet);
        planetIndex++;
    }

    return sequence;
}

module.exports = {
    calculateTimeSegments,
    mapPlanetaryOrder
};