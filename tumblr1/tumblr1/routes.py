from os import _exit
import re
from flask import render_template,Response
from sqlalchemy.sql.expression import asc
from tumblr1 import app,db,login_manager
from tumblr1.models import User,Post,Comment,Like,POST_TYPE,Category
from tumblr1 import admin
from flask_login import login_user,logout_user,current_user,login_required
from flask import Flask, render_template, redirect, request, session,make_response, flash,jsonify
# from passlib.hash import sha256_crypt
# from passlib.hash import sha256_crypt
from passlib.hash import sha256_crypt
import werkzeug
from werkzeug.utils import secure_filename
import os
from sqlalchemy import or_
from datetime import datetime

# @login_manager.unauthorized_handler #if user not login the you shoud be use this method and flash message
# def unauthorized():
#     # do stuff
#     return redirect("/")

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif','mp4'])
def allowed_file(filename):
    	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# @app.route('/')
@app.route('/')
def home_page():
    # result=User.query.all()
    # print(result)
    data=Post.query.all()
    # if i.post_likes==True
    # q=Like.query.filter((Like.post_id==1) & (Like.like_post==True)).first()
    # print(q)
    
    # tlike=db.session.query(Like).filter(Like.like_post==True).count()
    # data=db.session.query(User,Post).filter(User.id==Post.user_id).all()
    return render_template('index.html',data=data,POST_TYPE=POST_TYPE)#,result=result)
    # return 'done'

@app.route("/login",methods=['GET','POST'])
def login():
    if request.method == 'POST':
        username1 = request.form.get('username')
        password = request.form.get('password')
        q = User.query.filter_by(username=username1).first()
        try:
            encrypt_password=q.password
            print(encrypt_password)
            if q.username == username1 and sha256_crypt.verify(password,encrypt_password):
                login_user(q)
                return redirect('/home')
        except:
            flash(f"Invalid Username {username1} and ******** Password","info")
            return redirect('/login')
            

    if current_user.is_authenticated:
        return redirect('/')
    else:           
        return render_template('users/login.html')

@app.route("/logout",methods=['GET','POST'])
def log_out():
    logout_user()
    return redirect('/')

@app.route('/profile',methods=['GET','POST'])
@login_required
def user_profile():
    categories=Category.query.all()  
    data=Post.query.filter(Post.user_id==current_user.id).all()
    return render_template('users/profile.html',data=data,POST_TYPE=POST_TYPE,categories=categories)

@app.route('/individual_user_profile/<int:id>',methods=['GET','POST'])
def individual_user_profile(id):
    data=Post.query.filter(Post.user_id==id).all()
    user_details=User.query.get(id)
    return render_template('users/individual_user_profile.html',data=data,POST_TYPE=POST_TYPE,user_details=user_details)

@app.route("/delete_post",methods=['POST','GET'])
def delete_post():
    resp={}
    if request.method == 'POST':
        post_id=request.form.get('id')
        post_result= Post.query.filter((Post.id==post_id) and (Post.user_id==current_user.id)).first()
        like_result= Like.query.filter(Like.post_id==post_id).all()
        for i in like_result:
            db.session.delete(i)
        db.session.delete(post_result)
        db.session.commit()
    
        resp={"status":"done"}
        return jsonify(resp)
    
@app.route("/update_post/<int:id>",methods=['GET','POST'])
def update_post(id):
    post_result=Post.query.filter((Post.id==id) & (Post.user_id==current_user.id)).first()
    categories=Category.query.all() 
    return render_template("update_post.html",post_result=post_result,categories=categories,POST_TYPE=POST_TYPE)
    
