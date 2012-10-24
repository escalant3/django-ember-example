from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.resources import ModelResource

from tasks.models import Person, Task, Tag


class PersonResource(ModelResource):

    tasks = fields.ToManyField('tasks.api.TaskResource', 'task_set')

    class Meta:
        queryset = Person.objects.all()
        resource_name = 'person'
        filtering = {
            'name': ['exact']
        }

        # Authorization is needed for write methods
        authorization = Authorization()
        list_allowed_methods = ['get', 'post']
        detail_allowed_methods = ['get', 'post', 'put', 'delete']

        # This option is necessary cause ember-data expects
        # return data after a POST or PUT
        always_return_data = True


class TaskResource(ModelResource):

    person_id = fields.ToOneField(PersonResource, 'person', null=True)
    tags = fields.ToManyField('tasks.api.TagResource', 'tags')

    class Meta:
        queryset = Task.objects.all()
        resource_name = 'task'

        # Authorization is needed for write methods
        authorization = Authorization()
        list_allowed_methods = ['get', 'post']
        detail_allowed_methods = ['get', 'post', 'put', 'delete']

        # This option is necessary cause ember-data expects
        # return data after a POST or PUT
        always_return_data = True


class TagResource(ModelResource):

    class Meta:
        queryset = Tag.objects.all()
        resource_name = 'tag'

        # Authorization is needed for write methods
        authorization = Authorization()
        list_allowed_methods = ['get', 'post', 'put']
        detail_allowed_methods = ['get', 'post', 'put', 'delete']

        # This option is necessary cause ember-data expects
        # return data after a POST or PUT
        always_return_data = True

