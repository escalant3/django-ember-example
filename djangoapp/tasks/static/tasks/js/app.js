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
  tasks: DS.hasMany('task', {async: true})
});

App.Task = DS.Model.extend({
  name: DS.attr('string'),
  person: DS.belongsTo('person')
});


// Task controller and view
App.TaskView = Ember.View.extend({
  templateName: 'task',
  init: function() {
    this._super();
  }
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

// Router
App.Router.map(function() {
  this.resource('people');
  this.resource('person', { path: '/people/:person_id' });
  this.resource('task', { path: '/tasks/:task_id' });
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('people');
  }
});

App.PeopleRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('person');
  },
  setupController: function(controller, model) {
    var metadata = this.store.metadataFor('person');
    controller.set('model', model);

    // Show pagination if available
    if (model.get('length') < metadata.total_count) {
      controller.set('paginationInfo',
                     "Showing %@ of %@ people".fmt(model.get('length'), metadata.total_count));
    }
  }
});

App.PeopleController = Ember.ArrayController.extend({
  actions: {
    createPerson: function(name) {
      var person = this.store.createRecord('person', {name: name});

      person.save();

      this.set('newPerson', '');
    }
  }
});

App.PersonController = Ember.ObjectController.extend({
  actions: {
    createTask: function(taskName) {
      var person = this.get('model');
      var task = this.store.createRecord('task', {name: taskName});
      task.set('person', person);

      task.save().then(function(task) {
        person.get('tasks').pushObject(task);
      });

      this.set('newTask', '');
    },

    editPerson: function(person) {
      if (!!person) {
        newName = prompt("Enter new name");
        if (!!newName && newName !== "") {
          // Update a record
          person.set("name", newName);
          person.save();
        }
      }
    },

    deletePerson: function(person) {
      if (!!person) {
        // Delete a record
        person.deleteRecord();
        person.save();
        this.transitionToRoute('people');
      }
    },

    deleteTask: function(task) {
      var taskId;
      var person = this.get('model');

      if (!!task) {
        taskId = task.get('id');

        // Delete a record associated to another one (belongsTo)
        task.deleteRecord();

        task.save().then(function() {
          person.get('tasks').removeObject(task);
        });
      }
    }
  }
});

// Ember-data store using the Django Tastypie adapter
App.ApplicationAdapter = DS.DjangoTastypieAdapter.extend({
  namespace: 'api/v1'
});

App.ApplicationSerializer = DS.DjangoTastypieSerializer.extend({
});

