from django.db import models


class Customer(models.Model):
    name = models.CharField(max_length=30)
    dateNextVisit = models.CharField(max_length=30)
    typeNextVisit  = models.CharField(max_length=30)

    def __unicode__(self):
        return self.name


class VisitLog(models.Model):
    visitDate = models.CharField(max_length=30)
    visitType = models.CharField(max_length=30)
    customer = models.ForeignKey(Customer)

    def __unicode__(self):
        return "%s - %s" % (self.visitDate,
                            self.visitType)
