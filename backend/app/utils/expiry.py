

from datetime import date
from typing import Optional


def days_until_expiry(expiry_date: date, today: Optional[date] = None) -> int:
    """
    Returns the number of days between today and expiry_date.
    Negative means it already expired.
    """
    if today is None:
        today = date.today()
    return (expiry_date - today).days

def is_expiring_soon(expiry_date: date, days_threshold: int = 30, today: Optional[date] = None) -> bool:
    """
    Returns True if expiry_date is within days_threshold days from today
    (including if it has already expired).
    """
    return days_until_expiry(expiry_date, today) <= days_threshold

def get_expiry_status(expiry_date: date, warning_days: int = 30, today: Optional[date] = None) -> str:
    """
    Returns one of: "expired", "expiring_soon", "ok".
    """
    remaining = days_until_expiry(expiry_date, today)
    if remaining < 0:
        return "Expired"
    if remaining <= warning_days:
        return "Expiring soon"
    return "Active"