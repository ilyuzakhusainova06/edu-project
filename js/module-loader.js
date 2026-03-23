/* =============================================
   Module Loader — loads content from YAML front-matter markdown files
   ============================================= */

function parseYamlFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const data = {};
  let currentKey = null;
  let currentList = null;
  let multilineValue = '';
  let isMultiline = false;

  const lines = yaml.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // List item under a key
    if (/^  - /.test(line) && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(line.replace(/^  - /, ''));
      continue;
    }

    // Multiline continuation (indented with spaces, part of >- block)
    if (isMultiline && /^  \S/.test(line)) {
      if (line.trim() === '') {
        multilineValue += '\n\n';
      } else {
        multilineValue += (multilineValue.endsWith('\n\n') ? '' : ' ') + line.trim();
      }
      continue;
    }

    // Empty line inside multiline
    if (isMultiline && line.trim() === '') {
      multilineValue += '\n\n';
      continue;
    }

    // Save previous multiline
    if (isMultiline) {
      data[currentKey] = multilineValue.trim();
      isMultiline = false;
      multilineValue = '';
    }

    // Key: value pair
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const val = kvMatch[2];
      if (val === '>-' || val === '|') {
        isMultiline = true;
        multilineValue = '';
      } else if (val === '') {
        data[currentKey] = [];
      } else {
        data[currentKey] = val;
      }
    }
  }

  if (isMultiline && currentKey) {
    data[currentKey] = multilineValue.trim();
  }

  return data;
}

function simpleMarkdown(text) {
  if (!text) return '';
  return text
    .split(/\n\n+/)
    .map(block => {
      block = block.trim();
      if (/^- /.test(block)) {
        const items = block.split(/\n/).map(l => '<li>' + inlineMarkdown(l.replace(/^- /, '')) + '</li>').join('');
        return '<ul>' + items + '</ul>';
      }
      return '<p>' + inlineMarkdown(block) + '</p>';
    })
    .join('');
}

function inlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function loadModule(contentPath) {
  fetch(contentPath)
    .then(r => r.text())
    .then(text => {
      const data = parseYamlFrontmatter(text);

      const el = (id) => document.getElementById(id);

      if (data.number) {
        const numEl = el('module-number');
        if (numEl) numEl.textContent = 'Модуль ' + data.number;
        document.title = 'Модуль ' + data.number + ': ' + (data.title || '') + ' — ЦифроПед';
      }
      if (data.title) {
        const titleEl = el('module-title');
        if (titleEl) titleEl.textContent = data.title;
      }
      if (data.description) {
        const descEl = el('module-desc');
        if (descEl) descEl.textContent = data.description;
      }
      if (data.goals && Array.isArray(data.goals)) {
        const goalsEl = el('module-goals');
        if (goalsEl) goalsEl.innerHTML = data.goals.map(g => '<li>' + g + '</li>').join('');
      }
      if (data.theory) {
        const theoryEl = el('module-theory');
        if (theoryEl) theoryEl.innerHTML = simpleMarkdown(data.theory);
      }
      if (data.pedagogy) {
        const pedEl = el('module-pedagogy');
        if (pedEl) pedEl.innerHTML = simpleMarkdown(data.pedagogy);
      }
      if (data.practice) {
        const practEl = el('module-practice');
        if (practEl) practEl.innerHTML = simpleMarkdown(data.practice);
      }
      if (data.reflection && Array.isArray(data.reflection)) {
        const refEl = el('module-reflection');
        if (refEl) refEl.innerHTML = data.reflection.map(q => '<li>' + q + '</li>').join('');
      }
    });
}
