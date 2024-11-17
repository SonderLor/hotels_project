from confluent_kafka import Producer
import os
import logging

logger = logging.getLogger(__name__)

KAFKA_BROKER = os.getenv("KAFKA_BROKER")
TOPIC = "user-events"
producer = Producer({'bootstrap.servers': KAFKA_BROKER})


def send_user_created_event(user_id, username):
    event = {
        "event_type": "UserCreated",
        "user_id": str(user_id),
        "username": username,
    }
    producer.produce(TOPIC, value=str(event))
    producer.flush()

def send_user_deleted_event(user_id):
    event = {
        "event_type": "UserDeleted",
        "user_id": str(user_id),
    }
    producer.produce(TOPIC, value=str(event))
    producer.flush()
