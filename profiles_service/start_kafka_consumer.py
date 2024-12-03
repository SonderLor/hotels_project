import django
import os
import logging
from confluent_kafka import Consumer, KafkaException

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'profiles_service.settings')
django.setup()

logger = logging.getLogger(__name__)

KAFKA_BROKER = os.getenv("KAFKA_BROKER")
if not KAFKA_BROKER:
    logger.error("KAFKA_BROKER environment variable is not set.")
TOPIC_USER = "user-events"
TOPIC_BOOKING = "booking-events"
GROUP_ID = "profiles_service_group"

from profiles.models import Profile


def create_profile(user_id, email, username):
    try:
        Profile.objects.create(user_id=user_id, email=email, username=username, total_bookings=0)
        logger.info("Profile created for user ID: %s, email: %s, username: %s", user_id, email, username)
    except Exception as e:
        logger.exception("Failed to create profile for user ID: %s: %s", user_id, e)


def delete_profile(user_id):
    try:
        Profile.objects.filter(user_id=user_id).delete()
        logger.info("Profile deleted for user ID: %s", user_id)
    except Exception as e:
        logger.exception("Failed to delete profile for user ID: %s: %s", user_id, e)


def increment_booking_count(user_id):
    try:
        profile = Profile.objects.get(user_id=user_id)
        profile.total_bookings = (profile.total_bookings or 0) + 1
        profile.save()
        logger.info("Incremented booking count for user ID: %s. Total bookings: %s", user_id, profile.total_bookings)
    except Profile.DoesNotExist:
        logger.warning("Profile not found for user ID: %s. Unable to increment booking count.", user_id)
    except Exception as e:
        logger.exception("Failed to increment booking count for user ID: %s: %s", user_id, e)


if __name__ == "__main__":
    try:
        consumer = Consumer({
            'bootstrap.servers': KAFKA_BROKER,
            'group.id': GROUP_ID,
            'auto.offset.reset': 'earliest'
        })
        consumer.subscribe([TOPIC_USER, TOPIC_BOOKING])
        logger.info("Kafka consumer initialized and subscribed to topics: %s, %s", TOPIC_USER, TOPIC_BOOKING)

        while True:
            try:
                msg = consumer.poll(timeout=1.0)
                if msg is None:
                    continue
                if msg.error():
                    logger.error("Kafka error: %s", msg.error())
                    break

                event = eval(msg.value().decode('utf-8'))
                logger.info("Event received from Kafka: %s", event)

                event_type = event.get("event_type")
                if event_type == "UserCreated":
                    create_profile(event["user_id"], event["email"], event["username"])
                elif event_type == "UserDeleted":
                    delete_profile(event["user_id"])
                elif event_type == "BookingCreated":
                    increment_booking_count(event["user_id"])
                else:
                    logger.warning("Unhandled event type: %s", event_type)
            except Exception as e:
                logger.exception("Error while consuming Kafka event: %s", e)
    except Exception as e:
        logger.exception("Failed to initialize Kafka consumer: %s", e)
    finally:
        consumer.close()
        logger.info("Kafka consumer closed.")
