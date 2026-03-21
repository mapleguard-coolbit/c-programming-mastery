// ===== Application State =====
const App = {
    currentView: 'dashboard',
    currentModule: null,
    currentLesson: null,
    currentQuiz: null,
    currentExam: null,
    quizAnswers: {},
    examAnswers: {},
    progress: {
        completedLessons: [],
        quizScores: {},
        examScores: {},
        attemptedProblems: [],
        streak: 0,
        lastVisit: null
    }
};

// ===== Module Registry =====
const ModuleRegistry = {
    zero:              window.ModuleZero              || null,
    beginner:          window.ModuleBeginner          || null,
    earlyIntermediate: window.ModuleEarlyIntermediate || null,
    intermediate:      window.ModuleIntermediate      || null,
    lowlevel:          window.ModuleLowLevel          || null,
    advanced:          window.ModuleAdvanced          || null,
    expert:            window.ModuleExpert            || null,   // Bug fix: was ModuleExtra (wrong key)
    extra:             window.ModuleExtra             || null
};

const ModuleOrder = ['zero', 'beginner', 'earlyIntermediate', 'intermediate', 'lowlevel', 'advanced', 'expert', 'extra'];

const ModuleNames = {
    zero: 'Zero',
    beginner: 'Beginner',
    earlyIntermediate: 'Early Intermediate',
    intermediate: 'Intermediate',
    lowlevel: 'Low-Level Core',
    advanced: 'Advanced',
    expert: 'Expert',
    extra: 'Extra Topics & Beyond'
};

const ModuleColors = {
    zero: '#e879f9',
    beginner: '#4ade80',
    earlyIntermediate: '#60a5fa',
    intermediate: '#a78bfa',
    lowlevel: '#f472b6',
    advanced: '#fb923c',
    expert: '#f87171',
    extra: '#34d399'
};

// ===== Initialization =====
window.addEventListener('load', () => {
    loadProgress();
    renderNavigation();
    
    // Restore last visited location
    const lastView = localStorage.getItem('cMasteryLastView');
    const lastModule = localStorage.getItem('cMasteryLastModule');
    const lastLesson = localStorage.getItem('cMasteryLastLesson');

    if (lastView === 'lesson' && lastModule && lastLesson) {
        renderLesson(lastModule, lastLesson);
    } else if (lastView === 'practice' && lastModule) {
        renderPractice(lastModule);
    } else if (lastView === 'quiz' && lastModule) {
        renderQuiz(lastModule);
    } else if (lastView === 'exam' && lastModule) {
        renderExam(lastModule);
    } else {
        renderDashboard();
    }

    setupEventListeners();
    updateStreak();
    applyTheme();
});

// ===== Progress Management =====
function loadProgress() {
    const saved = localStorage.getItem('cMasteryProgress');
    if (saved) {
        try {
            App.progress = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse progress data', e);
            localStorage.removeItem('cMasteryProgress');
        }
        // Backfill keys added after initial release so old saves don't break
        if (!App.progress.attemptedProblems) App.progress.attemptedProblems = [];
        if (!App.progress.quizScores)        App.progress.quizScores = {};
        if (!App.progress.examScores)        App.progress.examScores = {};
    }
}

function saveProgress() {
    localStorage.setItem('cMasteryProgress', JSON.stringify(App.progress));
}

function updateStreak() {
    const today = new Date().toDateString();
    if (App.progress.lastVisit !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (App.progress.lastVisit === yesterday.toDateString()) {
            App.progress.streak++;
        } else {
            App.progress.streak = 1;
        }
        App.progress.lastVisit = today;
        saveProgress();
    }
}

// ===== Theme Management =====
function applyTheme() {
    const saved = localStorage.getItem('cMasteryTheme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('cMasteryTheme', next);
    // Bug fix: sync CodeMirror editor theme when toggling
    if (editorInstance) {
        editorInstance.setOption('theme', next === 'light' ? 'default' : 'dracula');
    }
}

// Bug fix: copyCode was referenced but never defined
function copyCode(btn) {
    const codeBlock = btn.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = original; }, 1500);
    }).catch(() => {
        // Fallback for browsers without clipboard API
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = original; }, 1500);
    });
}

// ===== Navigation Rendering =====
function renderNavigation() {
    const navModules = document.getElementById('navModules');
    let html = '';
    
    ModuleOrder.forEach((moduleId, index) => {
        const module = ModuleRegistry[moduleId];
        if (!module) return;
        
        const lessons = module.lessons || [];
        const completedCount = lessons.filter(l => 
            App.progress.completedLessons.includes(`${moduleId}-${l.id}`)
        ).length;

        const quizScore        = App.progress.quizScores[moduleId];
        const examScore        = App.progress.examScores[moduleId];
        const practiceAttempted = App.progress.attemptedProblems.some(k => k.startsWith(`${moduleId}-practice-`));
        
        html += `
            <div class="nav-module">
                <button class="module-header" data-module="${moduleId}">
                    <span class="module-icon">${index + 1}</span>
                    <span class="module-name">${ModuleNames[moduleId]}</span>
                    <svg class="module-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9,6 15,12 9,18"></polyline>
                    </svg>
                </button>
                <ul class="module-lessons">
                    ${lessons.map(lesson => `
                        <li class="lesson-item">
                            <div class="lesson-link ${App.progress.completedLessons.includes(`${moduleId}-${lesson.id}`) ? 'completed' : ''}" 
                                 data-module="${moduleId}" data-lesson="${lesson.id}">
                                <span class="lesson-check">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <polyline points="20,6 9,17 4,12"></polyline>
                                    </svg>
                                </span>
                                <span class="lesson-name">${lesson.title}</span>
                            </div>
                        </li>
                    `).join('')}
                    <li class="lesson-item">
                        <div class="lesson-link" data-module="${moduleId}" data-action="practice">
                            <span class="lesson-check"></span>
                            <span class="lesson-name">Practice</span>
                            ${practiceAttempted ? '<span class="sidebar-badge attempted">Tried</span>' : ''}
                        </div>
                    </li>
                    <li class="lesson-item">
                        <div class="lesson-link" data-module="${moduleId}" data-action="quiz">
                            <span class="lesson-check"></span>
                            <span class="lesson-name">Quiz</span>
                            ${quizScore !== undefined ? `<span class="sidebar-badge ${quizScore >= 70 ? 'passed' : 'failed'}">${quizScore}%</span>` : ''}
                        </div>
                    </li>
                    <li class="lesson-item">
                        <div class="lesson-link" data-module="${moduleId}" data-action="exam">
                            <span class="lesson-check"></span>
                            <span class="lesson-name">Exam</span>
                            ${examScore !== undefined ? `<span class="sidebar-badge ${examScore >= 80 ? 'passed' : 'failed'}">${examScore}%</span>` : ''}
                        </div>
                    </li>
                </ul>
            </div>
        `;
    });
    
    navModules.innerHTML = html;
    updateSidebarActive();
}

