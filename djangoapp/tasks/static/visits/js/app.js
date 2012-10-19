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
      route: '/:personName',

      connectOutlets: function(router, context) {
        router.get('applicationController').connectOutlet('person', context);
      },

      serialize: function(router, context){
        return {
          personName: context.get('name')
        }
      },

      deserialize: function(router, urlParams) {
        return App.Person.find({name: urlParams.personName});
      }
    })
  })
});

// Ember-data store using the Django Tastypie adapter
App.store = DS.Store.create({
  revision: 6,
  adapter: DS.DjangoTastypieAdapter.create()
});

// Models
App.Person = DS.Model.extend({
  name: DS.attr('string')
});

// Start!
App.initialize();






// /**
//  * Defines a customer model. Attribute names match the ones in the
//  * server. It also allows for local attributes that are not
//  * commited (isDone) as well as computed synchronized properties
//  * (visitText).
//  */
// App.Customer = DS.Model.extend({
//   name: DS.attr('string'),
//   dateNextVisit: DS.attr('string'),
//   typeNextVisit: DS.attr('string'),
//   isDone: DS.attr('boolean'),
//   visitLogs: DS.hasMany('App.VisitLog'),

//   visitText: Em.computed(function(){
//     return this.get('name') + " (" +
//       this.get('dateNextVisit') + " - " +
//       this.get('typeNextVisit') + ")";
//   }).property('name', 'dateNextVisit', 'typeNextVisit')
// });


// /**
//  * Defines a VisitLog model. A dummy piece of information to
//  * work with "related models"
//  */
// App.VisitLog = DS.Model.extend({
//   visitDate: DS.attr('string'),
//   visitType: DS.attr('string'),
//   customer: DS.belongsTo('App.Customer')
// });


// /**
//  * The main application controller. Provides an interface
//  * for the views to interact with the models
//  */
// App.customerController = Em.ArrayController.create({
//   content: App.store.findAll(App.Customer),
//   //content: null,

//   selectedCustomer: undefined,

//   noEditable: Em.computed(function(){
//     return (this.get('selectedCustomer') === undefined);
//   }).property('selectedCustomer'),

//   createCustomer: function(name){
//     if (this.getCustomer(name) === null) {
//       var customer = App.store.createRecord(App.Customer, { name: name });
//       App.store.commit();
//     } else {
//       alert("That customer already exists");
//     }
//   },

//   getCustomer: function(name){
//     for(var i=0;i<this.content.length;i++){
//       if (name===this.content.get(i).name){
//         return this.content.get(i);
//       }
//     }
//     return null;
//   },

//   visitsTodo: Em.computed(function(){
//     var table = this.filter(function(item, index, self){
//       if (item.get('dateNextVisit') !== null && item.get('dateNextVisit') !== "") {
//         return true;
//       }
//     });
//     return Em.A(table);
//   }).property('@each.dateNextVisit'),

//   clearDoneVisits: function(){
//     this.forEach(function(item, index, self){
//       if (item.get('isDone')) {
//         var visitLog = App.store.createRecord(App.VisitLog, {
//           visitDate: item.get('dateNextVisit'),
//           visitType: item.get('typeNextVisit'),
//           customer: item
//         });
//         item.set('isDone', false);
//         item.set('dateNextVisit', '');
//         item.set('typeNextVisit', '');
//       }
//     });
//     App.store.commit();
//   },

//   saveChanges: function(){
//     App.store.commit();
//   }
// });


// /**
//  * A mini-controller that provides VisitLogs specific functionality
//  */
// App.visitLogController = Em.ArrayController.create({
//   content: [],
//   selectedCustomerBinding: Em.Binding.oneWay('App.customerController.selectedCustomer'),
//   filteredContent: Em.observer(function(){
//     var customer = this.get('selectedCustomer');
//     if (customer !== undefined){
//       this.set('content', customer.get('visitLogs'));
//     }
//   }, 'selectedCustomer')
// });


// /**
//  * View to create a new customer
//  */
// App.CreateCustomerView = Em.TextField.extend({
//   placeholder: "Add new customers",
//   insertNewline: function() {
//     var value = this.get('value');
//     if (value) {
//       App.customerController.createCustomer(value);
//       this.set('value', '');
//     }
//   }
// });


// /**
//  * View to mark visits as done and create their logs
//  */
// App.MarkAsDoneView = Em.Button.extend({
//   classBinding: 'isActive',
//   target: 'App.customerController',
//   action: 'clearDoneVisits',
//   template: Em.Handlebars.compile('Set marked visits as done')

