/* =============================================
   Library Loader — loads tool entries from markdown files
   ============================================= */

const LIBRARY_FILES = [
  'content/library/microsoft-powerpoint.md',
  'content/library/google-slides.md',
  'content/library/prezi.md',
  'content/library/canva.md',
  'content/library/gimp.md',
  'content/library/paint-net.md',
  'content/library/learningapps.md',
  'content/library/wordwall.md',
  'content/library/kahoot.md',
  'content/library/padlet.md',
  'content/library/google-workspace.md',
  'content/library/yandex-360.md',
  'content/library/oblako-mail.md'
];

const CATEGORY_ICONS = {
  'Презентации': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  'Графика': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  'Онлайн-платформы': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z"/></svg>',
  'Облачные сервисы': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>'
};

const CATEGORY_ORDER = ['Презентации', 'Графика', 'Онлайн-платформы', 'Облачные сервисы'];

function parseLibraryFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data = {};
  match[1].split('\n').forEach(line => {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2];
  });
  return data;
}

function loadLibrary() {
  Promise.all(LIBRARY_FILES.map(f => fetch(f).then(r => r.text()).then(parseLibraryFrontmatter)))
    .then(items => {
      const groups = {};
      items.forEach(item => {
        if (!item.category) return;
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
      });

      const container = document.getElementById('library-content');
      if (!container) return;

      container.innerHTML = CATEGORY_ORDER
        .filter(cat => groups[cat])
        .map(cat => {
          const cards = groups[cat].map(tool =>
            '<div class="tool-card">' +
              '<div class="tool-card__name">' + tool.title + '</div>' +
              '<div class="tool-card__desc">' + tool.description + '</div>' +
            '</div>'
          ).join('');
          return '<div class="tools-category fade-in">' +
            '<h2 class="tools-category__title">' + (CATEGORY_ICONS[cat] || '') + ' ' + cat + '</h2>' +
            '<div class="cards-grid">' + cards + '</div>' +
          '</div>';
        }).join('');
    });
}
