let tasks = [];
let editingId = null;

// Initialize data loading routine 
function loadData() {
    const saved = localStorage.getItem("codynnflowTasks");
    if (saved) {
        tasks = JSON.parse(saved);
    } else {
        // Base structure setup mocking default variables with precise deadline structures
        const baselineTime = new Date();
        tasks = [
            {
                id: 1,
                title: "Evaluate the addition and deletion of user IDs",
                status: "pending",
                priority: "minor",
                completed: false,
                deadline: new Date(baselineTime.getTime() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
            },
            {
                id: 2,
                title: "Identify the implementation team",
                status: "progress",
                priority: "normal",
                completed: false,
                deadline: new Date(baselineTime.getTime() + 48 * 60 * 60 * 1000).toISOString()
            }
        ];
    }
    updateGreeting();
    renderTasks();
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greet = "Good Morning";
    if (hour >= 12 && hour < 18) greet = "Good Afternoon";
    else if (hour >= 18) greet = "Good Evening";
    
    document.getElementById("greeting").textContent = `${greet}`;
}

function saveData() {
    localStorage.setItem("codynnflowTasks", JSON.stringify(tasks));
}

// Formats data inputs into easily readable user strings
function formatDeadline(isoString) {
    if (!isoString) return "";
    const dateObj = new Date(isoString);
    const now = new Date();
    
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formatted = dateObj.toLocaleDateString('en-US', options);
    
    const isOverdue = dateObj < now;
    return {
        text: formatted,
        isOverdue: isOverdue
    };
}

// Global UI renderer controlling DOM nodes arrays matching filtering parameters
function renderTasks(searchQuery = "") {
    const onHoldContainer = document.getElementById("onHoldTasks");
    const completedContainer = document.getElementById("completedTasks");

    // Filter by text search if matching elements
    const filteredTasks = tasks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onHold = filteredTasks.filter((t) => !t.completed);
    const completed = filteredTasks.filter((t) => t.completed);

    // Dynamic item construction blocks
    onHoldContainer.innerHTML = onHold.length ? onHold.map(t => {
        const deadlineInfo = formatDeadline(t.deadline);
        const overdueClass = (deadlineInfo.isOverdue && t.status !== 'completed') ? 'overdue text-danger' : '';
        
        return `
            <div class="task-item">
                <div class="task-checkbox" onclick="toggleTask(${t.id})"></div>
                <div class="task-content">
                    <div class="task-title">${t.title}</div>
                    <div class="deadline-badge ${overdueClass}">
                        <i class="far fa-calendar-alt"></i> Due: ${deadlineInfo.text || 'No deadline'}
                        ${deadlineInfo.isOverdue ? '<strong>(Overdue)</strong>' : ''}
                    </div>
                </div>
                <span class="status-badge status-${t.status}">
                    ${t.status === "progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
                <div class="priority-badge priority-${t.priority}">
                    <i class="fas fa-circle"></i> ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </div>
                <button class="icon-btn" style="width:34px;height:34px;" onclick="editTask(${t.id})">
                    <i class="fas fa-pen" style="font-size:12px;"></i>
                </button>
                <button class="icon-btn" style="width:34px;height:34px; color: #ef4444;" onclick="deleteTask(${t.id})">
                    <i class="fas fa-trash" style="font-size:12px;"></i>
                </button>
            </div>
        `;
    }).join("") : '<p style="color:#64748b; padding:10px; font-size:14px;">No active tasks found</p>';

    completedContainer.innerHTML = completed.length ? completed.map(t => {
        const deadlineInfo = formatDeadline(t.deadline);
        return `
            <div class="task-item">
                <div class="task-checkbox completed" onclick="toggleTask(${t.id})"></div>
                <div class="task-content">
                    <div class="task-title completed">${t.title}</div>
                    <div class="deadline-badge">
                        <i class="far fa-calendar-check"></i> Finished
                    </div>
                </div>
                <span class="status-badge status-completed">Completed</span>
                <div class="priority-badge priority-${t.priority}">
                    <i class="fas fa-circle"></i> ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </div>
                <button class="icon-btn" style="width:34px;height:34px;" onclick="editTask(${t.id})">
                    <i class="fas fa-pen" style="font-size:12px;"></i>
                </button>
                <button class="icon-btn" style="width:34px;height:34px; color: #ef4444;" onclick="deleteTask(${t.id})">
                    <i class="fas fa-trash" style="font-size:12px;"></i>
                </button>
            </div>
        `;
    }).join("") : '<p style="color:#64748b; padding:10px; font-size:14px;">No completed tasks yet</p>';

    // Update Numerical Dashboard Counters metrics
    const total = tasks.length;
    const completedCount = tasks.filter((t) => t.completed).length;
    const pending = total - completedCount;
    const rate = total ? Math.round((completedCount / total) * 100) : 0;

    document.getElementById("taskCount").textContent = pending;
    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedCount").textContent = completedCount;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("completionRateValue").textContent = rate + "%";
    document.getElementById("completionProgress").style.width = rate + "%";

    saveData();
}

function toggleTask(id) {
    const t = tasks.find((t) => t.id === id);
    if (t) {
        t.completed = !t.completed;
        t.status = t.completed ? "completed" : "pending";
        renderTasks();
    }
}

function deleteTask(id) {
    if (confirm("Are you sure you want to drop this item?")) {
        tasks = tasks.filter((t) => t.id !== id);
        renderTasks();
    }
}

function openModal() {
    document.getElementById("taskModal").classList.add("active");
}

function closeModal() {
    document.getElementById("taskModal").classList.remove("active");
    document.getElementById("taskForm").reset();
    editingId = null;
}

// Intercepts input capture formatting submission mutations
document.getElementById("taskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value;
    const status = document.getElementById("taskStatus").value;
    const priority = document.getElementById("taskPriority").value;
    const deadline = document.getElementById("taskDeadline").value; 

    if (editingId) {
        const t = tasks.find((t) => t.id === editingId);
        t.title = title;
        t.status = status;
        t.priority = priority;
        t.deadline = deadline ? new Date(deadline).toISOString() : t.deadline;
        t.completed = status === "completed";
    } else {
        tasks.push({
            id: Date.now(),
            title,
            status,
            priority,
            completed: status === "completed",
            deadline: deadline ? new Date(deadline).toISOString() : new Date().toISOString()
        });
    }
    renderTasks();
    closeModal();
});

function editTask(id) {
    editingId = id;
    const t = tasks.find((t) => t.id === id);
    if (t) {
        document.getElementById("taskTitle").value = t.title;
        document.getElementById("taskStatus").value = t.status;
        document.getElementById("taskPriority").value = t.priority;
        
        if(t.deadline) {
            // Converts timestamps into usable formats required for standard browser elements
            const localDate = new Date(t.deadline);
            localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
            document.getElementById("taskDeadline").value = localDate.toISOString().slice(0, 16);
        }
        openModal();
    }
}

// Attaches event listeners dynamically monitoring the search bar input changes
document.getElementById("searchInput").addEventListener("input", (e) => {
    renderTasks(e.target.value);
});

// Primary initiation loop
loadData();