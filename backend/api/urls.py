from django.urls import path
from . import views

urlpatterns = [
    path('generate-path/', views.generate_path, name='generate_path'),
]
