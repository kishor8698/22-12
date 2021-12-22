$(document).ready(function () {

    $("#post_type").change(function () {
        var name = $(this).val();

        if (name == 'IMAGE') {
            $('#img_gif_video_msg').text('Please Select Image');
        }
        if (name == 'VIDEO') {
            $('#img_gif_video_msg').text('choose Video');
        }
        if (name == 'GIF') {
            $('#img_gif_video_msg').text('Please Select GIF');
        }
    });

});//document end

// $(".like_show").css('display','none')
// $("#unlike_hide").css('display','block')
function heartid(post_id) {
    var post_id = post_id;
    var like_post = true;
    console.log(post_id, like_post);
    $.ajax({
        type: "POST",
        url: "/like",
        data: { "post_id": post_id, "like_post": like_post },
        datatype: "json",
        success: function (response) {
            if (response.status == "unlike") {
                var counttt = $("#like_count" + post_id).text();
                $("#like_count" + post_id).text(parseInt(counttt) + 1)
                $("#unlike_hide" + post_id).css('display', 'none');
                $("#like_show" + post_id).css('display', 'block');
            }
            if (response.status == "like") {
                var counttt = $("#like_count" + post_id).text();
                $("#like_count" + post_id).text(parseInt(counttt) - 1)
                $("#like_show" + post_id).css('display', 'none');
                $("#unlike_hide" + post_id).css('display', 'block');
            }
            if (response.status == "success") {
                var counttt = $("#like_count" + post_id).text();
                $("#like_count" + post_id).text(parseInt(counttt) + 1)
                $("#unlike_hide" + post_id).css('display', 'none');
                $("#like_show" + post_id).css('display', 'block');
            }
            if (response.status == "unauthorized_user") {
                $.notify("Please Login", "info");
            }
        }
    });
}   //end of like and Unlike Logic

function edit_post(id) {

    $.ajax({
        url: "/edit_post",
        type: "POST",
        data: { "id": id },
        datatype: "json",
        success: function (response) {
            // console.log(response);
            var category_type = response.category_type;
            var post_type = response.post_type;
            var commnpath = "http://127.0.0.1:5000/static/all_post/";
            var file_name = response.post_data

            $("#id").val(response.post_id);
            $("#post_title").val(response.post_title);
            $("#post_desc").val(response.post_description);

            $('#post_type').find("option:contains('" + post_type + "')").each(function () {
                if ($(this).text() == post_type) 
                {
                    $(this).attr("selected", "selected");
                }
            });

            $('#category_type').find("option:contains('" + category_type + "')").each(function () {
                if ($(this).text() == category_type) {
                    $(this).attr("selected", "selected");
                }
            });
            // $("#post_view_id").attr('value', file_name);
            
            var img_video_gif=$("#post_src"+response.post_id).attr("src");
            console.log(img_video_gif);
            img_video_gif=img_video_gif.toLowerCase();
        
            if(img_video_gif.endsWith("mp4"))
            {
                $("#img_prev").css('display', 'none');
                $("#video_prev").css('display', 'block');
                $("#video_prev").attr('src',img_video_gif);
               
            }
            else if(img_video_gif.endsWith("jpg") || img_video_gif.endsWith("jpeg") || img_video_gif.endsWith("png") || img_video_gif.endsWith("gif"))
            {
                console.log("this is jpg or etc images")
                $("#video_prev").css('display', 'none');
                $("#img_prev").css('display', 'block');
                $("#img_prev").attr('src',img_video_gif);
              
            }
            // $("#post_view_id").val(file_name);
        }
    });
}//end of edit_post function
function update_post() 
{
    // e.preventDefault();
    var row_data = $('#post_form').serializeArray();

    var form_data = new FormData();
    $.each(row_data, function (key, input) {
        form_data.append(input.name, input.value);
    });
    var x=$("#post_view_id")[0].files[0];
    if(x)
    {
        form_data.append('img_gif_video',x);
        console.log(x,"this is image path");
    }
    console.log(form_data);
    $.ajax({
        type: "POST",
        url: "/update_post",
        data: form_data,
        processData: false,
        contentType: false,
        cache: false,
        success: function (response) 
        {
            console.log(response, '<<<<<<<<<<<<<');
            var commanpath="/static/all_post/";
            var post_id = response.post_id;
            if(response.status=="error")
            {
                $.notify("Please select JPEG,JPG,PNG,MP4,GIF","error");
            }
            if(response.status=="success")
            {
                if(response.post_data)
                {
                    $("#post_src"+post_id).attr('src',commanpath+response.post_data);
                }
                $("#category" + post_id).text(response.category_type_name);
                $("#post_title" + post_id).text(response.post_title);
                $("#post_description" + post_id).text(response.post_desc);
                $.notify("Record Updated Successfully", "success");
                setTimeout(() => {
                    location.reload();
                }, 2000);
            }
        }
    });
}//update_post function end

