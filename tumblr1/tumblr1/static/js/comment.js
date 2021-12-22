// Comment submit Function //
function SubmitComment() {
    event.preventDefault();
    let commentForm = document.getElementById('comment_form');
    let url = commentForm.action;
    let formData = new FormData(commentForm);
    let token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    let comBtn = document.getElementById("postcomment");
    let successMsg = document.getElementById('show-com-msg');
    let comCountDiv = document.getElementById('comcount');
    let comCount = comCountDiv.innerHTML;
    let comArea = document.getElementById('com-area');
    let parentDiv = document.getElementById('dynamic_com');
    let orgBtn = comBtn.innerHTML;
        comBtn.disabled = true;
        comBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ' + processing;
                 
    fetch(url, {
      method: 'POST',
      headers: {
        "X-CSRF-TOKEN": token
      },
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
        		comBtn.innerHTML = orgBtn;
                comBtn.disabled = false;
                successMsg.innerHTML = "";
                comArea.value = "";
                successMsg.classList.remove('d-none');
                successMsg.innerHTML += '<span class="align-self-center"><small>'+ successCom +'</small></span>';
                var divTop = document.createElement('div');
                divTop.className = 'maincom';
                var divCom = document.createElement('div');
                divCom.className = 'd-flex pt-3';
                divCom.innerHTML = '<img class="flex-shrink-0 me-3 avatar img-fluid rounded-circle" src="'+ data.avatar +'"><p class="pb-3 mb-0 small lh-sm border-bottom w-100"><input type="hidden" class="comment_id own_id" value="'+ data.comid +'" /><span class="d-block mb-2"><strong class="text-gray-800"><a href="'+ siteURL +'/profile/'+ data.username +'">'+ data.user +'</a></strong> <span class="usrname text-muted">@'+ data.username +' </span><span class="badge bg-info text-dark time">'+ now +'</span></span><span class="combody">'+ data.success +'</span><span class="d-block mt-2"><a class="link-secondary me-3" onclick="ReplyComment(this)" href="#">'+ MsgReply +'</a><a class="link-secondary me-3" onclick="EditComment(this)" href="#">'+ MsgEdit +'</a><a onclick="DeleteComment(this)" class="link-secondary" href="#">'+ MsgDelete +'</a></span> <span class="d-block mt-2 editcomment d-none"> </span> </p>';
                divTop.appendChild(divCom);
                parentDiv.insertBefore(divTop, parentDiv.firstChild);
                comCountDiv.innerHTML = ++comCount;
            } else {
                comBtn.innerHTML = orgBtn;
                comBtn.disabled = false;
                successMsg.innerHTML = "";
                successMsg.classList.remove('d-none');
                successMsg.innerHTML += '<span class="align-self-center text-danger"><small>'+ data.error +'</small></span>';
    }})
    .catch(error => {
        console.error('Error:', error);
        comBtn.innerHTML = orgBtn;
        comBtn.disabled = false;
    });
}

function RemoveBox(input) {
    event.preventDefault();
    let ownDiv = input.closest(".pb-3");
    let EditComment = ownDiv.querySelector(".editcomment");
    EditComment.innerHTML = '';
    EditComment.classList.add('d-none');
}

function EditComment(input) {
    event.preventDefault();
	let ownDiv = input.closest(".pb-3");
	let EditComment = ownDiv.querySelector(".editcomment");
    let getTxt = ownDiv.querySelector(".combody").innerText;
	EditComment.innerHTML = '<textarea name="body" class="form-control mb-3" rows="3">'+ getTxt +'</textarea><div class="form-text pb-2 d-none text-danger"></div><button class="btn btn-success btn-sm me-2" type="button" onclick="UpdateComment(this)">'+ MsgEdit +'</button> <button class="btn btn-secondary btn-sm" type="button" onclick="RemoveBox(this)">'+ MsgCancel +'</button>';
    EditComment.classList.remove('d-none');
}

function ReplyComment(input) {
    event.preventDefault();
    let ownDiv = input.closest(".pb-3");
    let ReplyComment = ownDiv.querySelector(".editcomment");
    let parendID = ownDiv.querySelector(".comment_id").value;
    let getUser = ownDiv.querySelector(".usrname").innerHTML;
    ReplyComment.innerHTML = '<form class="reply_form" method="POST" action="'+ siteURL +'/comments"><input type="hidden" name="post_id" value="'+ postID +'" /><input type="hidden" name="parent_id" value="'+ parendID +'" /><textarea name="body" class="form-control mb-3" rows="3">'+ getUser +' </textarea><div class="form-text pb-2 d-none text-danger"></div><button class="btn btn-primary btn-sm me-2" type="button" onclick="ReplySend(this)">'+ MsgReply +'</button> <button class="btn btn-secondary btn-sm" type="button" onclick="RemoveBox(this)">'+ MsgCancel +'</button></form>';
    ReplyComment.classList.remove('d-none');
}

