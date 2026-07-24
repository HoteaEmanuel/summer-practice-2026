import configparser
import os
from functools import wraps

from bcrypt import hashpw # type: ignore
from Application import app
from flask import jsonify, make_response, request # type: ignore
import jwt # type: ignore

from Application.database.models import User
from datetime import datetime, timedelta
from flask_jwt_extended import JWTManager, create_access_token # type: ignore
import bcrypt # type: ignore
from Application.scripts.utils import insert_user

secret = configparser.ConfigParser()
config_path = os.path.join(os.path.dirname(__file__), '..', 'scripts', 'config.ini')
secret.read(config_path)

app.config['JWT_SECRET_KEY'] = secret['db']['SECRET_KEY']
app.config['SECRET_KEY'] = secret['db']['SECRET_KEY']
jwt_manager = JWTManager(app)

# decorator for verifying the JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # jwt is passed in the request header
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        # return 401 if token is not passed
        if not token:
            return jsonify({'message' : 'Token is missing !!'}), 401

        try:
            # decoding the payload to fetch the stored details
            data = jwt.decode(token, app.config['SECRET_KEY'],algorithms=["HS256", "RS256"], options={"verify_signature": False})
            current_user = User.objects.get(username = data['sub'])
         
        except Exception as e:
            print(e)
            return jsonify({
                'message' : 'Token is invalid !!'
            }), 401
        # returns the current logged in users contex to the routes
        return  f(current_user, *args, **kwargs)
  
    return decorated


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.objects(username=username).first()
    if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        access_token = create_access_token(identity=str(username))
        return {
            'access_token': access_token,
            'message': 'Login Successfull',
            'loggedinUser': username,
            'name': user.name or username,
            'role': user.role,
            'group': user.group,
        }
    else:
        return {'message': 'Invalid credentials'}, 401
    

@app.route('/register', methods=['POST'])
@token_required
def register(current_user):
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'user')
    site = data.get('site')
    group = data.get('group')
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = {
        "name": name or username,
        "username": username,
        "password": hashed_password,
        "role": role,
        "site": site,
        "group": group,
    }
    action = insert_user(user)
    if 'error' not in action:
        return {"message": "User succesfully added"}
    return action


@app.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    if not current_password or not new_password:
        return jsonify({'message': 'Current and new password are required'}), 400

    if not bcrypt.checkpw(current_password.encode('utf-8'), current_user.password.encode('utf-8')):
        return jsonify({'message': 'Current password is incorrect'}), 401

    if len(new_password) < 6:
        return jsonify({'message': 'New password must be at least 6 characters'}), 400

    current_user.password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    current_user.save()
    return jsonify({'message': 'Password updated successfully'}), 200