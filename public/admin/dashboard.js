// public/admin/dashboard.js (Complete and Updated for New UI)

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    // UI elements
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const adminSections = document.querySelectorAll('.admin-section');
    
    // Forms and Tables
    const navLinks = {
        'dashboard-link': document.getElementById('dashboard-container'),
        'projects-management': document.getElementById('projects-management-container'),
        'services-management': document.getElementById('services-management-container'),
        'resume-management': document.getElementById('resume-management-container'),
        'experience-management': document.getElementById('experience-management-container'),
        'about-management': document.getElementById('about-management-container'),
        'messages-management': document.getElementById('messages-management-container'),
        'booking-management': document.getElementById('booking-management-container'),
        'email-templates-management': document.getElementById('email-templates-management-container'),
        'settings-management': document.getElementById('settings-management-container')
    };
    const heroForm = document.getElementById('hero-form');
    const projectForm = document.getElementById('project-form');
    const projectsTableBody = document.getElementById('projects-table-body');
    const clearProjectFormBtn = document.getElementById('clear-project-form');
    const serviceForm = document.getElementById('service-form');
    const servicesTableBody = document.getElementById('services-table-body');
    const clearServiceFormBtn = document.getElementById('clear-service-form');
    const experienceForm = document.getElementById('experience-form');
    const experiencesTableBody = document.getElementById('experiences-table-body');
    const clearExperienceFormBtn = document.getElementById('clear-experience-form');
    const aboutForm = document.getElementById('about-form');
    const projectImagePreview = document.getElementById('project-image-preview');
    const projectImagePlaceholder = document.getElementById('project-image-placeholder');
    const emailTemplatesList = document.getElementById('email-templates-list');
    const emailPreviewModal = document.getElementById('email-preview-modal');
    const closePreviewModalBtn = document.getElementById('close-preview-modal');
    const previewSubject = document.getElementById('preview-subject');
    const previewIframe = document.getElementById('preview-iframe');

     // NEW: Admin Settings selectors
    const otpRequestView = document.getElementById('otp-request-view');
    const otpVerifyView = document.getElementById('otp-verify-view');
    const adminContentView = document.getElementById('admin-content-view');
    const requestOtpBtn = document.getElementById('request-otp-btn');
    const otpVerifyForm = document.getElementById('otp-verify-form');
    const changePasswordForm = document.getElementById('change-password-form');
    const createAdminForm = document.getElementById('create-admin-form');
   const normalAdminView = document.getElementById('normal-admin-view');
    const superAdminView = document.getElementById('super-admin-view');
    const usersTableBody = document.getElementById('users-table-body');
    const editUserModal = document.getElementById('edit-user-modal');
    const editUserForm = document.getElementById('edit-user-form');
    const cancelEditUserBtn = document.getElementById('cancel-edit-user');
