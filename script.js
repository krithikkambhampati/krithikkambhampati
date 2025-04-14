document.addEventListener('DOMContentLoaded', function() {
    initEventTracking();
    initTextAnalyzer();
    initUI();
});

function initUI() {
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuIcon) {
        menuIcon.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    const toggleLogger = document.getElementById('toggle-logger');
    const eventLog = document.getElementById('event-log');
    
    if (toggleLogger) {
        toggleLogger.addEventListener('click', function() {
            eventLog.classList.toggle('hidden');
        });
    }
}

function initEventTracking() {
    document.addEventListener('click', function(event) {
        logEvent('click', event.target);
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                logEvent('view', entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    document.querySelectorAll('img').forEach(img => {
        observer.observe(img);
    });
}

function logEvent(eventType, element) {
    const timestamp = new Date().toISOString();
    let elementType = element.tagName.toLowerCase();
    
    if (element.classList.contains('btn')) {
        elementType = 'button';
    } else if (element.tagName === 'IMG') {
        elementType = 'image';
    } else if (element.tagName === 'A') {
        elementType = 'link';
    } else if (element.tagName === 'INPUT') {
        elementType = 'input-' + element.type;
    } else if (element.tagName === 'TEXTAREA') {
        elementType = 'textarea';
    } else if (element.tagName === 'SELECT') {
        elementType = 'dropdown';
    }
    
    const logMessage = `${timestamp}, ${eventType}, ${elementType}`;
    console.log(logMessage);
    
    const logContent = document.getElementById('log-content');
    if (logContent) {
        const logEntry = document.createElement('div');
        logEntry.textContent = logMessage;
        logContent.prepend(logEntry);
        
        if (logContent.children.length > 50) {
            logContent.removeChild(logContent.lastChild);
        }
    }
}

function initTextAnalyzer() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const sampleTextBtn = document.getElementById('sample-text-btn');
    const inputText = document.getElementById('input-text');
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
            analyzeText(inputText.value || "");
        });
    }
    
    if (sampleTextBtn) {
        sampleTextBtn.addEventListener('click', function() {
            loadSampleText();
        });
    }
}




function analyzeText(text) {
    const stats = calculateTextStats(text);
    displayTextStats(stats);
    
    const pronouns = countPronouns(text);
    displayTokenCounts('pronoun-results', pronouns);
    
    const prepositions = countPrepositions(text);
    displayTokenCounts('preposition-results', prepositions);
    
    const articles = countIndefiniteArticles(text);
    displayTokenCounts('article-results', articles);
}

function calculateTextStats(text) {
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length || 0;
    const spaces = (text.match(/\s/g) || []).length;
    const newlines = (text.match(/\n/g) || []).length;
    const specialSymbols = (text.match(/[^\w\s]/g) || []).length;
    
    return {
        letters,
        words,
        spaces,
        newlines,
        specialSymbols
    };
}

function displayTextStats(stats) {
    document.getElementById('char-count').textContent = `Letters:       ${stats.letters}`;
    document.getElementById('word-count').textContent = `Words:         ${stats.words}`;
    document.getElementById('space-count').textContent = `Spaces:       ${stats.spaces}`;
    document.getElementById('newline-count').textContent = `Newlines:        ${stats.newlines}`;
    document.getElementById('special-count').textContent = `Special Symbols:        ${stats.specialSymbols}`;
}

function countPronouns(text) {
    const pronounList = [
        'i', 'me', 'my', 'mine', 'myself',
        'you', 'your', 'yours', 'yourself', 'yourselves',
        'he', 'him', 'his', 'himself',
        'she', 'her', 'hers', 'herself',
        'it', 'its', 'itself',
        'we', 'us', 'our', 'ours', 'ourselves',
        'they', 'them', 'their', 'theirs', 'themselves',
        'this', 'that', 'these', 'those',
        'who', 'whom', 'whose', 'which', 'what'
    ];
    
    return countTokens(text, pronounList);
}

function countPrepositions(text) {
    const prepositionList = [
        'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'among',
        'around', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between',
        'beyond', 'by', 'concerning', 'considering', 'despite', 'down', 'during',
        'except', 'for', 'from', 'in', 'inside', 'into', 'like', 'near', 'of', 'off',
        'on', 'onto', 'out', 'outside', 'over', 'past', 'regarding', 'round', 'since',
        'through', 'throughout', 'to', 'toward', 'towards', 'under', 'underneath',
        'until', 'unto', 'up', 'upon', 'with', 'within', 'without'
    ];
    
    return countTokens(text, prepositionList);
}

function countIndefiniteArticles(text) {
    const articleList = ['a', 'an', 'the', 'some', 'any'];
    return countTokens(text, articleList);
}

function countTokens(text, tokenList) {
    const counts = {};
    
    tokenList.forEach(token => {
        counts[token] = 0;
    });
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    words.forEach(word => {
        if (tokenList.includes(word)) {
            counts[word]++;
        }
    });
    
    const sortedCounts = {};
    Object.keys(counts)
        .filter(token => counts[token] > 0)
        .sort((a, b) => counts[b] - counts[a])
        .forEach(token => {
            sortedCounts[token] = counts[token];
        });
    
    return sortedCounts;
}

function displayTokenCounts(elementId, counts) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (Object.keys(counts).length === 0) {
        container.innerHTML = '<div class="no-results">No matches found in the text.</div>';
        return;
    }
    
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    
    const maxCount = Math.max(...Object.values(counts));
    
    Object.entries(counts).forEach(([token, count]) => {
        const percentage = Math.max(5, (count / maxCount) * 100);
        
        const tokenItem = document.createElement('div');
        tokenItem.className = 'token-item';
        
        const tokenBar = document.createElement('div');
        tokenBar.className = 'token-bar';
        tokenBar.style.width = `${percentage}%`;
        
        const tokenInfo = document.createElement('div');
        tokenInfo.className = 'token-info';
        tokenInfo.innerHTML = `<span class="token-name">${token}  :</span><span class="token-count">  ${count}</span>`;

        tokenItem.appendChild(tokenInfo);
        tokenItem.appendChild(tokenBar);
        chartContainer.appendChild(tokenItem);
    });
    
    container.appendChild(chartContainer);
}