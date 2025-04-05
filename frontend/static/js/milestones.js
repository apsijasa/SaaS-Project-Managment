// frontend/static/js/milestones.js

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const milestonesList = document.getElementById('milestones-list');
    const milestoneForm = document.getElementById('milestone-form');
    
    // Modales
    const modalCreateMilestone = document.getElementById('modal-create-milestone');
    const modalEditMilestone = document.getElementById('modal-edit-milestone');
    const btnAddMilestone = document.getElementById('btn-add-milestone');
    const btnCancelMilestone = document.getElementById('btn-cancel-milestone');
    const btnSaveMilestone = document.getElementById('btn-save-milestone');
    const btnCancelEditMilestone = document.getElementById('btn-cancel-edit-milestone');
    const btnUpdateMilestone = document.getElementById('btn-update-milestone');
    
    // Variables de estado
    let currentProjectId = null;
    let currentMilestoneId = null;
    
    // Configuración de la API
    const API_URL = '/api';
    const token = localStorage.getItem('token');
    
    /**
     * Realiza una solicitud a la API
     * @param {string} endpoint - Endpoint de la API
     * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
     * @param {Object} body - Cuerpo de la solicitud para POST y PUT
     * @returns {Promise} Promesa con la respuesta de la API
     */
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
    
    /**
     * Muestra una notificación al usuario
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, info)
     */
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
    
    /**
     * Inicializa la página de hitos
     */
    function initMilestonesPage() {
        // Obtener ID del proyecto de la URL
        const urlParams = new URLSearchParams(window.location.search);
        currentProjectId = urlParams.get('project_id');
        
        if (currentProjectId) {
            // Cargar hitos del proyecto
            loadProjectMilestones(currentProjectId);
            
            // Configurar botón para añadir hitos
            if (btnAddMilestone) {
                btnAddMilestone.addEventListener('click', function() {
                    openCreateMilestoneModal();
                });
            }
            
            // Configurar formulario de creación de hitos
            if (milestoneForm) {
                milestoneForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    createMilestone();
                });
            }
            
            // Configurar formulario de edición de hitos
            if (document.getElementById('edit-milestone-form')) {
                document.getElementById('edit-milestone-form').addEventListener('submit', function(e) {
                    e.preventDefault();
                    updateMilestone();
                });
            }
        } else {
            // Si no hay ID de proyecto, mostrar mensaje
            if (milestonesList) {
                milestonesList.innerHTML = '<div class="no-data">No se ha seleccionado ningún proyecto.</div>';
            }
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
    
    /**
     * Carga los hitos de un proyecto
     * @param {string|number} projectId - ID del proyecto
     */
    async function loadProjectMilestones(projectId) {
        try {
            const data = await fetchAPI(`/projects/${projectId}/milestones`);
            
            if (data && data.milestones) {
                // Actualizar título de la página
                const projectTitle = document.getElementById('project-title');
                if (projectTitle) {
                    projectTitle.textContent = `Hitos del Proyecto: ${data.project?.name || 'Proyecto'}`;
                }
                
                // Renderizar lista de hitos
                renderMilestonesList(data.milestones);
            }
        } catch (error) {
            console.error('Error loading project milestones:', error);
            showNotification('Error al cargar los hitos del proyecto', 'error');
        }
    }
    
    /**
     * Renderiza la lista de hitos
     * @param {Array} milestones - Array de hitos
     */
    function renderMilestonesList(milestones) {
        if (!milestonesList) return;
        
        // Limpiar lista
        milestonesList.innerHTML = '';
        
        if (milestones.length === 0) {
            milestonesList.innerHTML = '<div class="no-data">No hay hitos disponibles para este proyecto.</div>';
            return;
        }
        
        // Ordenar hitos por fecha
        milestones.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Crear elemento para cada hito
        milestones.forEach(milestone => {
            const milestoneElement = createMilestoneElement(milestone);
            milestonesList.appendChild(milestoneElement);
        });
    }
    
    /**
     * Crea un elemento HTML para un hito
     * @param {Object} milestone - Datos del hito
     * @returns {HTMLElement} Elemento HTML del hito
     */
    function createMilestoneElement(milestone) {
        const element = document.createElement('div');
        element.className = `milestone-item ${milestone.completed ? 'completed' : ''}`;
        element.dataset.id = milestone.id;
        
        const milestoneDate = new Date(milestone.date);
        const today = new Date();
        
        // Determinar el estado del hito
        let status = '';
        let statusClass = '';
        
        if (milestone.completed) {
            status = 'Completado';
            statusClass = 'completed';
        } else if (milestoneDate < today) {
            status = 'Vencido';
            statusClass = 'overdue';
        } else {
            // Calcular días restantes
            const daysRemaining = Math.ceil((milestoneDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysRemaining <= 7) {
                status = `Próximo (${daysRemaining} días)`;
                statusClass = 'upcoming';
            } else {
                status = 'Pendiente';
                statusClass = 'pending';
            }
        }
        
        element.innerHTML = `
            <div class="milestone-date">${formatDate(milestoneDate)}</div>
            <div class="milestone-content">
                <div class="milestone-icon">
                    <i class="fas fa-flag"></i>
                </div>
                <div class="milestone-info">
                    <h4>${milestone.name}</h4>
                    <div class="milestone-meta">
                        <div class="milestone-responsible">
                            ${milestone.responsible_name ? 
                                `<div class="responsible-avatar">${getInitials(milestone.responsible_name)}</div>
                                ${milestone.responsible_name}` : 
                                '<span class="text-light">Sin asignar</span>'}
                        </div>
                        <div class="milestone-status ${statusClass}">${status}</div>
                    </div>
                    ${milestone.description ? `<div class="milestone-description">${milestone.description}</div>` : ''}
                </div>
                <div class="milestone-actions">
                    <button class="btn btn-sm btn-light" data-action="toggle" data-id="${milestone.id}">
                        <i class="fas ${milestone.completed ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                    </button>
                    <button class="btn btn-sm btn-light" data-action="edit" data-id="${milestone.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-light" data-action="delete" data-id="${milestone.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Configurar botones de acción
        const actionButtons = element.querySelectorAll('button[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.dataset.action;
                const milestoneId = this.dataset.id;
                
                if (action === 'toggle') {
                    toggleMilestoneStatus(milestoneId, !milestone.completed);
                } else if (action === 'edit') {
                    openEditMilestoneModal(milestoneId);
                } else if (action === 'delete') {
                    confirmDeleteMilestone(milestoneId);
                }
            });
        });
        
        return element;
    }
    
    /**
     * Obtiene las iniciales de un nombre
     * @param {string} name - Nombre completo
     * @returns {string} Iniciales del nombre
     */
    function getInitials(name) {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase();
    }
    
    /**
     * Formatea una fecha en formato legible
     * @param {Date} date - Fecha a formatear
     * @returns {string} Fecha formateada
     */
    function formatDate(date) {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    }
    
    /**
     * Abre el modal para crear un nuevo hito
     */
    function openCreateMilestoneModal() {
        if (!modalCreateMilestone) return;
        
        // Limpiar formulario
        if (milestoneForm) {
            milestoneForm.reset();
            
            // Establecer fecha por defecto (hoy)
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('milestone-date').value = today;
        }
        
        // Cargar participantes para el selector
        loadParticipantsForSelect();
        
        // Abrir modal
        modalCreateMilestone.classList.add('active');
    }
    
    /**
     * Abre el modal para editar un hito existente
     * @param {string|number} milestoneId - ID del hito a editar
     */
    async function openEditMilestoneModal(milestoneId) {
        if (!modalEditMilestone) return;
        
        try {
            // Obtener datos del hito
            const data = await fetchAPI(`/milestones/${milestoneId}`);
            
            if (data && data.milestone) {
                const milestone = data.milestone;
                currentMilestoneId = milestone.id;
                
                // Llenar formulario con datos del hito
                document.getElementById('edit-milestone-name').value = milestone.name;
                document.getElementById('edit-milestone-description').value = milestone.description || '';
                document.getElementById('edit-milestone-date').value = milestone.date;
                document.getElementById('edit-milestone-completed').checked = milestone.completed;
                
                // Cargar participantes para el selector
                await loadParticipantsForSelect('edit-milestone-responsible');
                
                // Seleccionar el participante responsable
                if (milestone.responsible_id) {
                    document.getElementById('edit-milestone-responsible').value = milestone.responsible_id;
                }
                
                // Abrir modal
                modalEditMilestone.classList.add('active');
            }
        } catch (error) {
            console.error('Error loading milestone data:', error);
            showNotification('Error al cargar los datos del hito', 'error');
        }
    }
    
    /**
     * Carga los participantes para un selector
     * @param {string} selectId - ID del elemento select
     */
    async function loadParticipantsForSelect(selectId = 'milestone-responsible') {
        const selectElement = document.getElementById(selectId);
        if (!selectElement || !currentProjectId) return;
        
        try {
            // Obtener participantes del proyecto
            const data = await fetchAPI(`/projects/${currentProjectId}/participants`);
            
            if (data && data.participants) {
                // Limpiar selector
                selectElement.innerHTML = '<option value="">Seleccionar responsable</option>';
                
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
    
    /**
     * Crea un nuevo hito
     */
    async function createMilestone() {
        const name = document.getElementById('milestone-name').value;
        const description = document.getElementById('milestone-description').value;
        const date = document.getElementById('milestone-date').value;
        const responsibleId = document.getElementById('milestone-responsible').value;
        
        // Validar datos
        if (!name || !date) {
            showNotification('Por favor, completa los campos requeridos', 'error');
            return;
        }
        
        // Crear objeto con datos del hito
        const milestoneData = {
            name,
            description,
            date,
            completed: false
        };
        
        // Añadir responsable si se seleccionó
        if (responsibleId) {
            milestoneData.responsible_id = responsibleId;
        }
        
        try {
            // Enviar solicitud a la API
            const response = await fetchAPI(`/projects/${currentProjectId}/milestones`, 'POST', milestoneData);
            
            if (response) {
                // Cerrar modal
                closeModal(modalCreateMilestone);
                
                // Recargar lista de hitos
                loadProjectMilestones(currentProjectId);
                
                // Mostrar notificación
                showNotification('Hito creado exitosamente');
            }
        } catch (error) {
            console.error('Error creating milestone:', error);
            showNotification('Error al crear el hito', 'error');
        }
    }
    
    /**
     * Actualiza un hito existente
     */
    async function updateMilestone() {
        if (!currentMilestoneId) return;
        
        const name = document.getElementById('edit-milestone-name').value;
        const description = document.getElementById('edit-milestone-description').value;
        const date = document.getElementById('edit-milestone-date').value;
        const completed = document.getElementById('edit-milestone-completed').checked;
        const responsibleId = document.getElementById('edit-milestone-responsible').value;
        
        // Validar datos
        if (!name || !date) {
            showNotification('Por favor, completa los campos requeridos', 'error');
            return;
        }
        
        // Crear objeto con datos del hito
        const milestoneData = {
            name,
            description,
            date,
            completed
        };
        
        // Añadir responsable si se seleccionó
        if (responsibleId) {
            milestoneData.responsible_id = responsibleId;
        }
        
        try {
            // Enviar solicitud a la API
            const response = await fetchAPI(`/milestones/${currentMilestoneId}`, 'PUT', milestoneData);
            
            if (response) {
                // Cerrar modal
                closeModal(modalEditMilestone);
                
                // Recargar lista de hitos
                loadProjectMilestones(currentProjectId);
                
                // Mostrar notificación
                showNotification('Hito actualizado exitosamente');
            }
        } catch (error) {
            console.error('Error updating milestone:', error);
            showNotification('Error al actualizar el hito', 'error');
        }
    }
    
    /**
     * Cambia el estado de un hito (completado/no completado)
     * @param {string|number} milestoneId - ID del hito
     * @param {boolean} completed - Nuevo estado
     */
    async function toggleMilestoneStatus(milestoneId, completed) {
        try {
            // Enviar solicitud a la API
            const response = await fetchAPI(`/milestones/${milestoneId}`, 'PUT', { completed });
            
            if (response) {
                // Recargar lista de hitos
                loadProjectMilestones(currentProjectId);
                
                // Mostrar notificación
                showNotification(`Hito marcado como ${completed ? 'completado' : 'pendiente'}`);
            }
        } catch (error) {
            console.error('Error toggling milestone status:', error);
            showNotification('Error al cambiar el estado del hito', 'error');
        }
    }
    
    /**
     * Confirma la eliminación de un hito
     * @param {string|number} milestoneId - ID del hito a eliminar
     */
    function confirmDeleteMilestone(milestoneId) {
        if (confirm('¿Estás seguro de que deseas eliminar este hito? Esta acción no se puede deshacer.')) {
            deleteMilestone(milestoneId);
        }
    }
    
    /**
     * Elimina un hito
     * @param {string|number} milestoneId - ID del hito a eliminar
     */
    async function deleteMilestone(milestoneId) {
        try {
            // Enviar solicitud a la API
            const response = await fetchAPI(`/milestones/${milestoneId}`, 'DELETE');
            
            if (response) {
                // Recargar lista de hitos
                loadProjectMilestones(currentProjectId);
                
                // Mostrar notificación
                showNotification('Hito eliminado exitosamente');
            }
        } catch (error) {
            console.error('Error deleting milestone:', error);
            showNotification('Error al eliminar el hito', 'error');
        }
    }
    
    /**
     * Cierra un modal
     * @param {HTMLElement} modal - Elemento modal a cerrar
     */
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // Inicializar página de hitos
    initMilestonesPage();
});