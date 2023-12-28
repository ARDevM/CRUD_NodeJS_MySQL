document.addEventListener('DOMContentLoaded', function () {
  const userTableBody = document.getElementById('userTableBody');
  const addUserForm = document.getElementById('addUserForm');
  const editUserForm = document.getElementById('editUserForm');

  function setupDeleteButton() {
    const deleteButtons = document.querySelectorAll('.deleteUser');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function () {
        const userId = this.dataset.userid;
        deleteUser(userId);
      });
    });
  }

  function getUsers() {
    fetch('/users')
      .then(response => response.json())
      .then(data => {
        userTableBody.innerHTML = '';
        data.forEach((user, index) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.nama}</td>
            <td>${user.email}</td>
            <td>${new Date(user.ulang_tahun).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-warning btn-sm edit-button" data-userid="${user.id}">Edit</button>
              <button class="btn btn-danger btn-sm deleteUser"  data-userid="${user.id}">Delete</button>
            </td>
          `;
          userTableBody.appendChild(tr);
        });
        setupEditButton();
        setupDeleteButton();
      })
      .catch(error => console.error('Error:', error));
  }

  function addUser(user) {
    fetch('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        getUsers();
        Swal.fire({
          title: 'Success!',
          text: 'User Added Successfully.',
          icon: 'success',
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        Swal.fire({
          title: 'Error!',
          text: 'An error occurred while adding a user.',
          icon: 'error',
        });
      });
  }

  function editUser(userId) {
    fetch(`/users?id=${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Server response:', data);

        const user = data.find(u => u.id.toString() === userId.toString());

        if (user) {
          const editUserIdInput = document.getElementById('editUserId');
          const editNamaInput = document.getElementById('editNama');
          const editEmailInput = document.getElementById('editEmail');
          const editUlangTahunInput = document.getElementById('editUlangTahun');

          editUserIdInput.value = user.id;
          editNamaInput.value = user.nama;
          editEmailInput.value = user.email;
          editUlangTahunInput.value = user.ulang_tahun;

          $('#editUserModal').modal('show');
        } else {
          console.error('User not found for ID:', userId);
          Swal.fire({
            title: 'Error!',
            text: 'User not found.',
            icon: 'error',
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Swal.fire({
          title: 'Error!',
          text: 'An error occurred while loading data.',
          icon: 'error',
        });
      });
  }

  function saveEditUser() {
    const editUserIdInput = document.getElementById('editUserId');
    const editNamaInput = document.getElementById('editNama');
    const editEmailInput = document.getElementById('editEmail');
    const editUlangTahunInput = document.getElementById('editUlangTahun');

    const editedUser = {
      id: editUserIdInput.value,
      nama: editNamaInput.value,
      email: editEmailInput.value,
      ulang_tahun: editUlangTahunInput.value
    };

    fetch('/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editedUser)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        getUsers();
        $('#editUserModal').modal('hide');
      })
      .catch(error => console.error('Error:', error));
  }

  function setupEditButton() {
    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => {
      button.addEventListener('click', function () {
        const userId = this.dataset.userid;
        editUser(userId);
      });
    });
  }

  function deleteUser(userId) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This user will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/users?id=${userId}`, {
          method: 'DELETE',
        })
          .then(response => response.json())
          .then(data => {
            console.log('Success:', data);
            getUsers();
            Swal.fire(
              'Deleted!',
              'User has been deleted.',
              'success'
            );
          })
          .catch(error => {
            console.error('Error:', error);
            Swal.fire(
              'Error!',
              'An error occurred while deleting the user.',
              'error'
            );
          });
      }
    });
  }

  addUserForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const nama = document.getElementById('nama').value;
    const email = document.getElementById('email').value;
    const ulangTahun = document.getElementById('ulangTahun').value;

    const newUser = {
      nama,
      email,
      ulang_tahun: ulangTahun
    };

    addUser(newUser);
    addUserForm.reset();
  });

  editUserForm.addEventListener('submit', function (event) {
    event.preventDefault();
    saveEditUser();
  });

  getUsers();
});
