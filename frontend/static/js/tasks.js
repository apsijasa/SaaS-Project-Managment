// frontend/static/js/tasks.js

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const tasksList = document.getElementById('tasks-list');
    const taskForm = document.getElementById('task-form');
    const subtasksList = document.getElementById('subtasks-list');
    const subtaskForm = document.getElementById('subtask-form');
    
    // Modales
    const modalCreateTask = document.getElementById('modal-create-task');
    const modalEditTask = document.getElementById('modal-edit-task');
    const modalCreateSubtask = document.getElementById('modal-create-subtask');
    const btnAddTask = document.getElementById('btn-add-task');
    const btnCancelTask = document.getElementById('btn-cancel-task');
    const btnSaveTask = document.getElementById('btn-save-task');
    const btnCancelEditTask = document.getElementById('btn-cancel-edit-task');
    const btnUpdateTask = document.getElementById('btn-update-task');
    const btnAddSubtask = document.getElementById('btn-add-subtask');
    const btnCancelSubtask = document.getElementById('btn-cancel-subtask');
    const btnSaveSubtask = document.getElementById('btn-save-subtask');
    
    // IDs actuales
    let currentProjectId = null;
    let currentTaskId = null;
    
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
                const error = await response.json();
                throw new Error(error.error || `Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            showNotification(error.message || 'Error al comunicarse con el servidor', 'error');
            return null;
        }
    }
    
    // Función para mostrar notificaciones
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Añadir clase para mostrar con animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Eliminar después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    // Función para inicializar la página de tareas
    function initTasksPage() {
        // Obtener ID del proyecto de la URL
        const urlParams = new URLSearchParams(window.location.search);
        currentProjectId = urlParams.get('project_id');
        
        if (currentProjectId) {
            // Cargar tareas del proyecto
            loadProjectTasks(currentProjectId);
            
            // Configurar botón para añadir tareas
            if (btnAddTask) {
                btnAddTask.addEventListener('click', function() {
                    openCreateTaskModal();
                });
            }
            
            // Configurar formulario de creación de tareas
            if (taskForm) {
                taskForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    createTask();
                });
            }
            
            // Configurar formulario de edición de tareas
            if (document.getElementById('edit-task-form')) {
                document.getElementById('edit-task-form').addEventListener('submit', function(e) {
                    e.preventDefault();
                    updateTask();
                });
            }
            
            // Configurar formulario de creación de subtareas
            if (subtaskForm) {
                subtaskForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    createSubtask();
                });
            }
        } else {
            // Si no hay ID de proyecto, mostrar todas las tareas del usuario
            loadAllTasks();
        }
        
        // Configurar botones de cancelar en modales
        const cancelButtons = document.querySelectorAll('.btn-cancel');
        cancelButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    closeModal(modal);
                }
            });
        });
        
        // Cerrar modales al hacer clic fuera de ellos
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                closeModal(e.target);
            }
        });
    }
    
    // Función para cargar tareas de un proyecto
    async function loadProjectTasks(projectId) {
        try {
            const data = await fetchAPI(`/projects/${projectId}/tasks`);
            
            if (data && data.tasks) {
                // Actualizar título de la página
                const projectTitle = document.getElementById('project-title');
                if (projectTitle) {
                    projectTitle.textContent = `Tareas del Proyecto: ${data.project?.name || 'Proyecto'}`;
                }
                
                // Renderizar lista de tareas
                renderTasksList(data.tasks);
            }
        } catch (error) {
            console.error('Error loading project tasks:', error);
            showNotification('Error al cargar las tareas del proyecto', 'error');
        }
    }
    
    // Función para cargar todas las tareas del usuario
    async function loadAllTasks() {
        try {
            const data = await fetchAPI('/tasks');
            
            if (data && data.tasks) {
                // Actualizar título de la página
                const pageTitle = document.getElementById('page-title');
                if (pageTitle) {
                    pageTitle.textContent = 'Mis Tareas';
                }
                
                // Renderizar lista de tareas
                renderTasksList(data.tasks);
            }
        } catch (error) {
            console.error('Error loading all tasks:', error);
            showNotification('Error al cargar las tareas', 'error');
        }
    }
    
    // Función para renderizar lista de tareas
    function renderTasksList(tasks) {
        if (!tasksList) return;
        
        // Limpiar lista
        tasksList.innerHTML = '';
        
        if (tasks.length === 0) {
            tasksList.innerHTML = '<tr><td colspan="6" class="text-center">No hay tareas disponibles</td></tr>';
            return;
        }
        
        // Crear fila para cada tarea
        tasks.forEach(task => {
            const row = createTaskRow(task);
            tasksList.appendChild(row);
        });
    }
    
    // Función para crear fila de tarea
    function createTaskRow(task) {
        const row = document.createElement('tr');
        row.dataset.id = task.id;
        
        const startDate = new Date(task.start_date).toLocaleDateString();
        const endDate = new Date(task.end_date).toLocaleDateString();
        
        row.innerHTML = `
            <td>
                <div class="task-name">${task.name}</div>
                <div class="subtasks-count">${task.subtasks_count || 0} subtareas</div>
            </td>
            <td>
                <div class="task-assignee">
                    ${task.assignee_name ? 
                        `<div class="assignee-avatar">${getInitials(task.assignee_name)}</div>
                        ${task.assignee_name}` : 
                        '<span class="text-light">Sin asignar</span>'}
                </div>
            </td>
            <td>${startDate} - ${endDate}</td>
            <td>
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${task.progress}%;"></div>
                    </div>
                    <span>${task.progress}%</span>
                </div>
            </td>
            <td>$${(task.budget || 0).toLocaleString('es-ES')}</td>
            <td>
                <div class="task-actions">
                    <button class="btn btn-sm btn-light" data-action="view" data-id="${task.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-light" data-action="edit" data-id="${task.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-light" data-action="delete" data-id="${task.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Configurar botones de acción
        const actionButtons = row.querySelectorAll('button[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.dataset.action;
                const taskId = this.dataset.id;
                
                if (action === 'view') {
                    viewTask(taskId);
                } else if (action === 'edit') {
                    openEditTaskModal(taskId);
                } else if (action === 'delete') {
                    confirmDeleteTask(taskId);
                }
            });
        });
        
        return row;
    }
    
    // Función para obtener iniciales de un nombre
    function getInitials(name) {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase();
    }
    
    // Función para abrir modal de creación de tarea
    function openCreateTaskModal() {
        if (!modalCreateTask) return;
        
        // Limpiar formulario
        if (taskForm) {
            taskForm.reset();
            
            // Establecer fecha de inicio como hoy
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('task-start-date').value = today;
            
            // Calcular fecha de fin por defecto (hoy + 7 días)
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            document.getElementById('task-end-date').value = nextWeek.toISOString().split('T')[0];
        }
        
        // Cargar participantes para el selector
        loadParticipantsForSelect();
        
        // Abrir modal
        modalCreateTask.classList.add('active');
    }
    
    // Función para abrir modal de edición de tarea
    async function openEditTaskModal(taskId) {
        if (!modalEditTask) return;
        
        try {
            // Obtener datos de la tarea
            const data = await fetchAPI(`/tasks/${taskId}`);
            
            if (data && data.task) {
                const task = data.task;
                currentTaskId = task.id;
                
                // Llenar formulario con datos de la tarea
                document.getElementById('edit-task-name').value = task.name;
                document.getElementById('edit-task-description').value = task.description || '';
                document.getElementById('edit-task-start-date').value = task.start_date;
                document.getElementById('edit-task-end-date').value = task.end_date;
                document.getElementById('edit-task-budget').value = task.budget || 0;
                document.getElementById('edit-task-progress').value = task.progress || 0;
                
                // Actualizar el valor mostrado del progreso
                document.getElementById('progress-value').textContent = `${task.progress || 0}%`;
                
                // Cargar participantes para el selector
                await loadParticipantsForSelect('edit-task-assignee');
                
                // Seleccionar el participante asignado
                if (task.assignee_id) {
                    document.getElementById('edit-task-assignee').value = task.assignee_id;
                }
                
                // Abrir modal
                modalEditTask.classList.add('active');
                
                // Cargar subtareas si las hay
                if (subtasksList) {
                    loadSubtasks(task.id);
                }
            }
        } catch (error) {
            console.error('Error loading task data:', error);
            showNotification('Error al cargar los datos de la tarea', 'error');
        }
    }
    
    // Función para cargar participantes para el selector
    async function loadParticipantsForSelect(selectId = 'task-assignee') {
        const selectElement = document.getElementById(selectId);
        if (!selectElement || !currentProjectId) return;
        
        try {
            // Obtener participantes del proyecto
            const data = await fetchAPI(`/projects/${currentProjectId}/participants`);
            
            if (data && data.participants) {
                // Limpiar selector
                selectElement.innerHTML = '<option value="">Seleccionar participante</option>';
                
                // Añadir opciones para cada participante
                data.participants.forEach(participant => {
                    const option = document.createElement('option');
                    option.value = participant.id;
                    option.textContent = participant.name;
                    selectElement.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading participants:', error);
        }
    }
    
    // Función para cargar subtareas
    async function loadSubtasks(taskId) {
        if (!subtasksList) return;
        
        try {
            // Obtener subtareas
            const data = await fetchAPI(`/tasks/${taskId}/subtasks`);
            
            if (data && data.subtasks) {
                // Limpiar lista
                subtasksList.innerHTML = '';
                
                if (data.subtasks.length === 0) {
                    subtasksList.innerHTML = '<tr><td colspan="5" class="text-center">No hay subtareas disponibles</td></tr>';
                    return;
                }
                
                // Crear fila para cada subtarea
                data.subtasks.forEach(subtask => {
                    const row = createSubtaskRow(subtask);
                    subtasksList.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error loading subtasks:', error);
            showNotification('Error al cargar las subtareas', 'error');
        }
    }
    
    // Función para crear fila de subtarea
    function createSubtaskRow(subtask) {
        const row = document.createElement('tr');
        row.dataset.id = subtask.id;
        
        const startDate = new Date(subtask.start_date).toLocaleDateString();
        const endDate = new Date(subtask.end_date).toLocaleDateString();
        
        row.innerHTML = `
            <td>${subtask.name}</td>
            <td>${startDate} - ${endDate}</td>
            <td>
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${subtask.progress}%;"></div>
                    </div>
                    <span>${subtask.progress}%</span>
                </div>
            </td>
            <td>$${(subtask.budget || 0).toLocaleString('es-ES')}</td>
            <td>
                <div class="task-actions">
                    <button class="btn btn-sm btn-light" data-action="edit-subtask" data-id="${subtask.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-light" data-action="delete-subtask" data-id="${subtask.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Configurar botones de acción
        const actionButtons = row.querySelectorAll('button[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.dataset.action;
                const subtaskId = this.dataset.id;
                
                if (action === 'edit-subtask') {
                    openEditSubtaskModal(subtaskId);
                } else if (action === 'delete-subtask') {
                    confirmDeleteSubtask(subtaskId);
                }
            });
        });
        
        return row;
    }
    
    // Función para crear una nueva tarea
    async function createTask() {
        const name = document.getElementById('task-name').value;
        const description = document.getElementById('task-description').value;
        const startDate = document.getElementById('task-start-date').value;
        const endDate = document.getElementById('task-end-date').value;
        const assigneeId = document.getElementById('task-assignee').value;
        const budget = document.getElementById('task-budget').value;
        
        // Validar datos
        if (!name || !startDate || !endDate) {
            showNotification('Por favor, completa los campos requeridos', 'error');
            return;
        }
        
        // Validar fechas
        if (new Date(startDate) > new Date(endDate)) {
            showNotification('La fecha de inicio debe ser anterior a la fecha de fin', 'error');
            return;
        }
        
        // Crear objeto con datos de la tarea
        const taskData = {
            name,
            description,
            start_date: startDate,
            end_date: endDate,
            budget: budget || 0
        };
        
        // Añadir asignado si se seleccionó
        if (assigneeId) {
            taskData.assignee_id = assigneeId;
        }
        
        try {
            // Enviar solicitud a la API
            const response = await fetchAPI(`/projects/${currentProjectId}/tasks`, 'POST', taskData);
            
            if (response) {
                // Cerrar modal
                closeModal(modalCreateTask);
                
                // Recargar lista de tareas
                loadProjectTasks(currentProjectId);
                
                // Mostrar notificación
                showNotification('Tarea creada exitosamente');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            showNotification('Error al crear la tarea', 'error');
        }
    }
    
    // Función para actualizar una tarea
    async function updateTask() {
        if (!currentTaskId) return;
        
        const name = document.getElementById('edit-task-name').value;
        const description = document.getElementById('edit-task-description').value;
        const startDate = document.getElementById('edit-task-start-date').value;
        const endDate = document.getElementById('edit-task-end-date').value;
        const assigneeId = document.getElementById('edit-task-assignee').value;
        const budget = document.getElementById('edit-task-budget').value;
        const progress = document.getElementById('edit-task-progress').value;
        
        // Validar datos
        if (!name || !startDate || !endDate) {
            showNotification('Por favor, completa los campos requeridos', 'error');
            return;
        }
        
        // Validar fechas
        if (new Date(startDate) > new Date(endDate)) {
            showNotification('La fecha de inicio debe ser anterior a la fecha de fin', 'error');
            return;
        }
        
        // Crear objeto con datos de la tarea
        const taskData = {
            name,
            description,
            start_date: startDate,
            end_date: endDate,
            budget: budget || 0,
            progress: progress || 0
        };
        
        // Añadir asignado si se seleccionó
        if (assigneeId) {
            taskData.assignee_id = assigneeId;
        }
        
        try {
            // Enviar solicitud a la API
            const response = await fetchAPI(`/tasks/${currentTaskId}`, 'PUT', taskData);
            
            if (response) {
                // Cerrar modal
                closeModal(modalEditTask);
                
                // Recargar lista de tareas
                loadProjectTasks(currentProjectId);
                
                // Mostrar notificación
                showNotification('Tarea actualizada exitosamente');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            showNotification('Error al actualizar la tarea', 'error');
        }
    }
    
    // Función para confirmar eliminación de tarea
    function confirmDeleteTask(taskId) {
        if (confirm('¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.')) {
            deleteTask(taskId);
        }
    }
    
    // Función para eliminar una tarea
    async function deleteTask(taskId) {
        try {
            // Enviar solicitud a la API
            const response = await fetchAPI(`/tasks/${taskId}`, 'DELETE');
            
            if (response) {
                // Recargar lista de tareas
                loadProjectTasks(currentProjectId);
                
                // Mostrar notificación
                showNotification('Tarea eliminada exitosamente');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            showNotification('Error al eliminar la tarea', 'error');
        }
    }
    
    // Función para abrir modal de creación de subtarea
    function openCreateSubtaskModal() {
        if (!modalCreateSubtask || !currentTaskId) return;
        
        // Limpiar formulario
        if (subtaskForm) {
            subtaskForm.reset();
            
            // Establecer fecha de inicio como hoy
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('subtask-start-date').value = today;
            
            // Calcular fecha de fin por defecto (hoy + 3 días)
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 3);
            document.getElementById('subtask-end-date').value = nextWeek.toISOString().split('T')[0];
        }
        
        // Abrir modal
        modalCreateSubtask.classList.add('active');
    }
    
    // Función para crear una nueva subtarea
    async function createSubtask() {
        if (!currentTaskId) return;
        
        const name = document.getElementById('subtask-name').value;
        const description = document.getElementById('subtask-description').value;
        const startDate = document.getElementById('subtask-start-date').value;
        const endDate = document.getElementById('subtask-end-date').value;
        const budget = document.getElementById('subtask-budget').value;
        
        // Validar datos
        if (!name || !startDate || !endDate) {
            showNotification('Por favor, completa los campos requeridos', 'error');
            return;
        }
        
        // Validar fechas
        if (new Date(startDate) > new Date(endDate)) {
            showNotification('La fecha de inicio debe ser anterior a la fecha de fin', 'error');
            return;
        }
        
        // Crear objeto con datos de la subtarea
        const subtaskData = {
            name,
            description,
            start_date: startDate,
            end_date: endDate,
            budget: budget || 0,
            progress: 0
        };
        
        try {
            // Enviar solicitud a la API
            const response = await fetchAPI(`/tasks/${currentTaskId}/subtasks`, 'POST', subtaskData);
            
            if (response) {
                // Cerrar modal
                closeModal(modalCreateSubtask);
                
                // Recargar lista de subtareas
                loadSubtasks(currentTaskId);
                
                // Mostrar notificación
                showNotification('Subtarea creada exitosamente');
            }
        } catch (error) {
            console.error('Error creating subtask:', error);
            showNotification('Error al crear la subtarea', 'error');
        }
    }
    
    // Función para abrir modal de edición de subtarea
    async function openEditSubtaskModal(subtaskId) {
        // Implementar cuando se cree el modal de edición de subtareas
        showNotification('Función en desarrollo', 'info');
    }
    
    // Función para confirmar eliminación de subtarea
    function confirmDeleteSubtask(subtaskId) {
        if (confirm('¿Estás seguro de que deseas eliminar esta subtarea? Esta acción no se puede deshacer.')) {
            deleteSubtask(subtaskId);
        }
    }
    
    // Función para eliminar una subtarea
    async function deleteSubtask(subtaskId) {
        try {
            // Enviar solicitud a la API
            const response = await fetchAPI(`/subtasks/${subtaskId}`, 'DELETE');
            
            if (response) {
                // Recargar lista de subtareas
                loadSubtasks(currentTaskId);
                
                // Mostrar notificación
                showNotification('Subtarea eliminada exitosamente');
            }
        } catch (error) {
            console.error('Error deleting subtask:', error);
            showNotification('Error al eliminar la subtarea', 'error');
        }
    }
    
    // Función para ver detalles de una tarea
    function viewTask(taskId) {
        // Redirigir a la página de detalles de la tarea o implementar vista detallada
        window.location.href = `/tasks/${taskId}`;
    }
    
    // Función para cerrar un modal
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // Inicializar página de tareas
    initTasksPage();
    
    // Configurar slider de progreso
    const progressSlider = document.getElementById('edit-task-progress');
    const progressValue = document.getElementById('progress-value');
    if (progressSlider && progressValue) {
        progressSlider.addEventListener('input', function() {
            progressValue.textContent = `${this.value}%`;
        });
    }
    
    // Configurar botón para añadir subtarea
    if (btnAddSubtask) {
        btnAddSubtask.addEventListener('click', function() {
            openCreateSubtaskModal();
        });
    }
});