let interval = null;

function startShift() {

    const rate = parseFloat(document.getElementById("rate").value);
    const startInput = document.getElementById("startDateTime").value;

    if (!rate || !startInput) {
        alert("Enter hourly rate and start date/time.");
        return;
    }

    const startTime = new Date(startInput);
    const now = new Date();

    if (startTime > now) {
        alert("Start time cannot be in the future.");
        return;
    }

    localStorage.setItem("currentRate", rate);
    localStorage.setItem("shiftStart", startTime.toISOString());

    if (interval) clearInterval(interval);

    interval = setInterval(updateLiveTracker, 1000);
    updateLiveTracker();
}

function updateLiveTracker() {

    const rate = parseFloat(localStorage.getItem("currentRate"));
    const start = new Date(localStorage.getItem("shiftStart"));
    const now = new Date();

    if (!rate || !start) return;

    const diffMs = now - start;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHoursDecimal = diffMinutes / 60;

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    const seconds = diffSeconds % 60;

    const earnings = rate * diffHoursDecimal;

    document.getElementById("liveClock").innerText =
        `Time Worked: ${hours}h ${minutes}m ${seconds}s`;

    document.getElementById("liveEarnings").innerText =
        `Live Earnings: $${earnings.toFixed(2)}`;
}

function stopShift() {

    if (interval) clearInterval(interval);

    const rate = parseFloat(localStorage.getItem("currentRate"));
    const start = new Date(localStorage.getItem("shiftStart"));
    const end = new Date();

    if (!rate || !start) return;

    const hoursWorked = (end - start) / (1000 * 60 * 60);
    const totalPay = rate * hoursWorked;

    saveShift(start, end, hoursWorked, totalPay);

    localStorage.removeItem("shiftStart");
    localStorage.removeItem("currentRate");

    document.getElementById("liveClock").innerText = "";
    document.getElementById("liveEarnings").innerText = "";
}

function saveShift(start, end, hours, pay) {

    let shifts = JSON.parse(localStorage.getItem("shifts")) || [];

    shifts.push({
        start: start.toISOString(),
        end: end.toISOString(),
        hours: hours.toFixed(2),
        pay: pay.toFixed(2)
    });

    localStorage.setItem("shifts", JSON.stringify(shifts));
    displayShifts();
}

function displayShifts() {

    const historyList = document.getElementById("history");
    historyList.innerHTML = "";

    const shifts = JSON.parse(localStorage.getItem("shifts")) || [];

    shifts.forEach(shift => {
        const li = document.createElement("li");
        li.textContent =
            `Shift: ${new Date(shift.start).toLocaleString()} 
            → ${new Date(shift.end).toLocaleString()}
            | Hours: ${shift.hours}
            | Pay: $${shift.pay}`;
        historyList.appendChild(li);
    });
}

window.onload = function() {
    displayShifts();
};
