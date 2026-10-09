const cl=console.log;

const todoForm = document.getElementById('todoForm')
const todoInput = document.getElementById('todoInput')
const todoContainer = document.getElementById('todoContainer')
const spinner = document.getElementById('spinner')
const addtodoBtn = document.getElementById('addtodoBtn')
const updatetodoBtn = document.getElementById('updatetodoBtn')
const isCompleted = document.getElementById('isCompleted')
const description = document.getElementById('description')
const todoHeading = document.getElementById('todoHeading')

const BASE_URL = `https://crud-6b7ce-default-rtdb.firebaseio.com`
const TODO_URL = `${BASE_URL}/todos.json`;

const state = {
    todoArr: [],
    editId:null,
}

function objToArr(obj){
//    let arr = Object.entries(obj)
//   let arr1 = arr.map(ele=>{
//     return ({...ele[1], id:ele[0]})
//    })
   state.todoArr = Object.entries(obj).map(ele=>{
    return ({...ele[1],id : ele[0]})
   })
}

function showSpinner(){
    spinner.classList.remove('d-none')
}
function hideSpinner(){
    spinner.classList.add('d-none')
}

function snackbar(msg,icon){
    Swal .fire({
        title:msg,
        icon:icon,
        timer:3000
    })
}

//read

async function fetchtodo(){
    try{
        showSpinner()
        let res = await fetch(TODO_URL,{
            method:"GET",
            body:null,
            headers:{
                "Content-type":"application/json",
                "Authorization":"TOKEN JWT form LS",
            }
        })
        let data = await res.json();
        cl(data)
        objToArr(data)
        oncreatetodoList(state.todoArr)

    }catch(err){
        snackbar(err,'error')
    }finally{
        hideSpinner()
    }
}

function oncreatetodoList(arr){
    let result = ``;
    arr.forEach((ele)=>{
        result +=`<li class="list-group-item d-flex justify-content-between align-items-center" id="${ele.id}">
                    <div>
                    <input type="checkbox" onclick="onTodoCompletedChange(this)"
                        ${ele.isCompleted ? 'checked' : ''}>
                    <strong>${ele.todoItem}</strong>
                </div>

                <div>
                    <i onclick="editTodo(this)"
                       class="fa-solid fa-pen-to-square"
                       role="button"></i>

                    <i onclick="deleteTodo(this)"
                       class="fa-solid fa-trash"
                       role="button"></i>
                </div>
            </li>`;

    });
    todoContainer.innerHTML = result;
}
fetchtodo()

//create

async function onTodoAdd(eve){
    eve.preventDefault()
    try{
        let todoObj={
            todoItem : todoInput.value,
            isCompleted : (isCompleted.value === 'yes'),
            createdAt:Date.now()
        }
        showSpinner()
        let res = await fetch(TODO_URL,{
            method: "POST",
            body:JSON.stringify(todoObj),
            headers:{
                "content-type":"application/json",
                "Authorization":"TOKEN JWT...."
            }
        })
        if(!res.ok){
            throw new Error("ERROR:" + res.status)
        }
        let data = await res.json()
        //cl(data)
        todoForm.reset()
        // todoObj.id = data.name;
        todoObj = {...todoObj, id: data.name}//reference change
        state.todoArr.unshift(todoObj);
        let li = document.createElement('li')
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.id = todoObj.id;
        li.innerHTML = `<div>
                            <input type="checkbox" onclick="onTodoCompletedChange(this)"
                        ${todoObj.isCompleted ? 'checked' : ''}>
                        <strong>${todoObj.todoItem}</strong>
                        </div>
                        <div>
                        <i onclick="editTodo(this)" class="fa-solid fa-pen-to-square text-info" role="button"></i>
                        <i onclick="deleteTodo(this)" class="fa-solid fa-trash text-danger" role="button"></i>
                        </div>`

            todoContainer.prepend(li)

    }catch(err){
        snackbar(err, 'error')
    }finally{
        hideSpinner()
    }
}

