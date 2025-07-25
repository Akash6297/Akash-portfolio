// public/admin/dashboard.js (Complete and Updated)

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    // Project elements
    const projectForm = document.getElementById('project-form');
    const projectsTableBody = document.getElementById('projects-table-body');
    const clearProjectFormBtn = document.getElementById('clear-project-form');
    
    // Service elements
    const serviceForm = document.getElementById('service-form');
    const servicesTableBody = document.getElementById('services-table-body');
    const clearServiceFormBtn = document.getElementById('clear-service-form');

    //ecperince section
const experienceForm = document.getElementById('experience-form');
    const experiencesTableBody = document.getElementById('experiences-table-body');
    // Shared elements
    const logoutBtn = document.getElementById('logout-button');
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-button');
    const cancelDeleteBtn = document.getElementById('cancel-delete-button');
    let deleteInfo = { id: null, type: null }; // To store what we are about to delete


    // --- API REQUEST HELPER ---
    // A single, reusable function to handle all API calls
    const apiRequest = async (method, url, body = null) => {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (body) {
                options.body = JSON.stringify(body);
            }
            const response = await fetch(url, options);
            if (!response.ok) {
                // If unauthorized, redirect to login. This protects the admin panel.
                if (response.status === 401) window.location.href = '/admin/login.html';
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error(`API request failed: ${method} ${url}`, error);
            alert(`An error occurred. Check the console for details.`);
            return null; // Return null on failure
        }
    };


    // --- PROJECT MANAGEMENT ---
    const fetchProjects = async () => {
        const projects = await apiRequest('GET', '/api/projects');
        if (!projects) return;
        projectsTableBody.innerHTML = '';
        projects.forEach(project => {
            const row = `
                <tr data-id="${project._id}">
                    <td class="p-4 border-t border-slate-700">${project.name}</td>
                    <td class="p-4 border-t border-slate-700">${project.description.substring(0, 50)}...</td>
                    <td class="p-4 border-t border-slate-700">
                        <button class="edit-project-btn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2">Edit</button>
                        <button class="delete-btn bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" data-type="project">Delete</button>
                    </td>
                </tr>`;
            projectsTableBody.insertAdjacentHTML('beforeend', row);
        });
    };

    const clearProjectForm = () => {
        projectForm.reset();
        projectForm.querySelector('#project-id').value = '';
    };

  // public/admin/dashboard.js

    // public/admin/dashboard.js
projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = projectForm.querySelector('#project-id').value;
    
    const formData = new FormData(projectForm); // This is all we need
    
    const url = id ? `/api/admin/projects/${id}` : '/api/admin/projects';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        if (!response.ok) {
             if (response.status === 401) window.location.href = '/admin/login.html';
             throw new Error(`HTTP error! status: ${response.status}`);
        }
        clearProjectForm();
        await fetchProjects();
    } catch (error) {
        console.error('Form submission error:', error);
        alert('An error occurred during submission.');
    }
});
    clearProjectFormBtn.addEventListener('click', clearProjectForm);

    projectsTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const row = target.closest('tr');
        if (!row) return;
        const id = row.dataset.id;

        if (target.classList.contains('edit-project-btn')) {
            const [project] = await apiRequest('GET', `/api/admin/projects/${id}`);
            if(!project) return;
            projectForm.querySelector('#project-id').value = project._id;
            projectForm.querySelector('#project-name').value = project.name;
            projectForm.querySelector('#project-description').value = project.description;
            projectForm.querySelector('#project-imageUrl').value = project.imageUrl;
            projectForm.querySelector('#project-tags').value = project.tags.join(', ');
            projectForm.querySelector('#project-liveUrl').value = project.liveUrl;
            projectForm.querySelector('#project-sourceUrl').value = project.sourceUrl;
            window.scrollTo(0, 0);
        }
        
        if (target.classList.contains('delete-btn')) {
            deleteInfo = { id, type: 'project' };
            deleteModal.classList.remove('hidden');
        }
    });

    
    // --- SERVICE MANAGEMENT ---
    const fetchServices = async () => {
        const services = await apiRequest('GET', '/api/services');
        if (!services) return;
        servicesTableBody.innerHTML = '';
        services.forEach(service => {
            const row = `
                <tr data-id="${service._id}">
                    <td class="p-4 border-t border-slate-700">${service.title}</td>
                    <td class="p-4 border-t border-slate-700">${service.description.substring(0, 50)}...</td>
                    <td class="p-4 border-t border-slate-700">
                        <button class="edit-service-btn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2">Edit</button>
                        <button class="delete-btn bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" data-type="service">Delete</button>
                    </td>
                </tr>`;
            servicesTableBody.insertAdjacentHTML('beforeend', row);
        });
    };

    const clearServiceForm = () => {
        serviceForm.reset();
        serviceForm.querySelector('#service-id').value = '';
    };

    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = serviceForm.querySelector('#service-id').value;
        const formData = new FormData(serviceForm);
        const data = Object.fromEntries(formData.entries());
        
        const url = id ? `/api/admin/services/${id}` : '/api/admin/services';
        const method = id ? 'PUT' : 'POST';

        await apiRequest(method, url, data);
        clearServiceForm();
        await fetchServices();
    });

    clearServiceFormBtn.addEventListener('click', clearServiceForm);

    servicesTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const row = target.closest('tr');
        if (!row) return;
        const id = row.dataset.id;

        if (target.classList.contains('edit-service-btn')) {
            const [service] = await apiRequest('GET', `/api/admin/services/${id}`);
            if (!service) return;
            serviceForm.querySelector('#service-id').value = service._id;
            serviceForm.querySelector('#service-title').value = service.title;
            serviceForm.querySelector('#service-description').value = service.description;
            serviceForm.querySelector('#service-iconSvg').value = service.iconSvg;
            // Scroll to the service form for a better user experience
            document.getElementById('services-management').scrollIntoView({ behavior: 'smooth' });
        }
        
        if (target.classList.contains('delete-btn')) {
            deleteInfo = { id, type: 'service' };
            deleteModal.classList.remove('hidden');
        }
    });


        // --- EXPERIENCE MANAGEMENT (NEW) ---
    const fetchExperiences = async () => {
        const experiences = await apiRequest('GET', '/api/experiences');
        if (!experiences) return;
        experiencesTableBody.innerHTML = '';
        experiences.forEach(exp => {
            const row = `<tr data-id="${exp._id}">
                <td class="p-4 border-t border-slate-700">${exp.title}</td>
                <td class="p-4 border-t border-slate-700">${exp.company}</td>
                <td class="p-4 border-t border-slate-700">
                    <button class="edit-experience-btn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2">Edit</button>
                    <button class="delete-btn bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" data-type="experience">Delete</button>
                </td></tr>`;
            experiencesTableBody.insertAdjacentHTML('beforeend', row);
        });
    };

    const clearExperienceForm = () => {
        experienceForm.reset();
        experienceForm.querySelector('#experience-id').value = '';
    };

    experienceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = experienceForm.querySelector('#experience-id').value;
        const data = Object.fromEntries(new FormData(experienceForm).entries());
        const url = id ? `/api/admin/experiences/${id}` : '/api/admin/experiences';
        const method = id ? 'PUT' : 'POST';
        await apiRequest(method, url, data);
        clearExperienceForm();
        await fetchExperiences();
    });

    document.getElementById('clear-experience-form').addEventListener('click', clearExperienceForm);

    experiencesTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const row = target.closest('tr');
        if (!row) return;
        const id = row.dataset.id;

        if (target.classList.contains('edit-experience-btn')) {
            const exp = await apiRequest('GET', `/api/admin/experiences/${id}`);
            if (!exp) return;
            experienceForm.querySelector('#experience-id').value = exp._id;
            experienceForm.querySelector('#experience-title').value = exp.title;
            experienceForm.querySelector('#experience-company').value = exp.company;
            experienceForm.querySelector('#experience-dateRange').value = exp.dateRange;
            experienceForm.querySelector('#experience-description').value = exp.description;
            document.getElementById('experience-management').scrollIntoView({ behavior: 'smooth' });
        }
        
        if (target.classList.contains('delete-btn') && target.dataset.type === 'experience') {
            deleteInfo = { id, type: 'experience' };
            deleteModal.classList.remove('hidden');
        }
    });

    // --- UPDATE DELETE MODAL LOGIC ---
    confirmDeleteBtn.addEventListener('click', async () => {
        const { id, type } = deleteInfo;
        if (id && type) {
            await apiRequest('DELETE', `/api/admin/${type}s/${id}`); // Note the 's' for plural
            deleteModal.classList.add('hidden');
            if (type === 'project') await fetchProjects();
            else if (type === 'service') await fetchServices();
            else if (type === 'experience') await fetchExperiences(); // <-- UPDATED
        }
    });

    // --- SHARED LOGIC (DELETE & LOGOUT) ---
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        const { id, type } = deleteInfo;
        if (id && type) {
            await apiRequest('DELETE', `/api/admin/${type}s/${id}`);
            deleteModal.classList.add('hidden');
            // Refresh the correct table after deletion
            if (type === 'project') {
                await fetchProjects();
            } else if (type === 'service') {
                await fetchServices();
            }
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await apiRequest('POST', '/api/admin/logout');
        window.location.href = '/admin/login.html';
    });


    // --- INITIALIZE PAGE ---
    // Fetch all data when the dashboard loads
    fetchProjects();
    fetchServices();
     fetchExperiences(); 
});