// ===== Active Sidebar Highlight =====
function updateSidebarActive() {
    document.querySelectorAll('.lesson-link.active-lesson').forEach(el => el.classList.remove('active-lesson'));

    if (!App.currentModule) return;

    let selector = null;
    if (App.currentView === 'lesson' && App.currentLesson) {
        selector = `.lesson-link[data-module="${App.currentModule}"][data-lesson="${App.currentLesson}"]`;
    } else if (App.currentView === 'practice') {
        selector = `.lesson-link[data-module="${App.currentModule}"][data-action="practice"]`;
    } else if (App.currentView === 'quiz') {
        selector = `.lesson-link[data-module="${App.currentModule}"][data-action="quiz"]`;
    } else if (App.currentView === 'exam') {
        selector = `.lesson-link[data-module="${App.currentModule}"][data-action="exam"]`;
    }

    if (selector) {
        const link = document.querySelector(selector);
        if (link) {
            link.classList.add('active-lesson');
            // Auto-expand the parent module panel so the active item is visible
            const header = link.closest('.nav-module')?.querySelector('.module-header');
            const lessonsList = link.closest('.module-lessons');
            if (header && lessonsList) {
                header.classList.add('expanded');
                lessonsList.classList.add('show');
            }
        }
    }
}

// ===== Dashboard Rendering =====
function renderDashboard() {
    const modulesOverview = document.getElementById('modulesOverview');
    let html = '';
    
    ModuleOrder.forEach((moduleId, index) => {
        const module = ModuleRegistry[moduleId];
        if (!module) return;
        
        const lessons = module.lessons || [];
        const completedCount = lessons.filter(l => 
            App.progress.completedLessons.includes(`${moduleId}-${l.id}`)
        ).length;
        const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
        
        html += `
            <div class="module-card" data-module="${moduleId}">
                <div class="module-card-header">
                    <div class="module-card-title">
                        <div class="module-card-icon">${index + 1}</div>
                        <span class="module-card-name">${ModuleNames[moduleId]}</span>
                    </div>
                    <span class="module-card-progress">${progress}%</span>
                </div>
                <div class="module-card-bar">
                    <div class="module-card-fill" style="width: ${progress}%"></div>
                </div>
                <p class="module-card-desc">${module.description || ''}</p>
            </div>
        `;
    });
    
    modulesOverview.innerHTML = html;
    updateStats();
    updateOverallProgress();
}

function updateStats() {
    const totalCompleted = App.progress.completedLessons.length;
    const quizzesPassed = Object.values(App.progress.quizScores).filter(s => s >= 70).length;
    const allScores = [...Object.values(App.progress.quizScores), ...Object.values(App.progress.examScores)];
    const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
    
    document.getElementById('statCompleted').textContent = totalCompleted;
    document.getElementById('statQuizzes').textContent = quizzesPassed;
    document.getElementById('statAvgScore').textContent = avgScore + '%';
    document.getElementById('statStreak').textContent = App.progress.streak;
}

function updateOverallProgress() {
    let totalLessons = 0;
    let totalCompleted = 0;
    
    ModuleOrder.forEach(moduleId => {
        const module = ModuleRegistry[moduleId];
        if (!module) return;
        const lessons = module.lessons || [];
        totalLessons += lessons.length;
        totalCompleted += lessons.filter(l => 
            App.progress.completedLessons.includes(`${moduleId}-${l.id}`)
        ).length;
    });
    
    const progress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
    document.getElementById('overallProgress').style.width = progress + '%';
    document.getElementById('progressText').textContent = progress + '% Complete';
}

// ===== View Management =====
function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewName + 'View').classList.remove('hidden');
    App.currentView = viewName;
    
    // Save state for next visit
    localStorage.setItem('cMasteryLastView', viewName);
    if (App.currentModule) localStorage.setItem('cMasteryLastModule', App.currentModule);
    if (App.currentLesson) localStorage.setItem('cMasteryLastLesson', App.currentLesson);
    
    window.scrollTo(0, 0);
}

// ===== Lesson Rendering =====
function renderLesson(moduleId, lessonId) {
    const module = ModuleRegistry[moduleId];
    if (!module) return;
    
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    App.currentModule = moduleId;
    App.currentLesson = lessonId;
    
    document.getElementById('lessonBadge').textContent = ModuleNames[moduleId];
    document.getElementById('lessonBadge').style.background = ModuleColors[moduleId] + '20';
    document.getElementById('lessonBadge').style.color = ModuleColors[moduleId];
    document.getElementById('lessonTitle').textContent = lesson.title;
    document.getElementById('breadcrumb').textContent = `${ModuleNames[moduleId]} > ${lesson.title}`;
    document.title = `${lesson.title} – ${ModuleNames[moduleId]} | C Programming Mastery`;
    
    const lessonContent = document.getElementById('lessonContent');
    lessonContent.innerHTML = renderLessonContent(lesson);
    
    // Update completion button
    const isCompleted = App.progress.completedLessons.includes(`${moduleId}-${lessonId}`);
    const markBtn = document.getElementById('markComplete');
    markBtn.textContent = isCompleted ? 'Completed' : 'Mark Complete';
    markBtn.classList.toggle('completed', isCompleted);
    
    // Update navigation buttons
    updateLessonNav();
    
    showView('lesson');
    updateSidebarActive();
}

