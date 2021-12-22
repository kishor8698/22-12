from datetime import datetime
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from tumblr1 import app,db
from tumblr1.models import User,Post,Comment,Like
from flask_login import current_user

# class MyModelView(ModelView):
#     def is_accessible(self):
#         return current_user.is_authenticated

admin=Admin(app)  
# admin.add_view(MyModelView(User, db.session))
admin.add_view(ModelView(User, db.session))
admin.add_view(ModelView(Post, db.session))
admin.add_view(ModelView(Comment, db.session))
admin.add_view(ModelView(Like, db.session))