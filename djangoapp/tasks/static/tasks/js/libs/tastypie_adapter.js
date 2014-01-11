var get = Ember.get, set = Ember.set;

function rejectionHandler(reason) {
  Ember.Logger.error(reason, reason.message);
  throw reason;
}

DS.DjangoTastypieAdapter = DS.RESTAdapter.extend({
  /**
    Set this parameter if you are planning to do cross-site
    requests to the destination domain. Remember trailing slash
  */
  serverDomain: null,

  /**
    This is the default Tastypie namespace found in the documentation.
    You may change it if necessary when creating the adapter
  */
  namespace: "api/v1",

  /**
    Bulk commits are not supported at this time by the adapter.
    Changing this setting will not work
  */
  bulkCommit: false,

  /**
    Tastypie returns the next URL when all the elements of a type
    cannot be fetched inside a single request. Unless you override this
    feature in Tastypie, you don't need to change this value. Pagination
    will work out of the box for findAll requests
  */
  since: 'next',

  /**
    Serializer object to manage JSON transformations
  */
  defaultSerializer: '_djangoTastypie',

  /**
    Create a record in the Django server. POST actions must
    be enabled in the Resource
  */
  createRecord: function(store, type, record) {
    var data,
        root = this.rootForType(type),
        adapter = this;

    data = record.serialize();

    return this.ajax(this.buildURL(root), "POST", {
      data: data
    }).then(function(json){
      adapter.didCreateRecord(store, type, record, json);
    }, function(xhr) {
      adapter.didError(store, type, record, xhr);
      throw xhr;
    }).then(null, rejectionHandler);
  },

  /**
    Edit a record in the Django server. PUT actions must
    be enabled in the Resource
  */
  updateRecord: function(store, type, record) {
    var id, data,
        root = this.rootForType(type),
        adapter = this;

    id = get(record, 'id');
    data = record.serialize();

    return this.ajax(this.buildURL(root, id), "PUT",{
      data: data
    }).then(function(json){
      adapter.didUpdateRecord(store, type, record, json);
    }, function(xhr) {
      adapter.didError(store, type, record, xhr);
      throw xhr;
    }).then(null, rejectionHandler);
  },

  /**
    Delete a record in the Django server. DELETE actions
    must be enabled in the Resource
  */
  deleteRecord: function(store, type, record) {
    var id,
        root = this.rootForType(type),
        adapter = this;

    id = get(record, 'id');

    return this.ajax(this.buildURL(root, id), "DELETE").then(function(json){
      adapter.didDeleteRecord(store, type, record, json);
    }, function(xhr){
      adapter.didError(store, type, record, xhr);
      throw xhr;
    }).then(null, rejectionHandler);
  },

  findMany: function(store, type, ids) {
    var url,
        root = this.rootForType(type),
        adapter = this;

    ids = this.serializeIds(ids);

    // FindMany array through subset of resources
    if (ids instanceof Array) {
      ids = "set/" + ids.join(";") + '/';
    }

    url = this.buildURL(root);
    url += ids;

    this.ajax(url, "GET", {
      success: function(json) {
        this.didFindMany(store, type, json);
      }
    });
    return this.ajax(url, "GET", {
    }).then(function(json) {
      adapter.didFindMany(store, type, json);
    }).then(null, rejectionHandler);
  },

  buildURL: function(record, suffix) {
    var url = this._super(record, suffix);

    // Add the trailing slash to avoid setting requirement in Django.settings
    if (url.charAt(url.length -1) !== '/') {
      url += '/';
    }

    // Add the server domain if any
    if (!!this.serverDomain) {
      url = this.removeTrailingSlash(this.serverDomain) + url;
    }

    return url;
  },

  /**
     The actual nextUrl is being stored. The offset must be extracted from
     the string to do a new call.
     When there are remaining objects to be returned, Tastypie returns a
     `next` URL that in the meta header. Whenever there are no
     more objects to be returned, the `next` paramater value will be null.
     Instead of calculating the next `offset` each time, we store the nextUrl
     from which the offset will be extrated for the next request
  */
  sinceQuery: function(since) {
    var offsetParam,
        query;

    query = {};

    if (!!since) {
      offsetParam = since.match(/offset=(\d+)/);
      offsetParam = (!!offsetParam && !!offsetParam[1]) ? offsetParam[1] : null;
      query.offset = offsetParam;
    }

    return offsetParam ? query : null;
  },

  removeTrailingSlash: function(url) {
    if (url.charAt(url.length -1) === '/') {
      return url.slice(0, -1);
    }
    return url;
  },

  /**
    django-tastypie does not pluralize names for lists
  */
  pathForType: function(type) {
    return type;
  }
});
