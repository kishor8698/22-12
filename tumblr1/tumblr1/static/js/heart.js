function ClickHeart(heart) {
  let heartID = heart.id.substr(5);
  let url = DataLink + "/" + heartID + "/click";
  let token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  let heartCount = document.getElementById("likeCount"+heartID);

  
  if(heart.classList.contains("heartliked")) {
    heart.classList.remove("heartliked");
  } else {
    heart.classList.toggle("heartAnimation");
  }
  fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text-plain, */*",
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRF-TOKEN": token
    },
    body: JSON.stringify({
      id: heartID
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    heartCount.innerHTML =  data;
  })
  .catch((error) => {
    console.error('Error:', error);
  });    
}