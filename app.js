// Data storage
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let friends = JSON.parse(localStorage.getItem('friends')) || [];
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let encouragements = JSON.parse(localStorage.getItem('encouragements')) || [];
let achievements = [
    { id: 'first-habit', name: 'First Step', description: 'Add your first habit', icon: '🌱', unlocked: false },
    { id: 'week-streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', unlocked: false },
    { id: 'month-streak', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '⭐', unlocked: false },
    { id: 'ten-habits', name: 'Habit Hero', description: 'Track 10 different habits', icon: '🦸', unlocked: false },
    { id: 'hundred-completions', name: 'Century Club', description: 'Complete 100 habits', icon: '💯', unlocked: false },
    { id: 'perfect-week', name: 'Perfect Week', description: 'Complete all habits for a week', icon: '✨', unlocked: false },
    { id: 'first-friend', name: 'Social Butterfly', description: 'Add your first friend', icon: '🤝', unlocked: false },
    { id: 'goal-achiever', name: 'Goal Getter', description: 'Complete your first goal', icon: '🎯', unlocked: false }
];

// Load achievements from storage
const storedAchievements = JSON.parse(localStorage.getItem('achievements'));
if (storedAchievements) {
    achievements = achievements.map(ach => {
        const stored = storedAchievements.find(s => s.id === ach.id);
        return stored ? { ...ach, unlocked: stored.unlocked } : ach;
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    renderHabits();
    renderStats();
    renderAchievements();
    renderFriends();
    renderGoals();
    setupEventListeners();
});

// Tab navigation
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Event listeners
function setupEventListeners() {
    document.getElementById('habitForm').addEventListener('submit', addHabit);
    document.getElementById('friendForm').addEventListener('submit', addFriend);
    document.getElementById('goalForm').addEventListener('submit', addGoal);
}

// Habit Management
function addHabit(e) {
    e.preventDefault();
    const name = document.getElementById('habitName').value;
    const category = document.getElementById('habitCategory').value;
    const frequency = document.getElementById('habitFrequency').value;
    
    const habit = {
        id: Date.now(),
        name,
        category,
        frequency,
        createdAt: new Date().toISOString(),
        completions: [],
        currentStreak: 0,
        longestStreak: 0
    };
    
    habits.push(habit);
    saveData();
    checkAchievements();
    renderHabits();
    renderDashboard();
    renderStats();
    updateGoalHabitOptions();
    showNotification('Habit added successfully!');
    e.target.reset();
}

function toggleHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    const today = new Date().toISOString().split('T')[0];
    
    if (habit.completions.includes(today)) {
        habit.completions = habit.completions.filter(d => d !== today);
        showNotification('Habit unmarked for today', 'info');
    } else {
        habit.completions.push(today);
        updateStreak(habit);
        checkAchievements();
        showNotification('Great job! Keep it up! 🎉');
    }
    
    saveData();
    renderHabits();
    renderDashboard();
    renderStats();
    updateProgressChart();
    updateGoalProgress();
}

function deleteHabit(habitId) {
    if (confirm('Are you sure you want to delete this habit?')) {
        habits = habits.filter(h => h.id !== habitId);
        saveData();
        renderHabits();
        renderDashboard();
        renderStats();
        updateProgressChart();
        showNotification('Habit deleted', 'error');
    }
}

function updateStreak(habit) {
    const sortedDates = [...habit.completions].sort().reverse();
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < sortedDates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expected = expectedDate.toISOString().split('T')[0];
        
        if (sortedDates[i] === expected) {
            currentStreak++;
        } else {
            break;
        }
    }
    
    habit.currentStreak = currentStreak;
    habit.longestStreak = Math.max(habit.longestStreak, currentStreak);
}

