from datetime import datetime

from ..database.models import Device, Saving, DailySaving

WEEKDAY_CODES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


def _current_weekday_code(now):
    return WEEKDAY_CODES[now.weekday()]


def _get_or_create_saving(device_name):
    saving = Saving.objects(deviceName=device_name).first()
    if not saving:
        saving = Saving(deviceName=device_name, log=[])
        saving.save()
    return saving


def power_off_devices():
    """Runs every minute. Turns off any scheduled device whose powerOffTime
    matches the current HH:MM, on a day it's scheduled to be active."""
    now = datetime.now()
    current_time_str = now.strftime("%H:%M")
    weekday_code = _current_weekday_code(now)

    devices = Device.objects(
        scheduleEnabled=True,
        powerOffTime=current_time_str,
        scheduleDays=weekday_code,
        isOn=True,
    )

    for device in devices:
        device.update(set__isOn=False, set__poweredOffSince=now)
        print(f"[scheduler] Powered off '{device.deviceName}' at {current_time_str}")


def power_on_devices():
    """Runs every minute. Turns on any scheduled device whose powerOnTime
    matches the current HH:MM, on a day it's scheduled to be active.
    Logs the actual energy saved while it was off."""
    now = datetime.now()
    current_time_str = now.strftime("%H:%M")
    weekday_code = _current_weekday_code(now)

    devices = Device.objects(
        scheduleEnabled=True,
        powerOnTime=current_time_str,
        scheduleDays=weekday_code,
        isOn=False,
    )

    for device in devices:
        hours_off = 0.0
        energy_saved = 0.0

        if device.poweredOffSince:
            delta = now - device.poweredOffSince
            hours_off = delta.total_seconds() / 3600.0
            rate = (device.consumptionPerHour or 0) * (device.count or 1)
            energy_saved = hours_off * rate

            saving = _get_or_create_saving(device.deviceName)
            saving.update(push__log=DailySaving(
                date=now.strftime("%Y-%m-%d"),
                hoursOff=round(hours_off, 4),
                energySaved=round(energy_saved, 4),
            ))

        device.update(set__isOn=True, unset__poweredOffSince=1)
        print(
            f"[scheduler] Powered on '{device.deviceName}' at {current_time_str} "
            f"(off for {round(hours_off, 2)}h, saved {round(energy_saved, 2)} kWh)"
        )