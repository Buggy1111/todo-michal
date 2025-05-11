
const apiUrl = 'https://todo-michal.onrender.com/todo/';
const categoriesUrl = 'https://todo-michal.onrender.com/categories/';

function loadTodos() {
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('todo-list');
      list.innerHTML = '';
      data.forEach(todo => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';

        const left = document.createElement('div');
        left.innerHTML = `
          <strong>${todo.name}</strong><br>
          <small>Kategorie: ${todo.category ? todo.category.name : 'žádná'}</small><br>
          <small class="text-muted">🕒 Vytvořeno: ${new Date(todo.created_at).toLocaleString('cs-CZ')}</small>
        `;

        const right = document.createElement('div');
        right.className = 'd-flex align-items-center gap-2';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.className = 'form-check-input';
        checkbox.title = 'Označit jako hotovo';
        checkbox.onchange = () => toggleCompleted(todo.id, checkbox.checked);

        const delBtn = document.createElement('button');
        delBtn.innerHTML = '🗑️';
        delBtn.className = 'btn btn-sm btn-outline-danger';
        delBtn.title = 'Smazat úkol';
        delBtn.onclick = () => deleteTodo(todo.id);

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.className = 'btn btn-sm btn-outline-primary';
        editBtn.title = 'Upravit úkol';
        editBtn.onclick = () => editTodoPrompt(todo);

        right.appendChild(checkbox);
        right.appendChild(delBtn);
        right.appendChild(editBtn);

        item.appendChild(left);
        item.appendChild(right);
        list.appendChild(item);
      });
    });
}

function loadCategories() {
  const select = document.getElementById('todo-category');
  // Ručně vyplněno v HTML
}

document.getElementById('todo-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('todo-name').value.trim();
  const category = document.getElementById('todo-category').value;

  if (!name) {
    alert("Zadej název úkolu.");
    return;
  }

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      category_id: category === "" ? null : parseInt(category)
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Chyba při přidávání úkolu.");
      return res.json();
    })
    .then(() => {
      loadTodos();
      document.getElementById('todo-form').reset();
    })
    .catch(err => alert(err.message));
});

function toggleCompleted(id, completed) {
  fetch(`${apiUrl}${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ completed: completed })
  })
    .then(res => res.json())
    .then(() => loadTodos());
}

function deleteTodo(id) {
  if (!confirm('Opravdu chceš smazat tento úkol?')) return;

  fetch(`${apiUrl}${id}/`, {
    method: 'DELETE'
  }).then(() => loadTodos());
}

function editTodoPrompt(todo) {
  const newName = prompt("Zadej nový název úkolu:", todo.name);
  if (newName === null || newName.trim() === "") return;

  const input = prompt("Zadej ID nové kategorie (nebo nech prázdné):", todo.category ? todo.category.id : "");
  const newCategoryId = input === "" ? null : parseInt(input);

  fetch(`${apiUrl}${todo.id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: newName.trim(),
      category_id: newCategoryId
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Chyba při ukládání změn.");
      return res.json();
    })
    .then(() => loadTodos())
    .catch(err => alert("Nepodařilo se upravit úkol. Zkontroluj vstup."));
}

loadTodos();
