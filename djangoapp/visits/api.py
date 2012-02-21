from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.resources import ModelResource

from visits.models import Customer, VisitLog


class CustomerResource(ModelResource):

    visitLogs = fields.ToManyField('visits.api.VisitLogResource', 'visitlog_set', full=True)

    class Meta:
        queryset = Customer.objects.all()
        resource_name = 'customer'

        # Authorization is needed for write methods
        authorization = Authorization()
        list_allowed_methods = ['get', 'post']
        detail_allowed_methods = ['get', 'post', 'put', 'delete']
        
        # This option is necessary cause ember-data expects 
        # return data after a POST or PUT
        always_return_data = True



class VisitLogResource(ModelResource):

    customer = fields.ToOneField(CustomerResource, 'customer') 

    class Meta:
        queryset = VisitLog.objects.all()
        resource_name = 'visit_log'

        # Authorization is needed for write methods
        authorization = Authorization()
        list_allowed_methods = ['get', 'post']
        detail_allowed_methods = ['get', 'post', 'put', 'delete']
        
        # This option is necessary cause ember-data expects 
        # return data after a POST or PUT
        always_return_data = True


