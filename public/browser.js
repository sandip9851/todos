let skip = 0
window.onload = gettingTodo();

function gettingTodo() {
  axios
    .get(`/read-todo?skip=${skip}`)
    .then((res) => {
      console.log(res);

      //this is for if all is not ok client should be inform to user via msg
      /*if(res.data.status !== 200){
      alert(res.data.message)
    }*/
      
      const todoData = res.data.data;
      skip += todoData.length;
     
      document.getElementById("item_list").insertAdjacentHTML(
        "beforeend",
        todoData
          .map((item) => {
            return `
        <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
        <span class="item-text">${item.todo}</span>
          <div>
            <button data_id ="${item._id}" class="edit-me btn btn-primary btn-sm mr-1">Edit</button>
            <button data_id ="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
          </div>
          </li>`;
          })
          .join(" ")
      );
    })
    .catch((err) => {
      console.log(err);
    });
}

document.addEventListener("click", (e) => {
  

  if (e.target.classList.contains("edit-me")) {
    const todoId = e.target.getAttribute("data_id");
    const newData = prompt("Enter new Todo Text");
    


    axios
      .post("/edit-item", { newData, todoId })
      .then((res) => {
        if (res.data.status !== 200) {
          alert(res.data.message);
          return;
        }

         
        e.target.parentElement.parentElement.querySelector(
          ".item-text"
        ).innerHTML = newData;
      })
      .catch((err) => console.log(err));
    
  } else if (e.target.classList.contains("delete-me")) {
    const todoId = e.target.getAttribute("data_id").trim(); 
    axios
        .post("/delete-todo", { todoId })
        .then((res) => {
          console.log(res);
          e.target.parentElement.parentElement.remove()
        })
        .catch((err) => {
          console.log(err);
        });
  } else if(e.target.classList.contains("add_item")){
    const todo = document.getElementById("create_field").value
    console.log(todo)
    axios
        .post("/create-item", { todo })
        .then((res) => {
          console.log(res);
          document.getElementById("item_list").insertAdjacentHTML(
            "beforeend",
            `
            <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
            <span class="item-text">${res.data.data.todo}</span>
              <div>
                <button data_id =" ${res.data.data._id}" class="edit-me btn btn-primary btn-sm mr-1">Edit</button>
                <button data_id =" ${res.data.data._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
              </div>
              </li>`
              
              
          );
           document.getElementById("create_field").value = ""
        })
         
        
        .catch((err) => {
          console.log(err);
        });
    
  }else if(e.target.classList.contains("logout")) {
    axios
      .post("/logout")
      .then((res) => {
        console.log(res.data.message);
        
        window.location.href = "/login";
      })
      .catch((err) => {
        console.log(err);
      });
  }else if(e.target.classList.contains("logout-all")) {
    axios
      .post("/logout-out-from-all")
      .then((res) => {
        console.log(res.data.message);
        
        window.location.href = "/login";
      })
      .catch((err) => {
        console.log(err);
      });
  }else if(e.target.classList.contains("show-more")){
    gettingTodo()

  }
});