django-ember-example
====================

:synopis: A dummy application following the MVC pattern with Ember.js

It can be used as skeleton to develop more complex apps.

I created this app as a proof of concept to test a REST
client using ember-data_ that connects to a REST server
provided by Django Tastypie. This app is mainly useful
to test the DjangoTastypieAdapter_.

Installation
------------

    $ pip install -r requirements.txt

    $ cd djangoapp

    $ python manage.py syncdb

    $ python manage.py runserver

Usage
-----
The goal of this app is testing several kinds of ember-data synchronization
with a Django REST server:
    * Adding new users with the text input commits automatically
    * Editing detail properties keep changes in the store memory till
      the "save changes" button is pressed
    * Marking done visits will both edit and create content commiting it

Ember.js
--------
If you just want to check the ember.js code, check it out at app.js_

.. _DjangoTastypieAdapter: https://github.com/escalant3/ember-data-tastypie-adapter
.. _ember-data: https://github.com/emberjs/data
.. _app.js: https://github.com/escalant3/django-ember-example/blob/master/djangoapp/tasks/static/tasks/js/app.js