// Rendering functions
function renderDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayHabits = habits.filter(h => h.frequency === 'daily');
    const completedToday = todayHabits.filter(h => h.completions.includes(today));
    
    // Today's progress
    const progressHtml = todayHabits.length > 0 ? `
        <div class="stat-item">
            <div class="stat-value">${completedToday.length}/${todayHabits.length}</div>
            <div class="stat-label">Habits Completed</div>
        </div>
        <p style="margin-top: 15px;">Completion rate: ${Math.round((completedToday.length / todayHabits.length) * 100)}%</p>
    ` : '<p>No daily habits yet. Add some to get started!</p>';
    
    document.getElementById('todayProgress').innerHTML = progressHtml;
    
    // Active streaks
    const activeStreaks = habits
        .filter(h => h.currentStreak > 0)
        .sort((a, b) => b.currentStreak - a.currentStreak)
        .slice(0, 5);
    
    const streaksHtml = activeStreaks.length > 0 ? 
        activeStreaks.map(h => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <span>${h.name}</span>
                <span class="streak-badge">${h.currentStreak} 🔥</span>
            </div>
        `).join('') : '<p>No active streaks yet</p>';
    
    document.getElementById('activeStreaks').innerHTML = streaksHtml;
    
    // Weekly summary
    const weekSummary = getWeeklySummary();
    document.getElementById('weeklySummary').innerHTML = weekSummary;
    
    updateProgressChart();
}

function getWeeklySummary() {
    const today = new Date();
    const weekDates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        weekDates.push(date.toISOString().split('T')[0]);
    }
    
    const dailyCompletions = weekDates.map(date => {
        return habits.filter(h => h.completions.includes(date)).length;
    });
    
    const totalCompletions = dailyCompletions.reduce((a, b) => a + b, 0);
    const avgCompletions = habits.length > 0 ? (totalCompletions / 7).toFixed(1) : 0;
    const bestDay = Math.max(...dailyCompletions);
    
    return `
        <div class="stats-grid">
            <div style="text-align: center;">
                <div style="font-size: 2rem; font-weight: bold; color: #667eea;">${totalCompletions}</div>
                <div style="font-size: 0.9rem; color: #666;">Total Completions</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 2rem; font-weight: bold; color: #764ba2;">${avgCompletions}</div>
                <div style="font-size: 0.9rem; color: #666;">Daily Average</div>
            </div>
        </div>
        <p style="margin-top: 10px; color: #28a745;">Best day: ${bestDay} completions</p>
    `;
}

function renderHabits() {
    const today = new Date().toISOString().split('T')[0];
    const habitsList = document.getElementById('habitsList');
    
    if (habits.length === 0) {
        habitsList.innerHTML = '<p>No habits yet. Add your first habit above!</p>';
        return;
    }
    
    habitsList.innerHTML = habits.map(habit => {
        const isCompleted = habit.completions.includes(today);
        return `
            <div class="habit-item">
                <div class="habit-info">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-meta">
                        ${habit.category} • ${habit.frequency} • 
                        ${habit.completions.length} total completions
                    </div>
                </div>
                <span class="streak-badge">${habit.currentStreak} day${habit.currentStreak !== 1 ? 's' : ''} 🔥</span>
                <button class="check-btn ${isCompleted ? 'completed' : ''}" onclick="toggleHabit(${habit.id})">
                    ${isCompleted ? '✓ Done' : 'Mark Done'}
                </button>
                <button class="delete-btn" onclick="deleteHabit(${habit.id})">Delete</button>
            </div>
        `;
    }).join('');
}

function renderStats() {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(h => h.completions.includes(today)).length;
    const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);
    const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);
    
    document.getElementById('totalHabits').textContent = habits.length;
    document.getElementById('completedToday').textContent = completedToday;
    document.getElementById('longestStreak').textContent = longestStreak;
    document.getElementById('totalCompletions').textContent = totalCompletions;
    
    updateCategoryChart();
    updateWeeklyChart();
}

function renderAchievements() {
    const achievementsList = document.getElementById('achievementsList');
    
    achievementsList.innerHTML = achievements.map(ach => `
        <div class="achievement-item ${ach.unlocked ? 'unlocked' : ''}">
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-desc">${ach.description}</div>
            ${ach.unlocked ? '<div style="color: #ffd700; margin-top: 10px; font-weight: bold;">✓ UNLOCKED</div>' : ''}
        </div>
    `).join('');
}

function checkAchievements() {
    let newUnlocks = [];
    
    // First habit
    if (!achievements.find(a => a.id === 'first-habit').unlocked && habits.length >= 1) {
        unlockAchievement('first-habit');
        newUnlocks.push('First Step');
    }
    
    // 10 habits
    if (!achievements.find(a => a.id === 'ten-habits').unlocked && habits.length >= 10) {
        unlockAchievement('ten-habits');
        newUnlocks.push('Habit Hero');
    }
    
    // Week streak
    const hasWeekStreak = habits.some(h => h.currentStreak >= 7);
    if (!achievements.find(a => a.id === 'week-streak').unlocked && hasWeekStreak) {
        unlockAchievement('week-streak');
        newUnlocks.push('Week Warrior');
    }
    
    // Month streak
    const hasMonthStreak = habits.some(h => h.currentStreak >= 30);
    if (!achievements.find(a => a.id === 'month-streak').unlocked && hasMonthStreak) {
        unlockAchievement('month-streak');
        newUnlocks.push('Monthly Master');
    }
    
    // 100 completions
    const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);
    if (!achievements.find(a => a.id === 'hundred-completions').unlocked && totalCompletions >= 100) {
        unlockAchievement('hundred-completions');
        newUnlocks.push('Century Club');
    }
    
    // Perfect week
    const perfectWeek = checkPerfectWeek();
    if (!achievements.find(a => a.id === 'perfect-week').unlocked && perfectWeek) {
        unlockAchievement('perfect-week');
        newUnlocks.push('Perfect Week');
    }
    
    // First friend
    if (!achievements.find(a => a.id === 'first-friend').unlocked && friends.length >= 1) {
        unlockAchievement('first-friend');
        newUnlocks.push('Social Butterfly');
    }
    
    if (newUnlocks.length > 0) {
        showNotification(`🏆 Achievement Unlocked: ${newUnlocks.join(', ')}!`);
        renderAchievements();
    }
}

function unlockAchievement(id) {
    const achievement = achievements.find(a => a.id === id);
    if (achievement) {
        achievement.unlocked = true;
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }
}

function checkPerfectWeek() {
    if (habits.length === 0) return false;
    
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dailyHabits = habits.filter(h => h.frequency === 'daily');
        const completed = dailyHabits.filter(h => h.completions.includes(dateStr));
        
        if (dailyHabits.length > 0 && completed.length !== dailyHabits.length) {
            return false;
        }
    }
    return true;
}

// Friends Management
function addFriend(e) {
    e.preventDefault();
    const name = document.getElementById('friendName').value;
    const email = document.getElementById('friendEmail').value;
    
    const friend = {
        id: Date.now(),
        name,
        email,
        addedAt: new Date().toISOString()
    };
    
    friends.push(friend);
    saveData();
    checkAchievements();
    renderFriends();
    showNotification('Friend added successfully!');
    e.target.reset();
}

function renderFriends() {
    const friendsList = document.getElementById('friendsList');
    
    if (friends.length === 0) {
        friendsList.innerHTML = '<p>No friends yet. Add friends to stay accountable!</p>';
    } else {
        friendsList.innerHTML = friends.map(friend => `
            <div class="friend-item">
                <div class="friend-info">
                    <div class="friend-name">${friend.name}</div>
                    <div class="friend-email">${friend.email}</div>
                </div>
                <button class="encourage-btn" onclick="sendEncouragement(${friend.id})">Send Encouragement</button>
                <button class="delete-btn" onclick="deleteFriend(${friend.id})">Remove</button>
            </div>
        `).join('');
    }
    
    renderEncouragements();
}

function sendEncouragement(friendId) {
    const friend = friends.find(f => f.id === friendId);
    const messages = [
        'Keep up the great work!',
        'You\'re doing amazing!',
        'Stay strong and consistent!',
        'Your progress is inspiring!',
        'Don\'t give up, you\'ve got this!'
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    encouragements.push({
        id: Date.now(),
        friendName: friend.name,
        message,
        timestamp: new Date().toISOString()
    });
    
    saveData();
    renderEncouragements();
    showNotification(`Encouragement sent to ${friend.name}!`);
}

function deleteFriend(friendId) {
    if (confirm('Remove this friend?')) {
        friends = friends.filter(f => f.id !== friendId);
        saveData();
        renderFriends();
        showNotification('Friend removed', 'error');
    }
}

function renderEncouragements() {
    const board = document.getElementById('encouragementBoard');
    
    if (encouragements.length === 0) {
        board.innerHTML = '<p>No encouragements yet. Send some to your friends!</p>';
    } else {
        const recent = encouragements.slice(-5).reverse();
        board.innerHTML = recent.map(enc => `
            <div class="encouragement-message">
                <strong>${enc.friendName}:</strong> ${enc.message}
                <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">
                    ${new Date(enc.timestamp).toLocaleString()}
                </div>
            </div>
        `).join('');
    }
}

// Goals Management
function addGoal(e) {
    e.preventDefault();
    const name = document.getElementById('goalName').value;
    const target = parseInt(document.getElementById('goalTarget').value);
    const habitId = parseInt(document.getElementById('goalHabit').value);
    
    const habit = habits.find(h => h.id === habitId);
    if (!habit) {
        showNotification('Please select a habit', 'error');
        return;
    }
    
    const goal = {
        id: Date.now(),
        name,
        target,
        habitId,
        habitName: habit.name,
        current: 0,
        createdAt: new Date().toISOString(),
        completed: false
    };
    
    goals.push(goal);
    saveData();
    renderGoals();
    showNotification('Goal created successfully!');
    e.target.reset();
}

function updateGoalProgress() {
    goals.forEach(goal => {
        const habit = habits.find(h => h.id === goal.habitId);
        if (habit) {
            goal.current = habit.currentStreak;
            if (goal.current >= goal.target && !goal.completed) {
                goal.completed = true;
                if (!achievements.find(a => a.id === 'goal-achiever').unlocked) {
                    unlockAchievement('goal-achiever');
                    showNotification('🏆 Achievement Unlocked: Goal Getter!');
                    renderAchievements();
                }
                showNotification(`🎉 Goal achieved: ${goal.name}!`);
            }
        }
    });
    saveData();
}

function renderGoals() {
    const goalsList = document.getElementById('goalsList');
    updateGoalProgress();
    
    if (goals.length === 0) {
        goalsList.innerHTML = '<p>No goals yet. Set your first goal above!</p>';
        return;
    }
    
    goalsList.innerHTML = goals.map(goal => {
        const progress = Math.min((goal.current / goal.target) * 100, 100);
        return `
            <div class="goal-item">
                <div class="goal-header">
                    <div class="goal-name">${goal.name}</div>
                    <button class="delete-btn" onclick="deleteGoal(${goal.id})">Delete</button>
                </div>
                <div class="goal-meta">Habit: ${goal.habitName}</div>
                <div class="goal-progress">
                    <div class="goal-progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="goal-meta">
                    Progress: ${goal.current} / ${goal.target} days
                    ${goal.completed ? ' <span style="color: #28a745; font-weight: bold;">✓ COMPLETED</span>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

function deleteGoal(goalId) {
    if (confirm('Delete this goal?')) {
        goals = goals.filter(g => g.id !== goalId);
        saveData();
        renderGoals();
        showNotification('Goal deleted', 'error');
    }
}

function updateGoalHabitOptions() {
    const select = document.getElementById('goalHabit');
    select.innerHTML = '<option value="">Select a habit</option>' + 
        habits.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
}

// Charts - Custom implementations
function updateProgressChart() {
    // Progress chart - last 7 days
    const today = new Date();
    const chartData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const completions = habits.filter(h => h.completions.includes(dateStr)).length;
        chartData.push({ label: dayName, value: completions });
    }
    
    const maxValue = Math.max(...chartData.map(d => d.value), 1);
    const container = document.getElementById('progressChart');
    
    container.innerHTML = `
        <div class="line-chart-container">
            <div class="line-chart">
                ${chartData.map((d, i) => {
                    const height = (d.value / maxValue) * 180;
                    return `
                        <div style="display: flex; flex-direction: column; align-items: center; position: relative; bottom: ${height}px;">
                            <div class="line-point">
                                <div class="point-value">${d.value}</div>
                                <div class="point-label">${d.label}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function updateCategoryChart() {
    const categories = {};
    habits.forEach(habit => {
        categories[habit.category] = (categories[habit.category] || 0) + 1;
    });
    
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    const entries = Object.entries(categories);
    const total = Object.values(categories).reduce((a, b) => a + b, 0);
    
    if (total === 0) {
        document.getElementById('categoryChart').innerHTML = '<p style="text-align: center; color: #666;">No habits to display</p>';
        return;
    }
    
    let currentAngle = 0;
    const segments = entries.map(([cat, count], i) => {
        const percentage = (count / total) * 100;
        const angle = (count / total) * 360;
        const segment = `${colors[i % colors.length]} ${currentAngle}deg ${currentAngle + angle}deg`;
        currentAngle += angle;
        return { segment, label: cat, count, percentage, color: colors[i % colors.length] };
    });
    
    const gradient = segments.map(s => s.segment).join(', ');
    
    document.getElementById('categoryChart').innerHTML = `
        <div class="pie-chart">
            <div class="pie-visual" style="background: conic-gradient(${gradient});"></div>
            <div class="pie-legend">
                ${segments.map(s => `
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${s.color};"></div>
                        <div class="legend-text">${s.label}: ${s.count} (${s.percentage.toFixed(1)}%)</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function updateWeeklyChart() {
    const today = new Date();
    const chartData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dailyHabits = habits.filter(h => h.frequency === 'daily');
        const completed = dailyHabits.filter(h => h.completions.includes(dateStr)).length;
        const rate = dailyHabits.length > 0 ? (completed / dailyHabits.length) * 100 : 0;
        chartData.push({ label: dayName, value: Math.round(rate) });
    }
    
    const container = document.getElementById('weeklyChart');
    
    container.innerHTML = `
        <div class="bar-chart">
            ${chartData.map(d => `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                    <div class="bar" style="height: ${d.value * 2}px; position: relative;">
                        <div class="bar-value">${d.value}%</div>
                    </div>
                    <div class="bar-label">${d.label}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Utility functions
function saveData() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('friends', JSON.stringify(friends));
    localStorage.setItem('goals', JSON.stringify(goals));
    localStorage.setItem('encouragements', JSON.stringify(encouragements));
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