@app.route('/edit_profile',methods=['GET','POST'])
def edit_profile():
    id=current_user.id
    log_user=User.query.filter_by(id=id).first()
    if request.method == 'POST':
        name = request.form.get('name')
        print(name)
        username = request.form.get('username')
        email = request.form.get('email')
        file=request.files['img']
        print(file)
        print(file.filename,"<<<<<<<<<<<<<<<<<")
        # logImg = file.filename if file != '' else log_user.user_image
        
        if file.filename == '' or file.filename != '':# or (file and allowed_file(file.filename)):
            print("kkk")
            # try:
            if file.filename != '':
                print("try if block")
                file.save(os.path.join(app.config['UPLOAD_FOLDER']+'user_profile_images/',file.filename)) #cannot save empty file so i have use try and except exception handling method
        # except:
            print("except block")
            website = request.form.get('website')
            facebook = request.form.get('facebook')
            twitter = request.form.get('twitter')
            instagram = request.form.get('instagram')
            linkedin = request.form.get('linkedin')
            log_user.name=name
            log_user.email=email
            if file.filename == '':
                print("except if block")
                log_user.user_image=log_user.user_image
            else:
                log_user.user_image=file.filename
            print('not empty')
            log_user.website_url=website
            log_user.facebook=facebook
            log_user.twitter=twitter
            log_user.instagram=instagram
            log_user.linkedin=linkedin
            db.session.commit()
            return redirect('/edit_profile')
        else:
            return 'something went wrong'
    return render_template('users/edit_profile.html',log_user=log_user)

@app.route('/change_password',methods=['GET','POST'])
def change_password():
    if request.method == 'POST':
        if current_user.is_authenticated:
            id=current_user.id
        user_pass=User.query.filter_by(id=id).first()
        database_password=user_pass.password    
        old_password=request.form.get('old_password')
        new_password=request.form.get('new_password')
        encrypt_password=sha256_crypt.encrypt(new_password)
        conform_password= request.form.get('conform_password')
        if new_password==conform_password:
            if sha256_crypt.verify(old_password,database_password):
                user_pass.password=encrypt_password
                db.session.commit()
                return 'password changed'
            
@app.route('/home',methods=['GET','POST'])
def home():
    if current_user.is_authenticated:
        return render_template('users/home.html')
    else:
        return 'User not login'

@app.route("/register_user",methods=['GET','POST'])
def register_user():
    if request.method == 'POST':
        name=request.form.get('name')
        username=request.form.get('username')
        email=request.form.get('email')
        password=request.form.get('password')
        password_confirmation=request.form.get('password_confirmation')
        encrypt_password=sha256_crypt.encrypt(password)
        if '@gmail' in email:
            # return email
            result=User(name=name,username=username,email=email,password=encrypt_password)
            db.session.add(result)
            db.session.commit()
            return redirect('/login')
        else:
            return 'Invalid email'
    return render_template('users/register.html')
 
@app.route('/add_post',methods=['GET','POST'])
def add_post():
    if request.method == 'POST':
        post_title=request.form['post_title']
        post_desc=request.form['post_desc']
        img_gif_video= request.files['img_gif_video']
        post_type=request.form['post_type']
        category_type_id1=request.form['category_type_id']
        # if request.files['img'] != '':
        #     img_gif_video= request.files['img']
        # if request.files['gif'] !='':
        #     img_gif_video= request.files['gif']
        # if request.files['video'] !='':  
        #     img_gif_video= request.files['video']
        if img_gif_video and allowed_file(img_gif_video.filename):
            filename = secure_filename(img_gif_video.filename)
            img_gif_video.save(os.path.join(app.config['UPLOAD_FOLDER']+'/all_post',filename))            
            user_id=current_user.id
            result=Post(post_title=post_title,post_description=post_desc,post_type=post_type,user_id=user_id,post_data=filename,category_type_id=category_type_id1)  
            db.session.add(result)
            db.session.commit()
            return redirect('/')
    categories=Category.query.all()    
    return render_template('add_post.html',categories=categories)

@app.route("/like",methods=['GET','POST'])
def likes():
    if request.method == 'POST':
        resp={}
        if current_user.is_authenticated:
            like_post1=bool(request.form['like_post'])
            post_id1=request.form['post_id']
            user_id1=current_user.id
            unlike=Like.query.filter((Like.user_id==user_id1) & (Like.post_id==post_id1) & (Like.like_post==False)).first()
            like=Like.query.filter((Like.user_id==user_id1) & (Like.post_id==post_id1) & (Like.like_post==True)).first()
            # print(result.like_post,result.post_id,result.user_id)
            if like:
                resp['status']='like'
                like.like_post=False
                db.session.commit()
                return jsonify(resp)
            if unlike:
                resp['status']="unlike"
                unlike.like_post=True
                db.session.commit()
                return jsonify(resp)
            else:
                result=Like(like_post=like_post1,post_id=post_id1,user_id=user_id1)
                db.session.add(result)
                db.session.commit()
                resp['status']='success'
                return jsonify(resp)
            
        resp['status']="unauthorized_user"
        return jsonify(resp)
         
