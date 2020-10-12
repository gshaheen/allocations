from django.forms import ModelForm
from .models import Portfolio

class CreatePortfolioForm(ModelForm):
    class Meta:
        model = Portfolio
        fields = ['title', 'description']