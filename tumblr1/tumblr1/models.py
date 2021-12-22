from flask_login import UserMixin,current_user
import enum
from datetime import datetime
from tumblr1 import db,login_manager

class POST_TYPE(enum.Enum):
    IMAGE='IMAGE'
    VIDEO='VIDEO'
    GIF='GIF'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model,UserMixin):
    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(255), nullable=False,unique=True)
    email = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    #----------default none values ------------------------
    user_image = db.Column(db.String(255),default='')
    website_url = db.Column(db.String(255),default=None)
    facebook = db.Column(db.String(255),default=None)
    twitter = db.Column(db.String(255),default=None)
    instagram = db.Column(db.String(255),default=None)
    linkedin =db.Column(db.String(255),default=None)
    
    def __repr__(self):
        return f'User {self.id} : {self.username} : {self.email} : {self.password}'
    
    # @property
    # def show(self):
    #     name = self.name
    #     if name.islower():
    #         return name.upper()

class Post(db.Model,UserMixin):
    __tablename__ = 'Post'
    id = db.Column(db.Integer, primary_key=True)
    post_title = db.Column(db.String(255), nullable=False)
    post_description = db.Column(db.String(255), nullable=False)
    post_data = db.Column(db.String(255), nullable=False)
    post_type = db.Column(db.Enum(POST_TYPE), nullable=False)
    post_datetime = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    
    category_type_id=db.Column(db.Integer,db.ForeignKey('Category.id',ondelete="CASCADE"),nullable=False) #category type
    category = db.relationship('Category', backref=db.backref('post', lazy=True))
    
    user_id = db.Column(db.Integer, db.ForeignKey('User.id',ondelete="CASCADE"),nullable=False)
    user = db.relationship('User', backref=db.backref('post', lazy=True))

    def __repr__(self):
        return '<Post %r>' % self.post_title
    
    @property
    def video_func(self):
        return self.post_type
    
    @property
    def show_datetime(self):
        return self.post_datetime.strftime('%d:%m.%Y')
    
    @property
    def like_count(self):
        return db.session.query(Post).join(Like).filter((Like.like_post==True) & (Post.id==self.id)).count()
    
    @property
    def check_like_unlike(self):
        if db.session.query(Like).join(Post).filter((Like.post_id==self.id) & (Like.like_post==True) & (Like.user_id==current_user.id)).all():
            return True
        else:
            return False
        # return db.session.query(Like,Post).filter((Like.like_post==True) & (Like.user_id==current_user.id) & (Like.post_id==self.id)).all()
    
    @property
    def all_comment(self):
        # return db.session.query(Comment).join(Post).filter(Comment.post_id==self.id).all()
        return db.session.query(Comment).join(Post).filter((Comment.post_id==self.id) & (Comment.is_delete==1)).order_by(Comment.id.desc()).all()
        
class Category(db.Model,UserMixin):
    __tablename__ = 'Category'
    id=db.Column(db.Integer, primary_key=True)
    category_type = db.Column(db.String(255),nullable=False)
    
class Comment(db.Model,UserMixin):
    __tablename__ = 'Comment'
    id = db.Column(db.Integer, primary_key=True)
    comment_text = db.Column(db.String(255), nullable=False)
    comment_datetime = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    replay_comment_id=db.Column(db.Integer,default=0) # this is True or Flase field
    is_delete=db.Column(db.Integer, default=1)
     
    post_id = db.Column(db.Integer, db.ForeignKey('Post.id',ondelete="CASCADE"),nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id',ondelete="CASCADE"),nullable=False)
    
    # person_id = db.Column(db.Integer, db.ForeignKey('Person.person_id'), nullable=False)
    post = db.relationship('Post', backref=db.backref('comment', lazy=True))
    user = db.relationship('User', backref=db.backref('comment', lazy=True)) 

    def __repr__(self):
        return '<Comment %r>' % self.comment_text

class Like(db.Model,UserMixin):
    __tablename__ = 'Like'
    id = db.Column(db.Integer, primary_key=True)
    like_post=db.Column(db.Boolean,default=False,nullable=False)
    
    
    post_id = db.Column(db.Integer, db.ForeignKey('Post.id',ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id',ondelete="CASCADE"),nullable=False)

    post = db.relationship('Post', backref=db.backref('Like', lazy=True))
    user = db.relationship('User', backref=db.backref('Like', lazy=True)) 

    def __repr__(self):
        return '<Like %r>' % self.id
    
    
        
