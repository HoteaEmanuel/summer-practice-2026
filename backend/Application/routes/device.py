import calendar
from datetime import date, timedelta

from Application import app
from flask import jsonify, request  # type: ignore
from ..database.models import Device
from bson import ObjectId

WEEKDAY_CODES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


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


@app.route('/device/<_id>', methods=['PUT', 'DELETE'])
def manage_device(_id):
    if request.method == 'PUT':
        try:
            device_data = request.get_json()
            device_data.pop('_id', None)
            deviceToUpdate = Device.objects(id=ObjectId(_id))
            if deviceToUpdate:
                deviceToUpdate.update(**device_data)
                return jsonify({'message': 'Device updated successfully'}), 200
            else:
                return jsonify({'error': 'Device not found'}), 404
        except Exception as e:
            print(e)
            return jsonify({'error': str(e)}), 400

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


def _device_hourly_rate(device):
    """Consumption rate for this device entry, accounting for how many
    physical units it represents (the 'count' field)."""
    rate = device.consumptionPerHour or 0
    units = device.count or 1
    return rate * units


def _day_usage_and_saved(devices, weekday_code):
    """Compute (usage, saved) in kWh for a single calendar day, given its
    weekday code (e.g. 'mon'), across all devices."""
    usage = 0.0
    saved = 0.0

    for device in devices:
        rate = _device_hourly_rate(device)
        if rate <= 0:
            continue  # no consumption rate set for this device yet

        if not device.scheduleEnabled:
            # No schedule configured -> treated as always on
            usage += 24 * rate
            continue

        active_days = device.scheduleDays or []
        if weekday_code not in active_days:
            # Scheduled, but not active on this day at all
            saved += 24 * rate
            continue

        on_time_str = device.powerOnTime or "00:00"
        off_time_str = device.powerOffTime or "23:59"

        try:
            on_h, on_m = map(int, on_time_str.split(":"))
            off_h, off_m = map(int, off_time_str.split(":"))
            active_hours = (off_h + off_m / 60.0) - (on_h + on_m / 60.0)
            if active_hours < 0:
                active_hours += 24  # overnight window, e.g. 22:00 -> 06:00
        except (ValueError, AttributeError):
            active_hours = 24  # malformed time strings -> fail safe to always-on

        saved_hours = 24 - active_hours
        usage += active_hours * rate
        saved += saved_hours * rate

    return usage, saved


def _weekday_code(d: date) -> str:
    return WEEKDAY_CODES[d.weekday()]


@app.route('/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    try:
        devices = list(Device.objects())
        total_devices = len(devices)
        scheduled_active_devices = sum(
            1 for d in devices if d.scheduleEnabled
        )

        range_param = request.args.get('range', 'week')
        today = date.today()
        chart_data = []
        total_usage = 0.0
        total_saved = 0.0

        if range_param == 'week':
            # Monday..Sunday of the current week
            monday = today - timedelta(days=today.weekday())
            for i in range(7):
                d = monday + timedelta(days=i)
                weekday_code = _weekday_code(d)
                usage, saved = _day_usage_and_saved(devices, weekday_code)
                total_usage += usage
                total_saved += saved
                chart_data.append({
                    "day": weekday_code.capitalize(),
                    "usage": round(usage, 2),
                    "saved": round(saved, 2),
                })

        elif range_param == 'month':
            days_in_month = calendar.monthrange(today.year, today.month)[1]
            for day_num in range(1, days_in_month + 1):
                d = date(today.year, today.month, day_num)
                weekday_code = _weekday_code(d)
                usage, saved = _day_usage_and_saved(devices, weekday_code)
                total_usage += usage
                total_saved += saved
                chart_data.append({
                    "day": str(day_num),
                    "usage": round(usage, 2),
                    "saved": round(saved, 2),
                })

        elif range_param == 'year':
            for month_num in range(1, 13):
                days_in_month = calendar.monthrange(today.year, month_num)[1]
                month_usage = 0.0
                month_saved = 0.0
                for day_num in range(1, days_in_month + 1):
                    d = date(today.year, month_num, day_num)
                    weekday_code = _weekday_code(d)
                    usage, saved = _day_usage_and_saved(devices, weekday_code)
                    month_usage += usage
                    month_saved += saved
                total_usage += month_usage
                total_saved += month_saved
                chart_data.append({
                    "day": calendar.month_abbr[month_num],
                    "usage": round(month_usage, 2),
                    "saved": round(month_saved, 2),
                })

        else:
            return jsonify({'error': f'Invalid range: {range_param}'}), 400

        return jsonify({
            "totalDevices": total_devices,
            "scheduledActiveDevices": scheduled_active_devices,
            "totalPower": round(total_usage, 1),
            "energySaved": round(total_saved, 1),
            "chartData": chart_data,
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500