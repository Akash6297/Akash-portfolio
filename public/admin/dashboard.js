// public/admin/dashboard.js (Complete and Updated for New UI)

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    // UI elements
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const adminSections = document.querySelectorAll('.admin-section');
    
    // Forms and Tables
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

// Message Center selectors
    const messagesList = document.getElementById('messages-list');
    const noMessagesDiv = document.getElementById('no-messages');
    const replyModal = document.getElementById('reply-modal');
    const closeReplyModalBtn = document.getElementById('close-reply-modal');
    const replyForm = document.getElementById('reply-form');

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

    
     // --- UI FUNCTIONALITY: SECTION TOGGLING (CORRECTED) ---
    const showSection = (sectionId) => {
        sidebarLinks.forEach(link => link.classList.remove('active'));
        adminSections.forEach(section => section.classList.add('hidden'));

        const activeLink = document.querySelector(`.sidebar-link[data-section="${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');

        const selectedSection = document.getElementById(`${sectionId}-container`);
        if (selectedSection) {
            selectedSection.classList.remove('hidden');
            
            // This is the corrected logic block with a proper if/else if chain
            if (sectionId === 'admin-settings') {
                document.getElementById('otp-request-view').classList.remove('hidden');
                document.getElementById('otp-verify-view').classList.add('hidden');
                document.getElementById('admin-content-view').classList.add('hidden');
            } else if (sectionId === 'hero-management') {
                fetchHeroData();
            } else if (sectionId === 'about-management') {
                fetchAboutData();
            } else if (sectionId === 'experience-management') {
                fetchExperiences();
            } else if (sectionId === 'projects-management') {
                fetchProjects();
            } else if (sectionId === 'services-management') {
                fetchServices();
            } else if (sectionId === 'messages-management') {
                fetchMessages(); // This will now be called correctly
            }
            else if (sectionId === 'email-templates') {
                fetchEmailTemplates();
            }
        }
    };

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(link.dataset.section);
        });
    });

 // --- API REQUEST HELPER (UPDATED) ---
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
            const result = await response.json();
            if (!response.ok) {
                if (response.status === 401) window.location.href = '/admin/login.html';
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }
            return result;
        } catch (error) {
            console.error(`API request failed: ${method} ${url}`, error);
            showToast(error.message, 'error');
            return null;
        }
    };


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
                           <button class="delete-btn text-slate-500 hover:text-red-500 text-2xl leading-none" data-type="message" title="Delete Message">×</button>
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
                <div class="bg-slate-800 p-6 rounded-lg shadow-xl" id="builder-${template._id}">
                    <form class="email-template-form" data-id="${template._id}">
                        <h3 class="text-2xl font-semibold text-white">${template.templateName}</h3>
                        <p class="text-sm text-slate-400">Variables: ${template.variables.join(', ')}</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            <div class="space-y-4">
                                <div><label class="block mb-2">Primary Color</label><input type="color" name="primaryColor" value="${config.primaryColor || '#14b8a6'}" class="w-full h-10 p-1 bg-slate-700 rounded-md"></div>
                                <div><label class="block mb-2">Header Text</label><input type="text" name="headerText" value="${config.headerText || ''}" class="w-full bg-slate-700 p-2 rounded-md"></div>
                                <div><label class="block mb-2">Body Content</label><textarea name="bodyText" rows="6" class="w-full bg-slate-700 p-2 rounded-md">${config.bodyText || ''}</textarea></div>
                                <div><label class="block mb-2">Footer Text</label><input type="text" name="footerText" value="${config.footerText || ''}" class="w-full bg-slate-700 p-2 rounded-md"></div>
                                <div class="flex items-center"><input type="checkbox" id="showSocials-${template._id}" name="showSocials" ${config.showSocials ? 'checked' : ''}><label for="showSocials-${template._id}" class="ml-2">Show Social Links</label></div>
                                <div class="social-inputs ${config.showSocials ? '' : 'hidden'}"><label class="block mb-2">GitHub URL</label><input type="text" name="githubLink" value="${config.githubLink || ''}" class="w-full bg-slate-700 p-2 rounded-md"></div>
                                <div class="social-inputs ${config.showSocials ? '' : 'hidden'}"><label class="block mb-2">LinkedIn URL</label><input type="text" name="linkedinLink" value="${config.linkedinLink || ''}" class="w-full bg-slate-700 p-2 rounded-md"></div>
                                <button type="submit" class="w-full bg-teal-500 text-white font-semibold py-2 px-6 rounded-md">Save Template</button>
                            </div>
                            <div>
                                <label class="block mb-2">Live Preview</label>
                                <iframe class="w-full h-96 bg-white border-0 rounded-md"></iframe>
                            </div>
                        </div>
                    </form>
                </div>`;
            emailTemplatesList.insertAdjacentHTML('beforeend', builderHTML);
        });

        document.querySelectorAll('.email-template-form').forEach(form => {
            const updatePreview = () => {
                const config = Object.fromEntries(new FormData(form).entries());
                config.showSocials = form.querySelector('[name="showSocials"]').checked;
                form.querySelectorAll('.social-inputs').forEach(el => el.classList.toggle('hidden', !config.showSocials));
                const iframe = form.querySelector('iframe');
                const sampleVars = getSampleData(form.closest('.bg-slate-800').querySelector('h3').textContent);
                iframe.srcdoc = createMasterTemplate(config, sampleVars);
            };

            form.addEventListener('input', updatePreview);
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = form.dataset.id;
                const config = Object.fromEntries(new FormData(form).entries());
                config.showSocials = form.querySelector('[name="showSocials"]').checked;
                
                const data = { htmlContent: JSON.stringify(config), subject: "placeholder" }; // Subject update needs more complex logic
                const result = await apiRequest('PUT', `/api/admin/email-templates/${id}`, data);
                if (result) showToast('Template saved successfully!');
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

    // --- INITIALIZE PAGE ---
    // Show the Hero section by default on load
    showSection('hero-management');
});