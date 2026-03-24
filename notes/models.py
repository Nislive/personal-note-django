from django.db import models
from django.conf import settings


class Note(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL ,on_delete=models.CASCADE, related_name="notes")
    title = models.CharField(max_length=30)
    content = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)