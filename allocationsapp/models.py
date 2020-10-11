from django.db import models
from django.contrib.auth.models import User

class Portfolio(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created = models.DateTimeField(auto_now_add=True)
    archived = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

class Allocation(models.Model):
    asset = models.CharField(max_length=100)
    percentAllocation = models.PositiveIntegerField()
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE)

    def __str__(self):
        return self.asset