@app.route('/categories',methods=['GET','POST'])
def categories():
    categories=Category.query.all()    
    return render_template('category/categories.html',categories=categories)

@app.route('/filter_categories/<int:id>',methods=['GET','POST'])
def filter_categories(id):
    result=Post.query.filter(Post.category_type_id == id).all()
    return render_template("category/filter_categories.html",data=result,POST_TYPE=POST_TYPE)
    
@app.route("/search_category",methods=['GET','POST'])
def search_category():
    resp={}
    if request.method == 'POST':
        category_type1= (request.form['category']).upper()
        if category_type1 !="":
            try:
                category_table=Category.query.filter(Category.category_type==category_type1).first()
                post_table=Post.query.filter(Post.category_type_id == category_table.id).all()
                if post_table:
                    flash(f"Here This is {category_type1} Post","success")
                    return render_template('category/search_category.html',data=post_table,POST_TYPE=POST_TYPE)
                else:
                    flash("No Record Found","info")
                    return redirect('/')
            except:
                flash("Something went wrong Please Search again....",'danger')
                return redirect('/')
        else:
            flash("Please Enter Category Name","info")
            return redirect('/')
        # resp['status']="done"
        # return jsonify(resp)
    return render_template('category/search_category.html')        
      
@app.route('/edit_post',methods=['GET','POST'])
def edit_post():
    resp={}
    if request.method == 'POST':
        post_id=request.form['id']
        post_result= Post.query.filter((Post.id==post_id) and (Post.user_id==current_user.id)).first()
        category_result=Category.query.filter(Category.id==post_result.category_type_id).first()
        data = post_result.post_type
        post_type = data.value
        resp["post_id"]=post_result.id
        resp["post_title"]=post_result.post_title
        resp["post_description"]=post_result.post_description
        resp["post_data"]=post_result.post_data
        # resp['post_type']=post_result.video_func
        
        resp["category_type"]=category_result.category_type
        resp["category_type_id"]=category_result.id
        resp["post_type"]=post_type
        # print(post_result.video_func)
        # resp["category_type"]=post_result.category_type
        return jsonify(resp)

@app.route("/update_post",methods=['GET','POST'])
def files():
    # print(request.form,"<<<<<<<<<<<<<<<<<<<<<<<<<<")
    # print(request.files['img_gif_video'],"<<<<<<<<<<<<<<<<<<<<<<<<<<")
    resp={}
    if request.method == 'POST':
        print(request.form)
        post_id=request.form["id"]
        post_title=request.form['post_title']
        post_desc=request.form['post_desc']
        post_type=request.form['post_type']
        category_type_id=request.form['category_type_id']
        post_table=Post.query.get(post_id)
        category_table=Category.query.filter(Category.id==category_type_id).first()
        
        try:
            img_gif_video=request.files['img_gif_video']
            print(img_gif_video.filename,"<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>")
            if img_gif_video and allowed_file(img_gif_video.filename):
                print("Try if block")
                filename = secure_filename(img_gif_video.filename)
                img_gif_video.save(os.path.join(app.config['UPLOAD_FOLDER']+'/all_post',filename))
                post_table.post_data=filename
                resp["post_data"]=filename
            else:
                resp['status']='error'
                print("please select valid file")
                return jsonify(resp)
        except:
            print("except block")
            
        post_table.post_title=post_title
        post_table.post_description=post_desc
        post_table.post_type=post_type
        post_table.post_datetime=datetime.utcnow()
        post_table.category_type_id=category_type_id
        db.session.commit()
        
        resp["post_id"]=post_id
        resp["post_title"]=post_title
        resp["post_desc"]=post_desc
        resp["post_type"]=post_type
        resp["category_type_id"]=category_type_id
        resp["category_type_name"]=category_table.category_type
        resp["status"]="success"
        return jsonify(resp)

@app.route("/user_post_total_likes",methods=['GET','POST'])
def check_query():
    resp={}
    result=db.session.query(Like).join(Post,User).filter((Post.user_id==current_user.id) & (Post.id==Like.post_id) & (Like.like_post==True)).all()
    total_post=Post.query.filter(Post.user_id==current_user.id).count()
    print(total_post,"<<<<<<<total post<<<<<<<<<<<<<<")    
    total_likes_counts=len(result)
    
    username_names=[]
    for i in result:
        if i.user.username not in username_names:
            username_names.append(i.user.username)
            print(i.user.username)

    resp['username_names']=username_names
    resp['total_likes_counts']=total_likes_counts
    resp['total_post']=total_post
    return jsonify(resp)

