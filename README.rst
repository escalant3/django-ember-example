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


.. _DjangoTastypieAdapter: https://github.com/escalant3/data/blob/master/packages/ember-data/lib/adapters/tastypie-adapter.js
.. _ember-data: https://github.com/emberjs/data
