import './style.css';
import type { AppConfig, CourseTask, TaskFilter, TaskPriority, TaskStatus } from './types';
import { escapeHtml, filterItems, loadFromStorage, saveToStorage } from './utils';

const textToType: string = '> SYSTEM INITIALIZED... INFORMATICS & NETWORK INFRASTRUCTURE SPECIALIST.';
let charIndex: number = 0;

function runTypeWriter(): void {
  const typeWriterElement = document.getElementById('typewriter');
  if (!typeWriterElement) return;

  if (charIndex < textToType.length) {
    typeWriterElement.innerHTML += textToType.charAt(charIndex);
    charIndex++;
    setTimeout(runTypeWriter, 50);
  } else {
    setInterval(() => {
      if (typeWriterElement.innerHTML.endsWith('_')) {
        typeWriterElement.innerHTML = typeWriterElement.innerHTML.slice(0, -1);
      } else {
        typeWriterElement.innerHTML += '_';
      }
    }, 500);
  }
}

function updateTime(): void {
  const timeElement = document.getElementById('sys-time');
  if (!timeElement) return;

  const now = new Date();
  const hours: string = now.getHours().toString().padStart(2, '0');
  const minutes: string = now.getMinutes().toString().padStart(2, '0');
  const seconds: string = now.getSeconds().toString().padStart(2, '0');

  timeElement.textContent = `${hours}:${minutes}:${seconds} WIB`;
}

function initTabNavigation(): void {
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-link');
  const sections = document.querySelectorAll<HTMLElement>('.content-section');

  navLinks.forEach((link) => {
    link.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (!targetId) return;

      const targetSection = document.querySelector<HTMLElement>(targetId);
      if (targetSection) {
        navLinks.forEach((nav) => nav.classList.remove('active'));
        link.classList.add('active');

        sections.forEach((sec) => sec.classList.remove('active'));
        setTimeout(() => {
          targetSection.classList.add('active');
        }, 10);
      }
    });
  });
}

const appConfig: AppConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'PRTS Academic Task Terminal',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
};

const STORAGE_KEY: string = 'prts_academic_tasks_v1';
let editingTaskId: number | null = null;
let activeFilter: TaskFilter = 'ALL';

const defaultTasks: CourseTask[] = [
  {
    id: 1,
    title: 'Tugas Pertemuan 6: Aplikasi Daftar Tugas (Git, npm, TS, Vite)',
    course: 'Pengembangan Aplikasi Web',
    deadline: '2026-11-26',
    priority: 'High',
    status: 'Belum Selesai',
    isCompleted: false,
  },
  {
    id: 2,
    title: 'Konfigurasi Routing & Analisis Paket Jaringan',
    course: 'Jaringan Komputer',
    deadline: '2026-11-25',
    priority: 'Medium',
    status: 'Selesai',
    isCompleted: true,
  },
];

let tasks: CourseTask[] = loadFromStorage<CourseTask[]>(STORAGE_KEY, defaultTasks);

function renderEnvInfo(): void {
  const nameEl = document.getElementById('env-app-name');
  const versionEl = document.getElementById('env-app-version');
  const modeEl = document.getElementById('env-app-mode');

  if (nameEl) nameEl.textContent = appConfig.appName;
  if (versionEl) versionEl.textContent = `v${appConfig.appVersion}`;
  if (modeEl) modeEl.textContent = appConfig.appEnv.toUpperCase();
}

function updateStats(): void {
  const totalCount: number = tasks.length;
  const doneCount: number = filterItems<CourseTask>(tasks, (t) => t.isCompleted).length;
  const pendingCount: number = totalCount - doneCount;

  const totalEl = document.getElementById('stat-total');
  const pendingEl = document.getElementById('stat-pending');
  const doneEl = document.getElementById('stat-done');

  if (totalEl) totalEl.textContent = String(totalCount);
  if (pendingEl) pendingEl.textContent = String(pendingCount);
  if (doneEl) doneEl.textContent = String(doneCount);
}

function renderTasks(): void {
  const listEl = document.getElementById('task-list');
  if (!listEl) return;

  updateStats();

  const displayedTasks: CourseTask[] =
    activeFilter === 'ALL'
      ? tasks
      : filterItems<CourseTask>(tasks, (task) => task.status === activeFilter);

  if (displayedTasks.length === 0) {
    listEl.innerHTML = `<div class="task-empty">Tidak ada data tugas pada filter "${escapeHtml(activeFilter)}".</div>`;
    return;
  }

  listEl.innerHTML = displayedTasks
    .map((task) => {
      const statusClass: string = task.isCompleted ? 'badge-done' : 'badge-pending';
      const priorityClass: string = `priority-${task.priority.toLowerCase()}`;
      const toggleLabel: string = task.isCompleted ? 'Tandai Belum' : 'Tandai Selesai';

      return `
        <article class="task-item ${task.isCompleted ? 'is-completed' : ''}">
          <div class="task-item-main">
            <div class="task-badges">
              <span class="badge ${statusClass}">${escapeHtml(task.status)}</span>
              <span class="badge ${priorityClass}">${escapeHtml(task.priority)}</span>
              <span class="task-course-tag">${escapeHtml(task.course)}</span>
            </div>
            <h4 class="task-item-title">${escapeHtml(task.title)}</h4>
            <div class="task-meta">Deadline: <strong>${escapeHtml(task.deadline)}</strong></div>
          </div>
          <div class="task-item-actions">
            <button type="button" class="btn-action btn-toggle" data-action="toggle" data-id="${task.id}">
              ${toggleLabel}
            </button>
            <button type="button" class="btn-action btn-edit" data-action="edit" data-id="${task.id}">
              Edit
            </button>
            <button type="button" class="btn-action btn-delete" data-action="delete" data-id="${task.id}">
              Hapus
            </button>
          </div>
        </article>
      `;
    })
    .join('');
}