// Message Center selectors
    const messagesList = document.getElementById('messages-list');
    const noMessagesDiv = document.getElementById('no-messages');
    const replyModal = document.getElementById('reply-modal');
    const closeReplyModalBtn = document.getElementById('close-reply-modal');
    const replyForm = document.getElementById('reply-form');
    
    // AI Bot elements
    const aiBotToggle = document.getElementById('ai-bot-toggle');
    const aiBotModal = document.getElementById('ai-bot-modal');
    const closeAiBotBtn = document.getElementById('close-ai-bot');
    const aiBotInput = document.getElementById('ai-bot-input');
    const aiDropZone = document.getElementById('ai-drop-zone');
    const aiFileInput = document.getElementById('ai-file-input');
    const aiProcessBtn = document.getElementById('ai-process-btn');
    const aiProcessStatus = document.getElementById('ai-process-status');
    const aiProgressBar = document.getElementById('ai-progress-bar');
    const aiStatusText = document.getElementById('ai-status-text');
    const aiFileStatus = document.getElementById('ai-file-status');


    // Shared elements
    const logoutBtn = document.getElementById('logout-button');
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-button');
    const cancelDeleteBtn = document.getElementById('cancel-delete-button');
    let deleteInfo = { id: null, type: null }; // To store what we are about to delete

  // --- NEW: TOAST NOTIFICATION FUNCTION ---
    const showToast = (message, type = 'success') => {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    };

 let currentUserIsSuperAdmin = false;
    let allUsers = [];

    // --- API REQUEST HELPER (UPDATED) ---
    const apiRequest = async (method, url, body = null) => {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            if (body) options.body = JSON.stringify(body);
            const response = await fetch(url, options);
            if (response.status === 401) {
                window.location.href = '/login.html';
                return null;
            }
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Something went wrong');
            }
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            showToast(error.message, 'error');
            return null;
        }
    };

    // --- CHECK ADMIN STATUS ---
    const checkAdminStatus = async () => {
        const status = await apiRequest('GET', '/api/admin/status');
        if (status) {
            currentUserIsSuperAdmin = status.isSuperAdmin;
        }
    };
    checkAdminStatus();
    
     // --- UI FUNCTIONALITY: SECTION TOGGLING (CORRECTED) ---
  

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(link.dataset.section);
        });
    });


    // --- HERO MANAGEMENT ---
    const fetchHeroData = async () => {
        const data = await apiRequest('GET', '/api/hero');
        if (data) {
            heroForm.querySelector('#hero-greeting').value = data.greeting;
            heroForm.querySelector('#hero-headline').value = data.headline;
            heroForm.querySelector('#hero-bio').value = data.bio;
            heroForm.querySelector('#hero-photo-preview').src = data.photoUrl || '';
        }
    };

    heroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(heroForm);
        try {
            const response = await fetch('/api/admin/hero', { method: 'PUT', body: formData });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update Hero section');
            }
            showToast('Hero section updated successfully!');
            await fetchHeroData(); // Refresh the preview image
        } catch (error) {
            console.error('Hero form submission error:', error);
            showToast(`An error occurred: ${error.message}`);
        }
    });

    // --- ABOUT ME MANAGEMENT ---
    const fetchAboutData = async () => {
        const data = await apiRequest('GET', '/api/about');
        if (data) {
            aboutForm.querySelector('#about-p1').value = data.bioParagraph1 || '';
            aboutForm.querySelector('#about-p2').value = data.bioParagraph2 || '';
            aboutForm.querySelector('#about-skills').value = (data.skills || []).join(', ');
        }
    };

    aboutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(aboutForm).entries());
        if (data.skills && typeof data.skills === 'string') {
            data.skills = data.skills.split(',').map(s => s.trim());
        }
        const result = await apiRequest('PUT', '/api/admin/about', data);
        if (result) showToast('About section updated successfully!');
    });

    // --- EXPERIENCE MANAGEMENT ---
    const fetchExperiences = async () => {
        const experiences = await apiRequest('GET', '/api/experiences');
        if (!experiences) return;
        experiencesTableBody.innerHTML = '';
        experiences.forEach(exp => {
            const row = `<tr data-id="${exp._id}">
                <td class="p-4 border-t border-slate-700">${exp.title}</td>
                <td class="p-4 border-t border-slate-700">${exp.company}</td>
                <td class="p-4 border-t border-slate-700">
                    <button class="edit-experience-btn bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500 hover:text-white p-2 rounded-lg transition-all duration-300 mr-1">
                        <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>

                    <button class="delete-btn bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-all duration-300" data-type="experience" title="Delete Experience">
                    <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>

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
        const result = await apiRequest(method, url, data);
        if (result) {
            clearExperienceForm();
            await fetchExperiences();
        }showToast('Experience section updated successfully!');
    });

    clearExperienceFormBtn.addEventListener('click', clearExperienceForm);

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
            // Removed scroll, as the section is already visible
        }
        
        if (target.classList.contains('delete-btn') && target.dataset.type === 'experience') {
            deleteInfo = { id, type: 'experience' };
            deleteModal.classList.remove('hidden');
        }
    });

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
                        <button class="edit-project-btn bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500 hover:text-white p-2 rounded-lg transition-all duration-300 mr-1">
                            <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>

                        <button class="delete-btn bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-all duration-300" data-type="project" title="Delete Project">
                    <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>

                    </td>
                </tr>`;
            projectsTableBody.insertAdjacentHTML('beforeend', row);
        });
    };

  const clearProjectForm = () => {
        projectForm.reset();
        projectForm.querySelector('#project-id').value = '';
        projectImagePreview.classList.add('hidden');
        projectImagePlaceholder.classList.remove('hidden');
    };
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = projectForm.querySelector('#project-id').value;
        const formData = new FormData(projectForm);
        const url = id ? `/api/admin/projects/${id}` : '/api/admin/projects';
        const method = id ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, { method, body: formData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            showToast(`Project ${id ? 'updated' : 'created'} successfully!`);
            clearProjectForm();
            await fetchProjects();
        } catch (error) {
            showToast(error.message, 'error');
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
            // ... (fill all form fields like name, description, etc.) ...
            projectForm.querySelector('#project-id').value = project._id;
            projectForm.querySelector('#project-name').value = project.name;
            projectForm.querySelector('#project-description').value = project.description;
            // Note: For file input, you can't set its value directly for security.
            // But we can set the hidden imageUrl field.
            projectForm.querySelector('#project-imageUrl').value = project.imageUrl; 
            projectForm.querySelector('#project-tags').value = (project.tags || []).join(', ');
            projectForm.querySelector('#project-liveUrl').value = project.liveUrl || '';
            projectForm.querySelector('#project-sourceUrl').value = project.sourceUrl || '';
            // Handle image preview
            if (project.imageUrl) {
                projectImagePreview.src = project.imageUrl;
                projectImagePreview.classList.remove('hidden');
                projectImagePlaceholder.classList.add('hidden');
            } else {
                projectImagePreview.classList.add('hidden');
                projectImagePlaceholder.classList.remove('hidden');
            }
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
                        <button class="edit-service-btn bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500 hover:text-white p-2 rounded-lg transition-all duration-300 mr-1">
                            <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>

                        <button class="delete-btn bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-all duration-300" data-type="service" title="Delete Service">
                    <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>

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
        const data = Object.fromEntries(new FormData(serviceForm).entries());
        
        const url = id ? `/api/admin/services/${id}` : '/api/admin/services';
        const method = id ? 'PUT' : 'POST';

        const result = await apiRequest(method, url, data);
        if (result) {
            clearServiceForm();
            await fetchServices();
        }showToast('Service section updated successfully!');
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
            // Removed scroll, as the section is already visible
        }
        
        if (target.classList.contains('delete-btn')) {
            deleteInfo = { id, type: 'service' };
            deleteModal.classList.remove('hidden');
        }
    });

    // --- BOOKINGS MANAGEMENT ---
    const fetchBookings = async () => {
        const bookingsTableBody = document.getElementById('bookings-table-body');
        const noBookingsMsg = document.getElementById('no-bookings-message');
        const statusFilter = document.getElementById('booking-status-filter').value;
        
        if(!bookingsTableBody || !noBookingsMsg) return;

        const bookings = await apiRequest('GET', '/api/admin/bookings');
        if (!bookings) return;
        
        bookingsTableBody.innerHTML = '';
        
        const filteredBookings = statusFilter === 'all' 
            ? bookings 
            : bookings.filter(b => b.status === statusFilter);

        if (filteredBookings.length === 0) {
            noBookingsMsg.classList.remove('hidden');
        } else {
            noBookingsMsg.classList.add('hidden');
            filteredBookings.forEach(booking => {
                let statusColor = 'text-slate-400';
                if(booking.status === 'confirmed') statusColor = 'text-green-400';
                if(booking.status === 'rejected') statusColor = 'text-red-400';
                if(booking.status === 'completed') statusColor = 'text-blue-400';

                const row = `
                    <tr data-id="${booking._id}" class="hover:bg-slate-700/30 transition-colors">
                        <td class="p-4 border-t border-slate-700">
                            <div class="font-semibold text-white">${booking.date}</div>
                            <div class="text-sm text-slate-400">${booking.time}</div>
                        </td>
                        <td class="p-4 border-t border-slate-700 text-white font-medium">${booking.name}</td>
                        <td class="p-4 border-t border-slate-700 text-slate-300">
                            <a href="mailto:${booking.email}" class="hover:text-teal-400 hover:underline transition-colors">${booking.email}</a>
                        </td>
                        <td class="p-4 border-t border-slate-700 font-semibold capitalize ${statusColor}">${booking.status}</td>
                        <td class="p-4 border-t border-slate-700 space-x-2">
                            ${booking.status === 'pending' ? `<button class="confirm-booking-btn bg-teal-500/10 text-teal-400 border border-teal-500/50 hover:bg-teal-500 hover:text-white px-3 py-1.5 rounded-md text-sm transition-all duration-300">Confirm</button>` : ''}
                            ${booking.status === 'pending' ? `<button class="reject-booking-btn bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-md text-sm transition-all duration-300">Reject</button>` : ''}
                            ${booking.status === 'confirmed' ? `<button class="complete-booking-btn bg-blue-500/10 text-blue-400 border border-blue-500/50 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-md text-sm transition-all duration-300">Mark Completed</button>` : ''}
                            <button class="delete-btn bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white p-2.5 rounded-lg transition-all duration-300 ml-2 align-middle" data-type="booking" title="Delete Booking">
                                <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>

                        </td>
                    </tr>
                    ${booking.message && booking.message !== 'No message provided' ? `
                    <tr class="bg-slate-800/50">
                        <td colspan="5" class="px-4 py-3 border-t border-slate-700 border-dashed text-sm text-slate-400 italic">
                            <span class="font-semibold text-slate-300 mr-2">Note:</span>${booking.message}
                        </td>
                    </tr>` : ''}
                `;
                bookingsTableBody.insertAdjacentHTML('beforeend', row);
            });
        }
    };

    const bookingStatusFilter = document.getElementById('booking-status-filter');
    if(bookingStatusFilter) bookingStatusFilter.addEventListener('change', fetchBookings);
    
    const refreshBookingsBtn = document.getElementById('refresh-bookings-btn');
    if(refreshBookingsBtn) refreshBookingsBtn.addEventListener('click', fetchBookings);

    const bookingsTableBody = document.getElementById('bookings-table-body');
    if(bookingsTableBody) {
        bookingsTableBody.addEventListener('click', async (e) => {
            const target = e.target;
            const row = target.closest('tr');
            if (!row || !row.dataset.id) return;
            const id = row.dataset.id;

            if (target.classList.contains('confirm-booking-btn')) {
                const meetingLink = prompt("Enter meeting link (optional) to send to the client:");
                if(meetingLink !== null) {
                    await apiRequest('PUT', `/api/admin/bookings/${id}/status`, { status: 'confirmed', meetingLink });
                    showToast('Booking confirmed & user notified!');
                    fetchBookings();
                }
            } else if (target.classList.contains('reject-booking-btn')) {
                if(confirm("Are you sure you want to reject this booking? The user will be notified.")) {
                    await apiRequest('PUT', `/api/admin/bookings/${id}/status`, { status: 'rejected' });
                    showToast('Booking rejected.');
                    fetchBookings();
                }
            } else if (target.classList.contains('complete-booking-btn')) {
                await apiRequest('PUT', `/api/admin/bookings/${id}/status`, { status: 'completed' });
                showToast('Booking marked as completed.');
                fetchBookings();
            } else if (target.classList.contains('delete-btn') && target.dataset.type === 'booking') {
                deleteInfo = { id, type: 'booking' };
                deleteModal.classList.remove('hidden');
            }
        });
    }

   // --- MESSAGE MANAGEMENT LOGIC (Unchanged but relies on the server fix) ---
    const fetchMessages = async () => {
        const messages = await apiRequest('GET', '/api/admin/messages');
        if (!messages) return;
        
        messagesList.innerHTML = '';
        if (messages.length === 0) {
            noMessagesDiv.classList.remove('hidden');
        } else {
            noMessagesDiv.classList.add('hidden');
            messages.forEach(message => {
                const messageCard = `
                    <div class="message-card bg-slate-800 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-700 transition-colors" data-id="${message._id}" data-read="${message.isRead}">
                        <div class="flex items-center min-w-0">
                            <span class="status-dot w-3 h-3 rounded-full mr-4 flex-shrink-0 ${message.isRead ? 'bg-slate-600' : 'bg-teal-500'}" title="${message.isRead ? 'Read' : 'Unread'}"></span>
                            <div class="truncate">
                                <p class="font-semibold text-white truncate">${message.name} <span class="text-sm text-slate-400 font-normal"><${message.email}></span></p>
                                <p class="text-slate-400 truncate">${message.message.substring(0, 80)}...</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2 ml-4 flex-shrink-0">
                           ${message.replied ? '<span class="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Replied</span>' : ''}
                           <button class="delete-btn bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white p-2.5 rounded-xl transition-all duration-300" data-type="message" title="Delete Message">
                               <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>

                        </div>
                    </div>`;
                messagesList.insertAdjacentHTML('beforeend', messageCard);
            });
        }
    };


     messagesList.addEventListener('click', async (e) => {
        const card = e.target.closest('.message-card');
        if (!card) return;
        const id = card.dataset.id;
        
        if (e.target.classList.contains('delete-btn')) {
            deleteInfo = { id, type: 'message' };
            deleteModal.classList.remove('hidden');
            return;
        }

        const message = await apiRequest('GET', `/api/admin/messages/${id}`); // This now works because of the server fix
        if (!message) return;

        document.getElementById('reply-modal-name').textContent = message.name;
        document.getElementById('reply-modal-email').textContent = message.email;
        document.getElementById('reply-modal-message').textContent = message.message;
        document.getElementById('reply-message-id').value = id;
        replyModal.classList.remove('hidden');

        if (card.dataset.read === 'false') {
            await apiRequest('PUT', `/api/admin/messages/${id}/read`);
            fetchMessages();
        }
    });

    closeReplyModalBtn.addEventListener('click', () => {
        replyModal.classList.add('hidden');
        replyForm.reset();
        document.getElementById('reply-status').textContent = '';
    });

    replyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('reply-message-id').value;
        const data = { replyMessage: document.getElementById('reply-textarea').value };
        const statusEl = document.getElementById('reply-status');
        
        const result = await apiRequest('POST', `/api/admin/messages/${id}/reply`, data);
        if (result && result.success) {
            statusEl.textContent = 'Reply sent!';
            statusEl.className = 'text-right mt-2 h-6 text-green-500';
            setTimeout(() => {
                closeReplyModalBtn.click();
                fetchMessages(); // Refresh list to show "Replied" badge
            }, 1500);
        } else {
            statusEl.textContent = 'Failed to send.';
            statusEl.className = 'text-right mt-2 h-6 text-red-500';
        }
    });

      // --- DELETE MODAL LOGIC (CONSOLIDATED & CORRECTED) ---
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        const { id, type } = deleteInfo;
        if (id && type) {
            const result = await apiRequest('DELETE', `/api/admin/${type}s/${id}`); // Note the 's' for plural
            if (result) {
                deleteModal.classList.add('hidden');
                // Call the correct fetch function based on the type
                if (type === 'project') await fetchProjects();
                else if (type === 'service') await fetchServices();
                else if (type === 'experience') await fetchExperiences();
                else if (type === 'message') await fetchMessages();
                else if (type === 'booking') await fetchBookings();
            }
        }
    });

    // --- LOGOUT ---
    logoutBtn.addEventListener('click', async () => {
        await apiRequest('POST', '/api/admin/logout');
        window.location.href = '/admin/login.html';
    });
 // --- NEW: ADMIN SETTINGS LOGIC ---
    requestOtpBtn.addEventListener('click', async () => {
        const statusEl = document.getElementById('otp-request-status');
        statusEl.textContent = 'Sending OTP...';
        const result = await apiRequest('POST', '/api/admin/request-otp');
        if (result && result.success) {
            statusEl.textContent = result.message;
            statusEl.className = 'mt-4 h-6 text-green-500';
            otpRequestView.classList.add('hidden');
            otpVerifyView.classList.remove('hidden');
        } else {
            statusEl.textContent = result ? result.message : 'An error occurred.';
            statusEl.className = 'mt-4 h-6 text-red-500';
        }
    });

    otpVerifyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = document.getElementById('otp-verify-status');
        const otp = otpVerifyForm.querySelector('#otp-input').value;
        statusEl.textContent = 'Verifying...';

        const result = await apiRequest('POST', '/api/admin/verify-otp', { otp });
        if (result && result.success) {
            statusEl.textContent = '';
            otpVerifyView.classList.add('hidden');
            adminContentView.classList.remove('hidden');
        } else {
            statusEl.textContent = result ? result.message : 'Verification failed.';
            statusEl.className = 'mt-4 h-6 text-red-500';
        }
        otpVerifyForm.reset();
    });

    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = document.getElementById('change-password-status');
        const data = Object.fromEntries(new FormData(changePasswordForm).entries());
        
        const result = await apiRequest('PUT', '/api/admin/change-password', data);
        if (result && result.success) {
            statusEl.textContent = result.message;
            statusEl.className = 'mt-4 h-6 text-green-500';
            changePasswordForm.reset();
            // Optional: Hide forms and show request OTP view again
            showSection('admin-settings'); 
        } else {
            statusEl.textContent = result ? result.message : 'Failed to change password.';
            statusEl.className = 'mt-4 h-6 text-red-500';
        }
    });

    createAdminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = document.getElementById('create-admin-status');
        const data = Object.fromEntries(new FormData(createAdminForm).entries());

        const result = await apiRequest('POST', '/api/admin/create-admin', data);
        if (result && result.success) {
            statusEl.textContent = result.message;
            statusEl.className = 'mt-4 h-6 text-green-500';
            createAdminForm.reset();
             // Optional: Hide forms and show request OTP view again
            showSection('admin-settings');
        } else {
            statusEl.textContent = result ? result.message : 'Failed to create admin.';
            statusEl.className = 'mt-4 h-6 text-red-500';
        }
    });
     // --- EMAIL TEMPLATE BUILDER LOGIC ---
    const createMasterTemplate = (config, variables) => {
        const { primaryColor, headerText, bodyText, footerText, showSocials, githubLink, linkedinLink } = config;
        let personalizedBody = bodyText;
        for (const [key, value] of Object.entries(variables)) {
            personalizedBody = personalizedBody.replace(new RegExp(`{{${key}}}`, 'g'), value.replace(/\n/g, '<br>'));
        }
        const socialsHTML = (showSocials === 'on' || showSocials === true) ? `<div style="text-align: center; margin-top: 20px;"><a href="${githubLink}" style="margin: 0 10px;">GitHub</a><a href="${linkedinLink}" style="margin: 0 10px;">LinkedIn</a></div>` : '';
        return `<div style="font-family: Poppins, sans-serif; background-color: #f1f5f9; padding: 40px;"><div style="max-width: 600px; margin: auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"><div style="background-color: ${primaryColor}; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0; font-size: 24px;">${headerText}</h1></div><div style="padding: 30px; font-size: 16px; line-height: 1.7;">${personalizedBody}</div><div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b;"><p>${footerText}</p>${socialsHTML}</div></div></div>`;
    };

    const fetchEmailTemplates = async () => {
        const templates = await apiRequest('GET', '/api/admin/email-templates');
        if (!templates) return;
        
        emailTemplatesList.innerHTML = '';
        templates.forEach(template => {
            const config = JSON.parse(template.htmlContent);
            const builderHTML = `
                <div class="bg-slate-800/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-slate-700/50 shadow-2xl transition-all hover:shadow-teal-500/10" id="builder-${template._id}">
                    <form class="email-template-form space-y-6" data-id="${template._id}">
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/50 pb-4">
                            <div>
                                <h3 class="text-2xl font-bold text-white tracking-tight">${template.templateName}</h3>
                                <div class="flex flex-wrap gap-2 mt-2">
                                    ${template.variables.map(v => `<span class="bg-teal-500/10 text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-500/20 uppercase tracking-widest cursor-help" title="Copy to use in content">${v}</span>`).join('')}
                                </div>
                            </div>
                            <div class="flex items-center space-x-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                                <span class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Live Preview Enabled</span>
                                <div class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div class="space-y-5">
                                <div>
                                    <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Email Subject Line</label>
                                    <input type="text" name="subject" value="${template.subject || ''}" placeholder="e.g. New Message from {{name}}" class="w-full bg-slate-900/80 border border-slate-600 p-3 rounded-xl text-white focus:outline-none focus:border-teal-400 transition-all shadow-inner">
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Color</label>
                                        <div class="flex items-center space-x-3 bg-slate-900/80 border border-slate-600 p-2.5 rounded-xl">
                                            <input type="color" name="primaryColor" value="${config.primaryColor || '#14b8a6'}" class="w-10 h-8 bg-transparent border-0 cursor-pointer">
                                            <span class="text-slate-300 font-mono text-sm">${config.primaryColor || '#14b8a6'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Header Text</label>
                                        <input type="text" name="headerText" value="${config.headerText || ''}" class="w-full bg-slate-900/80 border border-slate-600 p-3 rounded-xl text-white focus:outline-none focus:border-teal-400 transition-all shadow-inner">
                                    </div>
                                </div>

                                <div>
                                    <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Body content (HTML supported)</label>
                                    <textarea name="bodyText" rows="6" class="w-full bg-slate-900/80 border border-slate-600 p-3 rounded-xl text-white focus:outline-none focus:border-teal-400 transition-all shadow-inner font-mono text-sm">${config.bodyText || ''}</textarea>
                                </div>

                                <div>
                                    <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Footer Text</label>
                                    <input type="text" name="footerText" value="${config.footerText || ''}" class="w-full bg-slate-900/80 border border-slate-600 p-3 rounded-xl text-white focus:outline-none focus:border-teal-400 transition-all shadow-inner">
                                </div>

                                <div class="bg-slate-900/40 p-4 rounded-xl border border-slate-700/30 space-y-4">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Social Links</span>
                                        <label class="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="showSocials" class="sr-only peer" ${config.showSocials ? 'checked' : ''} onchange="this.closest('form').querySelector('.social-fields-grid').classList.toggle('hidden', !this.checked)">
                                            <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                                        </label>
                                    </div>
                                    <div class="social-fields-grid grid grid-cols-1 md:grid-cols-2 gap-3 ${config.showSocials ? '' : 'hidden'}">
                                        <input type="text" name="githubLink" placeholder="GitHub URL" value="${config.githubLink || ''}" class="w-full bg-slate-800 border border-slate-600 p-2 rounded-lg text-white text-xs">
                                        <input type="text" name="linkedinLink" placeholder="LinkedIn URL" value="${config.linkedinLink || ''}" class="w-full bg-slate-800 border border-slate-600 p-2 rounded-lg text-white text-xs">
                                    </div>
                                </div>

                                <button type="submit" class="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl hover:from-teal-400 hover:to-emerald-400 shadow-[0_4px_15px_rgba(20,184,166,0.2)] hover:shadow-[0_8px_25px_rgba(20,184,166,0.4)] transition-all duration-300 border border-teal-400/20 active:scale-[0.98]">Save Template Configuration</button>
                            </div>
                            
                            <div class="flex flex-col h-full">
                                <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time Desktop Preview</label>
                                <div class="flex-1 bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl ring-1 ring-white/5 relative group">
                                    <div class="absolute top-0 left-0 right-0 h-6 bg-slate-800 flex items-center px-3 space-x-1.5 border-b border-slate-700/50">
                                        <div class="w-2 h-2 rounded-full bg-red-400/50"></div>
                                        <div class="w-2 h-2 rounded-full bg-yellow-400/50"></div>
                                        <div class="w-2 h-2 rounded-full bg-green-400/50"></div>
                                    </div>
                                    <iframe class="w-full h-[500px] border-0 pt-6 bg-slate-100"></iframe>
                                </div>
                                <p class="text-[10px] text-slate-500 mt-2 text-center italic">The preview uses sample data to demonstrate layouts.</p>
                            </div>
                        </div>
                    </form>
                </div>`;
            emailTemplatesList.insertAdjacentHTML('beforeend', builderHTML);
        });

        document.querySelectorAll('.email-template-form').forEach(form => {
            const updatePreview = () => {
                const formData = new FormData(form);
                const config = Object.fromEntries(formData.entries());
                config.showSocials = form.querySelector('[name="showSocials"]').checked;
                
                const iframe = form.querySelector('iframe');
                const templateName = form.querySelector('h3').textContent;
                const sampleVars = getSampleData(templateName);
                iframe.srcdoc = createMasterTemplate(config, sampleVars);
            };

            form.addEventListener('input', updatePreview);
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = form.dataset.id;
                const formData = new FormData(form);
                const rawData = Object.fromEntries(formData.entries());
                
                const config = {
                    primaryColor: rawData.primaryColor,
                    headerText: rawData.headerText,
                    bodyText: rawData.bodyText,
                    footerText: rawData.footerText,
                    showSocials: form.querySelector('[name="showSocials"]').checked,
                    githubLink: rawData.githubLink,
                    linkedinLink: rawData.linkedinLink
                };
                
                const data = { 
                    htmlContent: JSON.stringify(config), 
                    subject: rawData.subject || "No Subject" 
                };

                const result = await apiRequest('PUT', `/api/admin/email-templates/${id}`, data);
                if (result) showToast(`'${rawData.subject}' template saved successfully!`);
            });
            updatePreview();
        });
    };
    
    // Use event delegation for dynamically created forms
    emailTemplatesList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('preview-template-btn')) {
            e.preventDefault();
            const form = e.target.closest('.email-template-form');
            const templateName = e.target.dataset.templateName;
            const subject = form.querySelector('[name="subject"]').value;
            const htmlContent = form.querySelector('[name="htmlContent"]').value;
            
            showPreview(templateName, subject, htmlContent);
        }
    });
    
    emailTemplatesList.addEventListener('submit', async (e) => {
        if (e.target.classList.contains('email-template-form')) {
            e.preventDefault();
            // ... (your existing form submission logic for templates) ...
            showToast('Email template saved successfully!');
        }
    });

    // --- NEW: EMAIL PREVIEW LOGIC ---
    const getSampleData = (templateName) => {
        const sample = {
            name: 'John Doe',
            email: 'johndoe@example.com',
            message: 'This is a test message to see how the template looks.\n\nIt can even have multiple lines!',
            replyMessage: 'Thank you for your feedback! We will look into this and get back to you shortly.',
            originalMessage: 'I had a question about your services.',
            subject: 'Question about your services'
        };

        switch (templateName) {
            case 'adminNotification':
                return { '{{name}}': sample.name, '{{email}}': sample.email, '{{message}}': sample.message };
            case 'userConfirmation':
                return { '{{name}}': sample.name, '{{message}}': sample.message };
            case 'adminReply':
                return { '{{name}}': sample.name, '{{replyMessage}}': sample.replyMessage, '{{originalMessage}}': sample.originalMessage, '{{subject}}': sample.subject };
            default:
                return {};
        }
    };

 
    // --- SUPER ADMIN FUNCTIONS ---
    const fetchUsers = async () => {
        const users = await apiRequest('GET', '/api/admin/users');
        if (!users) return;
        allUsers = users; // Store users for later access
        usersTableBody.innerHTML = '';
        users.forEach(user => {
            const isSuper = user.email === 'akashmandal6297@gmail.com';
            const row = `
                <tr data-id="${user._id}">
                    <td class="p-3 border-t border-slate-700">${user.username} ${isSuper ? '<span class="text-xs text-teal-400">(Super Admin)</span>' : ''}</td>
                    <td class="p-3 border-t border-slate-700">${user.email}</td>
                    <td class="p-3 border-t border-slate-700">
                        <button class="edit-user-btn bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500 hover:text-white p-2 rounded-lg transition-all duration-300">
                            <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        ${!isSuper ? `
                        <button class="delete-btn bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-all duration-300 ml-2" data-type="user" title="Delete User">
                            <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>` : ''}
                    </td>
                </tr>`;
            usersTableBody.insertAdjacentHTML('beforeend', row);
        });
    };
    
    // --- UI FUNCTIONALITY: SECTION TOGGLING ---
    const showSection = (sectionId) => {
        sidebarLinks.forEach(link => link.classList.remove('active'));
        adminSections.forEach(section => section.classList.add('hidden'));

        const activeLink = document.querySelector(`.sidebar-link[data-section="${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');

        const selectedSection = document.getElementById(`${sectionId}-container`);
        if (selectedSection) {
            selectedSection.classList.remove('hidden');
            
            if (sectionId === 'admin-settings') {
                if (currentUserIsSuperAdmin) {
                    superAdminView.classList.remove('hidden');
                    normalAdminView.classList.add('hidden');
                    fetchUsers();
                } else {
                    normalAdminView.classList.remove('hidden');
                    superAdminView.classList.add('hidden');
                }
            } else if (sectionId === 'hero-management') fetchHeroData();
            else if (sectionId === 'about-management') fetchAboutData();
            else if (sectionId === 'resume-management') loadResume();
            else if (sectionId === 'experience-management') fetchExperiences();
            else if (sectionId === 'projects-management') fetchProjects();
            else if (sectionId === 'services-management') fetchServices();
            else if (sectionId === 'messages-management') fetchMessages();
            else if (sectionId === 'bookings-management') fetchBookings();
            else if (sectionId === 'email-templates') fetchEmailTemplates();
        }
    };

// Super Admin event listeners
    usersTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const row = target.closest('tr');
        if (!row) return;
        const id = row.dataset.id;

        if (target.classList.contains('edit-user-btn')) {
            const user = allUsers.find(u => u._id === id); // Use the stored user list
            if (!user) return;
            editUserForm.querySelector('#edit-user-id').value = id;
            editUserForm.querySelector('#edit-username').value = user.username;
            editUserForm.querySelector('#edit-email').value = user.email;
            editUserForm.querySelector('#edit-new-password').value = '';
            editUserModal.classList.remove('hidden');
        }
        if (target.classList.contains('delete-btn')) {
             deleteInfo = { id, type: 'user' };
             deleteModal.classList.remove('hidden');
        }
    });

    const showPreview = (templateName, subject, htmlContent) => {
        const sampleData = getSampleData(templateName);
        let personalizedSubject = subject;
        let personalizedHtml = htmlContent;

        // Replace all variables in the subject and HTML
        for (const [variable, value] of Object.entries(sampleData)) {
            const regex = new RegExp(variable, 'g');
            personalizedSubject = personalizedSubject.replace(regex, value);
            personalizedHtml = personalizedHtml.replace(regex, value.replace(/\n/g, '<br>'));
        }
        
        previewSubject.textContent = personalizedSubject;
        // Using srcdoc is the best way to render HTML in an iframe for security and style isolation
        previewIframe.srcdoc = personalizedHtml;
        
        emailPreviewModal.classList.remove('hidden');
    };

    closePreviewModalBtn.addEventListener('click', () => {
        emailPreviewModal.classList.add('hidden');
        previewIframe.srcdoc = ''; // Clear the iframe content
    });

     // --- STEP 4: INITIALIZE THE PAGE ---
    // ===================================================================
    const initializeDashboard = async () => {
        // First, check the admin status
        const status = await apiRequest('GET', '/api/admin/status');
        if (status) {
            currentUserIsSuperAdmin = status.isSuperAdmin;
        }
        // THEN, show the default section
        showSection('hero-management');
    };

    initializeDashboard();

    // ==========================================
    // RESUME MANAGEMENT LOGIC (ADVANCED)
    // ==========================================

    let resumeSections = [];
    let summaryQuill;
    const quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
        ]
    };

    function initQuill(selector, placeholder = '') {
        const quill = new Quill(selector, {
            theme: 'snow',
            placeholder: placeholder || 'Start typing...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });
        return quill;
    }

    function updateSummaryCounter(quill) {
        const text = quill.getText().trim();
        const charCount = text.length;
        const wordCount = text.split(/\s+/).filter(w => w).length;
        const counterEl = document.getElementById('summary-counter');
        if (counterEl) {
            counterEl.innerText = `${charCount} characters | ${wordCount} words`;
        }
    }

    async function loadResume() {
        try {
            const res = await fetch('/api/resume');
            if (!res.ok) throw new Error('Failed to load resume');
            const resume = await res.json();
            
            // Populate Personal Info
            if (resume.personalInfo) {
                document.getElementById('resume-name').value = resume.personalInfo.name || '';
                document.getElementById('resume-title').value = resume.personalInfo.title || '';
                document.getElementById('resume-email').value = resume.personalInfo.email || '';
                document.getElementById('resume-phone').value = resume.personalInfo.phone || '';
                document.getElementById('resume-address').value = resume.personalInfo.address || '';
                document.getElementById('resume-linkedin').value = resume.personalInfo.linkedin || '';
                document.getElementById('resume-github').value = resume.personalInfo.github || '';
                
                // Initialize/Update Summary Quill
                if (!summaryQuill) {
                    summaryQuill = initQuill('#resume-summary-editor');
                }
                if (summaryQuill) {
                    summaryQuill.root.innerHTML = resume.personalInfo.summary || '';
                    updateSummaryCounter(summaryQuill);
                    summaryQuill.on('text-change', () => updateSummaryCounter(summaryQuill));
                }
                if (resume.personalInfo.photoShape) {
                document.getElementById('resume-photo-shape').value = resume.personalInfo.photoShape;
            }
            document.getElementById('resume-summary').value = resume.personalInfo.summary || '';
                
                // Photo Preview
                const previewImg = document.getElementById('resume-photo-preview');
                const placeholder = document.getElementById('resume-photo-placeholder');
                if (resume.personalInfo.photoUrl) {
                    previewImg.src = resume.personalInfo.photoUrl;
                    previewImg.classList.remove('hidden');
                    placeholder.classList.add('hidden');
                    document.getElementById('resume-photoUrl').value = resume.personalInfo.photoUrl;
                }
            }

            // NEW: Populate Template Selection
            if (resume.selectedTemplate) {
                const radio = document.querySelector(`input[name="selectedTemplate"][value="${resume.selectedTemplate}"]`);
                if (radio) radio.checked = true;
            }

            // Populate Skills (Dynamic)
            populateDynamicArray('resume-skills-container', resume.skills || [], createSkillRow);

            // Populate Dynamic Arrays
            populateDynamicArray('resume-experience-container', resume.experience || [], createExperienceRow);
            populateDynamicArray('resume-education-container', resume.education || [], createEducationRow);
            populateDynamicArray('resume-project-container', resume.projects || [], createResumeProjectRow);
            populateDynamicArray('resume-language-container', resume.languages || [], createLanguageRow);
            
            // Populate Section Config
            resumeSections = resume.sections && resume.sections.length > 0 ? resume.sections : [
                { id: 'summary', name: 'Summary', order: 0, isVisible: true },
                { id: 'experience', name: 'Experience', order: 1, isVisible: true },
                { id: 'projects', name: 'Projects', order: 2, isVisible: true },
                { id: 'education', name: 'Education', order: 3, isVisible: true },
                { id: 'skills', name: 'Skills', order: 4, isVisible: true },
                { id: 'languages', name: 'Languages', order: 5, isVisible: true }
            ];
            // ── Populate Typography preview controls from saved data ──
            if (resume.typography) {
                const ty = resume.typography;
                const pvFont   = document.getElementById('pv-font');
                const pvSize   = document.getElementById('pv-size');
                const pvLh     = document.getElementById('pv-lh');
                const pvGap    = document.getElementById('pv-gap');
                const pvAccent = document.getElementById('pv-accent');
                const pvSizeV  = document.getElementById('pv-size-val');
                const pvLhV    = document.getElementById('pv-lh-val');
                const pvGapV   = document.getElementById('pv-gap-val');
                if (pvFont   && ty.font)        pvFont.value   = ty.font;
                if (pvSize   && ty.size)        { pvSize.value   = ty.size;       if (pvSizeV) pvSizeV.textContent = ty.size + 'px'; }
                if (pvLh     && ty.lineHeight)  { pvLh.value     = ty.lineHeight; if (pvLhV)   pvLhV.textContent   = parseFloat(ty.lineHeight).toFixed(2); }
                if (pvGap    && ty.sectionGap)  { pvGap.value    = ty.sectionGap; if (pvGapV)  pvGapV.textContent  = ty.sectionGap + 'px'; }
                if (pvAccent && ty.accentColor) pvAccent.value = ty.accentColor;
            }

            renderSectionConfig();
            
        } catch (error) {
            console.error('Error loading resume:', error);
        }
    }

    // Photo Preview Logic
    const resumePhotoInput = document.getElementById('resume-photo-file');
    if (resumePhotoInput) {
        resumePhotoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewImg = document.getElementById('resume-photo-preview');
                    const placeholder = document.getElementById('resume-photo-placeholder');
                    previewImg.src = e.target.result;
                    previewImg.classList.remove('hidden');
                    placeholder.classList.add('hidden');
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Section Config Logic
    function renderSectionConfig() {
        const container = document.getElementById('resume-sections-config');
        if (!container) return;
        container.innerHTML = '';
        
        // Sort sections by order
        resumeSections.sort((a, b) => a.order - b.order);
        
        resumeSections.forEach((section, index) => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg group';
            div.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="flex flex-col space-y-1">
                        <button type="button" class="text-slate-500 hover:text-teal-400 p-0.5" onclick="moveSection(${index}, -1)" ${index === 0 ? 'disabled' : ''}>
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                        </button>
                        <button type="button" class="text-slate-500 hover:text-teal-400 p-0.5" onclick="moveSection(${index}, 1)" ${index === resumeSections.length - 1 ? 'disabled' : ''}>
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                    </div>
                    <span class="font-bold text-slate-300">${section.name}</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" class="sr-only peer" ${section.isVisible ? 'checked' : ''} onchange="toggleSectionVisibility(${index})">
                    <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
            `;
            container.appendChild(div);
        });
    }

    window.moveSection = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= resumeSections.length) return;
        
        const temp = resumeSections[index];
        resumeSections[index] = resumeSections[targetIndex];
        resumeSections[targetIndex] = temp;
        
        // Update orders
        resumeSections.forEach((s, i) => s.order = i);
        renderSectionConfig();
    };

    window.toggleSectionVisibility = (index) => {
        resumeSections[index].isVisible = !resumeSections[index].isVisible;
    };

    // Helper to populate arrays
    function populateDynamicArray(containerId, items, rowCreator) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        if (items.length > 0) {
            items.forEach(item => container.appendChild(rowCreator(item)));
        }
    }

    // HTML Row Creators
    function createExperienceRow(data = {}) {
        const div = document.createElement('div');
        div.className = 'resume-experience-item flex flex-col md:flex-row gap-4 p-4 border border-slate-700/50 rounded-lg bg-slate-800/50 relative';
        const uniqueId = 'exp-editor-' + Date.now() + Math.random().toString(36).substr(2, 9);
        div.innerHTML = `
            <button type="button" class="absolute top-2 right-2 text-red-500 hover:text-red-400 bg-slate-900/80 p-1.5 rounded-lg transition-all z-10 hover:scale-110 shadow-lg border border-red-500/20" title="Delete Entry" onclick="this.parentElement.remove()">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <div class="flex-1 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" placeholder="Company/Organization" value="${data.company || ''}" required class="exp-company w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
                    <input type="text" placeholder="Job Title/Position" value="${data.position || ''}" required class="exp-position w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Start Date" value="${data.startDate || ''}" required class="exp-start w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
                    <input type="text" placeholder="End Date" value="${data.endDate || ''}" required class="exp-end w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
                </div>
                <div class="relative">
                    <label class="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Experience Description / Key Responsibilities</label>
                    <div id="${uniqueId}" class="quill-editor-container exp-desc-editor"></div>
                </div>
            </div>
        `;
        // Delay Quill initialization until the element is in the DOM
        setTimeout(() => {
            const quill = initQuill('#' + uniqueId);
            quill.root.innerHTML = data.description || '';
            div.dataset.quillId = uniqueId;
            div.quillInstance = quill;
        }, 0);
        return div;
    }

    function createEducationRow(data = {}) {
        const div = document.createElement('div');
        div.className = 'resume-education-item flex flex-col md:flex-row gap-4 p-4 border border-slate-700/50 rounded-lg bg-slate-800/50 relative';
        const uniqueId = 'edu-editor-' + Date.now() + Math.random().toString(36).substr(2, 9);
        div.innerHTML = `
            <button type="button" class="absolute top-2 right-2 text-red-400 hover:text-red-300 transition z-10" onclick="this.parentElement.remove()">
                 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <div class="flex-1 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" placeholder="Institution/University" value="${data.institution || ''}" required class="edu-inst w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
                    <input type="text" placeholder="Degree/Certificate" value="${data.degree || ''}" required class="edu-deg w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Start Date" value="${data.startDate || ''}" required class="edu-start w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
                    <input type="text" placeholder="End Date" value="${data.endDate || ''}" required class="edu-end w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
                </div>
                <!-- Performance Metric -->
                <div class="grid grid-cols-2 gap-3">
                    <select class="edu-score-type w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
                        <option value="CGPA" ${data.scoreType === 'CGPA' ? 'selected' : ''}>CGPA</option>
                        <option value="Percentage" ${data.scoreType === 'Percentage' ? 'selected' : ''}>Percentage</option>
                    </select>
                    <input type="text" placeholder="Value (e.g. 9.0 or 85%)" value="${data.scoreValue || ''}" class="edu-score-value w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
                </div>
                <div class="relative">
                    <label class="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Other Details (Optional)</label>
                    <div id="${uniqueId}" class="quill-editor-container edu-desc-editor"></div>
                </div>
            </div>
        `;
        setTimeout(() => {
            const quill = initQuill('#' + uniqueId);
            quill.root.innerHTML = data.description || '';
            div.quillInstance = quill;
        }, 0);
        return div;
    }

    function createResumeProjectRow(data = {}) {
        const div = document.createElement('div');
        div.className = 'resume-project-item flex flex-col md:flex-row gap-4 p-4 border border-slate-700/50 rounded-lg bg-slate-800/50 relative';
        const uniqueId = 'proj-editor-' + Date.now() + Math.random().toString(36).substr(2, 9);
        div.innerHTML = `
            <button type="button" class="absolute top-2 right-2 text-red-400 hover:text-red-300 transition z-10" onclick="this.parentElement.remove()">
                 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <div class="flex-1 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" placeholder="Project Name" value="${data.name || ''}" required class="proj-name w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
                    <input type="url" placeholder="Project Link" value="${data.link || ''}" class="proj-link w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
                </div>
                <div class="relative">
                    <label class="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Project Description / Technical Stack</label>
                    <div id="${uniqueId}" class="quill-editor-container proj-desc-editor"></div>
                </div>
            </div>
        `;
        setTimeout(() => {
            const quill = initQuill('#' + uniqueId);
            quill.root.innerHTML = data.description || '';
            div.quillInstance = quill;
        }, 0);
        return div;
    }

    function createLanguageRow(data = {}) {
        const div = document.createElement('div');
        div.className = 'resume-language-item flex items-center gap-3 p-3 border border-slate-700/50 rounded-lg bg-slate-800/50 relative';
        div.innerHTML = `
            <input type="text" placeholder="Language" value="${data.language || ''}" required class="lang-name w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
            <input type="text" placeholder="Proficiency" value="${data.proficiency || ''}" required class="lang-level w-full bg-slate-900 border border-slate-600 p-2 rounded text-white focus:outline-none focus:border-teal-400 text-sm">
            <button type="button" class="text-red-500 hover:text-red-400 bg-slate-900/50 p-1 rounded-lg transition-all hover:scale-110" title="Delete Entry" onclick="this.parentElement.remove()">
                 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        `;
        return div;
    }

    function createSkillRow(skill = '') {
        const div = document.createElement('div');
        div.className = 'resume-skill-item flex items-center gap-2 p-2 bg-slate-800/30 border border-slate-700/50 rounded-lg group';
        div.innerHTML = `
            <input type="text" value="${skill}" placeholder="e.g. React" class="skill-input flex-1 bg-transparent border-none text-slate-200 focus:outline-none text-sm p-1">
            <button type="button" class="text-slate-500 hover:text-red-500 transition hover:scale-110" title="Delete Skill" onclick="this.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        `;
        return div;
    }

    // Event Listeners
    document.getElementById('add-resume-experience')?.addEventListener('click', () => {
        document.getElementById('resume-experience-container').appendChild(createExperienceRow());
    });
    document.getElementById('add-resume-skill')?.addEventListener('click', () => {
        document.getElementById('resume-skills-container').appendChild(createSkillRow());
    });
    document.getElementById('add-resume-education')?.addEventListener('click', () => {
        document.getElementById('resume-education-container').appendChild(createEducationRow());
    });
    document.getElementById('add-resume-project')?.addEventListener('click', () => {
        document.getElementById('resume-project-container').appendChild(createResumeProjectRow());
    });
    document.getElementById('add-resume-language')?.addEventListener('click', () => {
        document.getElementById('resume-language-container').appendChild(createLanguageRow());
    });

    const resumeFormObj = document.getElementById('resume-form');
    if (resumeFormObj) {
        resumeFormObj.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            
            const photoFile = document.getElementById('resume-photo-file').files[0];
            if (photoFile) formData.append('resumePhoto', photoFile);

            // NEW: Template selection
            const selectedTemplate = document.querySelector('input[name="selectedTemplate"]:checked')?.value || 'classic';
            formData.append('selectedTemplate', selectedTemplate);

            const experiences = Array.from(document.querySelectorAll('.resume-experience-item')).map(item => ({
                company: item.querySelector('.exp-company').value,
                position: item.querySelector('.exp-position').value,
                startDate: item.querySelector('.exp-start').value,
                endDate: item.querySelector('.exp-end').value,
                description: item.quillInstance ? item.quillInstance.root.innerHTML : ''
            }));

            const education = Array.from(document.querySelectorAll('.resume-education-item')).map(item => ({
                institution: item.querySelector('.edu-inst').value,
                degree: item.querySelector('.edu-deg').value,
                startDate: item.querySelector('.edu-start').value,
                endDate: item.querySelector('.edu-end').value,
                scoreType: item.querySelector('.edu-score-type').value,
                scoreValue: item.querySelector('.edu-score-value').value,
                description: item.quillInstance ? item.quillInstance.root.innerHTML : ''
            }));

            const projects = Array.from(document.querySelectorAll('.resume-project-item')).map(item => ({
                name: item.querySelector('.proj-name').value,
                link: item.querySelector('.proj-link').value,
                description: item.quillInstance ? item.quillInstance.root.innerHTML : ''
            }));

            const languages = Array.from(document.querySelectorAll('.resume-language-item')).map(item => ({
                language: item.querySelector('.lang-name').value,
                proficiency: item.querySelector('.lang-level').value
            }));

            const personalInfo = {
                name: document.getElementById('resume-name').value,
                title: document.getElementById('resume-title').value,
                email: document.getElementById('resume-email').value,
                phone: document.getElementById('resume-phone').value,
                address: document.getElementById('resume-address').value,
                linkedin: document.getElementById('resume-linkedin').value,
                github: document.getElementById('resume-github').value,
                summary: summaryQuill ? summaryQuill.root.innerHTML : document.getElementById('resume-summary').value,
                photoUrl: document.getElementById('resume-photoUrl').value,
                photoShape: document.getElementById('resume-photo-shape').value
            };

            formData.append('personalInfo', JSON.stringify(personalInfo));
            
            const skillInputs = document.querySelectorAll('.skill-input');
            const skillsArray = Array.from(skillInputs).map(input => input.value).filter(val => val.trim() !== '');
            formData.append('skills', JSON.stringify(skillsArray));
            formData.append('experience', JSON.stringify(experiences));
            formData.append('education', JSON.stringify(education));
            formData.append('projects', JSON.stringify(projects));
            formData.append('languages', JSON.stringify(languages));
            formData.append('sections', JSON.stringify(resumeSections));

            // ── Include typography settings from preview controls ──
            const typography = {
                font:        document.getElementById('pv-font')?.value   || "'Inter', sans-serif",
                size:        parseFloat(document.getElementById('pv-size')?.value  || 13),
                lineHeight:  parseFloat(document.getElementById('pv-lh')?.value   || 1.5),
                sectionGap:  parseFloat(document.getElementById('pv-gap')?.value  || 20),
                accentColor: document.getElementById('pv-accent')?.value || '#1e3a5f'
            };
            formData.append('typography', JSON.stringify(typography));

            const submitBtn = e.target.querySelector('button[type="submit"]');
            const ogText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Saving...';
            submitBtn.disabled = true;
            
            try {
                const res = await fetch('/api/admin/resume', { method: 'PUT', body: formData });
                if (res.ok) {
                    showToast('Resume saved successfully!');
                    loadResume();
                } else {
                    const err = await res.json();
                    throw new Error(err.message);
                }
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                submitBtn.innerHTML = ogText;
                submitBtn.disabled = false;
            }
        });
    }

    // --- SCROLL TO TOP LOGIC ---
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
    }

    // --- SUPER ADVANCED AI DATA BOT LOGIC ---
    if (aiBotToggle) {
        const aiInputView = document.getElementById('ai-input-view');
        const aiResultsView = document.getElementById('ai-results-view');
        const aiInputActions = document.getElementById('ai-input-actions');
        const aiResultsFields = document.getElementById('ai-results-fields');
        const aiDetectedSection = document.getElementById('ai-detected-section');
        const aiGrammarToggle = document.getElementById('ai-grammar-fix');
        const aiFillBtn = document.getElementById('ai-fill-btn');
        const aiBackBtn = document.getElementById('ai-back-btn');
        let suggestionsPanel = document.getElementById('ai-suggestions-panel');

        let lastExtractedData = null;

        // ─── SECTION TIPS ─────────────────────────────────────────────
        const sectionTips = {
            'experience-management': [
                '💼 "Software Engineer at Google, Jan 2021 - Present. Led backend API development."',
                '📅 Include dates like "Jan 2020 to Dec 2022" or "2019 - Present".',
                '🏢 Format: "Job Title at Company, start - end. What you achieved."',
            ],
            'projects-management': [
                '🚀 "E-commerce app using React & Node.js. Live at https://myapp.com"',
                '🔗 Include a GitHub or live URL for auto-detection.',
                '🏷️ Mention: "Tech Stack: React, Tailwind, MongoDB"',
            ],
            'services-management': [
                '⚡ "Full Stack Web Development — I build end-to-end web solutions."',
                '💡 Describe what you offer and what the client will get.',
            ],
            'about-management': [
                '👤 "Passionate developer with 5 years of experience. Skills: JS, Python, AWS"',
                '📝 Write 2 paragraphs: one about yourself, one about expertise.',
            ],
            'hero-management': [
                '👋 "Hello! I am a Full Stack Developer building amazing web experiences."',
                '✨ Keep it short and punchy — greeting plus your headline.',
            ],
            'resume-management': [
                '📄 "Name: John Doe. Email: john@email.com. Senior Developer with 5 years."',
                '🎓 Include education: "Studied CS at MIT, 2015-2019"',
            ],
            'bookings-management': [
                '📅 This section shows incoming meeting requests from your portfolio visitors.',
                '💬 Clients use the booking form on your site, they appear here automatically.',
            ]
        };

        // ─── CLOSE / OPEN (FIXED - SEPARATED) ────────────────────────
        const closeAiBot = () => {
            aiBotModal.classList.add('hidden');
            document.body.style.overflow = '';
        };

        const openAiBot = () => {
            // Reset UI state without closing modal
            aiInputView.classList.remove('hidden');
            aiInputActions.classList.remove('hidden');
            aiResultsView.classList.add('hidden');
            aiBotInput.value = '';
            aiFileInput.value = '';
            aiFileStatus.innerHTML = 'Drop image or <span class="text-indigo-400 underline cursor-pointer">browse</span>';
            aiProcessStatus.classList.add('hidden');
            if (aiResultsFields) aiResultsFields.innerHTML = '';
            lastExtractedData = null;
            if (suggestionsPanel) suggestionsPanel.classList.remove('hidden');
            // NOW open the modal
            aiBotModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            setTimeout(() => aiBotInput.focus(), 100);
        };

        aiBotToggle.addEventListener('click', openAiBot);
        closeAiBotBtn.addEventListener('click', closeAiBot);

        // Backdrop click closes
        aiBotModal.addEventListener('click', (e) => {
            if (e.target === aiBotModal) closeAiBot();
        });

        // Escape key closes
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !aiBotModal.classList.contains('hidden')) {
                closeAiBot();
            }
        });

        aiBackBtn.addEventListener('click', () => {
            aiResultsView.classList.add('hidden');
            aiInputView.classList.remove('hidden');
            aiInputActions.classList.remove('hidden');
            if (suggestionsPanel) suggestionsPanel.classList.remove('hidden');
        });

        // ─── DRAG & DROP / FILE HANDLING ────────────
        aiDropZone.addEventListener('click', () => aiFileInput.click());
        aiDropZone.addEventListener('dragover', (e) => { e.preventDefault(); aiDropZone.classList.add('border-indigo-500', 'bg-indigo-500/5'); });
        aiDropZone.addEventListener('dragleave', () => { aiDropZone.classList.remove('border-indigo-500', 'bg-indigo-500/5'); });
        aiDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            aiDropZone.classList.remove('border-indigo-500', 'bg-indigo-500/5');
            if (e.dataTransfer.files.length) {
                const dt = new DataTransfer();
                dt.items.add(e.dataTransfer.files[0]);
                aiFileInput.files = dt.files;
                showImagePreview(e.dataTransfer.files[0]);
            }
        });

        aiFileInput.addEventListener('change', () => {
            if (aiFileInput.files.length) showImagePreview(aiFileInput.files[0]);
        });

        const showImagePreview = (file) => {
            if (!file.type.startsWith('image/')) {
                aiFileStatus.innerHTML = '<span class="text-amber-400">⚠️ Please upload an image file (PNG, JPG, WebP).</span>';
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                aiFileStatus.innerHTML = `<div class="flex items-center gap-3">
                    <img src="${ev.target.result}" class="w-14 h-14 object-cover rounded-lg border-2 border-indigo-500/40 flex-shrink-0">
                    <div class="text-left">
                        <p class="text-sm font-semibold text-indigo-300">✅ ${file.name}</p>
                        <p class="text-xs text-slate-500">${(file.size/1024).toFixed(1)} KB — Ready for OCR</p>
                        <p class="text-[10px] text-slate-600 mt-0.5">Click "Extract & Refine" to scan the text</p>
                    </div></div>`;
            };
            reader.readAsDataURL(file);
        };

        // ─── LIVE SMART SUGGESTIONS ─────────────────────
        const renderDefaultTips = () => `<div class="bg-slate-800/50 border border-slate-700/40 rounded-xl p-3 mt-3">
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">💡 Smart Tips — start typing to see live AI guidance</p>
            <ul class="space-y-1 text-xs text-slate-500">
                <li>• Paste a job description → auto-fills <strong class="text-slate-400">Experience</strong></li>
                <li>• Paste project details → auto-fills <strong class="text-slate-400">Projects</strong></li>
                <li>• Upload a resume image → <strong class="text-slate-400">OCR reads it automatically</strong></li>
                <li>• Toggle “Smart Refine” to professionalize tone</li>
            </ul></div>`;

        const updateSuggestions = () => {
            if (!suggestionsPanel) return;
            const text = aiBotInput.value.trim();
            if (!text) { suggestionsPanel.innerHTML = renderDefaultTips(); return; }
            const sec = detectSection(text);
            const tips = sectionTips[sec] || [];
            const name = sec.replace('-management','').replace(/-/g,' ');
            const capName = name.charAt(0).toUpperCase() + name.slice(1);
            suggestionsPanel.innerHTML = `<div class="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 mt-3">
                <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">🤖 Detected Section: <strong>${capName}</strong></p>
                <ul class="space-y-1.5">${tips.map(t=>`<li class="text-xs text-slate-400">${t}</li>`).join('')}</ul>
            </div>`;
        };

        // Inject suggestions panel dynamically
        if (!suggestionsPanel) {
            suggestionsPanel = document.createElement('div');
            suggestionsPanel.id = 'ai-suggestions-panel';
            suggestionsPanel.innerHTML = renderDefaultTips();
            aiBotInput.parentElement.appendChild(suggestionsPanel);
        }

        aiBotInput.addEventListener('input', updateSuggestions);

        // Professionalize text (Simple client-side logic)
        const professionalize = (text) => {
            if (!text) return text;
            let result = text.trim();
            // Fix start case
            result = result.charAt(0).toUpperCase() + result.slice(1);
            // Replacements for common "weak" words
            const replacements = [
                { r: /\b(made|built|did)\b/gi, w: 'Developed' },
                { r: /\b(helped)\b/gi, w: 'Collaborated on' },
                { r: /\b(used|use)\b/gi, w: 'Utilized' },
                { r: /\b(worked on)\b/gi, w: 'Spearheaded' },
                { r: /\b(very|really)\b/gi, w: 'significantly' },
                { r: /\b(good)\b/gi, w: 'exceptional' },
                { r: /\b(fix|fixed)\b/gi, w: 'resolved' },
                { r: /\b(cool|awesome|great)\b/gi, w: 'professional' },
                { r: /\b(i am)\b/gi, w: 'Experienced' },
                { r: /\b(stuff|things)\b/gi, w: 'functionalities' },
                { r: /\b(looked after|took care of)\b/gi, w: 'Maintained' },
                { r: /\b(got)\b/gi, w: 'Achieved' }
            ];
            replacements.forEach(pair => result = result.replace(pair.r, pair.w));
            return result;
        };

        const detectSection = (text) => {
            const lowerText = text.toLowerCase();
            const scores = {
                'hero-management': (lowerText.match(/hero|intro|greeting|headline|bio|profile|photo|looking for|hire/gi) || []).length * 1.5,
                'about-management': (lowerText.match(/about|skills|bio|paragraph|me|myself|background/gi) || []).length,
                'experience-management': (lowerText.match(/work|job|experience|position|role|company|employment|career|history/gi) || []).length * 1.2,
                'projects-management': (lowerText.match(/project|build|app|website|demo|link|git|repo|portfolio|github/gi) || []).length * 1.2,
                'services-management': (lowerText.match(/service|offer|expert|solution|provide|features/gi) || []).length * 1.5,
                'resume-management': (lowerText.match(/resume|education|degree|university|school|language|proficiency|college|curriculum/gi) || []).length * 2,
                'bookings-management': (lowerText.match(/book|meeting|schedule|calendar|appointment|slot|available/gi) || []).length * 2
            };
            
            let bestSection = 'experience-management';
            let maxScore = 0;
            for (const section in scores) {
                if (scores[section] > maxScore) {
                    maxScore = scores[section];
                    bestSection = section;
                }
            }
            return bestSection;
        };

        const extractFields = (text, section, refine = true) => {
            const lines = text.split('\n').filter(l => l.trim().length > 2);
            const data = {};
            const cleanText = text.replace(/\n/g, ' ');

            if (section === 'experience-management') {
                data['experience-title'] = lines[0]?.split(/at|for|company/i)[0]?.trim().substring(0, 50) || '';
                data['experience-company'] = (cleanText.match(/(?:at|for|company:?)\s+([^,.-]{2,30})/i) || [null, lines[1] || ''])[1].trim();
                data['experience-dateRange'] = (cleanText.match(/(\d{2}\/\d{4}|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^,.-]*\s*(?:-|to|until)\s*([^,.-]*\d{4}|Present)/i) || [null, ''])[0];
                data['experience-description'] = lines.length > 1 ? lines.slice(1).join('\n') : text;
            } else if (section === 'projects-management') {
                data['project-name'] = lines[0]?.substring(0, 50) || '';
                data['project-tags'] = (cleanText.match(/(?:tags|tools|tech|stack):?\s*([^.\n]+)/i) || [null, 'React, Node.js'])[1].trim();
                data['project-liveUrl'] = (cleanText.match(/https?:\/\/[^\s]+(?:\.com|\.io|\.app|\.net|\.dev)/i) || [''])[0];
                data['project-description'] = lines.length > 1 ? lines.slice(1).join('\n') : text;
            } else if (section === 'services-management') {
                data['service-title'] = lines[0]?.substring(0, 50) || '';
                data['service-description'] = lines.length > 1 ? lines.slice(1).join('\n') : text;
                data['service-iconSvg'] = '<!-- Paste SVG Here -->';
            } else if (section === 'about-management') {
                data['about-p1'] = lines[0] || '';
                data['about-p2'] = lines[1] || '';
                data['about-skills'] = (cleanText.match(/(?:skills|expertise|know):?\s*([^.\n]+)/i) || [null, ''])[1].trim();
            } else if (section === 'hero-management') {
                data['hero-greeting'] = lines.find(l => l.match(/hi|hello|hey|welcome/i)) || 'Hello, I am';
                data['hero-headline'] = lines.find(l => l.length < 50 && !l.match(/hi|hello|hey/i)) || 'Full Stack Developer';
                data['hero-bio'] = lines.filter(l => l.length > 50).join(' ') || text;
            } else if (section === 'resume-management') {
                data['resume-name'] = (cleanText.match(/(?:i am|name is|name:?)\s+([^,.\n]{2,30})/i) || [null, ''])[1].trim() || lines[0];
                data['resume-title'] = lines.find(l => l.match(/developer|engineer|designer|manager/i)) || '';
                data['resume-email'] = (cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) || [''])[0];
                data['resume-summary'] = cleanText.substring(0, 400);
            }

            // Apply professional refinement if toggled
            if (refine) {
                for (let key in data) {
                    if (key.includes('description') || key.includes('bio') || key.includes('summary') || key.includes('p1') || key.includes('p2')) {
                        data[key] = professionalize(data[key]);
                    }
                }
            }
            return data;
        };

        const renderResults = (section, fields) => {
            aiInputView.classList.add('hidden');
            aiInputActions.classList.add('hidden');
            aiResultsView.classList.remove('hidden');
            
            aiDetectedSection.textContent = `Section: ${section.split('-')[0]}`;
            aiResultsFields.innerHTML = '';
            
            for (const [id, value] of Object.entries(fields)) {
                const label = id.replace(/-/g, ' ').replace(section.split('-')[0], '').trim();
                const fieldHtml = `
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">${label}</label>
                        ${id.includes('description') || id.includes('bio') || id.includes('summary') || id.includes('p1') ? 
                            `<textarea class="ai-result-input w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-slate-300 text-sm focus:border-indigo-500 transition-all font-sans" data-id="${id}" rows="3">${value}</textarea>` :
                            `<input type="text" class="ai-result-input w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-slate-300 text-sm focus:border-indigo-500 transition-all" data-id="${id}" value="${value}">`
                        }
                    </div>
                `;
                aiResultsFields.insertAdjacentHTML('beforeend', fieldHtml);
            }
        };

        aiProcessBtn.addEventListener('click', async () => {
            let text = aiBotInput.value.trim();
            const file = aiFileInput.files[0];

            if (!text && !file) return showToast('Please paste text or upload an image.', 'error');

            aiProcessStatus.classList.remove('hidden');
            aiProcessBtn.disabled = true;
            aiProgressBar.style.width = '5%';
            aiStatusText.textContent = 'Starting...';

            try {
                if (file) {
                    if (!file.type.startsWith('image/')) {
                        showToast('Please upload a valid image file.', 'error');
                        return;
                    }
                    if (typeof Tesseract === 'undefined') {
                        showToast('⚠️ OCR (Tesseract) not loaded. Check your internet.', 'error');
                        return;
                    }
                    aiStatusText.textContent = 'Reading image with OCR...';
                    aiProgressBar.style.width = '15%';
                    const result = await Tesseract.recognize(file, 'eng', {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                const pct = Math.min(90, Math.floor(m.progress * 75) + 15);
                                aiProgressBar.style.width = `${pct}%`;
                                aiStatusText.textContent = `OCR: ${Math.floor(m.progress * 100)}%`;
                            }
                        }
                    });
                    text = result.data.text;
                    if (!text || text.trim().length < 5) {
                        showToast('⚠️ Could not read image text. Try a clearer, higher-res image.', 'error');
                        return;
                    }
                    aiBotInput.value = text; // Show extracted text for user review
                    updateSuggestions();
                    aiStatusText.textContent = 'OCR Complete ✓';
                    aiProgressBar.style.width = '95%';
                    await new Promise(r => setTimeout(r, 600));
                }

                aiStatusText.textContent = 'Analyzing...';
                aiProgressBar.style.width = '98%';
                await new Promise(r => setTimeout(r, 150));

                const section = detectSection(text);
                const fields = extractFields(text, section, aiGrammarToggle ? aiGrammarToggle.checked : true);
                lastExtractedData = { section, fields };
                renderResults(section, fields);

            } catch (err) {
                console.error('AI Bot Error:', err);
                showToast(`AI failed: ${err.message || 'Unknown error'}`, 'error');
            } finally {
                aiProcessBtn.disabled = false;
                aiProcessStatus.classList.add('hidden');
                aiProgressBar.style.width = '0%';
            }
        });

        aiFillBtn.addEventListener('click', () => {
            if (!lastExtractedData) return showToast('Process text first.', 'error');

            const updatedFields = {};
            document.querySelectorAll('.ai-result-input').forEach(input => {
                updatedFields[input.dataset.id] = input.value;
            });

            showSection(lastExtractedData.section);

            let filled = 0;
            for (const [id, value] of Object.entries(updatedFields)) {
                const el = document.getElementById(id);
                if (el) {
                    el.value = value;
                    if (id === 'resume-summary' && typeof summaryQuill !== 'undefined' && summaryQuill) {
                        summaryQuill.root.innerHTML = value;
                    }
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    filled++;
                }
            }

            showToast(`✅ ${filled} field${filled !== 1 ? 's' : ''} auto-filled!`, 'success');
            closeAiBot();
        });
    }
});

