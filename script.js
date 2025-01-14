// script.js
function insertPlaceholder(placeholder) {
    const input = document.getElementById('sentence');
    const cursorPosition = input.selectionStart;
    const textBefore = input.value.substring(0, cursorPosition);
    const textAfter = input.value.substring(cursorPosition);
    input.value = textBefore + placeholder + textAfter;
    input.focus();
    input.setSelectionRange(cursorPosition + placeholder.length, cursorPosition + placeholder.length);
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(name) {
    const cookieName = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName)) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}

function loadCookies() {
    document.getElementById('action').value = getCookie('action') || '';
    document.getElementById('type').value = getCookie('type') || '';
    document.getElementById('element').value = getCookie('element') || '';
    document.getElementById('preposition').value = getCookie('preposition') || '';
    document.getElementById('entities').value = getCookie('entities') || '';
}

function saveCookies() {
    setCookie('action', document.getElementById('action').value, 30);
    setCookie('type', document.getElementById('type').value, 30);
    setCookie('element', document.getElementById('element').value, 30);
    setCookie('preposition', document.getElementById('preposition').value, 30);
    setCookie('entities', document.getElementById('entities').value, 30);
}

function generateRegex() {
    // Get the input sentence
    const sentence = document.getElementById('sentence').value;

    // Get the identifiers
    const action = document.getElementById('action').value.trim();
    const type = document.getElementById('type').value.trim();
    const element = document.getElementById('element').value.trim();
    const preposition = document.getElementById('preposition').value.trim();

    // Get the entities input and convert to lowercase array
    const entitiesInput = document.getElementById('entities').value;
    const entities = entitiesInput.split(',').map(entity => entity.trim().toLowerCase());

    // Define placeholders and their corresponding regex patterns
    const placeholders = {
        "[action]": `(?:${action})`,
        "[page]": "(\\w+.*?\\b),?", // Optional comma after the page identifier
        "[field]": `((?:${type})\\s+(?:${element}))`, // Double brackets for capture group
        "[prep]": `(?:${preposition})`,
        "[value]": "['\"]([^'\"]+)['\"]"
    };

    // Generate the regex pattern
    let regexPattern = sentence;
    for (const [placeholder, pattern] of Object.entries(placeholders)) {
        regexPattern = regexPattern.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), pattern);
    }

    // Replace spaces with \\s+ in the regex pattern
    regexPattern = regexPattern.replace(/\s+/g, '\\s+');

    // Generate the description
    let description = sentence;
    for (const placeholder of Object.keys(placeholders)) {
        description = description.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `[${placeholder.slice(1, -1)}]`);
    }

    // Prepare the JSON output
    const output = {
        regex: regexPattern,
        description: description,
        entities: entities
    };

    // Save values to cookies
    saveCookies();

    // Display the JSON output
    document.getElementById('json-output').textContent = JSON.stringify(output, null, 2);
}

function copyOutput() {
    const output = document.getElementById('json-output').textContent;
    navigator.clipboard.writeText(output)
        .then(() => {
            alert('Output copied to clipboard!');
        })
        .catch(() => {
            alert('Failed to copy output. Please manually copy the text.');
        });
}

// Load saved values from cookies when the page loads
window.onload = loadCookies;
