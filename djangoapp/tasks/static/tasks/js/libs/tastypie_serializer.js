var get = Ember.get, set = Ember.set;

DS.DjangoTastypieSerializer = DS.RESTSerializer.extend({

  init: function() {
    this._super();

    /* TODO
    this.configure({
      meta: 'meta',
      since: 'next'
    });*/
  },

  getItemUrl: function(meta, id){
    var url;

    url = get(this, 'adapter').rootForType(meta.type);
    return ["", get(this, 'namespace'), url, id, ""].join('/');
  },


  keyForBelongsTo: function(type, name) {
    return this.keyForAttributeName(type, name) + "_id";
  },

  /**
    ASSOCIATIONS: SERIALIZATION
    Transforms the association fields to Resource URI django-tastypie format
  */
  addBelongsTo: function(hash, record, key, relationship) {
    var id,
        related = get(record, relationship.key),
        embedded = this.embeddedType(record.constructor, key);

    if (embedded === 'always') {
      hash[key] = related.serialize();

    } else {
      id = get(related, this.primaryKey(related));

      if (!Ember.isNone(id)) { hash[key] = this.getItemUrl(relationship, id); }
    }
  },

  addHasMany: function(hash, record, key, relationship) {
    var self = this,
        serializedValues = [],
        id = null,
        embedded = this.embeddedType(record.constructor, key);

    key = this.keyForHasMany(relationship.type, key);

    value = record.get(key) || [];

    value.forEach(function(item) {
      if (embedded === 'always') {
        serializedValues.push(item.serialize());
      } else {
        id = get(item, self.primaryKey(item));
        if (!Ember.isNone(id)) {
          serializedValues.push(self.getItemUrl(relationship, id));
        }
      }
    });

    hash[key] = serializedValues;

  },

  /**
    Tastypie adapter does not support the sideloading feature
    */
  extract: function(store, type, payload, id, requestType) {
    this.extractMeta(store, type, payload);

    var specificExtract = "extract" + requestType.charAt(0).toUpperCase() + requestType.substr(1);
    return this[specificExtract](store, type, payload, id, requestType);
  },

  extractMany: function(loader, json, type, records) {
    this.sideload(loader, type, json);
    this.extractMeta(loader, type, json);

    if (json.objects) {
      var objects = json.objects, references = [];
      if (records) { records = records.toArray(); }

      for (var i = 0; i < objects.length; i++) {
        if (records) { loader.updateId(records[i], objects[i]); }
        var reference = this.extractRecordRepresentation(loader, type, objects[i]);
        references.push(reference);
      }

      loader.populateArray(references);
    }
  },

/* TODO
  extractMeta: function(loader, type, json) {
    var meta = this.configOption(type, 'meta'),
        data = json, value;

    if(meta && json[meta]){
      data = json[meta];
    }

    this.metadataMapping.forEach(function(property, key){
      if(value = data[property]){
        loader.metaForType(type, key, value);
      }
    });
  },
*/
  /**
   Tastypie default does not support sideloading
   */
  sideload: function(loader, type, json, root) {

  },

  /**
    ASSOCIATIONS: DESERIALIZATION
    Transforms the association fields from Resource URI django-tastypie format
  */
  _deurlify: function(value) {
    if (typeof value === "string") {
      return value.split('/').reverse()[1];
    } else {
      return value;
    }
  },

  extractHasMany: function(type, hash, key) {
    var value,
      self = this;

    value = hash[key];

    if (!!value) {
      value.forEach(function(item, i, collection) {
        collection[i] = self._deurlify(item);
      });
    }

    return value;
  },

  extractBelongsTo: function(type, hash, key) {
    var value = hash[key];

    if (!!value) {
      value = this._deurlify(value);
    }
    return value;
  },

  resourceUriToId: function (resourceUri){
    return resourceUri.split('/').reverse()[1];
  },

  normalizeRelationships: function (type, hash) {
    var payloadKey, key, self = this;

    type.eachRelationship(function (key, relationship) {
      if (this.keyForRelationship) {
        payloadKey = this.keyForRelationship(key, relationship.kind);
        if (key !== payloadKey) {
          hash[key] = hash[payloadKey];
          delete hash[payloadKey];
        }
      }
      if (hash[key]) {
        if (relationship.kind === 'belongsTo'){
          hash[key] = this.resourceUriToId(hash[key]);
        } else if (relationship.kind === 'hasMany'){
          var ids = [];
          hash[key].forEach(function (resourceUri){
            ids.push(self.resourceUriToId(resourceUri));
          });
          hash[key] = ids;
        }
      }
    }, this);
  },

  normalizePayload: function(type, payload) {
    payload[type.typeKey] = payload.objects;
    delete payload.objects;
    return payload;
  },

  normalizePayloadSingle: function(type, payload) {
    var newPayload = {};
    newPayload[type.typeKey] = payload;
    return newPayload;
  },

  /**
   * The only diference in this method with the official one is calling to
   * normalizePayloadSingle.
   * TODO Send a PR to ember-data to include a normalizePayloadSingle that
   * by default is an alias to normalizePayload
   */
  extractSingle: function(store, primaryType, payload, recordId, requestType) {
    payload = this.normalizePayloadSingle(primaryType, payload);

    var primaryTypeName = primaryType.typeKey,
        primaryRecord;

    for (var prop in payload) {
      var typeName  = this.typeForRoot(prop),
          isPrimary = typeName === primaryTypeName;

      // legacy support for singular resources
      if (isPrimary && Ember.typeOf(payload[prop]) !== "array" ) {
        primaryRecord = this.normalize(primaryType, payload[prop], prop);
        continue;
      }

      var type = store.modelFor(typeName);

      /*jshint loopfunc:true*/
      forEach.call(payload[prop], function(hash) {
        var typeName = this.typeForRoot(prop),
            type = store.modelFor(typeName),
            typeSerializer = store.serializerFor(type);

        hash = typeSerializer.normalize(type, hash, prop);

        var isFirstCreatedRecord = isPrimary && !recordId && !primaryRecord,
            isUpdatedRecord = isPrimary && coerceId(hash.id) === recordId;

        // find the primary record.
        //
        // It's either:
        // * the record with the same ID as the original request
        // * in the case of a newly created record that didn't have an ID, the first
        //   record in the Array
        if (isFirstCreatedRecord || isUpdatedRecord) {
          primaryRecord = hash;
        } else {
          store.push(typeName, hash);
        }
      }, this);
    }

    return primaryRecord;
  },

  relationshipToResourceUri: function (relationship, value){
    if (!value)
      return value;

    var store = relationship.type.store,
        typeKey = relationship.type.typeKey;

    return store.adapterFor(typeKey).buildURL(typeKey, get(value, 'id'));
  },

  serializeIntoHash: function (data, type, record, options) {
    Ember.merge(data, this.serialize(record, options));
  },

  serializeBelongsTo: function (record, json, relationship) {
    this._super.apply(this, arguments);
    var key = relationship.key;
    key = this.keyForRelationship ? this.keyForRelationship(key, "belongsTo") : key;

    json[key] = this.relationshipToResourceUri(relationship, get(record, relationship.key));
  },

  serializeHasMany: function(record, json, relationship) {
    var key = relationship.key,
    attrs = get(this, 'attrs'),
    config = attrs && attrs[key] ? attrs[key] : false;
    key = this.keyForRelationship ? this.keyForRelationship(key, "belongsTo") : key;

    var relationshipType = DS.RelationshipChange.determineRelationshipType(record.constructor, relationship);

    if (relationshipType === 'manyToNone' || relationshipType === 'manyToMany' || relationshipType === 'manyToOne') {
      if (isEmbedded(config)) {
        json[key] = get(record, key).map(function (relation) {
          var data = relation.serialize();
          return data;
        });
      } else {
        json[key] = get(record, relationship.key).map(function (next){
          return this.relationshipToResourceUri(relationship, next);
        }, this);
      }
    }
  }


});

