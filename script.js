// Habit Tracker Dashboard JavaScript

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initHabitForm();
    loadHabits();
    updateDateTime();
});

// Habit Form Handler
function initHabitForm() {
    const form = document.getElementById('habitForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const habitName = document.getElementById('habitName').value.trim();
        const habitCategory = document.getElementById('habitCategory').value;
        
        if (habitName && habitCategory) {
            addHabit(habitName, habitCategory);
            form.reset();
        }
    });
}

// Add a new habit
function addHabit(name, category) {
    const habits = getHabits();
    
    const newHabit = {
        id: Date.now(),
        name: name,
        category: category,
        createdAt: new Date().toISOString(),
        streak: 0,
        completed: false
    };
    
    habits.push(newHabit);
    saveHabits(habits);
    renderHabits();
}

// Load habits from localStorage
function getHabits() {
    const habits = localStorage.getItem('habits');
    return habits ? JSON.parse(habits) : [];
}

// Save habits to localStorage
function saveHabits(habits) {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Load and display habits
function loadHabits() {
    renderHabits();
}

// Render habits in the UI
function renderHabits() {
    const habits = getHabits();
    const habitsContainer = document.getElementById('habits');
    
    if (habits.length === 0) {
        habitsContainer.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">No habits yet. Add your first habit above!</p>';
        return;
    }
    
    habitsContainer.innerHTML = habits.map(habit => `
        <div class="habit-item" data-id="${habit.id}">
            <div>
                <span class="habit-name">${habit.name}</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <span class="habit-category">${getCategoryLabel(habit.category)}</span>
                <button onclick="toggleHabit(${habit.id})" class="btn-toggle" style="padding: 6px 12px; background: ${habit.completed ? '#10b981' : '#e5e7eb'}; color: ${habit.completed ? 'white' : '#6b7280'}; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                    ${habit.completed ? '✓' : '○'}
                </button>
                <button onclick="deleteHabit(${habit.id})" style="padding: 6px 10px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                    ✕
                </button>
            </div>
        </div>
    `).join('');
}

// Toggle habit completion
function toggleHabit(id) {
    const habits = getHabits();
    const habit = habits.find(h => h.id === id);
    
    if (habit) {
        habit.completed = !habit.completed;
        if (habit.completed) {
            habit.streak = (habit.streak || 0) + 1;
        }
        saveHabits(habits);
        renderHabits();
        updateProgressCharts();
    }
}

// Delete a habit
function deleteHabit(id) {
    if (confirm('Are you sure you want to delete this habit?')) {
        const habits = getHabits();
        const filteredHabits = habits.filter(h => h.id !== id);
        saveHabits(filteredHabits);
        renderHabits();
    }
}

// Get category label
function getCategoryLabel(category) {
    const labels = {
        'health': 'Health & Fitness',
        'productivity': 'Productivity',
        'learning': 'Learning',
        'mindfulness': 'Mindfulness',
        'social': 'Social',
        'other': 'Other'
    };
    return labels[category] || category;
}

// Update progress charts based on habits
function updateProgressCharts() {
    const habits = getHabits();
    const completedCount = habits.filter(h => h.completed).length;
    const totalCount = habits.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Update the chart (simplified version)
    console.log(`Completion rate: ${completionRate}%`);
}

// Update date and time (example of dynamic content)
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);
    console.log(`Current date: ${dateStr}`);
}

// Animation for streak cards
function animateStreakCards() {
    const streakCards = document.querySelectorAll('.streak-card');
    streakCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });
}

// Call animation on load
setTimeout(animateStreakCards, 500);

// Social features placeholder functions
function shareProgress() {
    alert('Share feature coming soon! You can share your progress on social media.');
}

function challengeFriend() {
    alert('Challenge feature coming soon! Compete with friends to build better habits.');
}

// Add event listeners for social buttons
document.addEventListener('DOMContentLoaded', () => {
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach((button, index) => {
        if (index === 0) {
            button.addEventListener('click', shareProgress);
        } else if (index === 1) {
            button.addEventListener('click', challengeFriend);
        }
    });
});
