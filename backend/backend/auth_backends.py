from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from django.contrib.auth.hashers import check_password
from django.contrib.auth import get_user_model

class MultiFieldAuthBackend(ModelBackend):
    User = get_user_model()

    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = self.User.objects.get(
                Q(username=username) |
                Q(email=username) |
                Q(student__roll_no=username)
            )
        except self.User.DoesNotExist:
            return None
        if check_password(password, user.password):
            return user
        return None

    def get_user(self, user_id):
        try:
            return self.User.objects.get(pk=user_id)
        except self.User.DoesNotExist:
            return None