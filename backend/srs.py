from datetime import datetime, timedelta

MIN_EASE_FACTOR = 1.3


def calculate_next_review(
    quality: int,
    ease_factor: float,
    interval_days: int,
    repetitions: int,
) -> dict:
    if quality < 0 or quality > 5:
        raise ValueError("quality must be between 0 and 5")

    if quality < 3:
        repetitions = 0
        interval_days = 1
    else:
        if repetitions == 0:
            interval_days = 1
        elif repetitions == 1:
            interval_days = 6
        else:
            interval_days = round(interval_days * ease_factor)

        repetitions += 1

    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    ease_factor = max(MIN_EASE_FACTOR, round(ease_factor, 2))

    next_review_date = datetime.utcnow() + timedelta(days=interval_days)

    return {
        "ease_factor": ease_factor,
        "interval_days": interval_days,
        "repetitions": repetitions,
        "next_review_date": next_review_date,
        "last_reviewed_at": datetime.utcnow(),
    }
