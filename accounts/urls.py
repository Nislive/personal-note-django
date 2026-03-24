from django.urls import path
from . import views

urlpatterns = [
    path('', views.accounts, name='accounts'),
    path('accounts/auth/login/', views.login_, name='login'),
    path('accounts/auth/register/', views.register_, name='register'),
    path('logout/', views.logout_, name='logout'),
]
