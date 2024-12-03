import django
import os
import logging
from confluent_kafka import Consumer, KafkaException

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotels_service.settings')
django.setup()

logger = logging.getLogger(__name__)

KAFKA_BROKER = os.getenv("KAFKA_BROKER")
if not KAFKA_BROKER:
    logger.error("KAFKA_BROKER environment variable is not set.")
TOPIC_BOOKING = "booking-events"
GROUP_ID = "hotels_service_group"

from rooms.models import Room


def increment_room_booking_count(room_id):
    """Increment the booking count for a specific room."""
    try:
        room = Room.objects.get(id=room_id)
        room.total_bookings = (room.total_bookings or 0) + 1
        room.save()
        logger.info("Incremented booking count for room ID: %s. Total bookings: %s", room_id, room.total_bookings)
    except Room.DoesNotExist:
        logger.warning("Room not found for ID: %s. Unable to increment booking count.", room_id)
    except Exception as e:
        logger.exception("Failed to increment booking count for room ID: %s: %s", room_id, e)


if __name__ == "__main__":
    try:
        consumer = Consumer({
            'bootstrap.servers': KAFKA_BROKER,
            'group.id': GROUP_ID,
            'auto.offset.reset': 'earliest'
        })
        consumer.subscribe([TOPIC_BOOKING])
        logger.info("Kafka consumer initialized and subscribed to topic: %s", TOPIC_BOOKING)

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

                if event.get("event_type") == "BookingCreated":
                    increment_room_booking_count(event["room_id"])
                else:
                    logger.warning("Unhandled event type: %s", event.get("event_type"))
            except Exception as e:
                logger.exception("Error while consuming Kafka event: %s", e)
    except Exception as e:
        logger.exception("Failed to initialize Kafka consumer: %s", e)
    finally:
        consumer.close()
        logger.info("Kafka consumer closed.")
