const MILESTONES = [1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60, 90, 120, 180, 365];

const STORAGE_KEY = "streakStart";

function getStartTime() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? parseInt(raw, 10) : null;
}

function setStartTime(ts) {
  localStorage.setItem(STORAGE_KEY, String(ts));
}

function clearStartTime() {
  localStorage.removeItem(STORAGE_KEY);
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days === 0 && hours === 0) {
    return `${minutes}m`;
  }
  if (days === 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${days}d ${hours}h ${minutes}m`;
}

function getNextMilestone(days) {
  for (const m of MILESTONES) {
    if (m > days) return m;
  }
  return null; // past last milestone
}

function updateUI() {
  const start = getStartTime();
  const now = Date.now();

  const daysEl = document.getElementById("days");
  const timeDetail = document.getElementById("timeDetail");
  const todayBar = document.getElementById("todayBar");
  const todayPercent = document.getElementById("todayPercent");
  const goalBar = document.getElementById("goalBar");
  const goalPercent = document.getElementById("goalPercent");
  const goalLabel = document.getElementById("goalLabel");
  const startBtn = document.getElementById("startBtn");
  const relapseBtn = document.getElementById("relapseBtn");
  const milestonesEl = document.getElementById("milestones");

  if (!start) {
    // No active streak
    daysEl.textContent = "0";
    timeDetail.textContent = "Start your streak";
    todayBar.style.width = "0%";
    todayPercent.textContent = "0%";
    goalBar.style.width = "0%";
    goalPercent.textContent = "0%";
    goalLabel.textContent = "Next goal: 1 day";
    startBtn.classList.remove("hidden");
    relapseBtn.classList.add("hidden");
    renderMilestones(0, milestonesEl);
    return;
  }

  startBtn.classList.add("hidden");
  relapseBtn.classList.remove("hidden");

  const elapsed = now - start;
  const totalDays = elapsed / 86400000;
  const fullDays = Math.floor(totalDays);
  const dayProgress = totalDays - fullDays; // 0 → 1

  // Display
  daysEl.textContent = fullDays;
  timeDetail.textContent = formatDuration(elapsed) + " total";

  // Today progress bar (progress through current day)
  const todayPct = Math.min(100, Math.round(dayProgress * 100));
  todayBar.style.width = todayPct + "%";
  todayPercent.textContent = todayPct + "%";

  // Goal progress
  const nextGoal = getNextMilestone(fullDays);
  if (nextGoal === null) {
    goalLabel.textContent = "All goals reached";
    goalBar.style.width = "100%";
    goalPercent.textContent = "100%";
  } else {
    const progressToGoal = totalDays / nextGoal;
    const goalPct = Math.min(100, Math.round(progressToGoal * 100));
    goalLabel.textContent = `Next goal: ${nextGoal} day${nextGoal === 1 ? "" : "s"}`;
    goalBar.style.width = goalPct + "%";
    goalPercent.textContent = goalPct + "%";
  }

  renderMilestones(fullDays, milestonesEl);
}

function renderMilestones(currentDays, container) {
  container.innerHTML = "";
  MILESTONES.forEach((m) => {
    const el = document.createElement("div");
    el.className = "milestone";
    if (currentDays >= m) {
      el.classList.add("reached");
    }
    if (getNextMilestone(currentDays) === m) {
      el.classList.add("current");
    }
    el.textContent = m === 7 ? "1 week" : m === 30 ? "1 month" : m + "d";
    container.appendChild(el);
  });
}

function startStreak() {
  setStartTime(Date.now());
  updateUI();
}

function resetStreak() {
  clearStartTime();
  updateUI();
  hideModal();
}

function showModal() {
  document.getElementById("confirmModal").classList.remove("hidden");
}

function hideModal() {
  document.getElementById("confirmModal").classList.add("hidden");
}

// Stars
function createStars() {
  const container = document.getElementById("stars");
  const count = 60;
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = Math.random() * 2 + 0.5;
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.setProperty("--duration", (Math.random() * 3 + 2) + "s");
    star.style.animationDelay = Math.random() * 5 + "s";
    container.appendChild(star);
  }
}

// Event listeners
document.getElementById("startBtn").addEventListener("click", startStreak);
document.getElementById("relapseBtn").addEventListener("click", showModal);
document.getElementById("cancelReset").addEventListener("click", hideModal);
document.getElementById("confirmReset").addEventListener("click", resetStreak);

// Init
createStars();
updateUI();

// Update every 30 seconds so the bars move smoothly
setInterval(updateUI, 30000);

// Also update when the page becomes visible again
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") updateUI();
});

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
