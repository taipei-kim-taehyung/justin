// 待辦資料使用獨立的 localStorage 名稱保存。
const STORAGE_KEY = 'justin-todo-items';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');

// 載入資料時排除格式不完整的項目，避免影響畫面更新。
function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(savedTodos)) return [];

    return savedTodos.filter((todo) =>
      todo && typeof todo.id === 'string' &&
      typeof todo.text === 'string' &&
      typeof todo.completed === 'boolean'
    );
  } catch (error) {
    console.warn('讀取待辦清單失敗，將以空清單開始。', error);
    return [];
  }
}

let todos = loadTodos();

// 每次修改後立即保存目前的待辦資料。
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.warn('儲存待辦清單失敗。', error);
  }
}

// 依照目前資料重繪清單與未完成數量。
function renderTodos() {
  list.replaceChildren();

  todos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = todo.completed ? 'todo-item is-complete' : 'todo-item';
    item.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.className = 'todo-checkbox';
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `標記「${todo.text}」為完成`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = '刪除';
    deleteButton.setAttribute('aria-label', `刪除「${todo.text}」`);

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  emptyState.hidden = todos.length > 0;
  remainingCount.textContent = `未完成:${todos.filter((todo) => !todo.completed).length} 項`;
}

// 表單送出時忽略空白內容，並將新項目保存到瀏覽器。
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    completed: false,
  });
  saveTodos();
  renderTodos();
  input.value = '';
  input.focus();
});

// 透過事件委派處理每筆待辦的勾選與刪除。
list.addEventListener('click', (event) => {
  const item = event.target.closest('.todo-item');
  if (!item) return;

  const todo = todos.find((entry) => entry.id === item.dataset.id);
  if (!todo) return;

  if (event.target.matches('.todo-checkbox')) {
    todo.completed = event.target.checked;
  } else if (event.target.matches('.delete-button')) {
    todos = todos.filter((entry) => entry.id !== todo.id);
  } else {
    return;
  }

  saveTodos();
  renderTodos();
});

renderTodos();
