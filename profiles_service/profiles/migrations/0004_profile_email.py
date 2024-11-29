# Generated by Django 5.1.3 on 2024-11-21 21:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0003_profile_username'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='email',
            field=models.EmailField(default=1, max_length=254, unique=True),
            preserve_default=False,
        ),
    ]