function resetFormMode(): void {
  const form = document.getElementById('task-form') as HTMLFormElement | null;
  const formTitle = document.getElementById('form-title');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');

  editingTaskId = null;
  form?.reset();
  if (formTitle) formTitle.textContent = 'Tambah Tugas Kuliah Baru';
  if (submitBtn) submitBtn.textContent = '+ Tambah Tugas';
  cancelBtn?.classList.add('hidden');
}

function startEditTask(taskId: number): void {
  const targetTask = tasks.find((t) => t.id === taskId);
  if (!targetTask) return;

  const titleInput = document.getElementById('task-title') as HTMLInputElement | null;
  const courseInput = document.getElementById('task-course') as HTMLSelectElement | null;
  const deadlineInput = document.getElementById('task-deadline') as HTMLInputElement | null;
  const priorityInput = document.getElementById('task-priority') as HTMLSelectElement | null;
  const formTitle = document.getElementById('form-title');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');

  if (titleInput) titleInput.value = targetTask.title;
  if (courseInput) courseInput.value = targetTask.course;
  if (deadlineInput) deadlineInput.value = targetTask.deadline;
  if (priorityInput) priorityInput.value = targetTask.priority;

  editingTaskId = targetTask.id;
  if (formTitle) formTitle.textContent = `Edit Tugas #${targetTask.id}`;
  if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';
  cancelBtn?.classList.remove('hidden');

  titleInput?.focus();
}

function toggleTaskStatus(taskId: number): void {
  tasks = tasks.map((task) => {
    if (task.id !== taskId) return task;
    const nextCompleted: boolean = !task.isCompleted;
    const nextStatus: TaskStatus = nextCompleted ? 'Selesai' : 'Belum Selesai';
    return { ...task, isCompleted: nextCompleted, status: nextStatus };
  });

  saveToStorage<CourseTask[]>(STORAGE_KEY, tasks);
  renderTasks();
}

function deleteTask(taskId: number): void {
  tasks = filterItems<CourseTask>(tasks, (task) => task.id !== taskId);
  if (editingTaskId === taskId) {
    resetFormMode();
  }
  saveToStorage<CourseTask[]>(STORAGE_KEY, tasks);
  renderTasks();
}

function initTaskManager(): void {
  const form = document.getElementById('task-form') as HTMLFormElement | null;
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const listEl = document.getElementById('task-list');
  const filterBtns = document.querySelectorAll<HTMLButtonElement>('.filter-btn');

  renderEnvInfo();
  renderTasks();

  form?.addEventListener('submit', (e: SubmitEvent) => {
    e.preventDefault();

    const titleInput = document.getElementById('task-title') as HTMLInputElement;
    const courseInput = document.getElementById('task-course') as HTMLSelectElement;
    const deadlineInput = document.getElementById('task-deadline') as HTMLInputElement;
    const priorityInput = document.getElementById('task-priority') as HTMLSelectElement;

    const title: string = titleInput.value.trim();
    const course: string = courseInput.value;
    const deadline: string = deadlineInput.value;
    const priority: TaskPriority = priorityInput.value as TaskPriority;

    if (!title || !deadline) return;

    if (editingTaskId !== null) {
      tasks = tasks.map((task) =>
        task.id === editingTaskId ? { ...task, title, course, deadline, priority } : task
      );
      resetFormMode();
    } else {
      const newTask: CourseTask = {
        id: Date.now(),
        title,
        course,
        deadline,
        priority,
        status: 'Belum Selesai',
        isCompleted: false,
      };
      tasks = [newTask, ...tasks];
      form.reset();
    }

    saveToStorage<CourseTask[]>(STORAGE_KEY, tasks);
    renderTasks();
  });

  cancelBtn?.addEventListener('click', resetFormMode);

  listEl?.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const taskId: number = Number(button.dataset.id);
    if (Number.isNaN(taskId)) return;

    if (action === 'toggle') toggleTaskStatus(taskId);
    if (action === 'edit') startEditTask(taskId);
    if (action === 'delete') deleteTask(taskId);
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = (btn.dataset.filter as TaskFilter) || 'ALL';
      renderTasks();
    });
  });
}

function bootstrap(): void {
  runTypeWriter();
  updateTime();
  setInterval(updateTime, 1000);
  initTabNavigation();
  initTaskManager();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}