// public/resume.js

document.addEventListener('DOMContentLoaded', async () => {
    const contentContainer = document.getElementById('resume-content');

    try {
        const response = await fetch('/api/resume');
        if (!response.ok) throw new Error('Failed to fetch resume data');
        const data = await response.json();

        if (!data || !data.personalInfo) {
            document.getElementById('resume-content').innerHTML = '<div class="col-span-2 text-center py-20 text-slate-500">No resume data found. Please create one in the Admin Dashboard.</div>';
            return;
        }

        renderResume(data);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('resume-content').innerHTML = '<div class="col-span-2 text-center py-20 text-red-500">Error loading resume. Please try again later.</div>';
    }

    function renderResume(data) {
        const template = data.selectedTemplate || 'classic';

        // Remove existing layout classes and add template specific one
        document.body.className = `template-${template}`;
        const container = document.getElementById('resume-content');

        if (template === 'modern') {
            renderModern(data);
        } else if (template === 'minimal') {
            renderMinimal(data);
        } else {
            renderClassic(data);
        }
    }

    function renderClassic(data) {
        const { personalInfo, experience, education, skills, projects, languages, sections } = data;
        const container = document.getElementById('resume-content');

        // Classic layout is a single column with photo at top right
        container.innerHTML = `
            <div class="classic-resume p-10 max-w-[850px] mx-auto bg-white min-h-[1100px]">
                <!-- Header -->
                <div class="flex justify-between items-start mb-6 border-b-2 border-slate-800 pb-4">
                    <div class="flex-1">
                        <h1 class="text-5xl font-bold uppercase tracking-tight text-slate-900 mb-1" style="font-family: 'EB Garamond', serif;">${personalInfo.name}</h1>
                        <p class="text-xl font-semibold text-slate-700 uppercase tracking-widest mb-4">${personalInfo.title}</p>
                        <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-medium text-slate-600">
                            ${personalInfo.address ? `<span><i class="fa-solid fa-location-dot mr-2 text-slate-400"></i>${personalInfo.address}</span>` : ''}
                            ${personalInfo.phone ? `<span><i class="fa-solid fa-phone mr-2 text-slate-400"></i><a href="tel:${personalInfo.phone.replace(/\s/g, '')}" class="hover:text-slate-900 transition-colors">${personalInfo.phone}</a></span>` : ''}
                            ${personalInfo.email ? `<span><i class="fa-solid fa-envelope mr-2 text-slate-400"></i><a href="mailto:${personalInfo.email}" class="hover:text-slate-900 transition-colors">${personalInfo.email}</a></span>` : ''}
                            ${personalInfo.linkedin ? `<span><i class="fa-brands fa-linkedin mr-2 text-slate-400"></i><a href="${personalInfo.linkedin}" target="_blank" class="hover:text-slate-900 transition-colors">${personalInfo.linkedin.replace(/https?:\/\/(www\.)?/, '')}</a></span>` : ''}
                            ${personalInfo.github ? `<span><i class="fa-brands fa-github mr-2 text-slate-400"></i><a href="${personalInfo.github}" target="_blank" class="hover:text-slate-900 transition-colors">${personalInfo.github.replace(/https?:\/\/(www\.)?/, '')}</a></span>` : ''}
                        </div>
                    </div>
                    ${personalInfo.photoUrl ? `
                        <div class="ml-6">
                            <img src="${personalInfo.photoUrl}" alt="${personalInfo.name}" class="${personalInfo.photoShape === 'circle' ? 'w-32 h-32 rounded-full' : 'w-32 h-40 rounded'} object-cover shadow-lg border border-slate-200 transform hover:scale-105 transition-transform duration-300">
                        </div>
                    ` : ''}
                </div>

                ${renderSectionsByType(data, 'classic')}
            </div>
        `;
    }

    function renderModern(data) {
        const { personalInfo, experience, education, skills, projects, languages, sections } = data;
        const container = document.getElementById('resume-content');

        // Modern layout has a sidebar (Current implementation)
        container.innerHTML = `
            <div class="modern-resume grid grid-cols-[280px_1fr] min-h-[1100px]">
                <div class="sidebar bg-slate-50 p-10 border-right border-slate-200">
                    ${personalInfo.photoUrl ? `<img src="${personalInfo.photoUrl}" class="w-32 h-32 ${personalInfo.photoShape === 'circle' ? 'rounded-full' : 'rounded-lg'} mx-auto mb-6 object-cover border-4 border-white shadow-lg">` : ''}
                    <h2 class="text-2xl font-bold text-center mb-1">${personalInfo.name}</h2>
                    <p class="text-slate-500 text-center italic mb-8">${personalInfo.title}</p>
                    
                    <div class="space-y-4 text-sm">
                        ${personalInfo.email ? `<p>✉️ ${personalInfo.email}</p>` : ''}
                        ${personalInfo.phone ? `<p>📞 ${personalInfo.phone}</p>` : ''}
                        ${personalInfo.linkedin ? `<p>🔗 LinkedIn</p>` : ''}
                    </div>
                </div>
                <div class="main-content p-10">
                    ${renderSectionsByType(data, 'modern')}
                </div>
            </div>
        `;
    }

    function renderMinimal(data) {
        const { personalInfo } = data;
        const container = document.getElementById('resume-content');

        container.innerHTML = `
            <div class="minimal-resume max-w-[800px] mx-auto p-12 bg-white">
                <header class="text-center mb-12">
                    <h1 class="text-4xl font-light tracking-widest uppercase mb-2">${personalInfo.name}</h1>
                    <p class="text-slate-400 uppercase tracking-widest text-sm">${personalInfo.title}</p>
                </header>
                ${renderSectionsByType(data, 'minimal')}
            </div>
        `;
    }

    function renderSectionsByType(data, type) {
        const { personalInfo, experience, education, skills, projects, languages, sections } = data;
        const config = sections && sections.length > 0 ? sections : [];
        config.sort((a, b) => a.order - b.order);

        return config.map(sec => {
            if (!sec.isVisible) return '';

            let content = '';
            const titleClass = type === 'classic' ? 'section-title-classic' : 'section-title';

            switch (sec.id) {
                case 'summary':
                    content = `<div class="text-slate-700 leading-relaxed ql-editor p-0 font-sans" style="min-height: auto;">${personalInfo.summary}</div>`;
                    break;
                case 'experience':
                    content = experience.map(exp => `
                        <div class="mb-4">
                            <div class="flex justify-between font-bold text-slate-900">
                                <span>${exp.company}</span>
                                <span class="text-sm">${exp.startDate} - ${exp.endDate}</span>
                            </div>
                            <div class="italic text-slate-600 mb-1">${exp.position}</div>
                            <div class="text-sm text-slate-700 ql-editor p-0 font-sans" style="min-height: auto;">${exp.description}</div>
                        </div>
                    `).join('');
                    break;
                case 'projects':
                    content = projects.map(proj => `
                        <div class="mb-3">
                            <div class="font-bold underline flex items-center gap-2">
                                ${proj.name}
                                ${proj.link ? `<a href="${proj.link}" target="_blank" class="text-xs font-normal text-slate-500 hover:text-indigo-600 ml-2 transition-colors italic">${proj.link}</a>` : ''}
                            </div>
                            <div class="text-sm text-slate-700 ql-editor p-0 font-sans" style="min-height: auto;">${proj.description}</div>
                        </div>
                    `).join('');
                    break;
                case 'education':
                    content = education.map(edu => `
                        <div class="mb-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="font-bold text-slate-900">${edu.institution}</div>
                                    <div class="text-sm italic text-slate-600">${edu.degree}</div>
                                    ${edu.scoreValue ? `<div class="text-xs font-semibold text-slate-700 mt-1 uppercase tracking-wider">${edu.scoreType}: ${edu.scoreValue}</div>` : ''}
                                </div>
                                <div class="text-sm font-bold text-slate-700">${edu.startDate} - ${edu.endDate}</div>
                            </div>
                            ${edu.description && edu.description !== '<p><br></p>' && edu.description !== '' ? `<div class="text-sm text-slate-700 ql-editor p-0 font-sans mt-1" style="min-height: auto;">${edu.description}</div>` : ''}
                        </div>
                    `).join('');
                    break;
                case 'skills':
                    content = `<p class="text-sm leading-relaxed"><span class="font-bold">Technical Skills:</span> ${skills.join(', ')}</p>`;
                    break;
                case 'languages':
                    content = `<div class="grid grid-cols-3 gap-2">
                        ${languages.map(l => `<div class="text-sm"><span class="font-bold">${l.language}:</span> ${l.proficiency}</div>`).join('')}
                    </div>`;
                    break;
            }

            return `
                <div class="section-container mb-6">
                    <h3 class="${titleClass}">${sec.name}</h3>
                    <div class="section-content">${content}</div>
                </div>
            `;
        }).join('');
    }
});
