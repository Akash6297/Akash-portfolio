// public/resume.js — Modern Sleek Resume Rendering

document.addEventListener('DOMContentLoaded', async () => {
    const contentContainer = document.getElementById('resume-content');

    try {
        const response = await fetch('/api/resume');
        if (!response.ok) throw new Error('Failed to fetch resume data');
        const data = await response.json();

        if (!data || !data.personalInfo) {
            contentContainer.innerHTML = `<div style="padding:80px;text-align:center;color:#94a3b8;font-family:Inter,sans-serif">
                No resume data found. <a href="/admin/dashboard.html" style="color:#14b8a6;">Create one in the Admin Dashboard</a>.
            </div>`;
            return;
        }

        renderResume(data);
    } catch (error) {
        console.error('Resume render error:', error);
        contentContainer.innerHTML = `<div style="padding:80px;text-align:center;color:#ef4444;font-family:Inter,sans-serif">
            Error loading resume. Please try again later.
        </div>`;
    }

    function renderResume(data) {
        // ─── Apply Typography from saved settings ──────────────────────
        applyTypography(data.typography);

        const template = data.selectedTemplate || 'classic';
        document.body.className = `template-${template}`;

        if (template === 'modern') {
            renderModern(data);
        } else if (template === 'minimal') {
            renderMinimal(data);
        } else {
            renderClassic(data);
        }
    }

    // ─── Apply Typography CSS Variables ─────────────────────────────
    function applyTypography(typo) {
        const t = typo || {};
        const font    = t.font        || "'Inter', sans-serif";
        const size    = t.size        || 13;
        const lh      = t.lineHeight  || 1.5;
        const gap     = t.sectionGap  || 20;
        const accent  = t.accentColor || '#1e3a5f';

        // Parse accent to get a light variant
        const r = parseInt(accent.replace('#','').slice(0,2), 16);
        const g = parseInt(accent.replace('#','').slice(2,4), 16);
        const b = parseInt(accent.replace('#','').slice(4,6), 16);
        const accentLight = `rgb(${Math.min(255,r+60)},${Math.min(255,g+60)},${Math.min(255,b+80)})`;

        const root = document.documentElement;
        root.style.setProperty('--resume-font',         font);
        root.style.setProperty('--resume-size',         size + 'px');
        root.style.setProperty('--resume-line-height',  String(lh));
        root.style.setProperty('--resume-section-gap',  gap + 'px');
        root.style.setProperty('--resume-accent',       accent);
        root.style.setProperty('--resume-accent-light', accentLight);

        // Also apply directly to content container for immediate effect
        const el = document.getElementById('resume-content');
        if (el) {
            el.style.fontFamily  = font;
            el.style.fontSize    = size + 'px';
            el.style.lineHeight  = String(lh);
        }
    }


    // ─── Helper: safe HTML escape ───────────────────────────────────
    function esc(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ─── Helper: render ordered sections ────────────────────────────
    function getOrderedSections(data) {
        const defaults = [
            { id: 'summary', name: 'Summary', order: 0, isVisible: true },
            { id: 'experience', name: 'Experience', order: 1, isVisible: true },
            { id: 'projects', name: 'Projects', order: 2, isVisible: true },
            { id: 'education', name: 'Education', order: 3, isVisible: true },
            { id: 'skills', name: 'Skills', order: 4, isVisible: true },
            { id: 'languages', name: 'Languages', order: 5, isVisible: true },
        ];
        const cfg = (data.sections && data.sections.length > 0) ? data.sections : defaults;
        return [...cfg].sort((a, b) => a.order - b.order).filter(s => s.isVisible);
    }

    // ─── CLASSIC TEMPLATE ────────────────────────────────────────────
    function renderClassic(data) {
        const { personalInfo, experience, education, skills, projects, languages } = data;
        const p = personalInfo;
        const sections = getOrderedSections(data);

        const contactHtml = [
            p.address && `<span><i class="fa-solid fa-location-dot"></i>${esc(p.address)}</span>`,
            p.phone && `<span><i class="fa-solid fa-phone"></i><a href="tel:${esc(p.phone.replace(/\s/g,''))}">${esc(p.phone)}</a></span>`,
            p.email && `<span><i class="fa-solid fa-envelope"></i><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></span>`,
            p.linkedin && `<span><i class="fa-brands fa-linkedin"></i><a href="${esc(p.linkedin)}" target="_blank">${p.linkedin.replace(/https?:\/\/(www\.)?/,'')}</a></span>`,
            p.github && `<span><i class="fa-brands fa-github"></i><a href="${esc(p.github)}" target="_blank">${p.github.replace(/https?:\/\/(www\.)?/,'')}</a></span>`,
        ].filter(Boolean).join('');

        const sectionsHtml = sections.map(sec => {
            let content = '';

            switch (sec.id) {
                case 'summary':
                    if (!p.summary) return '';
                    content = `<div class="ql-editor">${p.summary}</div>`;
                    break;
                case 'experience':
                    if (!experience?.length) return '';
                    content = experience.map(exp => `
                        <div class="exp-item">
                            <div class="exp-header">
                                <span class="exp-company">${esc(exp.company)}</span>
                                <span class="exp-date">${esc(exp.startDate)} – ${esc(exp.endDate)}</span>
                            </div>
                            <div class="exp-role">${esc(exp.position)}</div>
                            <div class="exp-desc ql-editor">${exp.description || ''}</div>
                        </div>
                    `).join('');
                    break;
                case 'projects':
                    if (!projects?.length) return '';
                    content = projects.map(proj => `
                        <div class="proj-item">
                            <div class="exp-header">
                                <span class="exp-company">${esc(proj.name)}${proj.link ? ` <a href="${esc(proj.link)}" target="_blank" style="font-size:0.78em;font-weight:400;color:#64748b;text-decoration:underline;margin-left:6px;">${proj.link.replace(/https?:\/\//,'')}</a>` : ''}</span>
                            </div>
                            <div class="exp-desc ql-editor">${proj.description || ''}</div>
                        </div>
                    `).join('');
                    break;
                case 'education':
                    if (!education?.length) return '';
                    content = education.map(edu => `
                        <div class="edu-item">
                            <div class="exp-header">
                                <div>
                                    <div class="exp-company">${esc(edu.institution)}</div>
                                    <div class="exp-role">${esc(edu.degree)}${edu.scoreValue ? ` &nbsp;·&nbsp; ${esc(edu.scoreType)}: ${esc(edu.scoreValue)}` : ''}</div>
                                </div>
                                <span class="exp-date">${esc(edu.startDate)} – ${esc(edu.endDate)}</span>
                            </div>
                            ${edu.description && edu.description !== '<p><br></p>' ? `<div class="exp-desc ql-editor" style="margin-top:3px;">${edu.description}</div>` : ''}
                        </div>
                    `).join('');
                    break;
                case 'skills':
                    if (!skills?.length) return '';
                    content = `<div class="skills-wrap">${skills.map(s => `<span class="skill-tag">${esc(s)}</span>`).join('')}</div>`;
                    break;
                case 'languages':
                    if (!languages?.length) return '';
                    content = `<div class="lang-grid">${languages.map(l => `<div class="lang-item"><strong>${esc(l.language)}</strong> &mdash; ${esc(l.proficiency)}</div>`).join('')}</div>`;
                    break;
                default: return '';
            }

            return `<div>
                <div class="section-title">${esc(sec.name)}</div>
                <div>${content}</div>
            </div>`;
        }).join('');

        document.getElementById('resume-content').innerHTML = `
            <div class="resume-classic">
                <div class="rc-header">
                    <div style="flex:1;">
                        <div class="rc-name">${esc(p.name)}</div>
                        <div class="rc-title">${esc(p.title)}</div>
                        <div class="rc-contact">${contactHtml}</div>
                    </div>
                    ${p.photoUrl ? `<img src="${esc(p.photoUrl)}" class="rc-photo ${p.photoShape === 'circle' ? 'circle' : ''}" alt="${esc(p.name)}">` : ''}
                </div>
                ${sectionsHtml}
            </div>
        `;
    }

    // ─── MODERN TEMPLATE ─────────────────────────────────────────────
    function renderModern(data) {
        const { personalInfo: p, experience, education, skills, projects, languages } = data;
        const sections = getOrderedSections(data);

        const sidebarSections = ['skills', 'languages'];
        const mainSections = sections.filter(s => !sidebarSections.includes(s.id));
        const skillsSec = sections.find(s => s.id === 'skills' && s.isVisible);
        const langSec = sections.find(s => s.id === 'languages' && s.isVisible);

        const mainHtml = mainSections.map(sec => {
            let content = '';
            switch (sec.id) {
                case 'summary':
                    if (!p.summary) return '';
                    content = `<div class="rm-summary ql-editor">${p.summary}</div>`;
                    break;
                case 'experience':
                    if (!experience?.length) return '';
                    content = experience.map(exp => `
                        <div class="rm-exp-item">
                            <div class="rm-exp-header">
                                <span class="rm-exp-company">${esc(exp.company)}</span>
                                <span class="rm-exp-date">${esc(exp.startDate)} – ${esc(exp.endDate)}</span>
                            </div>
                            <div class="rm-exp-role">${esc(exp.position)}</div>
                            <div class="rm-exp-desc ql-editor">${exp.description || ''}</div>
                        </div>
                    `).join('');
                    break;
                case 'projects':
                    if (!projects?.length) return '';
                    content = projects.map(proj => `
                        <div class="rm-exp-item">
                            <div class="rm-exp-header">
                                <span class="rm-exp-company">${esc(proj.name)}</span>
                                ${proj.link ? `<a href="${esc(proj.link)}" target="_blank" class="rm-exp-date" style="text-decoration:underline;font-size:0.75em;">${proj.link.replace(/https?:\/\//,'').substring(0,30)}</a>` : ''}
                            </div>
                            <div class="rm-exp-desc ql-editor">${proj.description || ''}</div>
                        </div>
                    `).join('');
                    break;
                case 'education':
                    if (!education?.length) return '';
                    content = education.map(edu => `
                        <div class="rm-exp-item">
                            <div class="rm-exp-header">
                                <span class="rm-exp-company">${esc(edu.institution)}</span>
                                <span class="rm-exp-date">${esc(edu.startDate)} – ${esc(edu.endDate)}</span>
                            </div>
                            <div class="rm-exp-role">${esc(edu.degree)}${edu.scoreValue ? ` · ${esc(edu.scoreType)}: ${esc(edu.scoreValue)}` : ''}</div>
                            ${edu.description && edu.description !== '<p><br></p>' ? `<div class="rm-exp-desc ql-editor">${edu.description}</div>` : ''}
                        </div>
                    `).join('');
                    break;
                default: return '';
            }

            return `<div>
                <div class="rm-section-title">${esc(sec.name)}</div>
                ${content}
            </div>`;
        }).join('');

        document.getElementById('resume-content').innerHTML = `
            <div class="resume-modern">
                <div class="rm-sidebar">
                    ${p.photoUrl ? `<img src="${esc(p.photoUrl)}" class="rm-photo" alt="${esc(p.name)}">` : ''}
                    <div class="rm-name">${esc(p.name)}</div>
                    <div class="rm-role">${esc(p.title)}</div>

                    <div class="rm-sb-section">
                        <div class="rm-sb-title">Contact</div>
                        ${p.email ? `<div class="rm-contact-item"><i class="fa-solid fa-envelope"></i><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></div>` : ''}
                        ${p.phone ? `<div class="rm-contact-item"><i class="fa-solid fa-phone"></i>${esc(p.phone)}</div>` : ''}
                        ${p.address ? `<div class="rm-contact-item"><i class="fa-solid fa-location-dot"></i>${esc(p.address)}</div>` : ''}
                        ${p.linkedin ? `<div class="rm-contact-item"><i class="fa-brands fa-linkedin"></i><a href="${esc(p.linkedin)}" target="_blank">LinkedIn</a></div>` : ''}
                        ${p.github ? `<div class="rm-contact-item"><i class="fa-brands fa-github"></i><a href="${esc(p.github)}" target="_blank">GitHub</a></div>` : ''}
                    </div>

                    ${skillsSec && skills?.length ? `
                        <div class="rm-sb-section">
                            <div class="rm-sb-title">Skills</div>
                            <div class="rm-skill-list">
                                ${skills.map(s => `<div class="rm-skill-item">${esc(s)}</div>`).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${langSec && languages?.length ? `
                        <div class="rm-sb-section">
                            <div class="rm-sb-title">Languages</div>
                            ${languages.map(l => `
                                <div class="rm-lang-item">
                                    <div class="rm-lang-name">${esc(l.language)}</div>
                                    <div class="rm-lang-level">${esc(l.proficiency)}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <div class="rm-main">${mainHtml}</div>
            </div>
        `;
    }

    // ─── MINIMAL TEMPLATE ────────────────────────────────────────────
    function renderMinimal(data) {
        const { personalInfo: p, experience, education, skills, projects, languages } = data;
        const sections = getOrderedSections(data);

        const contactHtml = [
            p.email && `<span><i class="fa-solid fa-envelope"></i>${esc(p.email)}</span>`,
            p.phone && `<span><i class="fa-solid fa-phone"></i>${esc(p.phone)}</span>`,
            p.address && `<span><i class="fa-solid fa-location-dot"></i>${esc(p.address)}</span>`,
            p.linkedin && `<span><i class="fa-brands fa-linkedin"></i><a href="${esc(p.linkedin)}" target="_blank" style="color:inherit;">LinkedIn</a></span>`,
            p.github && `<span><i class="fa-brands fa-github"></i><a href="${esc(p.github)}" target="_blank" style="color:inherit;">GitHub</a></span>`,
        ].filter(Boolean).join('');

        const sectionsHtml = sections.map(sec => {
            let content = '';
            switch (sec.id) {
                case 'summary':
                    if (!p.summary) return '';
                    content = `<div class="ql-editor" style="text-align:center;font-size:0.9em;color:#475569;">${p.summary}</div>`;
                    break;
                case 'experience':
                    if (!experience?.length) return '';
                    content = experience.map(exp => `
                        <div class="min-exp-item">
                            <div class="min-exp-header">
                                <span class="min-exp-company">${esc(exp.company)}</span>
                                <span class="min-exp-date">${esc(exp.startDate)} – ${esc(exp.endDate)}</span>
                            </div>
                            <div class="min-exp-role">${esc(exp.position)}</div>
                            <div class="min-exp-desc ql-editor">${exp.description || ''}</div>
                        </div>
                    `).join('');
                    break;
                case 'projects':
                    if (!projects?.length) return '';
                    content = projects.map(proj => `
                        <div class="min-exp-item">
                            <div class="min-exp-header">
                                <span class="min-exp-company">${esc(proj.name)}</span>
                                ${proj.link ? `<a href="${esc(proj.link)}" target="_blank" class="min-exp-date" style="color:#64748b;text-decoration:underline;">${proj.link.replace(/https?:\/\//,'').substring(0,28)}</a>` : ''}
                            </div>
                            <div class="min-exp-desc ql-editor">${proj.description || ''}</div>
                        </div>
                    `).join('');
                    break;
                case 'education':
                    if (!education?.length) return '';
                    content = education.map(edu => `
                        <div class="min-exp-item">
                            <div class="min-exp-header">
                                <span class="min-exp-company">${esc(edu.institution)}</span>
                                <span class="min-exp-date">${esc(edu.startDate)} – ${esc(edu.endDate)}</span>
                            </div>
                            <div class="min-exp-role">${esc(edu.degree)}${edu.scoreValue ? ` · ${esc(edu.scoreType)}: ${esc(edu.scoreValue)}` : ''}</div>
                            ${edu.description && edu.description !== '<p><br></p>' ? `<div class="min-exp-desc ql-editor">${edu.description}</div>` : ''}
                        </div>
                    `).join('');
                    break;
                case 'skills':
                    if (!skills?.length) return '';
                    content = `<div class="min-skills">${skills.map(s => `<span class="min-skill">${esc(s)}</span>`).join('')}</div>`;
                    break;
                case 'languages':
                    if (!languages?.length) return '';
                    content = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;">
                        ${languages.map(l => `<div style="font-size:0.85em;text-align:center;"><strong>${esc(l.language)}</strong><br><span style="color:#94a3b8;font-size:0.9em;">${esc(l.proficiency)}</span></div>`).join('')}
                    </div>`;
                    break;
                default: return '';
            }

            return `<div>
                <div class="min-section-title">${esc(sec.name)}</div>
                ${content}
            </div>`;
        }).join('');

        document.getElementById('resume-content').innerHTML = `
            <div class="resume-minimal">
                <div class="min-header">
                    ${p.photoUrl ? `<img src="${esc(p.photoUrl)}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin:0 auto 12px;display:block;border:3px solid #e2e8f0;" alt="${esc(p.name)}">` : ''}
                    <div class="min-name">${esc(p.name)}</div>
                    <div class="min-title">${esc(p.title)}</div>
                    <div class="min-contact">${contactHtml}</div>
                </div>
                ${sectionsHtml}
            </div>
        `;
    }
});
