// frontend/static/js/projects.js

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const projectTabs = document.querySelectorAll('.project-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const timelineViewOptions = document.querySelectorAll('.view-option');
    
    // Modales
    const modalCreateTask = document.getElementById('modal-create-task');
    const btnAddTask = document.getElementById('btn-add-task');
    const btnCancelTask = document.getElementById('btn-cancel-task');
    const btnSaveTask = document.getElementById('btn-save-task');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    // Botones para otras acciones
    const btnEditProject = document.getElementById('btn-edit-project');
    const btnAddMilestone = document.getElementById('btn-add-milestone');
    const btnAddMember = document.getElementById('btn-add-member');
    const btnAddMemberSidebar = document.getElementById('btn-add-member-sidebar');
    
    // Configuración de la API
    const API_URL = '/api';
    const token = localStorage.getItem('token');
    
    // ID del proyecto actual (en un caso real, se obtendría de la URL)
    const projectId = 1;
    
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
    
    // Función para inicializar la página de proyecto
    async function initProjectPage() {
        // Cargar detalles del proyecto
        await loadProjectDetails();
        
        // Cargar tareas del proyecto
        await loadProjectTasks();
        
        // Cargar hitos del proyecto
        await loadProjectMilestones();
        
        // Cargar equipo del proyecto
        await loadProjectTeam();
        
        // Cargar archivos del proyecto
        await loadProjectFiles();
    }
    
    // Función para cargar detalles del proyecto
    async function loadProjectDetails() {
        try {
            // En un caso real, obtendríamos estos datos de la API
            // Por ahora, usamos datos de ejemplo
            /*
            const project = await fetchAPI(`/projects/${projectId}`);
            
            if (project) {
                // Actualizar título del proyecto
                document.getElementById('project-name').textContent = project.name;
                document.getElementById('project-title').textContent = project.name;
                
                // Actualizar metadatos del proyecto
                document.getElementById('project-dates').innerHTML = `<i class="fas fa-calendar-alt"></i> ${formatDate(project.start_date)} - ${formatDate(project.end_date)}`;
                document.getElementById('project-progress').innerHTML = `<i class="fas fa-chart-line"></i> Progreso: ${project.progress}%`;
                document.getElementById('project-budget').innerHTML = `<i class="fas fa-dollar-sign"></i> Presupuesto: $${formatNumber(project.budget)}`;
                
                // Actualizar descripción del proyecto
                document.getElementById('project-description').textContent = project.description;
                
                // Actualizar barra de progreso
                const progressBars = document.querySelectorAll('.progress-bar-fill');
                progressBars.forEach(bar => {
                    bar.style.width = `${project.progress}%`;
                });
                
                // Actualizar porcentaje de progreso
                const progressPercentages = document.querySelectorAll('.progress-percentage, .percentage');
                progressPercentages.forEach(el => {
                    el.textContent = `${project.progress}%`;
                });
                
                // Actualizar círculo de progreso en SVG
                const circleElement = document.querySelector('.circle');
                if (circleElement) {
                    circleElement.setAttribute('stroke-dasharray', `${project.progress}, 100`);
                }
            }
            */
        } catch (error) {
            console.error('Error loading project details:', error);
        }
    }
    
    // Función para cargar tareas del proyecto
    async function loadProjectTasks() {
        try {
            // En un caso real, obtendríamos estos datos de la API
            // Por ahora, no hacemos nada ya que los datos están en el HTML estático
            /*
            const tasks = await fetchAPI(`/projects/${projectId}/tasks`);
            
            if (tasks && tasks.length > 0) {
                const tasksList = document.getElementById('tasks-list');
                
                // Limpiar lista de tareas
                tasksList.innerHTML = '';
                
                // Crear fila para cada tarea
                tasks.forEach(task => {
                    const taskRow = createTaskRow(task);
                    tasksList.appendChild(taskRow);
                });
            }
            */
        } catch (error) {
            console.error('Error loading project tasks:', error);
        }
    }
    
    // Función para crear fila de tarea
    function createTaskRow(task) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <div class="task-name">${task.name}</div>
                <div class="subtasks-count">${task.subtasks_count || 0} subtareas</div>
            </td>
            <td>
                <div class="task-assignee">
                    <img src="/static/images/avatar.jpg" alt="Avatar">
                    ${task.assignee_name || 'Sin asignar'}
                </div>
            </td>
            <td>${formatDate(task.start_date)} - ${formatDate(task.end_date)}</td>
            <td>
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${task.progress}%;"></div>
                    </div>
                    <span>${task.progress}%</span>
                </div>
            </td>
            <td>$${formatNumber(task.budget)}</td>
            <td>
                <div class="task-actions">
                    <button class="btn btn-sm btn-light" data-action="edit" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-light" data-action="delete" data-id="${task.id}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        return row;
    }
    
    // Función para cargar hitos del proyecto
    async function loadProjectMilestones() {
        try {
            // En un caso real, obtendríamos estos datos de la API
            // Por ahora, no hacemos nada ya que los datos están en el HTML estático
            /*
            const milestones = await fetchAPI(`/projects/${projectId}/milestones`);
            
            if (milestones && milestones.length > 0) {
                const milestonesList = document.getElementById('milestones-list');
                
                // Limpiar lista de hitos
                milestonesList.innerHTML = '';
                
                // Crear elemento para cada hito
                milestones.forEach(milestone => {
                    const milestoneItem = createMilestoneItem(milestone);
                    milestonesList.appendChild(milestoneItem);
                });
            }
            */
        } catch (error) {
            console.error('Error loading project milestones:', error);
        }
    }
    
    // Función para crear elemento de hito
    function createMilestoneItem(milestone) {
        const item = document.createElement('div');
        item.className = 'milestone-item';
        
        const status = milestone.completed ? 'completed' : 'pending';
        const statusText = milestone.completed ? 'Completado' : 'Pendiente';
        
        item.innerHTML = `
            <div class="milestone-date">${formatDate(milestone.date)}</div>
            <div class="milestone-content">
                <div class="milestone-icon">
                    <i class="fas fa-flag"></i>
                </div>
                <div class="milestone-info">
                    <h4>${milestone.name}</h4>
                    <div class="milestone-meta">
                        <div class="milestone-responsible">
                            <img src="/static/images/avatar.jpg" alt="Avatar">
                            ${milestone.responsible_name || 'Sin asignar'}
                        </div>
                        <div class="milestone-status ${status}">${statusText}</div>
                    </div>
                </div>
                <div class="milestone-actions">
                    <button class="btn btn-sm btn-light" data-action="edit" data-id="${milestone.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-light" data-action="delete" data-id="${milestone.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        return item;
    }
    
    // Función para cargar equipo del proyecto
    async function loadProjectTeam() {
        try {
            // En un caso real, obtendríamos estos datos de la API
            // Por ahora, no hacemos nada ya que los datos están en el HTML estático
            /*
            const team = await fetchAPI(`/projects/${projectId}/participants`);
            
            if (team && team.length > 0) {
                const teamMembers = document.getElementById('team-members');
                
                // Limpiar lista de miembros
                teamMembers.innerHTML = '';
                
                // Crear tarjeta para cada miembro
                team.forEach(member => {
                    const memberCard = createMemberCard(member);
                    teamMembers.appendChild(memberCard);
                });
            }
            */
        } catch (error) {
            console.error('Error loading project team:', error);
        }
    }
    
    // Función para crear tarjeta de miembro
    function createMemberCard(member) {
        const card = document.createElement('div');
        card.className = 'team-member-card';
        
        card.innerHTML = `
            <div class="member-avatar">
                <img src="/static/images/avatar.jpg" alt="Avatar">
            </div>
            <h4 class="member-name">${member.name}</h4>
            <div class="member-role ${member.role}">${capitalizeFirstLetter(member.role)}</div>
            <div class="member-stats">
                <div class="member-stat">
                    <div class="stat-value">${member.tasks_count || 0}</div>
                    <div class="stat-label">Tareas</div>
                </div>
                <div class="member-stat">
                    <div class="stat-value">${member.milestones_count || 0}</div>
                    <div class="stat-label">Hitos</div>
                </div>
            </div>
            <div class="member-actions">
                <button class="btn btn-sm btn-light"><i class="fas fa-envelope"></i></button>
                <button class="btn btn-sm btn-light" data-action="edit" data-id="${member.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-light" data-action="delete" data-id="${member.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        return card;
    }
    
    // Función para cargar archivos del proyecto
    async function loadProjectFiles() {
        try {
            // En un caso real, obtendríamos estos datos de la API
            // Por ahora, no hacemos nada ya que los datos están en el HTML estático
            /*
            const files = await fetchAPI(`/projects/${projectId}/files`);
            
            if (files && files.length > 0) {
                const filesList = document.getElementById('files-list');
                
                // Limpiar lista de archivos
                filesList.innerHTML = '';
                
                // Crear fila para cada archivo
                files.forEach(file => {
                    const fileRow = createFileRow(file);
                    filesList.appendChild(fileRow);
                });
            }
            */
        } catch (error) {
            console.error('Error loading project files:', error);
        }
    }
    
    // Función para crear fila de archivo
    function createFileRow(file) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <div class="file-info">
                    <i class="fas ${getFileIcon(file.type)}"></i>
                    <span>${file.name}</span>
                </div>
            </td>
            <td>${formatFileSize(file.size)}</td>
            <td>${file.uploaded_by}</td>
            <td>${formatDate(file.uploaded_at)}</td>
            <td>
                <div class="file-actions">
                    <button class="btn btn-sm btn-light" data-action="download" data-id="${file.id}"><i class="fas fa-download"></i></button>
                    <button class="btn btn-sm btn-light" data-action="delete" data-id="${file.id}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        return row;
    }
    
    // Función para determinar el icono según el tipo de archivo
    function getFileIcon(fileType) {
        const icons = {
            'image': 'fa-file-image',
            'pdf': 'fa-file-pdf',
            'document': 'fa-file-word',
            'spreadsheet': 'fa-file-excel',
            'presentation': 'fa-file-powerpoint',
            'archive': 'fa-file-archive',
            'code': 'fa-file-code',
            'text': 'fa-file-alt',
            'audio': 'fa-file-audio',
            'video': 'fa-file-video'
        };
        
        return icons[fileType] || 'fa-file';
    }
    
    // Función para formatear tamaño de archivo
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
    
    // Función para formatear números
    function formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Función para capitalizar primera letra
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Manejar el cambio de pestañas
    if (projectTabs.length > 0 && tabContents.length > 0) {
        projectTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remover clase active de todas las pestañas
                projectTabs.forEach(t => t.classList.remove('active'));
                
                // Añadir clase active a la pestaña actual
                this.classList.add('active');
                
                // Remover clase active de todos los contenidos
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Mostrar el contenido correspondiente
                const tabId = this.getAttribute('data-tab');
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    }
    
    // Manejar cambio de vista en la línea de tiempo
    if (timelineViewOptions.length > 0) {
        timelineViewOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remover clase active de todas las opciones
                timelineViewOptions.forEach(o => o.classList.remove('active'));
                
                // Añadir clase active a la opción actual
                this.classList.add('active');
                
                // En un caso real, actualizaríamos la vista de la línea de tiempo
                const view = this.getAttribute('data-view');
                console.log(`Changed timeline view to: ${view}`);
                
                // Aquí iría la lógica para actualizar el gráfico de Gantt
            });
        });
    }
    
    // Manejar clic en el toggle del sidebar (versión móvil)
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Manejar modal de creación de tarea
    if (btnAddTask && modalCreateTask) {
        // Abrir modal
        btnAddTask.addEventListener('click', function() {
            modalCreateTask.classList.add('active');
        });
        
        // Cerrar modal con botón cancelar
        if (btnCancelTask) {
            btnCancelTask.addEventListener('click', function() {
                modalCreateTask.classList.remove('active');
            });
        }
        
        // Cerrar modal con botón cerrar (X)
        modalCloseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Guardar tarea
        if (btnSaveTask) {
            btnSaveTask.addEventListener('click', async function() {
                // Obtener datos del formulario
                const name = document.getElementById('task-name').value;
                const description = document.getElementById('task-description').value;
                const startDate = document.getElementById('task-start-date').value;
                const endDate = document.getElementById('task-end-date').value;
                const assigneeId = document.getElementById('task-assignee').value;
                const budget = document.getElementById('task-budget').value;
                
                // Validar datos
                if (!name || !startDate || !endDate) {
                    alert('Por favor, completa los campos requeridos');
                    return;
                }
                
                // En un caso real, enviaríamos estos datos a la API
                /*
                try {
                    const response = await fetchAPI(`/projects/${projectId}/tasks`, 'POST', {
                        name,
                        description,
                        start_date: startDate,
                        end_date: endDate,
                        assignee_id: assigneeId || null,
                        budget: budget || 0
                    });
                    
                    if (response) {
                        // Cerrar modal
                        modalCreateTask.classList.remove('active');
                        
                        // Recargar tareas
                        await loadProjectTasks();
                        
                        // Limpiar formulario
                        document.getElementById('create-task-form').reset();
                    }
                } catch (error) {
                    console.error('Error creating task:', error);
                    alert('Error al crear la tarea. Por favor, inténtalo de nuevo.');
                }
                */
                
                // Simulación de creación exitosa
                console.log('Task created:', {
                    name,
                    description,
                    start_date: startDate,
                    end_date: endDate,
                    assignee_id: assigneeId,
                    budget
                });
                
                // Cerrar modal
                modalCreateTask.classList.remove('active');
                
                // Simular actualización de la lista
                setTimeout(() => {
                    alert('Tarea creada exitosamente');
                }, 500);
            });
        }
    }
    
    // Manejar acciones en tareas (editar, eliminar)
    document.addEventListener('click', function(e) {
        const button = e.target.closest('button[data-action]');
        
        if (button) {
            const action = button.getAttribute('data-action');
            const id = button.getAttribute('data-id');
            
            if (action === 'edit') {
                // En un caso real, abriríamos un modal de edición o redireccionaríamos
                console.log(`Edit item ${id}`);
                alert(`Editar elemento ID: ${id}`);
            } else if (action === 'delete') {
                // En un caso real, pediríamos confirmación y eliminaríamos de la API
                if (confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
                    console.log(`Delete item ${id}`);
                    
                    // Simulación de eliminación
                    const row = button.closest('tr');
                    if (row) {
                        row.style.opacity = '0';
                        setTimeout(() => {
                            row.remove();
                        }, 300);
                    } else {
                        const item = button.closest('.milestone-item, .team-member-card');
                        if (item) {
                            item.style.opacity = '0';
                            setTimeout(() => {
                                item.remove();
                            }, 300);
                        }
                    }
                }
            } else if (action === 'download') {
                // En un caso real, descargaríamos el archivo
                console.log(`Download file ${id}`);
                alert(`Descargando archivo ID: ${id}`);
            }
        }
    });
    
    // Manejar botón de editar proyecto
    if (btnEditProject) {
        btnEditProject.addEventListener('click', function() {
            // En un caso real, redireccionaríamos o abriríamos un modal
            console.log('Edit project');
            alert('Editar proyecto');
        });
    }
    
    // Manejar botón de añadir hito
    if (btnAddMilestone) {
        btnAddMilestone.addEventListener('click', function() {
            // En un caso real, abriríamos un modal
            console.log('Add milestone');
            alert('Añadir hito');
        });
    }
    
    // Manejar botones de añadir miembro
    if (btnAddMember) {
        btnAddMember.addEventListener('click', function() {
            // En un caso real, abriríamos un modal
            console.log('Add team member');
            alert('Añadir miembro al equipo');
        });
    }
    
    if (btnAddMemberSidebar) {
        btnAddMemberSidebar.addEventListener('click', function() {
            // En un caso real, abriríamos un modal
            console.log('Add team member (sidebar)');
            alert('Añadir miembro al equipo');
        });
    }
    
    // Cerrar modales al hacer clic fuera de ellos
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    // Inicializar la página de proyecto
    initProjectPage();
});