//delete

async function deleteTodo(ele){
    let remove_Id = ele.closest('li').id;
    let result = await Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
})
if(result.isConfirmed){
try{
    let REMOVE_URL = `${BASE_URL}/todos/${remove_Id}.json`
    showSpinner()
    let res = await fetch(REMOVE_URL,{
        method:"DELETE",
        body:null,
        headers:{
            "Content-type":"application/json",
            "Authorization":"TOKEN JWT...."
        }
    })
    let data = await res.json()
    cl(data)
    let getIndex = state.todoArr.findIndex(i=>i.id === remove_Id)
    state.todoArr.splice(getIndex, 1)
    ele.closest('li').remove()
}catch(err){
    snackbar(err, 'error')
}finally{
    hideSpinner()
}
}
}

//edit
async function editTodo(ele){
    let editId = ele.closest('li').id;
    state.editId = editId;
    let editObj = state.todoArr.find(d=>d.id === editId)
    todoInput.value = editObj.todoItem;
    isCompleted.value = editObj.isCompleted ? 'yes' : 'no',
    addtodoBtn.classList.add('d-none')
    updatetodoBtn.classList.remove('d-none')
    let textNode = document.createTextNode('Update Todo')
    todoHeading.innerText = ''
    todoHeading.append(textNode)
}

//update

async function updateTodo(){
    try{
        showSpinner()
        let updateId = state.editId;
        let updateObj={
            todoItem:todoInput.value.trim(),
            isCompleted:isCompleted.value === 'yes' ? true : false,
            id:updateId
        }
        let UPDATE_URL = `${BASE_URL}/todos/${updateId}.json`;
        showSpinner()
        let res = await fetch(UPDATE_URL,{
            method:"PATCH",
            body:JSON.stringify(updateObj),
            headers:{
                "content-type":"application/json",
                "Authorization":"TOKEN JWT"
            }
        })
        if(!res.ok){
            throw new Error('ERROR:')
        }
        let data = await res.json()
        cl(data)
        todoForm.reset()
        state.editId = null;
        todoHeading.innerText = 'Add Todo'
        let getIndex = state.todoArr.findIndex(y=>y.id === updateId)
        state.todoArr[getIndex]=updateObj;
        let li = document.getElementById(updateId)
        li.innerHTML = `<div>
                            <input type="checkbox" onclick="onTodoCompletedChange(this)"
                        ${updateObj.isCompleted ? 'checked' : ''}>
                        <strong>${updateObj.todoItem}</strong>
                        </div>
                        <div>
                        <i onclick="editTodo(this)" class="fa-solid fa-pen-to-square text-info" role="button"></i>
                        <i onclick="deleteTodo(this)" class="fa-solid fa-trash text-danger" role="button"></i>
                        </div>`
        addtodoBtn.classList.remove('d-none')
        updatetodoBtn.classList.add('d-none')
        todoHeading.innerText = 'Add Todo'
    }catch(err){
        snackbar(err,'error')
    }finally{
        hideSpinner()
    }
}

async function onTodoCompletedChange(ele){
    try{
        let updateObj =  {isCompleted : ele.checked};
        let UPDATE_URL = `${BASE_URL}/todos/${updateId}.json`;
        let res = await fetch(UPDATE_URL,{
            method:"PATCH",
            body:JSON.stringify(updateObj)
        })
        if(!res.ok){
            throw new Error("Error...")
        }
        let data = await res.json()
        cl(data)
        let getIndex = state.todoArr.findIndex(r=>r.id === updateId)
        state.todoArr[getIndex].isCompleted = ele.checked;
    }catch(err){
        snackbar(err,'error')
    }finally{
        hideSpinner()
    }
}
todoForm.addEventListener('submit', onTodoAdd)
updatetodoBtn.addEventListener('click', updateTodo)