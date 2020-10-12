from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from .models import Portfolio
from .forms import CreatePortfolioForm

def home(request):
    return render(request, 'home.html') 

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'registration/signup.html', {'form': form})

@login_required
def createportfolio(request):
    if request.method == 'GET':
        return render(request, 'createportfolio.html', {'form':CreatePortfolioForm()})
    else:
        try:
            form = CreatePortfolioForm(request.POST)
            newPortfolio = form.save(commit=False)
            newPortfolio.user = request.user
            newPortfolio.save()
            return redirect('home')
        except ValueError:
            return render(request, 'createportfolio.html', {'form':CreatePortfolioForm(), 'error':'bad data passed. try again!'})

@login_required
def viewallportfolios(request):
    portfolios = Portfolio.objects.filter(user=request.user)
    return render(request, 'viewallportfolios.html', {'portfolios':portfolios})