function renderLessonContent(lesson) {
    let html = '';
    
    if (lesson.explanation) {
        html += `<div class="lesson-section"><p>${lesson.explanation}</p></div>`;
    }
    
    if (lesson.sections) {
        lesson.sections.forEach(section => {
            html += `<div class="lesson-section">`;
            html += `<h2>${section.title}</h2>`;
            
            if (section.content) {
                html += `<p>${section.content}</p>`;
            }
            
            if (section.points) {
                html += `<ul>`;
                section.points.forEach(point => {
                    html += `<li>${point}</li>`;
                });
                html += `</ul>`;
            }
            
            if (section.code) {
                html += renderCodeBlock(section.code, section.codeTitle || 'c');
            }
            
            if (section.output) {
                html += `<div class="output-block">
                    <div class="output-label">Output:</div>
                    <pre>${section.output}</pre>
                </div>`;
            }
            
            if (section.tip) {
                html += `<div class="tip-box"><strong>Tip:</strong><p>${section.tip}</p></div>`;
            }
            
            if (section.warning) {
                html += `<div class="warning-box"><strong>Warning:</strong><p>${section.warning}</p></div>`;
            }
            
            html += `</div>`;
        });
    }
    
    return html;
}

function renderCodeBlock(code, title = 'c') {
    const highlighted = highlightSyntax(code);
    return `
        <div class="code-block">
            <div class="code-header">
                <span class="code-lang">${title}</span>
                <div class="code-actions">
                    <button class="code-btn" onclick="copyCode(this)">Copy</button>
                    <button class="code-btn" onclick="editCode(this)">Edit & Run</button>
                </div>
            </div>
            <div class="code-content">
                <pre><code>${highlighted}</code></pre>
            </div>
        </div>
    `;
}

