// frontend/static/js/timeline.js
// Script para manejar la visualización de líneas de tiempo en proyectos

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const timelineContainer = document.getElementById('timeline-container');
    const timelineViewOptions = document.querySelectorAll('.view-option');
    
    // Variables de estado
    let currentProjectId = null;
    let currentView = 'quarterly'; // quarterly, biannual, annual
    
    // Configuración de la API
    const API_URL = '/api';
    const token = localStorage.getItem('token');
    
    /**
     * Inicializa la línea de tiempo del proyecto
     */
    function initTimeline() {
        // Obtener ID del proyecto de la URL
        const urlParams = new URLSearchParams(window.location.search);
        currentProjectId = urlParams.get('project_id');
        
        if (!currentProjectId || !timelineContainer) {
            return;
        }
        
        // Cargar datos de la línea de tiempo
        loadTimelineData(currentProjectId, currentView);
        
        // Configurar las opciones de vista
        if (timelineViewOptions && timelineViewOptions.length > 0) {
            timelineViewOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const view = this.getAttribute('data-view');
                    
                    // Actualizar clases de los botones
                    timelineViewOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Actualizar vista actual
                    currentView = view;
                    
                    // Recargar datos con la nueva vista
                    loadTimelineData(currentProjectId, view);
                });
            });
        }
    }
    
    /**
     * Carga los datos de la línea de tiempo del proyecto
     * @param {string|number} projectId - ID del proyecto
     * @param {string} view - Vista de la línea de tiempo (quarterly, biannual, annual)
     */
    async function loadTimelineData(projectId, view) {
        try {
            // Mostrar cargando
            timelineContainer.innerHTML = '<div class="loading">Cargando línea de tiempo...</div>';
            
            // Realizar petición a la API
            const response = await fetch(`${API_URL}/projects/${projectId}/timeline?view=${view}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Renderizar la línea de tiempo
            renderTimeline(data);
            
        } catch (error) {
            console.error('Error loading timeline data:', error);
            timelineContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar la línea de tiempo. Por favor, inténtalo de nuevo más tarde.</p>
                </div>
            `;
        }
    }
    
    /**
     * Renderiza la línea de tiempo con los datos proporcionados
     * @param {Object} data - Datos de la línea de tiempo
     */
    function renderTimeline(data) {
        if (!data || !data.project) {
            timelineContainer.innerHTML = '<div class="no-data">No hay datos disponibles para la línea de tiempo.</div>';
            return;
        }
        
        // Extraer los datos necesarios
        const project = data.project;
        const tasks = data.tasks || [];
        const milestones = data.milestones || [];
        const view = data.view || currentView;
        
        // Determinar fechas de inicio y fin del proyecto
        const projectStart = new Date(project.start_date);
        const projectEnd = new Date(project.end_date);
        
        // Calcular el rango de tiempo según la vista
        const timeRange = calculateTimeRange(projectStart, projectEnd, view);
        
        // Generar el HTML de la línea de tiempo
        let timelineHTML = `
            <div class="timeline-header">
                <div class="timeline-project-info">
                    <h3>${project.name}</h3>
                    <div class="project-dates">
                        ${formatDate(projectStart)} - ${formatDate(projectEnd)}
                    </div>
                </div>
                <div class="timeline-legend">
                    <div class="legend-item">
                        <span class="legend-color task-color"></span>
                        <span class="legend-label">Tareas</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color milestone-color"></span>
                        <span class="legend-label">Hitos</span>
                    </div>
                </div>
            </div>
            <div class="timeline-grid">
                <div class="timeline-grid-header">
                    ${generateTimeUnits(timeRange, view)}
                </div>
                <div class="timeline-tasks">
                    ${generateTaskRows(tasks, timeRange, view)}
                </div>
                <div class="timeline-milestones">
                    ${generateMilestoneMarkers(milestones, timeRange, view)}
                </div>
            </div>
        `;
        
        // Insertar el HTML en el contenedor
        timelineContainer.innerHTML = timelineHTML;
        
        // Aplicar eventos y efectos adicionales
        applyTimelineInteractions();
    }
    
    /**
     * Calcula el rango de tiempo para la línea de tiempo según la vista
     * @param {Date} startDate - Fecha de inicio del proyecto
     * @param {Date} endDate - Fecha de fin del proyecto
     * @param {string} view - Vista de la línea de tiempo (quarterly, biannual, annual)
     * @returns {Array} Array de objetos de fechas para la línea de tiempo
     */
    function calculateTimeRange(startDate, endDate, view) {
        const range = [];
        const periodMonths = view === 'quarterly' ? 3 : view === 'biannual' ? 6 : 12;
        
        // Ajustar fecha de inicio al primer día del mes
        const adjustedStart = new Date(startDate);
        adjustedStart.setDate(1);
        
        // Ajustar fecha de fin al último día del mes
        const adjustedEnd = new Date(endDate);
        adjustedEnd.setMonth(adjustedEnd.getMonth() + 1);
        adjustedEnd.setDate(0);
        
        // Generar periodos según la vista
        let currentDate = new Date(adjustedStart);
        while (currentDate <= adjustedEnd) {
            // Añadir fecha actual al rango
            range.push(new Date(currentDate));
            
            // Avanzar al siguiente período
            currentDate.setMonth(currentDate.getMonth() + periodMonths);
        }
        
        return range;
    }
    
    /**
     * Genera las unidades de tiempo para el encabezado de la línea de tiempo
     * @param {Array} timeRange - Rango de tiempo calculado
     * @param {string} view - Vista actual
     * @returns {string} HTML de las unidades de tiempo
     */
    function generateTimeUnits(timeRange, view) {
        let html = '<div class="timeline-unit timeline-unit-label">Elemento</div>';
        
        timeRange.forEach((date, index) => {
            let label = '';
            
            if (view === 'quarterly') {
                // Q1, Q2, Q3, Q4 de cada año
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                label = `Q${quarter} ${date.getFullYear()}`;
            } else if (view === 'biannual') {
                // S1, S2 de cada año
                const semester = Math.floor(date.getMonth() / 6) + 1;
                label = `S${semester} ${date.getFullYear()}`;
            } else {
                // Año
                label = date.getFullYear().toString();
            }
            
            html += `<div class="timeline-unit">${label}</div>`;
        });
        
        return html;
    }
    
    /**
     * Genera las filas de tareas para la línea de tiempo
     * @param {Array} tasks - Array de tareas
     * @param {Array} timeRange - Rango de tiempo calculado
     * @param {string} view - Vista actual
     * @returns {string} HTML de las filas de tareas
     */
    function generateTaskRows(tasks, timeRange, view) {
        if (!tasks.length) {
            return '<div class="timeline-no-tasks">No hay tareas en este proyecto</div>';
        }
        
        let html = '';
        
        tasks.forEach(task => {
            const taskStart = new Date(task.start_date);
            const taskEnd = new Date(task.end_date);
            
            html += `
                <div class="timeline-row">
                    <div class="timeline-item-label" title="${task.name}">
                        ${task.name}
                    </div>
                    ${generateTaskBar(task, taskStart, taskEnd, timeRange, view)}
                </div>
            `;
        });
        
        return html;
    }
    
    /**
     * Genera la barra de una tarea en la línea de tiempo
     * @param {Object} task - Datos de la tarea
     * @param {Date} taskStart - Fecha de inicio de la tarea
     * @param {Date} taskEnd - Fecha de fin de la tarea
     * @param {Array} timeRange - Rango de tiempo calculado
     * @param {string} view - Vista actual
     * @returns {string} HTML de la barra de la tarea
     */
    function generateTaskBar(task, taskStart, taskEnd, timeRange, view) {
        let html = '';
        
        // Calcular posición y ancho de la barra de tarea
        const totalUnits = timeRange.length;
        let startPosition = -1;
        let endPosition = -1;
        const periodMonths = view === 'quarterly' ? 3 : view === 'biannual' ? 6 : 12;
        
        // Encontrar posiciones de inicio y fin
        for (let i = 0; i < timeRange.length; i++) {
            const currentPeriodStart = new Date(timeRange[i]);
            const currentPeriodEnd = new Date(currentPeriodStart);
            currentPeriodEnd.setMonth(currentPeriodStart.getMonth() + periodMonths - 1);
            currentPeriodEnd.setDate(getLastDayOfMonth(currentPeriodEnd));
            
            // Verificar si la tarea comienza en este período
            if (startPosition === -1 && taskStart <= currentPeriodEnd && 
                (i === 0 || taskStart > new Date(timeRange[i-1]))) {
                startPosition = i;
            }
            
            // Verificar si la tarea termina en este período
            if (endPosition === -1 && taskEnd <= currentPeriodEnd) {
                endPosition = i;
            }
        }
        
        // Si no se encontró posición, ajustar a los límites
        if (startPosition === -1) startPosition = 0;
        if (endPosition === -1) endPosition = timeRange.length - 1;
        
        // Generar celdas vacías hasta la posición de inicio
        for (let i = 0; i < startPosition; i++) {
            html += '<div class="timeline-unit empty"></div>';
        }
        
        // Generar barra de tarea
        const barWidth = endPosition - startPosition + 1;
        const progressWidth = Math.round((task.progress || 0) * barWidth / 100);
        
        html += `
            <div class="timeline-unit task-bar" style="grid-column: span ${barWidth};" 
                 data-id="${task.id}" title="${task.name} (${task.progress || 0}%)">
                <div class="task-progress-bar" style="width: ${task.progress || 0}%;"></div>
                <div class="task-name">${task.name}</div>
            </div>
        `;
        
        // Generar celdas vacías después de la tarea
        for (let i = endPosition + 1; i < totalUnits; i++) {
            html += '<div class="timeline-unit empty"></div>';
        }
        
        return html;
    }
    
    /**
     * Genera los marcadores de hitos para la línea de tiempo
     * @param {Array} milestones - Array de hitos
     * @param {Array} timeRange - Rango de tiempo calculado
     * @param {string} view - Vista actual
     * @returns {string} HTML de los marcadores de hitos
     */
    function generateMilestoneMarkers(milestones, timeRange, view) {
        if (!milestones.length) {
            return '<div class="timeline-no-milestones">No hay hitos en este proyecto</div>';
        }
        
        let html = '<div class="timeline-row milestone-row">';
        html += '<div class="timeline-item-label">Hitos</div>';
        
        // Crear un mapa de hitos por período
        const milestoneMap = new Map();
        const periodMonths = view === 'quarterly' ? 3 : view === 'biannual' ? 6 : 12;
        
        // Inicializar mapa con claves para cada período
        for (let i = 0; i < timeRange.length; i++) {
            milestoneMap.set(i, []);
        }
        
        // Asignar hitos a períodos
        milestones.forEach(milestone => {
            const milestoneDate = new Date(milestone.date);
            
            for (let i = 0; i < timeRange.length; i++) {
                const periodStart = new Date(timeRange[i]);
                const periodEnd = new Date(periodStart);
                periodEnd.setMonth(periodStart.getMonth() + periodMonths - 1);
                periodEnd.setDate(getLastDayOfMonth(periodEnd));
                
                if (milestoneDate >= periodStart && milestoneDate <= periodEnd) {
                    milestoneMap.get(i).push(milestone);
                    break;
                }
            }
        });
        
        // Generar marcadores de hitos para cada período
        for (let i = 0; i < timeRange.length; i++) {
            const periodMilestones = milestoneMap.get(i);
            
            if (periodMilestones.length === 0) {
                html += '<div class="timeline-unit milestone-empty"></div>';
            } else {
                html += `
                    <div class="timeline-unit milestone-container">
                        ${periodMilestones.map(milestone => `
                            <div class="milestone-marker ${milestone.completed ? 'completed' : ''}" 
                                data-id="${milestone.id}" 
                                title="${milestone.name} (${formatDate(new Date(milestone.date))})">
                                <i class="fas fa-flag"></i>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
        
        html += '</div>';
        return html;
    }
    
    /**
     * Aplica interacciones y eventos a la línea de tiempo
     */
    function applyTimelineInteractions() {
        // Añadir tooltips o interacciones según sea necesario
        const taskBars = document.querySelectorAll('.task-bar');
        const milestoneMarkers = document.querySelectorAll('.milestone-marker');
        
        // Eventos para barras de tareas
        taskBars.forEach(bar => {
            bar.addEventListener('click', function() {
                const taskId = this.getAttribute('data-id');
                // Redirigir a la página de detalles de la tarea
                window.location.href = `/tasks/${taskId}`;
            });
        });
        
        // Eventos para marcadores de hitos
        milestoneMarkers.forEach(marker => {
            marker.addEventListener('click', function() {
                const milestoneId = this.getAttribute('data-id');
                // Mostrar un modal con detalles del hito o redirigir
                alert(`Abrir detalles del hito ID: ${milestoneId}`);
            });
        });
    }
    
    /**
     * Obtiene el último día del mes para una fecha dada
     * @param {Date} date - Fecha
     * @returns {number} Último día del mes
     */
    function getLastDayOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
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
    
    // Inicializar línea de tiempo al cargar la página
    initTimeline();
});