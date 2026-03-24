from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.template import loader
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
import json
from django.shortcuts import redirect

def accounts(request):
  return render(request, 'index.html')


def login_(request):
  if request.method=="POST":

    login_dict = json.loads(request.body)
    username = login_dict.get("username")
    password = login_dict.get("password")

    user = authenticate(username=username, password=password)

    if user is not None:
      login(request, user)
      return JsonResponse({"success":True, "redirect_url":'/dashboard/'})
    else:
      return JsonResponse({"success": False, "message": "Invalid username or password."})

def register_(request):
  if request.method=="POST":
    register_dict = json.loads(request.body)
    username = register_dict.get("username")
    email = register_dict.get("email")
    password = register_dict.get("password")
    if not User.objects.filter(username=username).exists():

      user = User.objects.create_user(username=username, email=email, password=password)
      login(request, user)
      return JsonResponse({"success": True, "redirect_url": "/dashboard/"})
    else:
      return JsonResponse({"success":False})

def logout_(request):
    logout(request) 
    return redirect('/')