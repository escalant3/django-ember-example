from django.contrib import admin

from tasks.models import Person, Task, Tag

admin.site.register(Person)
admin.site.register(Task)
admin.site.register(Tag)
