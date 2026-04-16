document.addEventListener("DOMContentLoaded", function () {

let users = []

const navArea = document.getElementById("navArea")
const loginBtnArea = document.getElementById("loginBtnArea")
const content = document.getElementById("content")

const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")

const message = document.getElementById("message")
const regMessage = document.getElementById("regMessage")

// ===== PASSWORD HASH FUNCTION =====
async function hashPassword(password) {

const encoder = new TextEncoder()
const data = encoder.encode(password)

const hashBuffer = await crypto.subtle.digest("SHA-256", data)

const hashArray = Array.from(new Uint8Array(hashBuffer))

const hashHex = hashArray
.map(b => b.toString(16).padStart(2, "0"))
.join("")

return hashHex

}

// ===== LOAD USERS =====
function loadUsers(){

let localUsers = localStorage.getItem("users")

if(localUsers){

users = JSON.parse(localUsers)

}else{

fetch("user.json")
.then(res=>res.json())
.then(data=>{

users = data
localStorage.setItem("users",JSON.stringify(users))

})

}

}

loadUsers()

// ===== AUTO LOGIN =====

let loggedUser = JSON.parse(localStorage.getItem("loggedUser"))

if(loggedUser){

showUser(loggedUser)
content.classList.remove("d-none")

}

// ===== REGISTER =====

registerForm.addEventListener("submit", async function(e){

e.preventDefault()

let name = document.getElementById("regName").value
let email = document.getElementById("regEmail").value
let password = document.getElementById("regPassword").value
let image = document.getElementById("regImage").value

let exist = users.find(u=>u.email===email)

if(exist){

regMessage.innerHTML="<span class='text-danger'>Email already exists</span>"
return

}

// HASH PASSWORD
let hashedPassword = await hashPassword(password)

let newUser = {
name:name,
email:email,
password:hashedPassword,
image:image
}

users.push(newUser)

localStorage.setItem("users",JSON.stringify(users))

// AUTO LOGIN
localStorage.setItem("loggedUser",JSON.stringify(newUser))

showUser(newUser)

content.classList.remove("d-none")

regMessage.innerHTML="<span class='text-success'>Registration Successful</span>"

setTimeout(()=>{

bootstrap.Modal.getInstance(
document.getElementById("registerModal")
).hide()

},700)

registerForm.reset()

})

// ===== LOGIN =====

loginForm.addEventListener("submit", async function(e){

e.preventDefault()

let email = document.getElementById("email").value
let password = document.getElementById("password").value

let hashedPassword = await hashPassword(password)

let found = users.find(
u => u.email === email && u.password === hashedPassword
)

if(found){

localStorage.setItem("loggedUser",JSON.stringify(found))

showUser(found)

content.classList.remove("d-none")

message.innerHTML="<span class='text-success'>Login Successful</span>"

setTimeout(()=>{

bootstrap.Modal.getInstance(
document.getElementById("loginModal")
).hide()

},700)

}else{

message.innerHTML="<span class='text-danger'>Invalid Email or Password</span>"

}

})

// ===== SHOW USER =====

function showUser(user){

document.getElementById("navUserName").innerText = user.name

document.getElementById("navUserImage").src =
user.image || "https://i.pravatar.cc/100"

navArea.classList.remove("d-none")

loginBtnArea.classList.add("d-none")

document.getElementById("logoutBtn")
.addEventListener("click",logout)

}

// ===== LOGOUT =====

function logout(e){

e.preventDefault()

localStorage.removeItem("loggedUser")

location.reload()

}

// ===== DOWNLOAD JSON =====

document.getElementById("downloadUsers")
.addEventListener("click",function(){

let users = JSON.parse(localStorage.getItem("users")) || []

let data = JSON.stringify(users,null,2)

let blob = new Blob([data],{type:"application/json"})

let url = URL.createObjectURL(blob)

let a = document.createElement("a")

a.href = url
a.download = "user.json"

a.click()

URL.revokeObjectURL(url)

})

})

// ===== SUBSCRIPTION =====

const subscribeBtns = document.querySelectorAll(".subscribeBtn")
const planStatus = document.getElementById("planStatus")
const timerText = document.getElementById("timer")

subscribeBtns.forEach(btn => {

btn.addEventListener("click",function(){

let plan = this.dataset.plan

let expireTime = Date.now() + (2 * 60 * 1000) // 2 minute

localStorage.setItem("userPlan",plan)
localStorage.setItem("planExpire",expireTime)

startTimer()

})

})

// ===== TIMER FUNCTION =====

function startTimer(){

let plan = localStorage.getItem("userPlan")
let expire = localStorage.getItem("planExpire")

if(!plan || !expire) return

planStatus.innerHTML = "Active Plan: <b>"+plan+"</b>"

let interval = setInterval(function(){

let remaining = expire - Date.now()

if(remaining <= 0){

clearInterval(interval)

planStatus.innerHTML = "Subscription Expired"
timerText.innerHTML = ""

localStorage.removeItem("userPlan")
localStorage.removeItem("planExpire")

return

}

let minutes = Math.floor(remaining / 60000)
let seconds = Math.floor((remaining % 60000) / 1000)

timerText.innerHTML =
"Time Left: " + minutes + "m " + seconds + "s"

},1000)

}

startTimer()