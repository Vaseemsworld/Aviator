from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from django.db import transaction
from django.db.models import F
import uuid, urllib.parse

from .serializers import *
from .models import *
import random

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = self.get_tokens_for_user(user)
            return Response(tokens, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
    
    @staticmethod
    def get_tokens_for_user(user):
        refresh = RefreshToken.for_user(user)
        refresh['phone'] = user.phone
        refresh['username'] = user.username
        refresh['balance'] = str(user.balance)
        return {
            'refresh':str(refresh),
            'access':str(refresh.access_token),
        }

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_balance(request):
    user = request.user
    if not user or not user.is_authenticated:
        return Response({'detail':"User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return Response({"detail": "user does not exist, Please register."},status=status.HTTP_404_NOT_FOUND)
    
    return Response({"balance": user.balance})
    
UPI_ID = '7073237376@ibl'
MERCHANT_NAME= 'Khaimu'

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit(request):
    user = request.user
    amount = request.data.get('amount')
    payment_info = request.data.get('paymentInfo', {})

    try: 
        amount = float(amount)
        if amount <= 0:
            return Response({'error': 'Amount must be positive.'}, status=400)
    except:
        return Response({'error':'Invalid amount'}, status=400)
    

    WalletTransaction.objects.create(
        user= user,
        type='DEPOSIT',
        amount=amount,
        status='pending',
        meta=payment_info,
        timestamp=timezone.now()
    )

    return Response({'message': 'Deposit request submitted.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw(request):
    user = request.user
    amount = request.data.get('amount')
    try:
        amount = float(amount)
        if amount <= 0:
            return Response({'error': 'Amount must be positive.'}, status=400)
    except:
        return Response({'error': 'Invalid amount.'}, status=400)

    if user.balance < amount:
        return Response({'error': 'Insufficient balance'}, status=400)

    WalletTransaction.objects.create(
        user=request.user,
        type='WITHDRAW',
        amount=amount,
        status='pending',
        meta= request.data.get('bankDetails', {})
    )

    return Response({'message': 'Withdraw request submitted successfully.'})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def wallet_history(request):
    user = request.user
    offset = int(request.GET.get("offset", 0))
    limit = int(request.GET.get("limit", 25))

    qs = WalletTransaction.objects.filter(user=user).order_by("-id")
    paginated = qs[offset:offset + limit]

    data = [
        {
            "amount": str(tx.amount),
            "type": tx.type,
            "status": tx.status,
            "timestamp": tx.timestamp.isoformat(),
            "meta": tx.meta,
            "rejection_reason": tx.rejection_reason
        }
        for tx in paginated
    ]

    return Response({
        "results": data,
        "count": qs.count(),
        "has_more": offset + limit < qs.count()
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def place_bet(request):
    try:
        amount = Decimal(request.data.get('amount', 0))
        bet_key = request.data.get('bet_key')
        if not bet_key:
            return Response({"error": "Missing bet_key"}, status=400)
    except (ValueError, TypeError):
        return Response({"error": "Invalid input"}, status=400)

    user = request.user

    try:
        with transaction.atomic():
            user.refresh_from_db()

            if user.balance < amount:
                return Response({"detail": "Insufficient balance"}, status=400)

            user.balance = F('balance') - amount
            user.save(update_fields=['balance'])

            # Record the transaction
            WalletTransaction.objects.create(
                user=user,
                amount=amount,
                status="success",
                type="BET",
                meta={"bet_key": bet_key}
            )

            user.refresh_from_db()

        return Response({
            "message": "BET_PLACED",
            "balance": user.balance,
            "bet_key": bet_key
        })

    except Exception as e:
        return Response({
            "error": str(e),
            "detail": "Bet placement failed due to server error."
        }, status=500)
  
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def handle_win(request):
    user = request.user
    try:
        base_bet = Decimal(request.data.get("base_bet", 0))
        multiplier = Decimal(request.data.get("multiplier", 1.0))
        bet_key = request.data.get("bet_key")
        if not bet_key:
            return Response({"error": "Missing bet_key"}, status=400)
    except (ValueError, TypeError):
        return Response({"error": "Invalid input"}, status=400)

    winnings = base_bet * multiplier

    try:
        with transaction.atomic():
            user.refresh_from_db()
            user.balance = F('balance') + winnings
            user.save(update_fields=['balance'])

            WalletTransaction.objects.create(
                user=user,
                amount=winnings,
                status="success",
                type="WIN",
                meta={
                    "bet_key": bet_key,
                    "multiplier": float(multiplier),
                    "base_bet": float(base_bet),
                    "winnings": float(winnings)
                },
            )

            user.refresh_from_db()

        return Response({
            "message": "Winnings added",
            "balance": user.balance,
            "winnings": winnings,
            "multiplier": multiplier,
            "bet_key": bet_key,
        })

    except Exception as e:
        return Response({
            "error": str(e),
            "detail": "Failed to process winnings"
        }, status=500)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_bet(request):
    user = request.user
    try:
        refund = Decimal(request.data.get("amount", 0))
        bet_key = request.data.get("bet_key")
        if not bet_key:
            return Response({"error": "Missing bet_key"}, status=400)
    except (ValueError, TypeError):
        return Response({"error": "Invalid input"}, status=400)

    try:
        with transaction.atomic():
            user.refresh_from_db()
            user.balance = F('balance') + refund
            user.save(update_fields=['balance'])

            WalletTransaction.objects.create(
                user=user,
                amount=refund,
                type="CANCEL",
                status="success",
                meta={"bet_key": bet_key, "refunded_amount": float(refund)},
            )

            user.refresh_from_db()

        return Response({
            "message": "BET_CANCELED",
            "balance": user.balance,
            "bet_key": bet_key
        })

    except Exception as e:
        return Response({
            "error": str(e),
            "detail": "Failed to cancel bet"
        }, status=500)


@api_view(["POST"])
def send_otp(request):
    phone = request.data.get('phone')
    if not phone:
        return Response({'error':'Phone number is required'}, status=400)
    
    code = str(random.randint(100000,999999))
    OTP.objects.create(phone=phone,code=code)
    print(f"Otp for {phone}: {code}")

    return Response({'message':'OTP sent'})

@api_view(['POST'])
def verify_otp(request):
    phone = request.data.get('phone')
    code = request.data.get('code')

    try:
        otp = OTP.objects.filter(phone=phone, code=code).latest('created_at')
        if otp.is_valid():
            otp.delete()
            return Response({'message': 'OTP verified'})
        else:
            return Response({'error': 'OTP expired'}, status=400)
    except OTP.DoesNotExist:
        return Response({'error': 'Invalid OTP'}, status=400)


from django.contrib.auth import get_user_model

@api_view(['POST'])
def reset_password(request):
    phone = request.data.get('phone')
    new_password = request.data.get('new_password')

    User = get_user_model()
    try:
        user = User.objects.get(phone=phone)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successful'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


