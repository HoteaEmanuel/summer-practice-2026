from Application import app
from flask import jsonify, request # type: ignore
from ..database.models import Device
from bson import ObjectId

@app.route('/devices', methods=['GET'])
def get_devices():
    try:
        devices = Device.objects().to_json()
        return devices, 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/device', methods=['POST'])
def add_device():
    try:
        device_data = request.get_json()
        new_device = Device(**device_data)
        new_device.save()
        return jsonify({'message': 'Device added successfully'}), 201
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 400

# --- RUTA COMBINATĂ PENTRU EDITARE (PUT) ȘI ȘTERGERE (DELETE) ---
@app.route('/device/<_id>', methods=['PUT', 'DELETE'])
def manage_device(_id):
    # Dacă primim o cerere de UPDATE
    if request.method == 'PUT':
        try:
            device_data = request.get_json()
            device_data.pop('_id', None) # Eliminăm ID-ul pentru a evita erorile de suprascriere
            
            deviceToUpdate = Device.objects(id=ObjectId(_id))
            if deviceToUpdate:
                deviceToUpdate.update(**device_data)
                return jsonify({'message': 'Device updated successfully'}), 200
            else:
                return jsonify({'error': 'Device not found'}), 404
        except Exception as e:
            print(e)
            return jsonify({'error': str(e)}), 400

    # Dacă primim o cerere de ȘTERGERE
    elif request.method == 'DELETE':
        try:
            deviceToDelete = Device.objects(id=ObjectId(_id))
            if deviceToDelete:
                deviceToDelete.delete()
                return jsonify({'message': 'Device deleted successfully'}), 200
            else:
                return jsonify({'error': 'Device not found'}), 404
        except Exception as e:
            print(e)
            return jsonify({'error': str(e)}), 400