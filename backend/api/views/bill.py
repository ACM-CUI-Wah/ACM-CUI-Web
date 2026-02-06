from rest_framework import generics
from api.models import Bill
from api.serializers import BillSerializer
from api.permissions import IsTreasurer


class BillListCreateView(generics.ListCreateAPIView):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [IsTreasurer]


class BillRUDView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [IsTreasurer]