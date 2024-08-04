from django.contrib.auth import get_user_model
from django.test import TestCase

# Create your tests here.


class UserMangerTestCase(TestCase):
    def test_create_user(self):
        User = get_user_model()
        user = User.objects.create_user(email="john@example.com", password="ddd")
        self.assertEqual(user.email, "john@example.com")
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        try:
            self.assertIsNone(user.username)
        except AttributeError:
            pass
        with self.assertRaises(ValueError):
            User.objects.create_user(email="<EMAIL>", password="<PASSWORD>")
        with self.assertRaises(TypeError):
            User.objects.create_user()
        with self.assertRaises(TypeError):
            User.objects.create_user(email="")