function delete_post(id) {
    data_id = {}
    data_id['id'] = id;
    bootbox.confirm({
        message: "Are You Sure You Want To Delete Your Data ?",
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-success'
            },
            cancel: {
                label: 'No',
                className: 'btn-danger'
            },
        },
        callback: function (result) {
            console.log(result);
            if (result) {
                console.log(id);
                $.ajax({
                    url: "/delete_post",
                    type: "POST",
                    data: { "id": id },
                    datatype: "json",
                    success: function (response) {
                        console.log(response.status);
                        if (response.status == "done") 
                        {
                            $("#post_del_row" + id).remove();
                            $.notify("Post Deleted Successfully", "info");
                        }
                        // $("#modal_id").val(response.id);
                        // $("#modal_body").val(response.body);
                    }
                });
            }
            else {

            }
        }
    });
} //end of delete post logic

function user_post_total_likes()
{
    console.log("user_total_likes");
        $.ajax({type: "POST",
        url: "/user_post_total_likes",
        processData: false,
        contentType: false,
        cache: false,
        success: function (response) 
        {   
                $("#total_post_likes").text(response.total_likes_counts);
                $("#total_posts").text(response.total_post);
                $("#total_users_name").empty();
                var sr_no=0
                for(var i=0; i<response.username_names.length; i++)
                {
                    sr_no+=1;    
                    $("#total_users_name").append("<tr><td>"+ sr_no + "</td>"+ "<td>"+ response.username_names[i] + "</td></tr>");
                }
        }
    });
}
function SubmitComment(id)
{
        console.log(id);
        var row_data = $('#comment_form'+id).serializeArray();
        var form_data = new FormData();
        $.each(row_data, function (key, input) {
            form_data.append(input.name, input.value);
        });
        form_data.append("post_id",id)
        console.log(form_data,id);
        var comman_path="static/user_profile_images/";
        $.ajax({
        type: "POST",
        url: "/parent_comment",
        data: form_data,
        processData: false,
        contentType: false,
        cache: false,
        success: function (response) 
        {   
            if(response.status == "success")
            {
                console.log(response.status);
                $("#comment_successfully_submited").text("Comment was successfully sent");
                if(response.user_image !='' )
                {
                    $("#com-area"+id).val("");
                    $("#parent_comment"+id).prepend("<li id='delete_parent_comment"+response.parent_replay_id+"'>"+"<div>"+"<img src='static/images/green_blink.gif' height='15px;' width='10px;'>"+"<img class='avatar-xs img-fluid rounded-circle' src='"+comman_path+response.user_image+"'>"+"<strong>"+response.user_name+" "+"</strong>"+response.comment_text+" "+"<button type='button' class='btn btn-link' id='replay_btn'" +"onclick='replay_btn(\""+response.parent_replay_id+"\");'>Replay</button>"+'<button type="button" class="btn btn-link" id="replay_btn" style="color:red;"'+'onclick="delete_parent_comment(\''+response.parent_replay_id+'\');">Delete</button>'+'<form class="reply_form" method="POST" id="reply_form'+response.parent_replay_id+'" style="display:none;">'+
                    '<textarea name="child_comment_text"  id="child_comment_textarea'+response.parent_replay_id+'" class="form-control mb-3" rows="3" spellcheck="false" data-ms-editor="true" data-gramm="false" wt-ignore-input="true" data-quillbot-element="dO2SHQmmAIhUqYBw7Zfm0"></textarea>'+
                    '<input type="hidden" value="'+id+'" name="post_id">'+
                    '<button class="btn btn-primary btn-sm me-2" type="button"'+ 'onclick="ReplySend(\''+response.parent_replay_id+'\');">Replay</button>'+
                    '<button class="btn btn-secondary btn-sm" type="button"'+'onclick="RemoveBox(\''+response.parent_replay_id+'\');">Cancel</button>'+'</form>'+'</div>'+'<ul id="child_comment'+response.parent_replay_id+'">'+'</ul>'+'</li>'+'<hr>');    
                    //$("#parent_comment"+id).prepend("<li>"+"<div>"+"<img src='static/images/green_blink.gif' height='15px;' width='10px;'>"+"<img class='avatar-xs img-fluid rounded-circle' src='"+comman_path+response.user_image+"'>"+"<strong>"+response.user_name+"</strong>"+response.comment_text+" "+"<a id='xyzz' href='"+id+"'>"+"replay"+"</a>"+"</div>"+"</li>"+"<hr>");
                   // $("#parent_comment"+id).prepend("<li>"+"<div>"+"<img src='static/images/green_blink.gif' height='15px;' width='10px;'>"+"<img class='avatar-xs img-fluid rounded-circle' src='"+comman_path+response.user_image+"'>"+"<strong>"+response.user_name+"</strong>"+response.comment_text+" "+"<button type='button' class='btn btn-link' id='replay_btn' onclick='replay_btn('"+id+"');">+"Replay"+"</button>"+"</div>"+"</li>"+"<hr>");
                }
                else
                {
                    // $("#parent_comment"+id).prepend("<li>"+"<div>"+"<img src='static/images/green_blink.gif' height='15px;' width='10px;'>"+"<img class='avatar-xs img-fluid rounded-circle' src='"+comman_path+"default.png"+"'>"+"<strong>"+response.user_name+"</strong>"+response.comment_text+" "+"<a id='xyzz' href='"+id+"'>"+"replay"+"</a>"+"</div>"+"</li>"+"<hr>");
                    $("#com-area"+id).val("");
                      
                    $("#parent_comment"+id).prepend("<li id='delete_parent_comment"+response.parent_replay_id+"'>"+"<div>"+"<img src='static/images/green_blink.gif' height='15px;' width='10px;'>"+"<img class='avatar-xs img-fluid rounded-circle' src='"+comman_path+"default.png"+"'>"+"<strong>"+response.user_name+" "+"</strong>"+response.comment_text+" "+"<button type='button' class='btn btn-link' id='replay_btn'" +"onclick='replay_btn(\""+response.parent_replay_id+"\");'>Replay</button>"+'<button type="button" class="btn btn-link" id="replay_btn" style="color:red;"'+'onclick="delete_parent_comment(\''+response.parent_replay_id+'\');">Delete</button>'+'<form class="reply_form" method="POST" id="reply_form'+response.parent_replay_id+'" style="display:none;">'+
                    '<textarea name="child_comment_text"  id="child_comment_textarea'+response.parent_replay_id+'" class="form-control mb-3" rows="3" spellcheck="false" data-ms-editor="true" data-gramm="false" wt-ignore-input="true" data-quillbot-element="dO2SHQmmAIhUqYBw7Zfm0"></textarea>'+
                    '<input type="hidden" value="'+id+'" name="post_id">'+
                    '<button class="btn btn-primary btn-sm me-2" type="button"'+ 'onclick="ReplySend(\''+response.parent_replay_id+'\');">Replay</button>'+
                    '<button class="btn btn-secondary btn-sm" type="button"'+'onclick="RemoveBox(\''+response.parent_replay_id+'\');">Cancel</button>'+'</form>'+'</div>'+'<ul id="child_comment'+response.parent_replay_id+'">'+'</ul>'+'</li>'+'<hr>');
                }
                
                // setTimeout(() => {
                //     location.reload();
                // }, 2000);
            }
            if(response.status=="error")
            {
                console.log(response.status);
                $.notify("It is not possible to allow an empty comment.", "info");
            }

        }

    });
}
function replay_btn(id)
{
    console.log(id,"call replay_btn function with id");
    $("#reply_form"+id).css("display","block");
}
function RemoveBox(id)
{
    $("#reply_form"+id).css("display","none");
}
function grant_replay_btn(id)
{
    console.log(id,"call grant_replay_btn function with id");
    $("#reply_form"+id).css("display","block");
}
function grant_RemoveBox(id)
{
    $("#reply_form"+id).css("display","none");
}

