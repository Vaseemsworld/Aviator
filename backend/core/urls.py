from django.urls import path, include
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("wallet/balance/", get_balance),
    path("wallet/deposit/", deposit),
    path("wallet/withdraw/", withdraw),
    path("wallet/history/", wallet_history),
    path('wallet/bet/', place_bet),
    path('wallet/win/', handle_win),
    path('wallet/cancel/', cancel_bet),
    path('send-otp/', send_otp),
    path('verify-otp/', verify_otp),
    path('reset-password/', reset_password),
]