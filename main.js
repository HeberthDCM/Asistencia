document.addEventListener('DOMContentLoaded', function() {
    // Hide all sections except the active one
    const navItems = document.querySelectorAll('.nav-item');
    const sectionContents = document.querySelectorAll('.section-content');
    const sidebar = document.getElementById('sidebar');
    
    // Initially hide sidebar
    sidebar.classList.add('hidden');
    
    // Function to load asistencias with consolidado
    const loadAsistenciasWithConsolidado = () => {
        sidebar.classList.remove('hidden');
        const consolidadoItem = document.querySelector('.sidebar-item[data-ciclo="consolidado"]');
        sidebar.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
        consolidadoItem.classList.add('active');
        loadAsistenciasData('consolidado');
    };

    // Set up navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            
            // Update active nav item
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            // Update section title
            document.getElementById('sectionTitle').textContent = this.textContent.trim();
            
            // Handle section-specific logic
            if (section === 'asistencias') {
                loadAsistenciasWithConsolidado();
            } else {
                sidebar.classList.add('hidden');
            }
            
            // Show the selected section
            sectionContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === `${section}Content`) {
                    content.classList.remove('hidden');
                }
            });
        });
    });
    
    // Set up sidebar items for asistencias
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebarItems.forEach(sideItem => sideItem.classList.remove('active'));
            this.classList.add('active');
            
            const ciclo = this.getAttribute('data-ciclo');
            loadAsistenciasData(ciclo);
        });
    });
    
    // Initialize with first nav item active
    if (navItems.length > 0) {
        const firstItem = navItems[0];
        firstItem.classList.add('active');
        document.getElementById('sectionTitle').textContent = firstItem.textContent.trim();
        
        // If first item is asistencias, load consolidado
        if (firstItem.getAttribute('data-section') === 'asistencias') {
            loadAsistenciasWithConsolidado();
        }
        
        // Show the first section content
        document.getElementById(`${firstItem.getAttribute('data-section')}Content`).classList.remove('hidden');
    }
});