// });


// /**
//  * A list of the pending visits to do
//  */
// App.VisitsTodoView = Em.CollectionView.extend({
//   contentBinding: Em.Binding.oneWay('App.customerController.visitsTodo'),
//   itemViewClass: Em.Checkbox.extend({
//     titleBinding: 'content.visitText',
//     valueBinding: 'content.isDone'
//   })
// });


// /**
//  * The list of customers
//  */
// App.CustomersView = Em.CollectionView.extend({
//   contentBinding: 'App.customerController.content',
//   tagName: "ul",
//   selectedCustomerBinding: 'App.customerController.selectedCustomer',

//   //NOTE Formerly known as itemView
//   itemViewClass: Em.View.extend({
//     classNames: ['customer'],
//     classNameBindings: ['selected'],
//     selected: Em.computed(function(){
//       if (!!this.get('parentView.selectedCustomer')) {
//           return (this.get('parentView.selectedCustomer.name') === this.get('content.name'));
//       } else {
//           return false;
//       }
//     }).property('parentView.selectedCustomer'),
//     template: Em.Handlebars.compile('{{content.name}}'),
//     mouseDown: function(evt) {
//       this.get('parentView').set('selectedCustomer', this.get('content'));
//     }
//   })
// });


// /**
//  * A generic view to be extended by the TextInputs. Controls that
//  * a customer is selected to allow editing the data
//  */
// App.DetailTextField = Em.TextField.extend({
//   attributeBindings: ['disabled'],
//   disabledBinding: 'App.customerController.noEditable'
// });


// /**
//  * The detail view to add data about the next visit and query
//  * the log of last visits.
//  * It is constructed as a nested container of views to show
//  * this handful ember functionality
//  */
// App.CustomerDetailView = Em.ContainerView.extend({
//   childViews: ['customerInfo', 'dateControl', 'typeControl', 'commitButton', 'visitLog'],
//   customerInfo: Em.View.extend({
//     customerBinding: 'App.customerController.selectedCustomer',
//     template: Em.Handlebars.compile('<label>Customer name: </label>{{customer.name}}')
//   }),
//   dateControl: Em.ContainerView.extend({
//     childViews: ['label', 'input'],
//     label: Em.View.extend({
//       tagName: 'label',
//       template: Em.Handlebars.compile('Next visit date: ')
//     }),
//     input: App.DetailTextField.extend({
//       valueBinding: 'App.customerController*selectedCustomer.dateNextVisit'
//     })
//   }),
//   typeControl: Em.ContainerView.extend({
//     childViews: ['label', 'input'],
//     label: Em.View.extend({
//       tagName: 'label',
//       template: Em.Handlebars.compile('Next visit type: ')
//     }),
//     input: App.DetailTextField.extend({
//       valueBinding: 'App.customerController*selectedCustomer.typeNextVisit'
//     })
//   }),
//   commitButton: Em.Button.extend({
//     classBinding: 'isActive',
//     target: 'App.customerController',
//     action: 'saveChanges',
//     template: Em.Handlebars.compile('Save changes to server')
//   }),
//   visitLog: Em.ContainerView.extend({
//     childViews: ['header', 'visits'],
//     header: Em.View.extend({
//         tagName: "h3",
//         template: Em.Handlebars.compile('Visit Log')
//     }),
//     visits: Em.CollectionView.extend({
//       tagName: "ul",
//       classNames: ['log-list'],
//       contentBinding: 'App.visitLogController.content',
//       itemViewClass: Em.View.extend({
//         classNames: ['visit-log'],
//         template: Em.Handlebars.compile('{{content.visitDate}} - {{content.visitType}}')
//       })
//     })
//   })
// });

// // Loading initial data
// //App.store.findAll(App.VisitLog);

// // View creation
// var createCustomerView = App.CreateCustomerView.create({});
// var customersView = App.CustomersView.create({});
// var markAsDoneView = App.MarkAsDoneView.create({});
// var visitsTodoView = App.VisitsTodoView.create({});
// var customerDetailView = App.CustomerDetailView.create({});

// // Attaching views to the DOM
// createCustomerView.appendTo('#customers-list');
// customersView.appendTo('#customers-list');
// markAsDoneView.appendTo('#visits-panel');
// visitsTodoView.appendTo('#visits-panel');
// customerDetailView.appendTo('#customer-detail');
