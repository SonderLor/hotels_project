import django
import os
import logging
from confluent_kafka import Consumer, KafkaException

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'profiles_service.settings')
django.setup()

logger = logging.getLogger(__name__)

KAFKA_BROKER = os.getenv("KAFKA_BROKER")
TOPIC = "user-events"
GROUP_ID = "profiles_service_group"

from profiles.models import Profile


def create_profile(user_id, username):
    Profile.objects.create(user_id=user_id, username=username)


def delete_profile(user_id):
    Profile.objects.filter(user_id=user_id).delete()


if __name__ == "__main__":
    consumer = Consumer({
        'bootstrap.servers': KAFKA_BROKER,
        'group.id': GROUP_ID,
        'auto.offset.reset': 'earliest'
    })

    consumer.subscribe([TOPIC])
    logger.info("Поток consume_events запущен")
    while True:
        try:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaException._PARTITION_EOF:
                    continue
                else:
                    logger.error(f"Kafka error: {msg.error()}")
                    break
            event = eval(msg.value().decode('utf-8'))
            if event.get("event_type") == "UserCreated":
                create_profile(event["user_id"], event["username"])
            if event.get("event_type") == "UserDeleted":
                delete_profile(event["user_id"])
        except Exception as e:
            logger.exception("Error in consume events: {}".format(e))
