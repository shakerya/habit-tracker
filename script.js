document.addEventListener("DOMContentLoaded", function() {
    const habitContainer = document.getElementById('habit-container');
    const addHabitButton = document.getElementById('add-habit-button');
    const habitNameInput = document.getElementById('habit-name');
    const habitGoalInput = document.getElementById('habit-goal');
    const habitTimeframeInput = document.getElementById('habit-timeframe');
    const summaryContainer = document.getElementById('summary-container');
    const weeklySummaryContainer = document.getElementById('weekly-summary-container');
    const monthlySummaryContainer = document.getElementById('monthly-summary-container');
    const currentDateSpan = document.getElementById('current-date');

    // Set today's date in the summary section
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    currentDateSpan.textContent = formattedDate;

    // Load habits from local storage when the page is loaded
    const habits = JSON.parse(localStorage.getItem('habits')) || [];
    const dailyProgress = JSON.parse(localStorage.getItem('dailyProgress')) || {};

    // Function to save habits to local storage
    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }

    // Function to save daily progress to local storage
    function saveDailyProgress() {
        localStorage.setItem('dailyProgress', JSON.stringify(dailyProgress));
    }

    // Function to add a habit to the container
    function addHabitToDOM(habit, habitIndex) {
        const habitDiv = document.createElement('div');
        habitDiv.classList.add('habit');

        const habitInfoDiv = document.createElement('div');
        habitInfoDiv.classList.add('habit-info');

        const habitNameSpan = document.createElement('span');
        habitNameSpan.textContent = `${habit.name} (${habit.timeframe})`;

        const counterSpan = document.createElement('span');
        counterSpan.classList.add('counter');
        counterSpan.textContent = `${habit.currentCount} / ${habit.goal}`;

        habitInfoDiv.appendChild(habitNameSpan);
        habitInfoDiv.appendChild(document.createElement('br'));
        habitInfoDiv.appendChild(counterSpan);

        const markDoneButton = document.createElement('button');
        markDoneButton.classList.add('mark-done');
        markDoneButton.textContent = habit.currentCount >= habit.goal ? 'Goal Reached!' : 'Mark One Done';
        markDoneButton.disabled = habit.currentCount >= habit.goal;

        // Function to update the count when "Mark One Done" is clicked
        markDoneButton.addEventListener('click', function() {
            if (habit.currentCount < habit.goal) {
                habit.currentCount++;
                counterSpan.textContent = `${habit.currentCount} / ${habit.goal}`;

                if (habit.currentCount >= habit.goal) {
                    markDoneButton.disabled = true;
                    markDoneButton.textContent = 'Goal Reached!';
                }

                // Save updated habit progress
                saveHabits();

                // Update daily progress
                const todayKey = today.toISOString().split('T')[0];
                if (!dailyProgress[todayKey]) {
                    dailyProgress[todayKey] = [];
                }
                dailyProgress[todayKey][habitIndex] = habit.currentCount;
                saveDailyProgress();

                updateDailySummary();
                updateWeeklySummary();
                updateMonthlySummary();
            }
        });

        habitDiv.appendChild(habitInfoDiv);
        habitDiv.appendChild(markDoneButton);
        habitContainer.appendChild(habitDiv);
    }

    // Function to add a new habit
    addHabitButton.addEventListener('click', function() {
        const habitName = habitNameInput.value.trim();
        const habitGoal = parseInt(habitGoalInput.value);
        const habitTimeframe = habitTimeframeInput.value;

        if (habitName && habitGoal > 0) {
            const newHabit = {
                name: habitName,
                goal: habitGoal,
                timeframe: habitTimeframe,
                currentCount: 0
            };

            habits.push(newHabit);
            saveHabits();
            addHabitToDOM(newHabit, habits.length - 1);

            habitNameInput.value = '';
            habitGoalInput.value = '';

            updateDailySummary();
            updateWeeklySummary();
            updateMonthlySummary();
        } else {
            alert('Please enter a valid habit name and goal count.');
        }
    });

    // Function to update the daily summary
    function updateDailySummary() {
        const todayKey = today.toISOString().split('T')[0];
        summaryContainer.innerHTML = '';

        if (dailyProgress[todayKey]) {
            dailyProgress[todayKey].forEach((count, index) => {
                const summaryDiv = document.createElement('div');
                summaryDiv.classList.add('summary-item');
                summaryDiv.textContent = `${habits[index].name}: ${count} / ${habits[index].goal}`;
                summaryContainer.appendChild(summaryDiv);
            });
        }
    }

    // Function to update the weekly summary
    function updateWeeklySummary() {
        const todayKey = today.toISOString().split('T')[0];
        const pastWeek = Object.keys(dailyProgress)
            .filter(date => {
                const dayDiff = (new Date(todayKey) - new Date(date)) / (1000 * 60 * 60 * 24);
                return dayDiff >= 0 && dayDiff < 7;
            });

        weeklySummaryContainer.innerHTML = '';
        if (pastWeek.length > 0) {
            habits.forEach((habit, index) => {
                let weeklyTotal = 0;
                pastWeek.forEach(date => {
                    if (dailyProgress[date] && dailyProgress[date][index] !== undefined) {
                        weeklyTotal += dailyProgress[date][index];
                    }
                });

                const weeklySummaryDiv = document.createElement('div');
                weeklySummaryDiv.classList.add('summary-item');
                weeklySummaryDiv.textContent = `${habit.name}: ${weeklyTotal} times in the last 7 days`;
                weeklySummaryContainer.appendChild(weeklySummaryDiv);
            });
        }
    }

    // Function to update the monthly summary
    function updateMonthlySummary() {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        monthlySummaryContainer.innerHTML = '';

        habits.forEach((habit, index) => {
            let monthlyTotal = 0;
            for (let date in dailyProgress) {
                const progressDate = new Date(date);
                if (progressDate.getFullYear() === currentYear && progressDate.getMonth() === currentMonth) {
                    if (dailyProgress[date][index] !== undefined) {
                        monthlyTotal += dailyProgress[date][index];
                    }
                }
            }

            const monthlySummaryDiv = document.createElement('div');
            monthlySummaryDiv.classList.add('summary-item');
            monthlySummaryDiv.textContent = `${habit.name}: ${monthlyTotal} times this month`;
            monthlySummaryContainer.appendChild(monthlySummaryDiv);
        });
    }

    // Load existing habits into the DOM
    habits.forEach((habit, index) => {
        addHabitToDOM(habit, index);
    });

    // Load and update summaries
    updateDailySummary();
    updateWeeklySummary();
    updateMonthlySummary();
});
