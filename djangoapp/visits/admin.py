from django.contrib import admin

from visits.models import Customer, VisitLog

admin.site.register(Customer)
admin.site.register(VisitLog)
