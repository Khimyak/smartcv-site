
document.getElementById("send-resume-btn").addEventListener("click", async function () {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const category = document.getElementById("category").value;
  const details = document.getElementById("details").value;
  const recommend = document.getElementById("recommend").checked;

  if (!name || !email || !category || !details) {
    alert("Please fill all fields first.");
    return;
  }

  const payload = {
    name,
    email,
    category,
    details,
    recommend
  };

  const res = await fetch("https://hook.us1.make.com/y4cbgq3nh99gw0vxzy3eqckbqrcxz09a", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    alert("Резюме надіслано на вашу пошту!");
  } else {
    alert("Помилка при надсиланні. Спробуйте пізніше.");
  }
});
