from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_notes, name='get-notes'),
    path('create/', views.save_note, name='save-notes'),
    path('delete/<int:pk>/', views.delete_note, name='delete-notes'),
    path('update/<int:pk>/', views.update_note, name='update-notes'),
    path('ai/<int:pk>/', views.llm_call, name='ai-summarize')
]