function highlightSyntax(code) {
    // Storage for protected code blocks
    const parts = [];
    const store = (html) => {
        const index = parts.push(html) - 1;
        return `__PH_${index}__`;
    };
    
    // Helper to convert HTML characters to safe entities
    const escapeHtml = (str) => {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
    };

    // 1. Extract Strings and Comments first (to protect them)
    // Matches: "strings", 'chars', //comments, /*comments*/
    const tokenRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
    
    let result = code.replace(tokenRegex, (match) => {
        let className = match.startsWith('/') ? 'cmt' : 'str';
        // Escape the content and wrap it
        return store(`<span class="${className}">${escapeHtml(match)}</span>`);
    });

    // 2. Escape the remaining code (fixes the <stdio.h> issue)
    // This converts < and > to &lt; and &gt; so they are visible
    result = escapeHtml(result);

    // 3. Highlight Keywords
    const keywords = ['int', 'char', 'float', 'double', 'void', 'long', 'short', 'unsigned', 'signed', 'const', 'static', 'extern', 'register', 'auto', 'volatile', 'return', 'if', 'else', 'switch', 'case', 'default', 'break', 'continue', 'for', 'while', 'do', 'goto', 'sizeof', 'typedef', 'struct', 'union', 'enum', 'include', 'define', 'ifdef', 'ifndef', 'endif', 'elif', 'pragma', 'NULL', 'true', 'false',
        // C11
        '_Generic', '_Static_assert', '_Noreturn', '_Alignas', '_Alignof', '_Thread_local', '_Atomic',
        // C23
        'constexpr', 'nullptr', 'typeof', 'typeof_unqual', 'alignas', 'alignof', 'static_assert', 'thread_local', 'noreturn', '_BitInt', 'nodiscard', 'maybe_unused', 'deprecated', 'fallthrough'];
    
    keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        result = result.replace(regex, `<span class="kw">${kw}</span>`);
    });

    // 4. Highlight Types
    const types = ['FILE', 'size_t', 'ptrdiff_t', 'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t', 'int8_t', 'int16_t', 'int32_t', 'int64_t', 'uintptr_t', 'intptr_t', 'wchar_t', 'va_list'];
    types.forEach(t => {
        const regex = new RegExp(`\\b${t}\\b`, 'g');
        result = result.replace(regex, `<span class="typ">${t}</span>`);
    });

    // 5. Highlight Functions
    result = result.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="fn">$1</span>(');

    // 6. Highlight Numbers — hex and binary literals first, then decimal/float
    result = result.replace(/\b(0[xX][0-9a-fA-F]+[uUlL]*)\b/g, '<span class="num">$1</span>');
    result = result.replace(/\b(0[bB][01]+[uUlL]*)\b/g, '<span class="num">$1</span>');
    result = result.replace(/\b(\d+\.?\d*(?:[eE][+-]?\d+)?[fFlLuU]*)\b/g, (m) => {
        // Don't double-wrap already-highlighted hex/binary
        return m.startsWith('0x') || m.startsWith('0X') || m.startsWith('0b') || m.startsWith('0B')
            ? m : `<span class="num">${m}</span>`;
    });

    // 7. Highlight Preprocessor Hash
    result = result.replace(/#/g, '<span class="kw">#</span>');

    // 8. Restore the protected Strings and Comments
    parts.forEach((html, index) => {
        result = result.replace(`__PH_${index}__`, () => html);
    });
    
    return result;
}

function updateLessonNav() {
    const module = ModuleRegistry[App.currentModule];
    if (!module) return;
    
    const lessons = module.lessons;
    const currentIndex = lessons.findIndex(l => l.id === App.currentLesson);
    
    const prevBtn = document.getElementById('prevLesson');
    const nextBtn = document.getElementById('nextLesson');
    
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === lessons.length - 1;

    // Show/hide end-of-module next steps prompt
    let nextSteps = document.getElementById('lessonNextSteps');
    if (currentIndex === lessons.length - 1) {
        if (!nextSteps) {
            nextSteps = document.createElement('div');
            nextSteps.id = 'lessonNextSteps';
            nextSteps.className = 'lesson-next-steps';
            document.querySelector('.lesson-nav').insertAdjacentElement('afterend', nextSteps);
        }
        const nextModuleIdx = ModuleOrder.indexOf(App.currentModule) + 1;
        const hasNextModule = nextModuleIdx < ModuleOrder.length && ModuleRegistry[ModuleOrder[nextModuleIdx]];
        const nextModuleId  = hasNextModule ? ModuleOrder[nextModuleIdx] : null;
        nextSteps.innerHTML = `
            <div class="next-steps-title">🎉 You've finished the <strong>${ModuleNames[App.currentModule]}</strong> module!</div>
            <div class="next-steps-actions">
                <button class="action-btn primary" onclick="renderPractice('${App.currentModule}')">Practice Problems</button>
                <button class="action-btn secondary" onclick="renderQuiz('${App.currentModule}')">Take the Quiz</button>
                <button class="action-btn secondary" onclick="renderExam('${App.currentModule}')">Take the Exam</button>
                ${nextModuleId ? `<button class="action-btn accent" onclick="renderLesson('${nextModuleId}', ModuleRegistry['${nextModuleId}'].lessons[0].id)">Next Module: ${ModuleNames[nextModuleId]} →</button>` : ''}
            </div>
            ${!nextModuleId ? `
            <div class="course-completion-donate">
                <div class="course-completion-message">
                    <span class="completion-trophy">🏆</span>
                    <div>
                        <p class="completion-congrats">As you have reached the end, we believe you were benefited by this.</p>
                        <p class="completion-ask">Please donate whatever amount you want to support our work.</p>
                    </div>
                </div>
                <div class="completion-crypto-list">
                    <div class="completion-crypto-item" data-address="bc1qr65zqs43tjxzruhhr8gknvxkvl5xphrmug4ts9">
                        <div class="crypto-icon btc">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z"/></svg>
                        </div>
                        <div class="crypto-info">
                            <span class="crypto-name">Bitcoin <span class="crypto-ticker">BTC</span></span>
                            <span class="crypto-address">bc1qr65zqs43tjxzruhhr8gknvxkvl5xphrmug4ts9</span>
                        </div>
                        <button class="copy-btn completion-copy-btn" aria-label="Copy Bitcoin address">
                            <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            <svg class="check-icon hidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                        </button>
                    </div>
                    <div class="completion-crypto-item" data-address="0x06f2Cda18700D22FaC8e395Ef8141195eA9c4E5b">
                        <div class="crypto-icon eth">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/></svg>
                        </div>
                        <div class="crypto-info">
                            <span class="crypto-name">Ethereum <span class="crypto-ticker">ETH</span></span>
                            <span class="crypto-address">0x06f2Cda18700D22FaC8e395Ef8141195eA9c4E5b</span>
                        </div>
                        <button class="copy-btn completion-copy-btn" aria-label="Copy Ethereum address">
                            <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            <svg class="check-icon hidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                        </button>
                    </div>
                    <div class="completion-crypto-item" data-address="7GfxY27W51i62hHcK8q2uEXb1nxdt2kWvSW9HPQPVfz7">
                        <div class="crypto-icon solana">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4l3.5 3.5v3h-1.5V8.5L12 6.75 10 8.5v2H8.5v-3L12 4z"/></svg>
                        </div>
                        <div class="crypto-info">
                            <span class="crypto-name">Solana <span class="crypto-ticker">SOL</span></span>
                            <span class="crypto-address">7GfxY27W51i62hHcK8q2uEXb1nxdt2kWvSW9HPQPVfz7</span>
                        </div>
                        <button class="copy-btn completion-copy-btn" aria-label="Copy Solana address">
                            <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            <svg class="check-icon hidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                        </button>
                    </div>
                </div>
            </div>
            ` : ''}
        `;
        // Wire up copy buttons in the end-of-course donation banner
        if (!nextModuleId) {
            nextSteps.querySelectorAll('.completion-crypto-item').forEach(function(item) {
                item.querySelector('.completion-copy-btn').addEventListener('click', function(e) {
                    e.stopPropagation();
                    const address   = item.dataset.address;
                    const copyIcon  = this.querySelector('.copy-icon');
                    const checkIcon = this.querySelector('.check-icon');
                    navigator.clipboard.writeText(address).then(function() {
                        copyIcon.classList.add('hidden');
                        checkIcon.classList.remove('hidden');
                        item.classList.add('copied');
                        setTimeout(function() {
                            copyIcon.classList.remove('hidden');
                            checkIcon.classList.add('hidden');
                            item.classList.remove('copied');
                        }, 2000);
                    });
                });
            });
        }
        nextSteps.classList.remove('hidden');
    } else if (nextSteps) {
        nextSteps.classList.add('hidden');
    }
}

// ===== Practice Rendering =====
function renderPractice(moduleId) {
    const module = ModuleRegistry[moduleId];
    if (!module || !module.practice) return;
    
    App.currentModule = moduleId;
    
    document.getElementById('practiceTitle').textContent = `${ModuleNames[moduleId]} Practice`;
    document.getElementById('practiceModule').textContent = ModuleNames[moduleId];
    document.getElementById('breadcrumb').textContent = `${ModuleNames[moduleId]} > Practice`;
    document.title = `${ModuleNames[moduleId]} Practice | C Programming Mastery`;
    
    const practiceList = document.getElementById('practiceList');
    let html = '';
    
    module.practice.forEach((problem, index) => {
        html += `
            <div class="practice-card" data-index="${index}">
                <div class="practice-header-bar">
                    <div class="practice-info">
                        <div class="practice-number">Problem ${index + 1}</div>
                        <div class="practice-name">${problem.title}</div>
                    </div>
                    <span class="practice-difficulty difficulty-${problem.difficulty}">${problem.difficulty}</span>
                    <div class="practice-expand">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6,9 12,15 18,9"></polyline>
                        </svg>
                    </div>
                </div>
                <div class="practice-body">
                    <div class="practice-problem">
                        <p>${problem.problem}</p>
                    </div>
                    ${problem.hint ? `<div class="tip-box"><strong>Hint:</strong><p>${problem.hint}</p></div>` : ''}
                    <div class="practice-solution">
                        <button class="solution-toggle" onclick="toggleSolution(this)">Show Solution</button>
                        <div class="solution-content">
                            ${renderCodeBlock(problem.solution, 'Solution')}
                            ${problem.explanation ? `<p>${problem.explanation}</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    practiceList.innerHTML = html;
    showView('practice');
    updateSidebarActive();
}

function toggleSolution(btn) {
    const content = btn.nextElementSibling;
    content.classList.toggle('show');
    btn.textContent = content.classList.contains('show') ? 'Hide Solution' : 'Show Solution';

    // Mark the problem as attempted the first time the solution is revealed
    if (content.classList.contains('show') && App.currentModule) {
        const card = btn.closest('.practice-card');
        if (card) {
            const key = `${App.currentModule}-practice-${card.dataset.index}`;
            if (!App.progress.attemptedProblems.includes(key)) {
                App.progress.attemptedProblems.push(key);
                saveProgress();
                renderNavigation(); // refresh sidebar badge
            }
        }
    }
}

// ===== Quiz Rendering =====
function renderQuiz(moduleId) {
    const module = ModuleRegistry[moduleId];
    if (!module || !module.quiz) return;
    
    App.currentModule = moduleId;
    App.currentQuiz = 0;
    App.quizAnswers = {};
    
    document.getElementById('quizTitle').textContent = `${ModuleNames[moduleId]} Quiz`;
    document.getElementById('breadcrumb').textContent = `${ModuleNames[moduleId]} > Quiz`;
    document.title = `${ModuleNames[moduleId]} Quiz | C Programming Mastery`;
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('quizNav').classList.remove('hidden');
    
    renderQuizQuestion(0);
    showView('quiz');
    updateSidebarActive();
}

function renderQuizQuestion(index) {
    const module = ModuleRegistry[App.currentModule];
    const quiz = module.quiz;
    const question = quiz[index];
    
    App.currentQuiz = index;
    
    document.getElementById('quizProgress').textContent = `Question ${index + 1} of ${quiz.length}`;
    
    const quizContent = document.getElementById('quizContent');
    const labels = ['A', 'B', 'C', 'D'];
    
    quizContent.innerHTML = `
        <div class="question-card">
            <div class="question-number">Question ${index + 1}</div>
            <div class="question-text">${question.question}</div>
            ${question.code ? renderCodeBlock(question.code, 'c') : ''}
            <div class="options-list">
                ${question.options.map((opt, i) => `
                    <button class="option-btn ${App.quizAnswers[index] === i ? 'selected' : ''}" 
                            data-index="${i}" onclick="selectQuizOption(${index}, ${i})">
                        <span class="option-label">${labels[i]}</span>
                        <span>${opt}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    // Update nav buttons
    document.getElementById('prevQuestion').disabled = index === 0;
    document.getElementById('nextQuestion').classList.toggle('hidden', index === quiz.length - 1);
    document.getElementById('submitQuiz').classList.toggle('hidden', index !== quiz.length - 1);
}

function selectQuizOption(questionIndex, optionIndex) {
    App.quizAnswers[questionIndex] = optionIndex;
    
    document.querySelectorAll('#quizContent .option-btn').forEach((btn, i) => {
        btn.classList.toggle('selected', i === optionIndex);
    });
}

function nextQuizQuestion() {
    const module = ModuleRegistry[App.currentModule];
    if (App.currentQuiz < module.quiz.length - 1) {
        renderQuizQuestion(App.currentQuiz + 1);
    }
}

function prevQuizQuestion() {
    if (App.currentQuiz > 0) {
        renderQuizQuestion(App.currentQuiz - 1);
    }
}

function submitQuiz() {
    const module = ModuleRegistry[App.currentModule];
    const quiz = module.quiz;

    // Guard: warn about unanswered questions
    const unanswered = quiz.filter((_, i) => App.quizAnswers[i] === undefined).length;
    if (unanswered > 0) {
        if (!confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway? Skipped questions will be marked wrong.`)) return;
    }
    
    let correct = 0;
    quiz.forEach((q, i) => {
        if (App.quizAnswers[i] === q.answer) correct++;
    });
    
    const score = Math.round((correct / quiz.length) * 100);
    // Keep the best score, never overwrite a higher one
    App.progress.quizScores[App.currentModule] = Math.max(score, App.progress.quizScores[App.currentModule] || 0);
    saveProgress();
    
    // Hide nav, show results
    document.getElementById('quizNav').classList.add('hidden');
    const resultsDiv = document.getElementById('quizResults');
    resultsDiv.classList.remove('hidden');

    const labels = ['A', 'B', 'C', 'D'];
    let reviewHtml = '<div class="results-review">';
    quiz.forEach((q, i) => {
        const userAnswer = App.quizAnswers[i];
        const isCorrect  = userAnswer === q.answer;
        reviewHtml += `
            <div class="review-question ${isCorrect ? 'review-correct' : 'review-incorrect'}">
                <div class="review-question-header">
                    <span class="review-status-icon">${isCorrect ? '✓' : '✗'}</span>
                    <span class="review-question-text">Q${i + 1}: ${q.question}</span>
                </div>
                <div class="review-options">
                    ${q.options.map((opt, j) => {
                        let cls = 'review-option';
                        if (j === q.answer) cls += ' review-option-correct';
                        else if (j === userAnswer) cls += ' review-option-wrong';
                        return `<div class="${cls}"><span class="option-label">${labels[j]}</span><span>${opt}</span></div>`;
                    }).join('')}
                </div>
                ${!isCorrect && userAnswer === undefined ? '<div class="review-skipped">Not answered</div>' : ''}
            </div>`;
    });
    reviewHtml += '</div>';

    resultsDiv.innerHTML = `
        <div class="results-score">${score}%</div>
        <div class="results-text">${score >= 70 ? '✓ Passed!' : 'Keep practicing!'}</div>
        <div class="results-details">
            <div class="results-stat"><div class="results-stat-value">${correct}</div><div class="results-stat-label">Correct</div></div>
            <div class="results-stat"><div class="results-stat-value">${quiz.length - correct}</div><div class="results-stat-label">Incorrect</div></div>
            <div class="results-stat"><div class="results-stat-value">${App.progress.quizScores[App.currentModule]}%</div><div class="results-stat-label">Best Score</div></div>
        </div>
        <div class="results-review-label">Answer Review</div>
        ${reviewHtml}
        <div class="results-actions">
            <button class="action-btn primary" onclick="renderQuiz('${App.currentModule}')">Retake Quiz</button>
            <button class="action-btn secondary" onclick="showDashboard()">Back to Dashboard</button>
        </div>
    `;
    
    updateStats();
    renderNavigation();
}

// ===== Exam Rendering =====
function renderExam(moduleId) {
    const module = ModuleRegistry[moduleId];
    if (!module || !module.exam) return;
    
    App.currentModule = moduleId;
    App.currentExam = 0;
    App.examAnswers = {};
    
    document.getElementById('examTitle').textContent = `${ModuleNames[moduleId]} Exam`;
    document.getElementById('examInfo').textContent = `${module.exam.length} Questions | No Time Limit`;
    document.getElementById('breadcrumb').textContent = `${ModuleNames[moduleId]} > Exam`;
    document.title = `${ModuleNames[moduleId]} Exam | C Programming Mastery`;
    document.getElementById('examResults').classList.add('hidden');
    
    renderExamQuestions();
    showView('exam');
    updateSidebarActive();
}

function renderExamQuestions() {
    const module = ModuleRegistry[App.currentModule];
    const exam = module.exam;
    const labels = ['A', 'B', 'C', 'D'];
    
    const examContent = document.getElementById('examContent');
    let html = '';
    
    exam.forEach((question, qIndex) => {
        html += `
            <div class="question-card">
                <div class="question-number">Question ${qIndex + 1}</div>
                <div class="question-text">${question.question}</div>
                ${question.code ? renderCodeBlock(question.code, 'c') : ''}
                <div class="options-list">
                    ${question.options.map((opt, i) => `
                        <button class="option-btn ${App.examAnswers[qIndex] === i ? 'selected' : ''}" 
                                onclick="selectExamOption(${qIndex}, ${i})">
                            <span class="option-label">${labels[i]}</span>
                            <span>${opt}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    html += `<button class="action-btn primary" style="margin-top: 24px;" onclick="submitExam()">Submit Exam</button>`;
    examContent.innerHTML = html;
}

function selectExamOption(questionIndex, optionIndex) {
    App.examAnswers[questionIndex] = optionIndex;
    // Bug fix: was calling renderExamQuestions() which rebuilt the entire DOM
    // and reset scroll position. Now we just toggle CSS classes like the quiz does.
    const allCards = document.querySelectorAll('#examContent .question-card');
    const card = allCards[questionIndex];
    if (!card) return;
    card.querySelectorAll('.option-btn').forEach((btn, i) => {
        btn.classList.toggle('selected', i === optionIndex);
    });
}

function submitExam() {
    const module = ModuleRegistry[App.currentModule];
    const exam = module.exam;

    // Guard: warn about unanswered questions
    const unanswered = exam.filter((_, i) => App.examAnswers[i] === undefined).length;
    if (unanswered > 0) {
        if (!confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway? Skipped questions will be marked wrong.`)) return;
    }
    if (!confirm('Submit exam? Your score will be recorded.')) return;
    
    let correct = 0;
    exam.forEach((q, i) => {
        if (App.examAnswers[i] === q.answer) correct++;
    });
    
    const score = Math.round((correct / exam.length) * 100);
    // Keep the best score, never overwrite a higher one
    App.progress.examScores[App.currentModule] = Math.max(score, App.progress.examScores[App.currentModule] || 0);
    saveProgress();
    
    const resultsDiv = document.getElementById('examResults');
    resultsDiv.classList.remove('hidden');
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const labels = ['A', 'B', 'C', 'D'];
    let reviewHtml = '<div class="results-review">';
    exam.forEach((q, i) => {
        const userAnswer = App.examAnswers[i];
        const isCorrect  = userAnswer === q.answer;
        reviewHtml += `
            <div class="review-question ${isCorrect ? 'review-correct' : 'review-incorrect'}">
                <div class="review-question-header">
                    <span class="review-status-icon">${isCorrect ? '✓' : '✗'}</span>
                    <span class="review-question-text">Q${i + 1}: ${q.question}</span>
                </div>
                <div class="review-options">
                    ${q.options.map((opt, j) => {
                        let cls = 'review-option';
                        if (j === q.answer) cls += ' review-option-correct';
                        else if (j === userAnswer) cls += ' review-option-wrong';
                        return `<div class="${cls}"><span class="option-label">${labels[j]}</span><span>${opt}</span></div>`;
                    }).join('')}
                </div>
                ${!isCorrect && userAnswer === undefined ? '<div class="review-skipped">Not answered</div>' : ''}
            </div>`;
    });
    reviewHtml += '</div>';

    resultsDiv.innerHTML = `
        <div class="results-score">${score}%</div>
        <div class="results-text">${score >= 80 ? '✓ Excellent work!' : score >= 60 ? 'Good effort!' : 'Keep studying!'}</div>
        <div class="results-details">
            <div class="results-stat"><div class="results-stat-value">${correct}</div><div class="results-stat-label">Correct</div></div>
            <div class="results-stat"><div class="results-stat-value">${exam.length - correct}</div><div class="results-stat-label">Incorrect</div></div>
            <div class="results-stat"><div class="results-stat-value">${App.progress.examScores[App.currentModule]}%</div><div class="results-stat-label">Best Score</div></div>
        </div>
        <div class="results-review-label">Answer Review</div>
        ${reviewHtml}
        <div class="results-actions">
            <button class="action-btn primary" onclick="renderExam('${App.currentModule}')">Retake Exam</button>
            <button class="action-btn secondary" onclick="showDashboard()">Back to Dashboard</button>
        </div>
    `;
    
    updateStats();
    renderNavigation();
}

// ===== Code Editor =====
let editorInstance = null;

function editCode(btn) {
    const codeBlock = btn.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    
    document.getElementById('codeModal').classList.remove('hidden');
    document.getElementById('outputArea').textContent = '// Output will appear here';
    
    // Initialize CodeMirror only once
    if (!editorInstance) {
        editorInstance = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
            mode: "text/x-csrc",
            theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'default' : 'dracula',
            lineNumbers: true,
            indentUnit: 4,
            matchBrackets: true,
            viewportMargin: Infinity
        });
    }
    
    editorInstance.setValue(code);
    
    // Force refresh to fix rendering glitch when opening inside a hidden modal
    setTimeout(() => editorInstance.refresh(), 50);
}

async function runCode() {
    const code        = editorInstance.getValue();
    const outputArea  = document.getElementById('outputArea');
    const stdinValue  = document.getElementById('stdinArea').value || "";
    const runBtn      = document.getElementById('runCode');

    // Disable button while running to prevent duplicate requests
    runBtn.disabled = true;
    runBtn.textContent = 'Running…';
    outputArea.textContent = "Compiling and running...";

    try {
        // Try Wandbox first (free, no auth, CORS-friendly), fall back to Godbolt
        const result = await runWithWandbox(code, stdinValue)
                    ?? await runWithGodbolt(code, stdinValue);

        outputArea.textContent = result ?? "// Both execution backends failed.\n// Check your internet connection and try again.";
    } finally {
        runBtn.disabled = false;
        runBtn.textContent = 'Run Code';
    }
}

// ── Wandbox API ───────────────────────────────────────────────
// Free, no auth required, CORS-friendly. Returns output string
// or null if the request failed at the network/HTTP level.
async function runWithWandbox(code, stdin) {
    try {
        const res = await fetch("https://wandbox.org/api/compile.json", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code:     code,
                compiler: "gcc-head",
                options:  "-Wall -std=c17",
                stdin:    stdin
            })
        });

        if (!res.ok) return null;   // fall through to Godbolt

        const data = await res.json();

        // Compilation failure
        if (data.status !== "0" && data.compiler_error) {
            return "Compilation Error:\n" + data.compiler_error;
        }

        // Runtime output
        let out = "";
        if (data.program_output) out += data.program_output;
        if (data.program_error)  out += (out ? "\n" : "") + "stderr:\n" + data.program_error;
        return out || "// Program finished with no output.";

    } catch {
        return null;    // Network error — fall through to Godbolt
    }
}

