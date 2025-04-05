// frontend/static/js/dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const userInitials = document.getElementById('user-initials');
    const userName = document.getElementById('user-name');
    
    // Estadísticas del dashboard
    const projectsCount = document.getElementById('projects-count');
    const tasksCount = document.getElementById('tasks-count');
    const milestonesCount = document.getElementById('milestones-count');
    const overdueCount = document.getElementById('overdue-count');
    
    // Listas en el dashboard
    const recentProjects = document.getElementById('recent-projects');
    const pendingTasks = document.getElementById('pending-tasks');
    const upcomingMilestones = document.getElementById('upcoming-milestones');
    const recentActivity = document.getElementById('recent-activity');
    
    // Configuración de la API
    const API_URL = '/api';
    const token = localStorage.getItem('token');
    
    // Función para realizar solicitudes a la API
    async function fetchAPI(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    }
    
    // Función para inicializar el dashboard
    async function initDashboard() {
        // Cargar información del usuario
        loadUserInfo();
        
        // Cargar estadísticas
        await loadStatistics();
        
        // Cargar proyectos recientes
        await loadRecentProjects();
        
        // Cargar tareas pendientes
        await loadPendingTasks();
        
        // Cargar próximos hitos
        await loadUpcomingMilestones();
        
        // Cargar actividad reciente
        await loadRecentActivity();
    }
    
    // Función para cargar información del usuario
    function loadUserInfo() {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (user && userInitials && userName) {
            // Mostrar iniciales del usuario
            const nameParts = user.name.split(' ');
            const initials = nameParts.map(part => part.charAt(0)).join('');
            userInitials.textContent = initials;
            
            // Mostrar nombre del usuario
            userName.textContent = user.name;
        }
    }
    
    // Función para cargar estadísticas
    async function loadStatistics() {
        try {
            // En un caso real, obtendríamos estos datos de la API
            // Por ahora, usamos datos de ejemplo
            /*
            const stats = await fetchAPI('/statistics');
            
            if (stats) {
                projectsCount.textContent = stats.projects;
                tasksCount.textContent = stats.tasks;
                milestonesCount.textContent = stats.milestones;
                overdueCount.textContent = stats.overdue;
            }
            */
            
            // Simulación de carga de datos
            setTimeout(() => {
                if (projectsCount) projectsCount.textContent = '8';
                if (tasksCount) tasksCount.textContent = '24';
                if (milestonesCount) milestonesCount.textContent = '5';
                if (overdueCount) overdueCount.textContent = '3';
            }, 500);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }
    
    // Función para cargar proyectos recientes
    async function loadRecentProjects() {
        try {
            // En un caso real, obtendríamos estos datos de la API
            // Por ahora, no hacemos nada ya que los datos están en el HTML estático
            /*
            const projects = await fetchAPI('/projects?limit=3');
            
            if (projects && projects.length > 0) {
                // Limpiar contenedor
                recentProjects.innerHTML = '';
                
                // Crear elementos para cada proyecto
                projects.forEach(project => {
                    const projectElement = createProjectElement(project);
                    recentProjects.appendChild(projectElement);
                });
            }
            */
        } catch (error) {
            console.error('Error loading recent projects:', error);
        }
    }
    
    // Función para crear elemento de proyecto
    function createProjectElement(project) {
        const projectElement = document.createElement('a');
        projectElement.href = `/projects/${project.id}`;
        projectElement.className = 'project-card';
        
        projectElement.innerHTML = `
            <h4>${project.name}</h4>
            <p>${project.description}</p>
            <div class="project-info">
                <div class="project-dates">${formatDate(project.start_date)} - ${formatDate(project.end_date)}</div>
                <div class="project-progress">${project.progress}%</div>
            </div>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${project.progress}%;"></div>
            </div>
        `;
        
        return projectElement;
    }
    
    // Función para cargar tareas pendientes
    async function loadPendingTasks() {
        try {
            // En un caso real, obtendríamos estos datos de la API
            // Por ahora, no hacemos nada ya que los datos están en el HTML estático
            /*
            const tasks = await fetchAPI('/tasks?status=pending&limit=4');
            
            if (tasks && tasks.length > 0) {
                // Limpiar contenedor
                pendingTasks.innerHTML = '';
                
                // Crear elementos para cada tarea
                tasks.forEach(task => {
                    const taskElement = createTaskElement(task);
                    pendingTasks.appendChild(taskElement);
                });
            }
            */
        } catch (error) {
            console.error('Error loading pending tasks:', error);
        }
    }
    
    // Función para crear elemento de tarea
    function createTaskElement(task) {
        const taskElement = document.createElement('li');
        taskElement.className = 'task-item';
        
        taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox">
            <div class="task-content">
                <h4 class="task-title">${task.name}</h4>
                <div class="task-meta">
                    <div class="task-date"><i class="fas fa-calendar"></i> ${formatDate(task.end_date)}</div>
                    <div class="task-assignee">
                        <img src="/static/images/avatar.jpg" alt="Avatar">
                        ${task.assignee_name}
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <div class="task-action-btn" data-id="${task.id}" data-action="edit">
                    <i class="fas fa-edit"></i>
                </div>
                <div class="task-action-btn" data-id="${task.id}" data-action="delete">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        `;
        
        return taskElement;
    }
    
    // Función para cargar próximos hitos
    async function loadUpcomingMilestones() {
        try {
            // En un caso real, obtendríamos estos datos de la API
            // Por ahora, no hacemos nada ya que los datos están en el HTML estático
            /*
            const milestones = await fetchAPI('/milestones?upcoming=true&limit=3');
            
            if (milestones && milestones.length > 0) {
                // Limpiar contenedor
                upcomingMilestones.innerHTML = '';
                
                // Crear elementos para cada hito
                milestones.forEach(milestone => {
                    const milestoneElement = createMilestoneElement(milestone);
                    upcomingMilestones.appendChild(milestoneElement);
                });
            }
            */
        } catch (error) {
            console.error('Error loading upcoming milestones:', error);
        }
    }
    
    // Función para crear elemento de hito
    function createMilestoneElement(milestone) {
        const milestoneElement = document.createElement('li');
        milestoneElement.className = 'task-item';
        
        milestoneElement.innerHTML = `
            <div class="task-content">
                <h4 class="task-title">${milestone.name}</h4>
                <div class="task-meta">
                    <div class="task-date"><i class="fas fa-calendar"></i> ${formatDate(milestone.date)}</div>
                    <div class="task-assignee">
                        <i class="fas fa-user"></i> Proyecto: ${milestone.project_name}
                    </div>
                </div>
            </div>
        `;
        
        return milestoneElement;
    }
    
    // Función para cargar actividad reciente
    async function loadRecentActivity() {
        try {
            // En un caso real, obtendríamos estos datos de la API
            // Por ahora, no hacemos nada ya que los datos están en el HTML estático
            /*
            const activities = await fetchAPI('/activities?limit=4');
            
            if (activities && activities.length > 0) {
                // Limpiar contenedor
                recentActivity.innerHTML = '';
                
                // Crear elementos para cada actividad
                activities.forEach(activity => {
                    const activityElement = createActivityElement(activity);
                    recentActivity.appendChild(activityElement);
                });
            }
            */
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }
    
    // Función para crear elemento de actividad
    function createActivityElement(activity) {
        const activityElement = document.createElement('li');
        activityElement.className = 'task-item';
        
        activityElement.innerHTML = `
            <div class="task-content">
                <h4 class="task-title">${activity.description}</h4>
                <div class="task-meta">
                    <div class="task-date"><i class="fas fa-clock"></i> ${formatTimeAgo(activity.created_at)}</div>
                </div>
            </div>
        `;
        
        return activityElement;
    }
    
    // Función para formatear fechas
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
    
    // Función para formatear tiempo relativo
    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffSeconds < 60) {
            return 'Hace unos segundos';
        } else if (diffMinutes < 60) {
            return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
        } else if (diffHours < 24) {
            return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
        } else if (diffDays < 7) {
            return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
        } else {
            return formatDate(dateString);
        }
    }
    
    // Manejar clic en el toggle del sidebar (versión móvil)
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Manejar cambios en el tamaño de la ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            sidebar.classList.remove('active');
            if (sidebarToggle) sidebarToggle.classList.remove('active');
        }
    });
    
    // Manejar clic en los checkboxes de tareas
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('task-checkbox')) {
            const taskItem = e.target.closest('.task-item');
            
            // En un caso real, enviaríamos esta información a la API
            setTimeout(() => {
                taskItem.style.opacity = '0.5';
                taskItem.style.textDecoration = 'line-through';
            }, 300);
        }
    });
    
    // Manejar clic en los botones de acción de tareas
    document.addEventListener('click', function(e) {
        const actionBtn = e.target.closest('.task-action-btn');
        
        if (actionBtn) {
            const taskId = actionBtn.dataset.id;
            const action = actionBtn.dataset.action;
            
            if (action === 'edit') {
                // En un caso real, redirigir a la página de edición o mostrar modal
                console.log(`Edit task ${taskId}`);
            } else if (action === 'delete') {
                // En un caso real, mostrar confirmación y eliminar de la API
                console.log(`Delete task ${taskId}`);
                
                // Simulación de eliminación
                const taskItem = actionBtn.closest('.task-item');
                taskItem.style.opacity = '0';
                setTimeout(() => {
                    taskItem.remove();
                }, 300);
            }
        }
    });
    
    // Inicializar el dashboard
    initDashboard();
});