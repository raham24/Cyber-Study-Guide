// Global JS for Cyber-Study-Guide Project

// Example: Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Example: Toggle sections (for expandable content, if needed)
function toggleSection(id) {
    var el = document.getElementById(id);
    if (el) {
        el.style.display = (el.style.display === 'none') ? 'block' : 'none';
    }
}

// Chapter Questions Persistence Logic
function getChapterStorageKey(chapter) {
    // Use a unique key per chapter and browser session
    return chapter + "-questions-" + (window.crypto?.randomUUID?.() || Math.random().toString(36).substr(2, 9));
}

function saveAnswer(chapter, qNum, value, multi) {
    const STORAGE_KEY = getChapterStorageKey(chapter);
    let answers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (multi) {
        answers[qNum] = answers[qNum] || [];
        if (answers[qNum].includes(value)) {
            answers[qNum] = answers[qNum].filter(v => v !== value);
        } else {
            answers[qNum].push(value);
        }
    } else {
        answers[qNum] = value;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    updateAnswerGrid(chapter);
}

function getAnswer(chapter, qNum) {
    const STORAGE_KEY = getChapterStorageKey(chapter);
    let answers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return answers[qNum] || "";
}

function restoreAnswers(chapter) {
    document.querySelectorAll('.question-block').forEach(function(qBlock, idx) {
        let qNum = idx + 1;
        let multi = qBlock.classList.contains('multi-select');
        let saved = getAnswer(chapter, qNum);
        if (multi && Array.isArray(saved)) {
            let checks = qBlock.querySelectorAll('input[type="checkbox"]');
            checks.forEach(check => {
                check.checked = saved.includes(check.value);
            });
        } else {
            let radios = qBlock.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                if (radio.value === saved) radio.checked = true;
            });
        }
    });
}

function updateAnswerGrid(chapter) {
    let grid = document.querySelector('.answer-grid');
    if (grid) {
        grid.innerHTML = '';
        document.querySelectorAll('.question-block').forEach(function(qBlock, idx) {
            let qNum = idx + 1;
            let multi = qBlock.classList.contains('multi-select');
            let saved = getAnswer(chapter, qNum);
            let display = '';
            if (multi && Array.isArray(saved)) {
                display = saved.join(', ');
            } else {
                display = saved;
            }
            grid.innerHTML += `<div class="answer-row"><span class="answer-number">${qNum}.</span><span class="answer-blank">${display}</span></div>`;
        });
    }
}

function setupQuestionPersistence(chapter) {
    restoreAnswers(chapter);
    document.querySelectorAll('.question-block input[type="radio"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            let qBlock = this.closest('.question-block');
            let qNum = Array.from(document.querySelectorAll('.question-block')).indexOf(qBlock) + 1;
            saveAnswer(chapter, qNum, this.value, false);
        });
    });
    document.querySelectorAll('.question-block input[type="checkbox"]').forEach(function(check) {
        check.addEventListener('change', function() {
            let qBlock = this.closest('.question-block');
            let qNum = Array.from(document.querySelectorAll('.question-block')).indexOf(qBlock) + 1;
            saveAnswer(chapter, qNum, this.value, true);
        });
    });
    updateAnswerGrid(chapter);
}

// Usage example in HTML:
// document.addEventListener('DOMContentLoaded', function() {
//     setupQuestionPersistence('chapter1');
// });