@app.route("/post_details/<int:id>", methods=["GET",'POST'])
def post_details(id):
    post_result = Post.query.get(id)
    return render_template("post_details.html",i=post_result,POST_TYPE=POST_TYPE)         

@app.route("/parent_comment",methods=["GET",'POST'])
def parent_comment():
    resp={}
    comment_text1=request.form['comment_text']
    post_id1=request.form['post_id']
    print(comment_text1,post_id1)
    if comment_text1 != "" and post_id1 != "":
        result=Comment(comment_text=comment_text1,post_id=post_id1,user_id=current_user.id)
        db.session.add(result)
        db.session.commit()
        print(result.id,"<<<<<<<<<<<<<<<<<<<<<")
        db.session.add(result)
        db.session.commit()
        
        resp["user_image"]=current_user.user_image
        resp['user_name']=current_user.name
        resp['comment_text']=comment_text1
        resp['parent_replay_id']=result.id
        resp["status"]="success"
    else:
        resp["status"]="error"
    return jsonify(resp)
    
@app.route("/child_comment",methods=["GET",'POST'])
def child_comment():
    resp={}
    if request.method == 'POST':
        child_comment_text1=request.form['child_comment_text']
        parent_replay_id1=request.form['parent_replay_id']
        post_id1=request.form['post_id']
        print(parent_replay_id1,child_comment_text1,'<<<<<<<<<<')
        if child_comment_text1 != "" and parent_replay_id1 != "" and post_id1 != "":
            result=Comment(comment_text=child_comment_text1,post_id=post_id1,user_id=current_user.id,replay_comment_id=parent_replay_id1)
            db.session.add(result)
            db.session.commit()
            resp["user_image"]=current_user.user_image
            resp['user_name']=current_user.name
            resp['comment_text']=child_comment_text1
            resp['parent_replay_id']=result.id
            resp['post_id']=post_id1
            resp["status"]="success"
        else:
            resp["status"]="error"
        return jsonify(resp)
    
@app.route("/grant_child_comment",methods=["GET",'POST'])
def grant_child_comment():
    resp={}
    if request.method == 'POST':
        child_comment_text1=request.form['child_comment_text']
        parent_replay_id1=request.form['parent_replay_id']
        post_id1=request.form['post_id']
        print(parent_replay_id1,child_comment_text1,'<<<<<<<<<<')
        resp['status']="success"
        if child_comment_text1 != "" and parent_replay_id1 != "" and post_id1 != "":
            result=Comment(comment_text=child_comment_text1,post_id=post_id1,user_id=current_user.id,replay_comment_id=parent_replay_id1)
            db.session.add(result)
            db.session.commit()
            resp["user_image"]=current_user.user_image
            resp['user_name']=current_user.name
            resp['comment_text']=child_comment_text1
            resp["status"]="success"
        else:
            resp["status"]="error"
        return jsonify(resp)
    
@app.route("/delete_parent_comment",methods=['GET','POST'])
def delete_parent_comment():
    resp={}
    if request.method == 'POST':
        id=request.form['parent_comment_id']
        print(id)
        parent_comment_id=Comment.query.get(request.form['parent_comment_id'])
        parent_comment_id.is_delete=0
        childs=Comment.query.filter(parent_comment_id.id==Comment.replay_comment_id).all()
        for i in childs:
            i.is_delete=0
            grant_child_comment=Comment.query.filter(i.id==Comment.replay_comment_id).all()
            for j in grant_child_comment:
                j.is_delete=0
        db.session.commit()
        resp['status']="success"
        return jsonify(resp)
    
@app.route("/delete_child_comment",methods=['GET','POST'])
def delete_child_comment():
    resp={}
    if request.method == 'POST':
        id=request.form['child_comment_id']
        print(id)
        child_comment_id=Comment.query.get(request.form['child_comment_id'])
        child_comment_id.is_delete=0
        childs=Comment.query.filter(child_comment_id.id==Comment.replay_comment_id).all()
        for i in childs:
            print(i.id,"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
            i.is_delete=0
        db.session.commit()
        resp['status']="success"
        return jsonify(resp)
            