// ── Godbolt (Compiler Explorer) fallback ─────────────────────
// Free, no auth required, CORS-friendly. Uses gcc (latest) with
// execute mode enabled. Returns output string or null on failure.
async function runWithGodbolt(code, stdin) {
    try {
        const res = await fetch("https://godbolt.org/api/compiler/cg132/compile", {
            method:  "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept":       "application/json"
            },
            body: JSON.stringify({
                source:  code,
                options: {
                    userArguments: "-std=c17 -Wall",
                    executeParameters: {
                        args:  [],
                        stdin: stdin
                    },
                    compilerOptions: { executorRequest: true },
                    filters:         { execute: true },
                    tools:           []
                },
                lang:    "c",
                allowStoreCodeDebug: false
            })
        });

        if (!res.ok) return null;

        const data = await res.json();

        // Build (compile) failure
        if (data.buildResult && data.buildResult.code !== 0) {
            const errors = (data.buildResult.stderr || [])
                .map(l => l.text).join("\n");
            return "Compilation Error:\n" + (errors || "Unknown compilation failure.");
        }

        // Runtime output
        const stdout = (data.stdout || []).map(l => l.text).join("\n");
        const stderr = (data.stderr || []).map(l => l.text).join("\n");

        if (data.didExecute === false) {
            return "Compilation Error:\n" + (stderr || "Unknown compilation failure.");
        }

        let out = stdout;
        if (stderr) out += (out ? "\n" : "") + "stderr:\n" + stderr;
        return out || "// Program finished with no output.";

    } catch {
        return null;
    }
}

