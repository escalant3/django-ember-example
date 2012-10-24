from django.conf.urls.defaults import patterns, include, url

from tastypie.api import Api
from tasks.api import PersonResource, TaskResource, TagResource

from django.contrib.staticfiles.urls import staticfiles_urlpatterns

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

#REST API
v1_api = Api(api_name='v1')
v1_api.register(PersonResource())
v1_api.register(TaskResource())
v1_api.register(TagResource())

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'djangoapp.views.home', name='home'),
    # url(r'^djangoapp/', include('djangoapp.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(v1_api.urls)),
    url(r'^$', 'djangoapp.tasks.views.main'),
)

urlpatterns += staticfiles_urlpatterns()
