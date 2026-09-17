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
    Returns one of: "Expired", "Expiring soon",or Active
    """
    remaining = days_until_expiry(expiry_date, today)
    if remaining < 0:
        return "Expired"
    if remaining <= warning_days:
        return "Expiring soon"
    return "Active"

def format_expiry_message(item_name: str, expiry_date: date, warning_days: int = 30, today: Optional[date] = None) -> str:
    """
    Returns a friendly, human-readable message about an item's expiry.
    e.g. "License expires in 5 days" or "License expired 3 days ago"
    """
    remaining = days_until_expiry(expiry_date, today)
    if remaining < 0:
        return f"{item_name} expired {abs(remaining)} day{'s' if abs(remaining) != 1 else ''} ago"
    if remaining <= warning_days:
        return f"{item_name} expires in {remaining} day{'s' if remaining != 1 else ''}"
    return f"{item_name} is valid"