function resetCode() {
    if (editorInstance) {
        editorInstance.setValue('');
    }
    document.getElementById('stdinArea').value = '';
    document.getElementById('outputArea').textContent = '// Output will appear here';
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Logo / home button — always navigates back to the dashboard
    document.getElementById('logoHomeBtn').addEventListener('click', showDashboard);

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });
    
    // Mobile menu
    document.getElementById('menuBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    
    // Module headers
    document.getElementById('navModules').addEventListener('click', (e) => {
        const header = e.target.closest('.module-header');
        if (header) {
            const module = header.dataset.module;
            header.classList.toggle('expanded');
            const lessons = header.nextElementSibling;
            lessons.classList.toggle('show');
        }
        
        const lessonLink = e.target.closest('.lesson-link');
        if (lessonLink) {
            const moduleId = lessonLink.dataset.module;
            const action = lessonLink.dataset.action;
            const lessonId = lessonLink.dataset.lesson;
            
            if (action === 'practice') {
                renderPractice(moduleId);
            } else if (action === 'quiz') {
                renderQuiz(moduleId);
            } else if (action === 'exam') {
                renderExam(moduleId);
            } else if (lessonId) {
                renderLesson(moduleId, lessonId);
            }
            
            // Close mobile sidebar
            document.getElementById('sidebar').classList.remove('open');
        }
    });
    
    // Dashboard module cards
    document.getElementById('modulesOverview').addEventListener('click', (e) => {
        const card = e.target.closest('.module-card');
        if (card) {
            const moduleId = card.dataset.module;
            const module = ModuleRegistry[moduleId];
            if (module && module.lessons && module.lessons.length > 0) {
                renderLesson(moduleId, module.lessons[0].id);
            }
        }
    });
    
    // Continue button
    document.getElementById('continueBtn').addEventListener('click', () => {
        // Find first incomplete lesson
        for (const moduleId of ModuleOrder) {
            const module = ModuleRegistry[moduleId];
            if (!module || !module.lessons) continue;
            
            for (const lesson of module.lessons) {
                if (!App.progress.completedLessons.includes(`${moduleId}-${lesson.id}`)) {
                    renderLesson(moduleId, lesson.id);
                    return;
                }
            }
        }
        
        // All complete, go to first lesson
        renderLesson(ModuleOrder[0], ModuleRegistry[ModuleOrder[0]].lessons[0].id);
    });
    
    // Reset progress
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all progress?')) {
            App.progress = {
                completedLessons: [],
                quizScores: {},
                examScores: {},
                attemptedProblems: [],
                streak: App.progress.streak,
                lastVisit: App.progress.lastVisit
            };
            saveProgress();
            renderNavigation();
            renderDashboard();
        }
    });
    
    // Lesson navigation
    document.getElementById('prevLesson').addEventListener('click', () => {
        const module = ModuleRegistry[App.currentModule];
        const currentIndex = module.lessons.findIndex(l => l.id === App.currentLesson);
        if (currentIndex > 0) {
            renderLesson(App.currentModule, module.lessons[currentIndex - 1].id);
        }
    });
    
    document.getElementById('nextLesson').addEventListener('click', () => {
        const module = ModuleRegistry[App.currentModule];
        const currentIndex = module.lessons.findIndex(l => l.id === App.currentLesson);
        if (currentIndex < module.lessons.length - 1) {
            // Auto-mark the current lesson complete when the user clicks Next
            const key = `${App.currentModule}-${App.currentLesson}`;
            if (!App.progress.completedLessons.includes(key)) {
                App.progress.completedLessons.push(key);
                saveProgress();
                renderNavigation();
                updateStats();
                updateOverallProgress();
            }
            renderLesson(App.currentModule, module.lessons[currentIndex + 1].id);
        }
    });
    
    document.getElementById('markComplete').addEventListener('click', () => {
        const key = `${App.currentModule}-${App.currentLesson}`;
        const index = App.progress.completedLessons.indexOf(key);
        
        if (index === -1) {
            App.progress.completedLessons.push(key);
        } else {
            App.progress.completedLessons.splice(index, 1);
        }
        
        saveProgress();
        renderNavigation();
        updateStats();
        updateOverallProgress();
        
        const btn = document.getElementById('markComplete');
        const isCompleted = App.progress.completedLessons.includes(key);
        btn.textContent = isCompleted ? 'Completed' : 'Mark Complete';
        btn.classList.toggle('completed', isCompleted);
    });
    
    // Quiz navigation
    document.getElementById('prevQuestion').addEventListener('click', prevQuizQuestion);
    document.getElementById('nextQuestion').addEventListener('click', nextQuizQuestion);
    document.getElementById('submitQuiz').addEventListener('click', submitQuiz);
    
    // Code modal
    document.getElementById('modalBackdrop').addEventListener('click', () => {
        document.getElementById('codeModal').classList.add('hidden');
    });
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('codeModal').classList.add('hidden');
    });
    document.getElementById('runCode').addEventListener('click', runCode);
    document.getElementById('resetCode').addEventListener('click', resetCode);

    // Close code modal on Escape key (mirrors the donate flyout behaviour)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !document.getElementById('codeModal').classList.contains('hidden')) {
            document.getElementById('codeModal').classList.add('hidden');
        }
    });
    
    // Practice cards
    document.getElementById('practiceList').addEventListener('click', (e) => {
        const header = e.target.closest('.practice-header-bar');
        if (header) {
            const card = header.closest('.practice-card');
            card.classList.toggle('expanded');
        }
    });
}

function showDashboard() {
    App.currentModule = null;
    App.currentLesson = null;
    document.title = 'C Programming Mastery – Free Interactive C Tutorial (Beginner to C23)';
    renderNavigation();
    renderDashboard();
    showView('dashboard');
    document.getElementById('breadcrumb').textContent = 'Dashboard';
}

// Global functions
window.copyCode = copyCode;
window.editCode = editCode;
window.toggleSolution = toggleSolution;
window.selectQuizOption = selectQuizOption;
window.selectExamOption = selectExamOption;
window.nextQuizQuestion = nextQuizQuestion;
window.prevQuizQuestion = prevQuizQuestion;
window.submitQuiz = submitQuiz;
window.submitExam = submitExam;
window.renderQuiz = renderQuiz;
window.renderExam = renderExam;
window.renderPractice = renderPractice;
window.renderLesson = renderLesson;
window.showDashboard = showDashboard;
window.runCode = runCode;
window.resetCode = resetCode;