function ReplySend(parent_replay_id)
{
    var row_data = $('#reply_form'+parent_replay_id).serializeArray();
    var form_data = new FormData();
    $.each(row_data, function (key, input)
    {
        form_data.append(input.name, input.value);
    });
    form_data.append("parent_replay_id",parent_replay_id);
    var comman_path="static/user_profile_images/";
    $.ajax({
    type: "POST",
    url: "/child_comment",
    data: form_data,
    processData: false,
    contentType: false,
    cache: false,
    success: function (response) 
        {
            if(response.status=="success")
            {           
                console.log(response.status,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>replay");
                $("#reply_form"+parent_replay_id).css("display","none");
                $("#child_comment_textarea"+parent_replay_id).val("");
                if(response.user_image !='')
                {
                    // $("#child_comment"+parent_replay_id).prepend("<li>"+"<img src='static/images/green_blink.gif' height='15px;' width='10px;'>"+"<img class='avatar-xs img-fluid rounded-circle' src='"+comman_path+response.user_image+"'>"+" "+"<strong>"+response.user_name+"</strong>"+response.comment_text+"</li>");
                    $("#child_comment"+parent_replay_id).prepend("<li id='delete_child_comment"+response.parent_replay_id+"'>"+"<img src='static/images/green_blink.gif' height='15px;' width='10px;'>"+"<img class='avatar-xs img-fluid rounded-circle' src='"+comman_path+response.user_image+"'>"+"<strong>"+response.user_name+" "+"</strong>"+response.comment_text+"<button type='button' class='btn btn-link' id='grant_replay_btn'" +"onclick='replay_btn(\""+response.parent_replay_id+"\");'>Replay</button>"+'<button type="button" class="btn btn-link" id="replay_btn" style="color:red;"'+'onclick="delete_child_comment(\''+response.parent_replay_id+'\');">Delete</button>'+'<form class="reply_form" method="POST" id="reply_form'+response.parent_replay_id+'" style="display:none;">'+
                    '<textarea name="child_comment_text"  id="child_comment_textarea'+response.parent_replay_id+'" class="form-control mb-3" rows="3" spellcheck="false" data-ms-editor="true" data-gramm="false" wt-ignore-input="true" data-quillbot-element="dO2SHQmmAIhUqYBw7Zfm0"></textarea>'+
                    '<input type="hidden" value="'+response.post_id+'" name="post_id">'+
                    '<button class="btn btn-primary btn-sm me-2" type="button"'+ 'onclick="grant_ReplySend(\''+response.parent_replay_id+'\');">Replay</button>'+
                    '<button class="btn btn-secondary btn-sm" type="button"'+'onclick="grant_RemoveBox(\''+response.parent_replay_id+'\');">Cancel</button>'+'</form>'+'<ul id="grant_child_comment'+response.parent_replay_id+'">'+'</ul>'+'<hr>'+'</li>');
                }
                else
                {
                    $("#child_comment"+parent_replay_id).prepend("<li id='delete_child_comment"+response.parent_replay_id+"'>"+"<img src='static/images/green_blink.gif' height='15px;' width='10px;'>"+"<img class='avatar-xs img-fluid rounded-circle' src='"+comman_path+"default.png"+"'>"+"<strong>"+response.user_name+" "+"</strong>"+response.comment_text+"<button type='button' class='btn btn-link' id='grant_replay_btn'" +"onclick='replay_btn(\""+response.parent_replay_id+"\");'>Replay</button>"+'<button type="button" class="btn btn-link" id="replay_btn" style="color:red;"'+'onclick="delete_child_comment(\''+response.parent_replay_id+'\');">Delete</button>'+'<form class="reply_form" method="POST" id="reply_form'+response.parent_replay_id+'" style="display:none;">'+
                    '<textarea name="child_comment_text"  id="child_comment_textarea'+response.parent_replay_id+'" class="form-control mb-3" rows="3" spellcheck="false" data-ms-editor="true" data-gramm="false" wt-ignore-input="true" data-quillbot-element="dO2SHQmmAIhUqYBw7Zfm0"></textarea>'+
                    '<input type="hidden" value="'+id+'" name="post_id">'+
                    '<button class="btn btn-primary btn-sm me-2" type="button"'+ 'onclick="grant_ReplySend(\''+response.parent_replay_id+'\');">Replay</button>'+
                    '<button class="btn btn-secondary btn-sm" type="button"'+'onclick="grant_RemoveBox(\''+response.parent_replay_id+'\');">Cancel</button>'+'</form>'+'<ul id="grant_child_comment'+response.parent_replay_id+'">'+'</ul>'+'<hr>'+'</li>');
                }
            }
            if(response.status=="error")
            {
                $("#reply_form"+parent_replay_id).css("display","none");
                $.notify("It is not possible to allow an empty comment.", "info");
            }
        }
    });
}
function grant_ReplySend(parent_replay_id)
{
    var row_data = $('#reply_form'+parent_replay_id).serializeArray();
    var form_data = new FormData();
    $.each(row_data, function (key, input)
    {
        form_data.append(input.name, input.value);
    });
    form_data.append("parent_replay_id",parent_replay_id);
    var comman_path="static/user_profile_images/";
    $.ajax({
    type: "POST",
    url: "/grant_child_comment",
    data: form_data,
    processData: false,
    contentType: false,
    cache: false,
    success: function (response) 
        {
             console.log(response.status);   
            if(response.status=="success")
            {           
                console.log(response.status,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>replay");
                $("#reply_form"+parent_replay_id).css("display","none");
                $("#child_comment_textarea"+parent_replay_id).val("");
                if(response.user_image !='')
                {
                    $("#grant_child_comment"+parent_replay_id).prepend("<li>"+"<img src='static/images/green_blink.gif' height='15px;' width='10px;'>"+"<img class='avatar-xs img-fluid rounded-circle' src='"+comman_path+response.user_image+"'>"+"<strong>"+response.user_name+" "+"</strong>"+response.comment_text+"</li>");
                }
                else
                {
                    $("#grant_child_comment"+parent_replay_id).prepend("<li>"+"<img src='static/images/green_blink.gif' height='15px;' width='10px;'>"+"<img class='avatar-xs img-fluid rounded-circle' src='"+comman_path+"default.png"+"'>"+"<strong>"+response.user_name+" "+"</strong>"+response.comment_text+"</li>");
                }
            }
            if(response.status=="error")
            {
                $("#reply_form"+parent_replay_id).css("display","none");
                $.notify("It is not possible to allow an empty comment.", "info");
            }
        }
    });
}

function delete_parent_comment(parent_comment_id)
{
    console.log("before response",parent_comment_id)
    // $.ajax
    // ({  
    //     type: "POST",
    //     url:"/delete_parent_comment",
    //     data:{"parent_comment_id":parent_comment_id},
    //     success: function (response)
    //     {
    //         console.log("After response");
    //         $("#delete_parent_comment"+parent_comment_id).remove();
    //         $.notify("Comment Deleted Successfully", "success");
    //     }

    // });
    //////////////////////////////////////////////////////////////////////////////////////
    bootbox.confirm({
        message: "Are You Sure You Want To Delete Your Comment ?",
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-success'
            },
            cancel: {
                label: 'No',
                className: 'btn-danger'
            },
        },
        callback: function (result) {
            console.log(result);
            if (result) {
            $.ajax
                ({  
                    type: "POST",
                    url:"/delete_parent_comment",
                    data:{"parent_comment_id":parent_comment_id},
                    success: function (response)
                    {
                        console.log("After response");
                        $("#delete_parent_comment"+parent_comment_id).remove();
                        $.notify("Comment Deleted Successfully", "success");
                    }

                });
            }
            else {

            }
        }
    });
}
///////child comment delete Logic
function delete_child_comment(child_comment_id)
{
    console.log("before response",child_comment_id)
    // $.ajax
    // ({  
    //     type: "POST",
    //     url:"/delete_parent_comment",
    //     data:{"parent_comment_id":parent_comment_id},
    //     success: function (response)
    //     {
    //         console.log("After response");
    //         $("#delete_parent_comment"+parent_comment_id).remove();
    //         $.notify("Comment Deleted Successfully", "success");
    //     }

    // });
    //////////////////////////////////////////////////////////////////////////////////////
    bootbox.confirm({
        message: "Are You Sure You Want To Delete Your Comment ?",
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-success'
            },
            cancel: {
                label: 'No',
                className: 'btn-danger'
            },
        },
        callback: function (result) {
            console.log(result);
            if (result) {
            $.ajax
                ({  
                    type: "POST",
                    url:"/delete_child_comment",
                    data:{"child_comment_id":child_comment_id},
                    success: function (response)
                    {
                        console.log("After response");
                        $("#delete_child_comment"+child_comment_id).remove();
                        $.notify("Comment Deleted Successfully", "success");
                    }

                });
            }
            else {


            }
        }
    });
}

