
const API_URL = "http://localhost:5000/students";

// DOM Elements
const studentTableBody = document.getElementById("studentTableBody");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("studentModal");
const editModal = document.getElementById("editStudentModal");

const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");

const studentForm = document.getElementById("studentForm");
const editForm = document.getElementById("editStudentForm");

const formError = document.getElementById("formError");
const editError = document.getElementById("editFormError");
const message = document.getElementById("message");

let students = [];

// Escape HTML
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Show Message
function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#c0392b" : "#20815a";
}

// API Response Handler
async function getResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || result.error || `Server Error: ${response.status}`);
  }

  return result;
}

// Dashboard Statistics
function updateStats() {
  document.getElementById("totalCount").textContent = students.length;

  document.getElementById("activeCount").textContent =
    students.filter(s => s.status === "Active").length;

  document.getElementById("completedCount").textContent =
    students.filter(s => s.status === "Completed").length;
}

// Render Students
function renderStudents(list) {
  if (!list.length) {
    studentTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty">No students found.</td>
      </tr>
    `;
    return;
  }

  studentTableBody.innerHTML = list.map(student => {
    const id = escapeHTML(student._id || student.id || "");
    const name = escapeHTML(student.name || "Unnamed");
    const email = escapeHTML(student.email || "");
    const domain = escapeHTML(student.domain || "Not specified");

    const status = ["Active", "Inactive", "Completed"].includes(student.status)
      ? student.status
      : "Inactive";

    const initials = name.trim().charAt(0).toUpperCase() || "?";

    return `
      <tr>
        <td>
          <span class="student-initial">${initials}</span>
          <span class="student-name">${name}</span>
        </td>

        <td>${domain}</td>
        <td>${email}</td>

        <td>
          <span class="status status-${status.toLowerCase()}">
            ${status}
          </span>
        </td>

        <td class="action-buttons">
          <button class="edit-btn" data-id="${id}" type="button">
            Edit
          </button>

          <button class="delete-btn" data-id="${id}" type="button">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// Search Students
function applySearch() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = students.filter(student =>
    (student.name || "").toLowerCase().includes(query) ||
    (student.email || "").toLowerCase().includes(query) ||
    (student.domain || "").toLowerCase().includes(query) ||
    (student.status || "").toLowerCase().includes(query)
  );

  renderStudents(filtered);
}

// GET Students
async function loadStudents() {
  studentTableBody.innerHTML = `
    <tr>
      <td colspan="5" class="empty">Loading students...</td>
    </tr>
  `;

  try {
    const response = await fetch(API_URL);
    const data = await getResponse(response);

    // Supports array or { students: [...] } API responses
    const records = Array.isArray(data) ? data : data.students;

    if (!Array.isArray(records)) {
      throw new Error("Invalid student data received from server.");
    }

    students = records;

    updateStats();
    applySearch();

  } catch (error) {
    studentTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty">
          Unable to load students. Check backend server.
        </td>
      </tr>
    `;

    students = [];
    updateStats();
    showMessage(error.message, true);
  }
}

// Open Add Modal
function openModal() {
  studentForm.reset();
  formError.textContent = "";

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  document.getElementById("name").focus();
}

// Close Add Modal
function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

// Open Edit Modal
function openEditModal(student) {
  document.getElementById("editStudentId").value =
    student._id || student.id;

  document.getElementById("editName").value = student.name || "";
  document.getElementById("editEmail").value = student.email || "";
  document.getElementById("editDomain").value = student.domain || "";
  document.getElementById("editStatus").value = student.status || "Active";

  editError.textContent = "";

  editModal.classList.add("show");
  editModal.setAttribute("aria-hidden", "false");
}

// Close Edit Modal
function closeEditModal() {
  editModal.classList.remove("show");
  editModal.setAttribute("aria-hidden", "true");
}

// Modal Events
openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
closeEditModalBtn.addEventListener("click", closeEditModal);

modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

editModal.addEventListener("click", event => {
  if (event.target === editModal) closeEditModal();
});

// ADD STUDENT - POST
studentForm.addEventListener("submit", async event => {
  event.preventDefault();

  formError.textContent = "";

  const submitButton = studentForm.querySelector('button[type="submit"]');

  const studentData = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    domain: document.getElementById("domain").value,
    status: document.getElementById("status").value
  };

  if (!studentData.name || !studentData.email || !studentData.domain) {
    formError.textContent = "Please fill all required fields.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(studentData)
    });

    await getResponse(response);

    studentForm.reset();
    closeModal();

    searchInput.value = "";

    showMessage("Student added successfully!");

    await loadStudents();

  } catch (error) {
    formError.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Save Student";
  }
});

// Search Event
searchInput.addEventListener("input", applySearch);

// EDIT / DELETE BUTTON EVENTS
studentTableBody.addEventListener("click", async event => {

  // EDIT STUDENT
  const editButton = event.target.closest(".edit-btn");

  if (editButton) {
    const id = editButton.dataset.id;

    const student = students.find(
      item => String(item._id || item.id) === id
    );

    if (!student) {
      showMessage("Student not found.", true);
      return;
    }

    openEditModal(student);
    return;
  }

  // DELETE STUDENT
  const deleteButton = event.target.closest(".delete-btn");

  if (deleteButton) {
    const id = deleteButton.dataset.id;

    const student = students.find(
      item => String(item._id || item.id) === id
    );

    if (!student) {
      showMessage("Student not found.", true);
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    deleteButton.disabled = true;

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(id)}`,
        {
          method: "DELETE"
        }
      );

      await getResponse(response);

      showMessage("Student deleted successfully!");

      await loadStudents();

    } catch (error) {
      showMessage(error.message, true);
    } finally {
      deleteButton.disabled = false;
    }
  }
});

// UPDATE STUDENT - PUT
editForm.addEventListener("submit", async event => {
  event.preventDefault();

  editError.textContent = "";

  const id = document.getElementById("editStudentId").value;

  const submitButton = editForm.querySelector('button[type="submit"]');

  const updatedStudent = {
    name: document.getElementById("editName").value.trim(),
    email: document.getElementById("editEmail").value.trim(),
    domain: document.getElementById("editDomain").value,
    status: document.getElementById("editStatus").value
  };

  if (!id) {
    editError.textContent = "Student ID is missing.";
    return;
  }

  if (
    !updatedStudent.name ||
    !updatedStudent.email ||
    !updatedStudent.domain
  ) {
    editError.textContent = "Please fill all required fields.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Updating...";

  try {
    console.log("Sending update:", updatedStudent);

    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedStudent)
      }
    );

    const result = await getResponse(response);

    console.log("Update response:", result);

    closeEditModal();

    await loadStudents();

  } catch (error) {
    editError.textContent = error.message;
    console.error("Update Error:", error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Update Student";
  }
});

// Sidebar Navigation
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {
  link.addEventListener("click", event => {
    const href = link.getAttribute("href");

    navLinks.forEach(item => item.classList.remove("active"));
    link.classList.add("active");

    if (href === "#students") {
      event.preventDefault();

      document.getElementById("students").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    if (href === "#") {
      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  });
});

// Escape Key
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
    closeEditModal();
  }
});

// INITIAL LOAD
loadStudents();
