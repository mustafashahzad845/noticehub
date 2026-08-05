import BASE_URL from "../../config.js"
const signupFlow = async () => {
    const fullName = document.getElementById("fullName").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const password2 = document.getElementById("password2").value

    if (!fullName || !email || !password || !password2) {
        alert("Required fields are empty")
        return
    }

    if (password !== password2) {
        alert("Password not match")
        return
    } else if (password.length < 6) {
        alert("Password must be atleast 6 charachters")
        return
    }

    const obj = {
        fullName,
        email,
        password
    }

    console.log(obj);


    const res = await fetch(`${BASE_URL}/api/signup`,  {
        method: "POST",
            headers : {
            "Content-Type" : "application/json"


} ,  body: JSON.stringify(obj)



    
    })
.then(res=>res.json())

    if(!res.status){
alert(res.message)
return
    }

console.log(res , "response");
console.log(status , "status");


alert(res.message)
location.replace("../../pages/auth/login.html")

}


window.signupFlow = signupFlow