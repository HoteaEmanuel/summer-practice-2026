from Application import app
import configparser
import pymongo # type: ignore
import os
from flask import jsonify # type: ignore
from ..database.models import User
from .auth import token_required

secret = configparser.ConfigParser()
config_path = os.path.join(os.path.dirname(__file__), '..', 'scripts', 'config.ini')
secret.read(config_path)
client = pymongo.MongoClient(secret['db']['MONGO_URL'])
mydb = client.energysaving


@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = User.objects().to_json()
        return users, 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify({
        'name': current_user.name,
        'username': current_user.username,
        'role': current_user.role,
        'site': current_user.site,
        'group': current_user.group,
    }), 200