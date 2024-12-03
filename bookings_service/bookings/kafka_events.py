from confluent_kafka import Producer
import os
import logging

logger = logging.getLogger(__name__)

KAFKA_BROKER = os.getenv("KAFKA_BROKER")
if not KAFKA_BROKER:
    logger.error("KAFKA_BROKER environment variable is not set.")
TOPIC = "booking-events"

try:
    producer = Producer({'bootstrap.servers': KAFKA_BROKER})
    logger.info("Kafka producer initialized successfully.")
except Exception as e:
    logger.exception("Failed to initialize Kafka producer: %s", e)
    raise

def send_booking_created_event(booking):
    event = {
        "event_type": "BookingCreated",
        "user_id": booking['user_id'],
        "room_id": booking['room_id'],
        "booking_id": booking['id'],
    }
    try:
        producer.produce(TOPIC, value=str(event))
        producer.flush()
        logger.info("BookingCreated event sent: %s", event)
    except Exception as e:
        logger.exception("Failed to send BookingCreated event: %s", e)
