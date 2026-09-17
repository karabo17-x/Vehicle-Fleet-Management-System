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