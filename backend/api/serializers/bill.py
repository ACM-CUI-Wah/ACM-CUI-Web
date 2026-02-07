from rest_framework import serializers
from api.models import Bill
from api.utils import get_bucket_public_url, upload_file

class BillSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = '__all__'
        read_only_fields = ['id']

    def get_image(self, obj):
        if not obj.image:
            return None
        return get_bucket_public_url(obj.image)


class BillWriteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True, required=True)

    class Meta:
        model = Bill
        fields = '__all__'
        read_only_fields = ['id']

    def create(self, validated_data):
        uploaded_image = validated_data.pop("image", None)
        bill = Bill.objects.create(**validated_data)

        if uploaded_image:
            bill.image = upload_file(uploaded_image, "bills")
            bill.save(update_fields=["image"])

        return bill

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if image:
            instance.image = upload_file(image, "bills")

        instance.save()
        return instance