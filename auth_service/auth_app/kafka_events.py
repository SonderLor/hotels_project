from confluent_kafka import Producer
import os
import logging

logger = logging.getLogger(__name__)

KAFKA_BROKER = os.getenv("KAFKA_BROKER")
if not KAFKA_BROKER:
    logger.error("KAFKA_BROKER environment variable is not set.")
TOPIC = "user-events"

try:
    producer = Producer({'bootstrap.servers': KAFKA_BROKER})
    logger.info("Kafka producer initialized successfully.")
except Exception as e:
    logger.exception("Failed to initialize Kafka producer: %s", e)
    raise

def send_user_created_event(user_id, username, email):
    event = {
        "event_type": "UserCreated",
        "user_id": str(user_id),
        "username": username,
        "email": email,
    }
    try:
        producer.produce(TOPIC, value=str(event))
        producer.flush()
        logger.info("UserCreated event sent: %s", event)
    except Exception as e:
        logger.exception("Failed to send UserCreated event: %s", e)

def send_user_deleted_event(user_id):
    event = {
        "event_type": "UserDeleted",
        "user_id": str(user_id),
    }
    try:
        producer.produce(TOPIC, value=str(event))
        producer.flush()
        logger.info("UserDeleted event sent: %s", event)
    except Exception as e:
        logger.exception("Failed to send UserDeleted event: %s", e)
