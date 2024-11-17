FROM python:3.12

RUN apt-get update && apt-get install -y gcc python3-dev musl-dev libpq-dev && \
    apt-get clean

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
