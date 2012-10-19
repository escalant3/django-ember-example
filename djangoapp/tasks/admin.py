from django.contrib import admin

from tasks.models import Person, Task

admin.site.register(Person)
admin.site.register(Task)
