import BASE_URL from "../../config.js";

const loginFlow = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Required fields are missing");
    return;
  }
  const obj = {
    email,
    password,
  };

   const res = await fetch(`${BASE_URL}/api/login`,  {
        method: "POST",
            headers : {
            "Content-Type" : "application/json"


} ,  body: JSON.stringify(obj)
  });
};
window.loginFlow = loginFlow;
