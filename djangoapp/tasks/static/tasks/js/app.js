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
  }
});


App.PersonController = Ember.ObjectController.extend({
  editPerson: function(person) {
    if (!!person) {
      newName = prompt("Enter new name");
      if (!!newName && newName !== "") {
        // Update a record
        person.set("name", newName);
        App.store.commit();
      }
    }
  },

  deletePerson: function(person) {
    if (!!person) {
      // Delete a record
      person.deleteRecord();
      App.store.commit();
      this.transitionToRoute('people');
      }
  },

  deleteTask: function(task) {
    if (!!task) {
      // Delete a record associated to another one (belongsTo)
      task.deleteRecord();
      App.store.commit();
    }
  },

  actions: {
    createTask: function(taskName) {
      var person = this.get('model');
      task = this.store.createRecord('task', {name: taskName});
      task.set('person', person);
      task.save().then(function(task) {
        person.get('tasks').pushObject(task);
      });
      this.set('newTask', '');
    }
  }

});

// Ember-data store using the Django Tastypie adapter
App.ApplicationAdapter = DS.DjangoTastypieAdapter.extend({
  namespace: 'api/v1'
});

App.ApplicationSerializer = DS.DjangoTastypieSerializer.extend({
});

