from django.db import models


class Customer(models.Model):
    name = models.CharField(max_length=30)
    date_next_visit = models.CharField(max_length=30)
    type_next_visit  = models.CharField(max_length=30)

    def __unicode__(self):
        return self.name


class VisitLog(models.Model):
    visit_date = models.CharField(max_length=30)
    visit_type = models.CharField(max_length=30)
    customer = models.ForeignKey(Customer)

    def __unicode__(self):
        return "%s - %s" % (self.visitDate,
                            self.visitType)
