class ActiveModel {

    constructor(props) {
        this.___props = {};
        this.___validators = {};
        this.___errors = [];
        this.initial && this.initial();
        this.setAttributes(props);
    }

    get collectionName() {
        return '';
    }

    get collection() {
        return Mongo.Collection.get(this.collectionName);
    }

    setAttributes(props) {
        props && _.isObject(props) && _.each(props, (v, k) => {
            if(this.hasOwnProperty(k)) this[k] = v
        });
    }

    get attributes() {

    }
}