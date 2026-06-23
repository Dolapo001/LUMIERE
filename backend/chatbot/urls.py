from django.urls import path
from .views import chat_view, chat_history_view

urlpatterns = [
    path('', chat_view, name='chat'),
    path('history/', chat_history_view, name='chat-history'),
]
