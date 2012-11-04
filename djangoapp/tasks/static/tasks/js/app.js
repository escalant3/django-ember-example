/*
 * A dummy application with Ember.js and Django
 *
 * It can be used as skeleton to develop more complex apps.
 *
 * I created this app as a proof of concept to test a REST
 * client using ember-data that connects to a REST server
 * provided by Django Tastypie. This app is mainly useful
 * to test the DjangoTastypieAdapter.
 */


// Application namespace
var App = Ember.Application.create();

// Models
App.Person = DS.Model.extend({
  name: DS.attr('string'),
  tasks: DS.hasMany('App.Task')
});

App.Task = DS.Model.extend({
  name: DS.attr('string'),
  person: DS.belongsTo('App.Person'),
  tags: DS.hasMany('App.Tags')
});

App.Tag = DS.Model.extend({
  name: DS.attr('string'),
  task: DS.belongsTo('App.Task')
});

// Application root view
App.ApplicationView = Ember.View.extend({
  templateName: 'application'
});

// Application main controller (main view rendering context)
App.ApplicationController = Ember.Controller.extend();

// People controller and view
App.PeopleController = Ember.ArrayController.extend();
App.PeopleView = Ember.View.extend({
  templateName: 'people'
});

// Person controller and view
App.PersonView = Ember.View.extend({
  templateName: 'person'
});
App.PersonController = Ember.ObjectController.extend();

// Task controller and view
App.TaskView = Ember.View.extend({
  templateName: 'task',
  init: function() {
    this._super();

    Em.set(this, 'context.availableTags', App.Tag.find());
  }
});
App.TaskController = Ember.ObjectController.extend({
});

// Create new person view
App.CreatePersonView = Em.TextField.extend({
  placeholder: "Add new people",
  insertNewline: function() {
    var value = this.get('value');
    if (value) {
      App.Person.createRecord({name: value});
      App.store.commit();
      this.set('value', '');
    }
  }
});

App.CreateTaskView = Em.TextField.extend({
  placeholder: "Add a new task",
  insertNewline: function() {
    var value,
        person,
        task;

    value = this.get('value');
    person = this.get('person');
    if (!!value && !!person) {
      task = App.Task.createRecord({name: value});
      task.set('person', person);
      App.store.commit();
      this.set('value', '');
    }
  }
});

App.ToggleTagView = Em.View.extend({
  tagName: "span",
  classNames: ["label", "label-info"],
  click: function(a, b, c) {
    var tag,
        task;

    tag = this.get('content');
    task = this.get('task');

    Em.get(task, 'tags').pushObject(tag);
    App.store.commit();
  }
});

App.CreateTagView = Em.TextField.extend({
  placeholder: "Add a new tag",
  insertNewline: function() {
    value = this.get('value');

    if (!!value) {
      App.Tag.createRecord({name: value});
      App.store.commit();
      this.set('value', '');
    }
  }
});

// The router is the main component of the application
App.Router = Ember.Router.extend({
  enableLogging: true,

  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/',

      showPerson: Ember.Route.transitionTo('person'),

      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('people', App.Person.find());
      }
    }),

    person: Ember.Route.extend({
      route: '/person/:personId',

      showTask: Ember.Route.transitionTo('task'),

      editPerson: function(router, event) {
        var newName,
            person;

        person = router.get('personController.content');

        if (!!person) {
          newName = prompt("Enter new name");
          if (!!newName && newName !== "") {
            // Update a record
            person.set("name", newName);
            App.store.commit();
          }
        }
      },

      deletePerson: function(router, event) {
        var person;

        person = router.get('personController.content');

        if (!!person) {
          // Delete a record
          person.deleteRecord();
          App.store.commit();
          router.transitionTo('index');
        }
      },

      deleteTask: function(router, event) {
        var task;

        task = event.context;

        if (!!task) {
          // Delete a record associated to another one (belongsTo)
          task.deleteRecord();
          App.store.commit();
        }
      },


      connectOutlets: function(router, context) {
        router.get('applicationController').connectOutlet('person', context);
      },

      serialize: function(router, context){
        return {
          personId: context.get('id')
        };
      },

      deserialize: function(router, urlParams) {
        return App.Person.find(urlParams.personId);
      }
    }),

    task: Em.Route.extend({
      route: "/task/:taskId",

      backToPerson: Ember.Route.transitionTo('person'),

      connectOutlets: function(router, context) {
        router.get("applicationController").connectOutlet('task', context);
      },

      serialize: function(router, context) {
        return {
          taskId: context.get('id')
        };
      },

      deserialize: function(router, urlParams) {
        return App.Task.find(urlParams.taskId);
      }
    })
  })
});

// Ember-data store using the Django Tastypie adapter
App.store = DS.Store.create({
  revision: 7,
  adapter: DS.DjangoTastypieAdapter.create()
});

// Start!
App.initialize();
