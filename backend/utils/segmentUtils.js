const normalize = (str) => str.trim().toLowerCase();

// Build route segments with seat validation
const buildRouteSegments = (segments, startStation, endStation, seats) => {
    const routeSegments = [];
    let recording = false;

    for (let seg of segments) {
        if (normalize(seg.from) === normalize(startStation)) {
            recording = true;
        }

        if (recording) {
            if (seg.seatsAvailable < seats) {
                throw new Error(`Not enough seats in segment ${seg.from} → ${seg.to}`);
            }

            routeSegments.push({
                from: seg.from,
                to: seg.to,
                seats,
            });
        }

        if (normalize(seg.to) === normalize(endStation)) {
            break;
        }
    }

    if (routeSegments.length === 0) {
        throw new Error("Invalid route selection");
    }

    return routeSegments;
};

module.exports = { buildRouteSegments, normalize };
