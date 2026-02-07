from rest_framework import generics
from api.models import Bill
from api.serializers import BillSerializer, BillWriteSerializer
from api.permissions import IsTreasurer


class BillListCreateView(generics.ListCreateAPIView):
    queryset = Bill.objects.all()
    permission_classes = [IsTreasurer]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BillWriteSerializer
        return BillSerializer


class BillRUDView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bill.objects.all()
    permission_classes = [IsTreasurer]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BillWriteSerializer
        return BillSerializer