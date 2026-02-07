from rest_framework import serializers
from api.models import Bill
from api.utils import get_bucket_public_url, upload_file

class BillSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = '__all__'
        read_only_fields = ['id']

    def get_image_url(self, obj):
        if not obj.image:
            return None
        return get_bucket_public_url(obj.file)

    def create(self, validated_data):
        image = validated_data.pop("image", None)
        bill = Bill.objects.create(**validated_data)

        if image:
            bill.image = upload_file(image, "bills")
            bill.save(update_fields=["image"])

        return bill