// Comment reply Function //
function ReplySend(input) {
    event.preventDefault();
    let ownDiv = input.closest(".editcomment");
    let mainDiv = ownDiv.closest(".pt-3");                    
    let parendID = mainDiv.querySelector(".comment_id").value;
    let replyForm = ownDiv.querySelector(".reply_form");
    let errMsg = ownDiv.querySelector(".form-text");
    let url = replyForm.action;
    let comCountDiv = document.getElementById('comcount');
    let comCount = comCountDiv.innerHTML;
    let formData = new FormData(replyForm);
    let token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');       
    let comBtn = ownDiv.querySelector(".btn-primary");
    let orgBtn = comBtn.innerHTML;
    comBtn.disabled = true;
    comBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ' + processing;
    fetch(url, {
      method: 'POST',
      headers: {
        "X-CSRF-TOKEN": token
      },
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            comBtn.innerHTML = orgBtn;
            comBtn.disabled = false;
            ownDiv.classList.add('d-none');
            var divCom = document.createElement('div');
            divCom.className = 'd-flex pt-3 ps-5';
            divCom.innerHTML = '<img class="flex-shrink-0 me-3 avatar-sm img-fluid rounded-circle" src="'+ data.avatar +'"><p class="pb-3 mb-0 small lh-sm border-bottom w-100"><input type="hidden" class="comment_id" value="'+ parendID +'" /><input type="hidden" class="own_id" value="'+ data.comid +'" /><span class="d-block mb-2"><strong class="text-gray-800"><a href="'+ siteURL +'/profile/'+ data.username +'">'+ data.user +'</a></strong> <span class="usrname text-muted">@'+ data.username +' </span><span class="badge bg-info text-dark time">'+ now +'</span></span><span class="combody">'+ data.success +'</span><span class="d-block mt-2"><a class="link-secondary me-3" onclick="ReplyComment(this)" href="#">'+ MsgReply +'</a><a class="link-secondary me-3" onclick="EditComment(this)" href="#">'+ MsgEdit +'</a><a onclick="DeleteComment(this)" class="link-secondary" href="#">'+ MsgDelete +'</a></span> <span class="d-block mt-2 editcomment d-none"> </span> </p>';
            mainDiv.after(divCom);
            comCountDiv.innerHTML = ++comCount;
        } else {
            comBtn.innerHTML = orgBtn;
            comBtn.disabled = false;
            errMsg.innerHTML = "";
            errMsg.classList.remove('d-none');
            errMsg.innerHTML += data.error;
    }})
    .catch(error => {
        console.error('Error:', error);
        comBtn.innerHTML = orgBtn;
        comBtn.disabled = false;
    });
}

// Update Comment Function //
function UpdateComment(input) {
    event.preventDefault();
    let ownDiv = input.closest(".editcomment");
    let mainDiv = ownDiv.closest(".pt-3");                    
    let ownID = mainDiv.querySelector(".own_id").value;
    let errMsg = ownDiv.querySelector(".form-text");
    let comBody = mainDiv.querySelector(".combody");
    let comnewBody = ownDiv.querySelector(".form-control");
    let token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');       
    let comBtn = ownDiv.querySelector(".btn-success");
    let orgBtn = comBtn.innerHTML;
    comBtn.disabled = true;
    comBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ' + processing;
    
    fetch(siteURL +'/comments/'+ ownID, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text-plain, */*",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": token
          },
          body: JSON.stringify({
                id : ownID,
                body: comnewBody.value
            }),
        })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            comBtn.innerHTML = orgBtn;
            comBtn.disabled = false;
            ownDiv.classList.add('d-none');
            comBody.innerHTML = data.success;
        } else {
            comBtn.innerHTML = orgBtn;
            comBtn.disabled = false;
            errMsg.innerHTML = "";
            errMsg.classList.remove('d-none');
            errMsg.innerHTML += data.error;
    }})
    .catch(error => {
        console.error('Error:', error);
        comBtn.innerHTML = orgBtn;
        comBtn.disabled = false;
    });
}

function DeleteComment(input) {
    event.preventDefault();
    let ownDiv = input.closest(".pb-3");
    let EditComment = ownDiv.querySelector(".editcomment");
    let getTxt = ownDiv.querySelector(".combody").innerHTML;
    EditComment.innerHTML = '<span class="fw-bolder me-3">'+ MsgSure +'</span><a class="me-3" onclick="DeleteCommentRequest(this)" href="#">'+ MsgDelete +'</a> <a class="me-3" href="#" onclick="RemoveBox(this)">'+ MsgCancel +'</a>';
    EditComment.classList.remove('d-none');
}

// Delete Comment From Database Function //
function DeleteCommentRequest(input) {
    event.preventDefault();
    let ownDiv = input.closest(".editcomment");
    let checkDiv = ownDiv.closest(".pt-3");
    if (checkDiv.classList.contains('ps-5')) {
        var mainDiv = ownDiv.closest(".pt-3");
    } else {
        var mainDiv = ownDiv.closest(".maincom");
    }
    let comCountDiv = document.getElementById('comcount');
    let comCount = comCountDiv.innerHTML;
    let ownID = mainDiv.querySelector(".own_id").value;
    let token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
    fetch(siteURL +'/comments/'+ ownID, {
          method: 'DELETE',
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text-plain, */*",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": token
          },
          body: JSON.stringify({
                id : ownID
            }),
        })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            mainDiv.remove();
            comCountDiv.innerHTML = --comCount;
        }})
    .catch(error => {
        console.error('Error:', error);
    });
}

