/**
 * Licensed to ohmage under one or more contributor license agreements. See the
 * NOTICE file distributed with this work for additional information regarding
 * copyright ownership. The ohmage team licenses this file to you under the
 * Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License
 * with this source code or at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * <p>A Concordia object has one constructor which takes a schema and validates
 * it. If it fails validation, an exception will be thrown.</p>
 * 
 * <p>There is one public function, which is validateData(data). 'data' must be
 * a JSON object or a JSON array or a string representing one of the two. If
 * the data is not valid, an exception will be thrown; otherwise, the function 
 * will return the valid JSON object or JSON array.</p>
 * 
 * <p>An example example definition would be:</p>
 * 
 * <code>
 * {
 *     "type":"object",
 *     "doc":"Valid data for this definition must be an object.",
 *     "schema":[
 *         {
 *             "name":"myNumber",
 *             "type":"number",
 *             "doc":"This object has one field whose key is \"myNumber\" and
 *                    whose value must be a valid JSON number type."
 *         }
 *     ]
 * }
 * </code>
 * 
 * <h4>Extending Type and Data Validation</h4>
 * <h5>Extending Type Validation</h5>
 * <p>Schema type validation can be extended through a 
 * validateSchemaExtension{TYPE} function. For example, to add a custom
 * extension to the number type, you would first create the custom validation
 * function. This function will get one parameter which is the JSON object that
 * is part of the definition defining this type, e.g.</p>
 * 
 * <code>
 * {
 *     "type":"octalDigit",
 *     "doc":"A single octal digit."
 *     "min":0,
 *     "max":7
 * }
 * </code>
 * 
 * <p>Then, the custom code that would enforce this extension may look like:
 * </p>
 * 
 * <code>
 * function customNumberTypeExtension(obj) {
 *     var min = obj['min'];
 *     if ((min === null) ||
 *         (Object.prototype.toString.call(min) !== "undefined")) {
 *         
 *         throw "The 'min' value is missing.";
 *     }
 *     else if (Object.prototype.toString.call(min) !== "[object Number]") {
 *         throw "The 'min' value is not a number.";
 *     }
 *     
 *     var max = obj['max'];
 *     if ((max === null) ||
 *         (Object.prototype.toString.call(max) === "undefined")) {
 *         
 *         throw "The 'max' value is missing.";
 *     }
 *     else if (Object.prototype.toString.call(max) !== "[object Number]") {
 *         throw "The 'max' value is not a number.";
 *     }
 * }
 * </code>
 * 
 * <p>Finally, this function is added to the Concordia prototype to ensure that
 * it will be executed when new Concordia objects are created.</p>
 * 
 * <code>
 * Concordia.prototype.validateSchemaExtensionNumber = 
 *     customNumberTypeExtension;
 * </code>
 * 
 * <p>Extensions can always been cleaned up by deleting them, e.g.</p>
 * 
 * <code>
 * delete Concordia.prototype.validateSchemaExtensionNumber;
 * </code>
 * 
 * <h5>Extending Data Validation</h5>
 * <p>Additionally, custom validators for the data may be added in a similar
 * way. Continuing the example above, a valid data point may look like:</p>
 * 
 * <code>
 * {
 *     "octalDigit":3
 * }
 * </code>
 * 
 * <p>The custom code that would be run when the data was being validated is
 * named similarly, validateDataExtension{TYPE}. The custom function will take
 * two arguments, the first is the part of the schema that corresponds to this
 * piece of the data and the second is the specific portion of the data to be
 * evaluated.</p>
 * 
 * <p>For example, given the following schema:</p>
 * 
 * <code>
 * {
 *     "type":"object",
 *     "doc":"An object with two fields, a number and a string.",
 *     "schema":[
 *         {
 *             "name":"myNumber",
 *             "type":"number",
 *             "doc":"A number field."
 *         },
 *         {
 *             "name":"myString",
 *             "type":"string",
 *             "doc":"A string field."
 *         }
 *     ]
 * }
 * </code>
 * 
 * <p>And the following data point:</p>
 * 
 * <code>
 * {
 *     "myNumber":9,
 *     "myString":"foo"
 * }
 * </code>
 * 
 * <p>The following function which extends the data validation for number types
 * would receive the parameters:</p>
 * 
 * <h6>schema</h6>
 * <code>
 * {
 *     "name":"myNumber",
 *     "type":"number",
 *     "doc":"A number field."
 * }
 * </code>
 * 
 * <h6>data</h6>
 * <code>
 * 9
 * </code>
 * 
 * <h6>Code</h6>
 * <code>
 * function customNumberDataExtension(schema, data) {
 *     // Because the schema is stored within the object it should never be
 *     // modified, so it can safely be assumed that the 'min' and 'max' fields
 *     // that were validated during schema validation will still be present.
 *     var min = schema['min'];
 *     var max = schema['max'];
 *     
 *     // Because the type of the data has already been validated, it can
 *     // safely be assumed that the data is at least of the valid type.
 *     // NOTE: If the field is marked as 'optional', this value may be 'null'
 *     // or 'undefined', which must be checked.
 *     var value = data['octalDigit'];
 *     
 *     // Now, the business logic of this validation ensures that the value is
 *     // valid.
 *     if (value < min) {
 *         throw "The data is invalid because its value is less than the " +
 *                 'min' (" +
 *                 min +
 *                 "): " +
 *                 data;
 *     }
 *     if (value > max) {
 *         throw "The data is invalid because its value is greater than the " +
 *                 'max' (" +
 *                 max +
 *                 "): " +
 *                 data;
 *     }
 * }
 * </code>
 * 
 * <p>And, to add it to Concordia:</p>
 * 
 * <code>
 * Concordia.prototype.validateDataExtensionNumber = customNumberDataExtension;
 * </code>
 * 
 * <h4>Referencing Schemas</h4>
 * <h5>Explanation</h5>
 * <p>Concordia schemas may reference external schemas using IETF's JSON
 * Reference RFC draft. Only objects and arrays may reference external schemas.
 * </p>
 * 
 * <p>The reference definition will be part of the list of the fields list. 
 * When a {@link Concordia#KEYWORD_REFERENCE} tag is given, the "name" field
 * becomes optional and the "type" field becomes unused.</p>
 * <ul>
 *   <li>If it is not given, the referenced schema must have a root type of
 *     "object", and the fields of that referenced object will be incorporated
 *     into this local schema definition.</li>
 *   <li>If the "name" field is given, the definition will completely define
 *     the data for that field.</li>
 * </ul>
 * 
 * <h5>Objects</h5>
 * <h6>Field Aggregation</h6>
 * <p>For example, if we had a local schema like:</p>
 * 
 * <code>
 * {
 *     "type":"object",
 *     "schema":[
 *         {
 *             "name":"localField",
 *             "type":"number"
 *         },
 *         {
 *             "$ref":"http://localhost/"
 *         }
 *     ]
 * }
 * </code>
 * 
 * <p>The remote schema's root type must be "object"; its fields will be
 * incorporated. Imagine this is our remote schema:</p>
 * 
 * <code>
 * {
 *     "doc":"This type must be 'object'.",
 *     "type":"object",
 *     "schema":[
 *         {
 *             "name":"remoteField",
 *             "type":"string"
 *         }
 *     ]
 * }
 * </code>
 * 
 * <p>An example of valid data for the local schema would be:</p>
 * 
 * <code>
 * {
 *     "localField":0,
 *     "remoteField":"foo"
 * }
 * </code>
 * 
 * <p>Because the names are merged together, the local schema's local field
 * names cannot overlap with the remote schemas root fields.</p>
 * 
 * <h6>Sub-Definition</h6>
 * <p>For example, if we had a local schema like:</p>
 * 
 * <code>
 * {
 *     "type":"object",
 *     "schema":[
 *         {
 *             "name":"localField",
 *             "type":"number"
 *         },
 *         {
 *             "name":"localSubObject",
 *             "$ref":"http://localhost/"
 *         }
 *     ]
 * }
 * </code>
 * 
 * <p>The remote schema may be anything as it will just be its own entity in
 * the definition. An example could be:</p>
 * 
 * <code>
 * {
 *     "type":"array",
 *     "schema":{
 *         "type":"number"
 *     }
 * }
 * </code>
 * 
 * <p>And, example data would look like:</p>
 * 
 * <code>
 * {
 *     "localField":0,
 *     "localSubObject":[
 *         1,
 *         2,
 *         3
 *     ]
 * }
 * </code>
 * 
 * <h5>Arrays</h5>
 * <p>Because arrays define each of their components independently of one
 * another, there is no requirement on the referenced schema.</p>
 * 
 * @author John Jenkins
 */
function Concordia(schema) {
    'use strict';

    // An anonymous function is used to create the internals of the class and
    // prevent those functions and data from being exposed.
    (function (concordia) {
        // The Concordia keywords.
        var KEYWORD_TYPE = "type"
          , KEYWORD_OPTIONAL = "optional"
          , KEYWORD_DOC = "doc"
          , KEYWORD_SCHEMA = "schema"
          , KEYWORD_NAME = "name"
          , KEYWORD_REFERENCE = "$ref"
          , KEYWORD_CONCORDIA = "$concordia"

        // The Concordia types.
          , TYPE_BOOLEAN = "boolean"
          , TYPE_NUMBER = "number"
          , TYPE_STRING = "string"
          , TYPE_OBJECT = "object"
          , TYPE_ARRAY = "array"

        // The JavaScript types.
          , JS_TYPE_BOOLEAN = "[object Boolean]"
          , JS_TYPE_NUMBER = "[object Number]"
          , JS_TYPE_STRING = "[object String]"
          , JS_TYPE_OBJECT = "[object Object]"
          , JS_TYPE_ARRAY = "[object Array]"
          , JS_TYPE_FUNCTION = "[object Function]";
        
        /**
         * Apparently, indexOf is a little non-standard, so we offer an
         * implementation if it doesn't already exist.
         */
        if (! Array.prototype.indexOf) {
            Array.prototype.indexOf =
                function(value) {
                    for(var i = 0; i < this.length; i++) {
                        if(this[i] === value) {
                            return i;
                        }
                    }
                    return -1;
                };
        }

        // Predefine the recursive functions to allow them to be referenced
        // before they are defined.
        function validateSchemaChild(obj) {}
        function validateDataChild(schema, data) {}
        
        /**
         * <p>Retrieves a remote schema definition if the corresponding key
         * exists, validates that the remote schema is valid by creating a
         * Concordia object from it, and stores that Concordia object with the
         * original reference object.</p>
         * 
         * <p>The key to use to reference a remote schema is
         * {@link #KEYWORD_REFERENCE} and the value of that key must be a URL
         * string that can be used to retrieve the schema. The decomposed
         * object is then stored back in the original object under the key
         * {@link #KEYWORD_CONCORDIA}. Note that this means that anything that
         * was previously stored under this key will be overridden, so it is
         * advised to never use that key.</p>
         * 
         * @param obj The object that may be a remote reference to a schema.
         * 
         * @param requiredType The type that the root of the remote schema must
         *                     be in order to be compatible with this schema.
         */
        function getRemoteSchema(obj, requiredType) {
            // Attempt to get the reference string from the object.
            var ref = obj[KEYWORD_REFERENCE];
            // If the value is JSON null, throw an exception indicating that.
            if (ref === null) {
                throw "The '" +
                        KEYWORD_REFERENCE +
                        "' field for the JSON object is null, which is not " +
                        "allowed: " +
                        JSON.stringify(obj);
            }
            var refType = typeof ref;
            // If the reference field is missing, return.
            if (refType === "undefined") {
                return;
            }
            // If the reference field does exist but it isn't a string, that is
            // an error.
            if (Object.prototype.toString.call(ref) !== JS_TYPE_STRING) {
                throw "The '" +
                        KEYWORD_REFERENCE +
                        "' field for the JSON object is not a string, which " +
                        "it must be to reference an external schema: " +
                        JSON.stringify(obj);
            }
            
            // Get the referenced schema.
            var subSchemaRequest = new XMLHttpRequest();
            subSchemaRequest.open("GET", ref, false);
            subSchemaRequest.send(null);
            
            // Verify that the request succeeded.
            if(subSchemaRequest.status !== 200) {
                throw "The sub-schema could not be retrieved (" +
                        subSchemaRequest.status +
                        "): " +
                        subSchemaRequest.responseText;
            }
            
            // Get the response text.
            var subSchemaString = subSchemaRequest.responseText;
            if ((subSchemaString === null) || 
                (subSchemaString === "")) {
                
                throw "The sub-schema was not returned from the remote " +
                		"location: " +
                        ref;
            }
            
            // Create a Concordia object from this remote Concordia schema.
            var subSchema = new Concordia(subSchemaString);
            subSchema.validateData = validateDataNoCheck;
            
            // If given a required root type, verify that the root type of the
            // sub-schema is that type.
            if ((requiredType !== null) &&
                (subSchema[KEYWORD_SCHEMA][KEYWORD_TYPE] !== requiredType)) {
                
                throw "The sub-schema must have a root type of '" +
                        requiredType +
                        "'. Instead, it had a root type of '" +
                        subSchema[KEYWORD_SCHEMA][KEYWORD_TYPE] +
                        "': " +
                        JSON.stringify(subSchema[KEYWORD_SCHEMA]);
            }
            
            // Store the sub-schema in this object alongside the reference.
            obj[KEYWORD_CONCORDIA] = subSchema;
        }
        
        /**
         * Validates a JSON object whose "type" has already been determined to
         * be "boolean". There are no other requirements for the "boolean" 
         * type.
         * 
         * @param obj The JSON object to validate.
         */
        function validateSchemaBoolean(obj) {
            // Check if any additional properties were added to this type.
            var extensionType = 
                Object
                    .prototype
                        .toString
                            .call(
                                Concordia
                                    .prototype.validateSchemaExtensionBoolean);
            if (extensionType === JS_TYPE_FUNCTION) {
                Concordia.prototype.validateSchemaExtensionBoolean(obj);
            }
        }
        
        /**
         * Validates that the data is a boolean or, if it is 'null' or missing,
         * that the field is optional.
         * 
         * @param schema The Schema to use to validate the data.
         * 
         * @param data The data to validate.
         */
        function validateDataBoolean(schema, data) {
            // If the data is not present or 'null', ensure that it is 
            // optional.
            if (data === null) {
                if (! schema[KEYWORD_OPTIONAL]) {
                    throw "The data is null and not optional.";
                }
            }
            // If the data is present, ensure that it is a boolean.
            else if (Object.prototype.toString.call(data) !== JS_TYPE_BOOLEAN) {
                throw "The value is not a boolean: " + JSON.stringify(data);
            }
            
            // Check if custom validation code is present.
            var extensionType = 
                Object
                    .prototype
                        .toString
                            .call(
                                Concordia
                                    .prototype.validateDataExtensionBoolean);
            if (extensionType === JS_TYPE_FUNCTION) {
                Concordia.prototype.validateDataExtensionBoolean(schema, data);
            }
        }
        
        /**
         * Validates a JSON object whose "type" has already been determined to
         * be "number". There are no other requirements for the "number" type.
         * 
         * @param obj The JSON object to validate.
         */
        function validateSchemaNumber(obj) {
            // Check if any additional properties were added to this type.
            var extensionType = 
                Object
                    .prototype
                        .toString
                            .call(
                                Concordia
                                    .prototype.validateSchemaExtensionNumber);
            if (extensionType === JS_TYPE_FUNCTION) {
                Concordia.prototype.validateSchemaExtensionNumber(obj);
            }
        }
        
        /**
         * Validates that the data is a number or, if it is 'null' or missing,
         * that the field is optional. 
         * 
         * @param schema The schema to use to validate the data.
         * 
         * @param data The data to validate.
         */
        function validateDataNumber(schema, data) {
            // If the data is not present or 'null', ensure that it is
            // optional.
            if (data === null) {
                if (! schema[KEYWORD_OPTIONAL]) {
                    throw "The data is null and not optional.";
                }
            }
            // If the data is present, ensure that it is a number.
            else if (Object.prototype.toString.call(data) !== JS_TYPE_NUMBER) {
                throw "The value is not a number: " + JSON.stringify(data);
            }
            
            // Check if custom validation code is present.
            var extensionType = 
                Object
                    .prototype
                        .toString
                            .call(
                                Concordia
                                    .prototype.validateDataExtensionNumber);
            if (extensionType === JS_TYPE_FUNCTION) {
                Concordia.prototype.validateDataExtensionNumber(schema, data);
            }
        }
        
        /**
         * Validates a JSON object whose "type" has already been determined to
         * be "string". There are no other requirements for the "string" type.
         * 
         * @param obj The JSON object to validate.
         */
        function validateSchemaString(obj) {
            // Check if any additional properties were added to this type.
            var extensionType = 
                Object
                    .prototype
                        .toString
                            .call(
                                Concordia
                                    .prototype.validateSchemaExtensionString);
            if (extensionType === JS_TYPE_FUNCTION) {
                Concordia.prototype.validateSchemaExtensionString(obj);
            }
        }
        
        /**
         * Validates that the data is a string or, if it is 'null' or missing,
         * that the field is optional.
         */
        function validateDataString(schema, data) {
            // If the data is not present or 'null', ensure that it is 
            // optional.
            if (data === null) {
                if (! schema[KEYWORD_OPTIONAL]) {
                    throw "The data is null and not optional.";
                }
            }
            // If the data is present, ensure that it is a string.
            else if (Object.prototype.toString.call(data) !== JS_TYPE_STRING) {
                throw "The data is not a string: " + JSON.stringify(data);
            }
            
            // Check if custom validation code is present.
            var extensionType = 
                Object
                    .prototype
                        .toString
                            .call(
                                Concordia
                                    .prototype.validateDataExtensionString);
            if (extensionType === JS_TYPE_FUNCTION) {
                Concordia.prototype.validateDataExtensionString(schema, data);
            }
        }
        
        /**
         * Validates a JSON object whose "type" has already been determined to
         * be "object". The "object" type requires a "schema" field whose value
         * is a JSON array of JSON objects. Each JSON object defines a field in
         * the data that conforms to this schema; therefore, each JSON object
         * must have a "name" field whose value will be the key in the data.
         * Each JSON object must also define a type.
         * 
         * @param obj The JSON object to validate.
         */
        function validateSchemaObject(obj) {
            var schema = obj[KEYWORD_SCHEMA]
              , schemaType
              , i
              , field
              , fieldNames
              , name
              , nameType
              , extensionType;
            
            // Verify the schema isn't null.
            if (schema === null) {
                throw "The '" + 
                        KEYWORD_SCHEMA + 
                        "' field's value is null: " + 
                        JSON.stringify(obj);
            }
            // Verify that the schema is present and is a JSON array.
            schemaType = typeof schema;
            if (schemaType === "undefined") {
                throw "The '" + 
                        KEYWORD_SCHEMA + 
                        "' field is missing: " + 
                        JSON.stringify(obj);
            }
            if (Object.prototype.toString.call(schema) !== JS_TYPE_ARRAY) {
                throw "The '" +
                        KEYWORD_SCHEMA +
                        "' field's value must be a JSON array: " + 
                        JSON.stringify(obj);
            }
            
            // The list of field names needs to be initialized.
            fieldNames = [];
            
            // For each of the JSON objects, verify that it has a name and a
            // type.
            for (i = 0; i < schema.length; i += 1) {
                field = schema[i];
                // Verify that the index isn't null.
                if (field === null) {
                    throw "The element at index " + 
                            i + 
                            " of the '" +
                            KEYWORD_SCHEMA +
                            "' field is null: " + 
                            JSON.stringify(obj);
                }
                // Verify that the index is a JSON object and not an array.
                if (Object.prototype.toString.call(field) !== JS_TYPE_OBJECT) {
                    throw "The element at index " + 
                            i + 
                            " of the '" +
                            KEYWORD_SCHEMA +
                            "' field is not a JSON object: " + 
                            JSON.stringify(obj);
                }

                // Verify that the JSON object contains a "name" field and that
                // it's not null.
                name = field[KEYWORD_NAME];
                if (name === null) {
                    throw "The '" +
                            KEYWORD_NAME +
                            "' field for the JSON object at index " + 
                            i + 
                            " is null: " + 
                            JSON.stringify(obj);
                }
                // Verify that the "name" or "$ref" fields exist. 
                nameType = typeof name;
                if (nameType === "undefined") {
                    // If the "name" field didn't exist, attempt to retrieve a
                    // remote schema.
                    try {
                        getRemoteSchema(field, TYPE_OBJECT);
                    }
                    // If decoding threw an exception, prepend the index of the
                    // failed schema.
                    catch(e) {
                        throw "The referenced schema was invalid at index " +
                                i +
                                ": " +
                                e.toString();
                    }
                    
                    // If a remote schema was not added, then throw an
                    // exception regarding the missing "name" field.
                    if ((field[KEYWORD_CONCORDIA] === null) ||
                        (typeof field[KEYWORD_CONCORDIA] === "undefined")) {
                        
                        throw "The '" +
                                KEYWORD_NAME +
                                "' field for the JSON object at index " + 
                                i + 
                                " is misisng: " + 
                                JSON.stringify(obj);
                    }
                }
                // If the "name" field does exist, it must be a string.
                else if (Object.prototype.toString.call(name) !== JS_TYPE_STRING) {
                    throw "The type of the '" +
                            KEYWORD_NAME +
                            "' field for the JSON object at index " + 
                            i + 
                            " is not a string: " + 
                            JSON.stringify(obj);
                }
                // Validate the field.
                else {
                    // Verifies that no field with that name already exists.
                    if (fieldNames.indexOf(name) !== -1) {
                        throw "The field '" +
                                name +
                                "' is defined multiple times: " +
                                JSON.stringify(obj);
                    }
                    // Add this field to the list of fields.
                    else {
                        fieldNames.push(name);
                    }
                    
                    // The reference field overshaddows the name field, so we
                    // first attempt to get the remote schema.
                    try {
                        getRemoteSchema(field, null);
                    }
                    // If decoding threw an exception, prepend the index of the
                    // failed schema.
                    catch(e) {
                        throw "The referenced schema was invalid at index " +
                                i +
                                ": " +
                                e.toString();
                    }

                    // If a remote schema was not added, then attempt to
                    // recurse looking for the "type".
                    if ((field[KEYWORD_CONCORDIA] === null) ||
                        (typeof field[KEYWORD_CONCORDIA] === "undefined")) {
                        
                        // Validates the type of this field.
                        validateSchemaChild(field);
                    }
                }
            }
            
            // Check if any additional properties were added to this type.
            extensionType = 
                Object
                    .prototype
                        .toString
                            .call(
                                Concordia
                                    .prototype.validateSchemaExtensionObject);
            if (extensionType === JS_TYPE_FUNCTION) {
                Concordia.prototype.validateSchemaExtensionObject(obj);
            }
        }
        
        /**
         * Validates that the data is a JSON object or, if the data is 'null'
         * or missing, that it is optional.
         * 
         * @param schema The schema to use to validate the data.
         * 
         * @param data The data to validate.
         */
        function validateDataObject(schema, data) {
            var i
              , schemaFields
              , schemaField
              , name
              , subSchema
              , dataField
              , dataFieldType
              , extensionType;
            
            // If the data is not present or 'null', ensure that it is 
            // optional.
            if (data === null) { 
                if (! schema[KEYWORD_OPTIONAL]) {
                    throw "The data is not optional.";
                }
                else {
                    return;
                }
            }
            
            // Ensure that it is an object.
            if (Object.prototype.toString.call(data) !== JS_TYPE_OBJECT) {
                throw "The data is not a JSON object: " + JSON.stringify(data);
            }
            
            // For each index in the object's "schema" field,
            schemaFields = schema[KEYWORD_SCHEMA];
            for (i = 0; i < schemaFields.length; i += 1) {
                // Get this index, which is a JSON object that contains the
                // type schema.
                schemaField = schemaFields[i];
                
                // Get the name.
                name = schemaField[KEYWORD_NAME];
                
                // Get the sub-schema.
                subSchema = schemaField[KEYWORD_CONCORDIA];
                
                // If the name doesn't exist, then it must be a referenced
                // schema.
                if (typeof name === "undefined") {
                    // Validate the data based on the sub-schema.
                    subSchema.validateData(data);
                }
                // Otherwise, we need to pull out the data and validate that.
                else {
                    // Get the data.
                    dataField = data[name];
                    
                    // If the data doesn't exist, ensure that it is optional.
                    dataFieldType = typeof dataField;
                    if (dataFieldType === "undefined") { 
                        if (! schemaField[KEYWORD_OPTIONAL]) {
                            throw "The field '" +
                                    name +
                                    "' is missing from the data: " +
                                    JSON.stringify(data);
                        }
                    }
                    // If the data does exist, validate it.
                    else {
                        // If there is no sub-schema, validate using this 
                        // sub-schema.
                        if (typeof subSchema === "undefined") {
                            validateDataChild(schemaField, dataField);
                        }
                        // Otherwise, use the sub-schema to validate the data.
                        else {
                            subSchema.validateData(dataField);
                        }
                    }
                }
            }
            
            // Check if custom validation code is present.
            extensionType = 
                Object
                    .prototype
                        .toString
                            .call(
                                Concordia
                                    .prototype.validateDataExtensionObject);
            if (extensionType === JS_TYPE_FUNCTION) {
                Concordia.prototype.validateDataExtensionObject(schema, data);
            }
        }
        
        /**
         * Validates a JSON object whose "type" has already been determined to
         * be "array". The "array" type requires a "schema" field whose value
         * is either a JSON object or a JSON array. If it is a JSON object,
         * that signifies that a data point could have any number of indicies,
         * but that they are all the same type. If it is a JSON array, that
         * signifies that a data point will have the exact same number of 
         * indicies as the number of indicies in this array and that the type
         * of each index in the data array must be the specified in the 
         * correlating index in this array.
         * 
         * @param obj The JSON object to validate.
         * 
         * @see validateConstLengthArray(object)
         * @see validateConstTypeArray(object)
         */
        function validateSchemaArray(obj) {
            var schema = obj[KEYWORD_SCHEMA]
              , schemaType
              , schemaJsType
              , extensionType;

            // Validate that the schema is not null.
            if (schema === null) {
                throw "The '" +
                        KEYWORD_SCHEMA +
                        "' field's value cannot be null: " + 
                        JSON.stringify(obj);
            }
            // Validate that the schema exists and that it is an object, either 
            // a JSON object or a JSON array.
            schemaType = typeof schema;
            if (schemaType === "undefined") {
                throw "The '" +
                        KEYWORD_SCHEMA +
                        "' field is missing: " + 
                        JSON.stringify(obj);
            }
            
            schemaJsType = Object.prototype.toString.call(schema);
            // If it is an array, this is a definition for a data point whose
            // value will be a constant length array, and each index in that
            // array must have a defined type. But, the types may vary from
            // index to index.
            if (schemaJsType === JS_TYPE_ARRAY) {
                validateSchemaConstLengthArray(schema);
            }
            // If it is an object, this is a definition for a data point whose 
            // value will be a variable length array, but each index's type
            // must be the same.
            else if (schemaJsType === JS_TYPE_OBJECT) {
                validateSchemaConstTypeArray(schema);
            }
            // Otherwise, it is invalid.
            else {
                throw "The '" +
                        KEYWORD_SCHEMA +
                        "' field's type must be either an array or an object: " + 
                        JSON.stringify(obj);
            }
            
            // Check if any additional properties were added to this type.
            extensionType = 
                Object
                    .prototype
                        .toString
                            .call(
                                Concordia
                                    .prototype.validateSchemaExtensionArray);
            if (extensionType === JS_TYPE_FUNCTION) {
                Concordia.prototype.validateSchemaExtensionArray(obj);
            }
        }
        
        /**
         * Validates that the data is a JSON array or, if the data is missing
         * or 'null', that it is optional.
         * 
         * @param schema The schema to use to validate the data.
         * 
         * @param data The data to validate.
         * 
         * @see validateConstLengthArray(object, array)
         * @see validateConstTypeArray(object, array)
         */
        function validateDataArray(schema, data) {
            var arraySchema
              , extensionType;
            
            // If the data is not present or 'null', ensure that it is
            // optional.
            if (data === null) { 
                if (! schema[KEYWORD_OPTIONAL]) {
                    throw "The data is not optional.";
                }
                else {
                    return;
                }
            }
            
            // Ensure it is an array.
            if (Object.prototype.toString.call(data) !== JS_TYPE_ARRAY) {
                throw "The data is not a JSON array: " + 
                        JSON.stringify(data);
            }
            
            // Get the schema.
            arraySchema = schema[KEYWORD_SCHEMA];
            // If it's an array, then pass it to the constant length array
            // validator.
            if (Object.prototype.toString.call(arraySchema) === JS_TYPE_ARRAY) {
                validateDataConstLengthArray(arraySchema, data);
            }
            // If it's an object, then pass it to the constant type array
            // validator.
            else {
                validateDataConstTypeArray(arraySchema, data);
            }
            
            // Check if custom validation code is present.
            extensionType = 
                Object
                    .prototype
                        .toString
                            .call(
                                Concordia
                                    .prototype.validateDataExtensionArray);
            if (extensionType === JS_TYPE_FUNCTION) {
                Concordia.prototype.validateDataExtensionArray(schema, data);
            }
        }
        
        /**
         * Validates a JSON array that is defining the different types in a
         * staticly-sized array. This validates that each index in the JSON 
         * array is a JSON object defining a type.
         * 
         * @param arr The JSON array to validate.
         */
        function validateSchemaConstLengthArray(arr) {
            var i
              , field;
            
            // Validate each index in the array.
            for (i = 0; i < arr.length; i++) {
                field = arr[i];
                
                // If the index is null, throw an exception.
                if (field === null) {
                    throw "The element at index " + 
                            i + 
                            " is null: " + 
                            JSON.stringify(obj);
                }
                
                // If the index is not an object, throw an exception.
                if (Object.prototype.toString.call(field) !== JS_TYPE_OBJECT) {
                    throw "The element at index " + 
                            i + 
                            "is not a JSON object: " + 
                            JSON.stringify(obj);
                }
                
                // First, attempt to decode it as a remote schema.
                try {
                    getRemoteSchema(field, null);
                }
                // If decoding threw an exception, prepend the index of the
                // failed schema.
                catch(e) {
                    throw "The referenced schema was invalid at index " +
                            i +
                            ": " +
                            e.toString();
                }

                // If a remote schema was not added, then attempt to validate
                // it like normal.
                if ((field[KEYWORD_CONCORDIA] === null) ||
                    (typeof field[KEYWORD_CONCORDIA] === "undefined")) {
                    
                    validateSchemaChild(field);
                }
            }
        }
        
        /**
         * Validates that the data array is the same length as is specified in
         * the schema and that each element in the data array has the type 
         * defined in the schema array at the same index.
         * 
         * @param schema A JSON array where each index defines a type.
         * 
         * @param dataArray The JSON array whose indicies are to be validated.
         */
        function validateDataConstLengthArray(schema, dataArray) {
            var i;
            
            // As a quick check, ensure both arrays are the same length. Even
            // if the schema array lists its final elements as being optional
            // and the data array is short those entries, it is still 
            // considered invalid. Instead, the data array should be prepended
            // with 'null's to match the schema's length.
            if (schema.length !== dataArray.length) {
                throw "The schema array and the data array are of different " +
                        "lengths: " +
                        JSON.stringify(dataArray);
            }
            
            // For each schema in the schema array, ensure that the 
            // corresponding element in the data array is of the correct type.
            for (i = 0; i < schema.length; i++) {
                // If this is a referenced schema, get the sub-schema and
                // recurse on it.
                var subSchema = schema[i][KEYWORD_CONCORDIA];
                if ((subSchema !== null) &&
                    (typeof subSchema !== "undefined") &&
                    (subSchema instanceof Concordia)) {
                    
                    subSchema.validateData(dataArray[i]);
                }
                // Otherwise, get this index's schema and validate this index's
                // data.
                else {
                    validateDataChild(schema[i], dataArray[i]);
                }
            }
        }
        
        /**
         * Validates a JSON object that is defining the type for all of the 
         * indicies in a JSON array.
         * 
         * @param obj The JSON object to validate.
         */
        function validateSchemaConstTypeArray(obj) {
            // First, attempt to decode it as a remote schema.
            getRemoteSchema(obj, null);

            // If a remote schema was not added, then attempt to validate
            // it like normal.
            if ((obj[KEYWORD_CONCORDIA] === null) ||
                (typeof obj[KEYWORD_CONCORDIA] === "undefined")) {
                
                validateSchemaChild(obj);
            }
        }
        
        /**
         * Validates that each element in an array has the given schema.
         * 
         * @param schema The Concordia schema to use to validate the data.
         * 
         * @param dataArray The array of elements to validate.
         */
        function validateDataConstTypeArray(schema, dataArray) {
            var i;
            
            // Get the sub-schema if it exists; otherwise, set the variable to
            // null.
            var subSchema = schema[KEYWORD_CONCORDIA];
            if ((typeof subSchema === "undefined") ||
                (! (subSchema instanceof Concordia))) {
                
                subSchema = null;
            }
            
            // For each element in the data array, make sure that it conforms
            // to the given schema.
            for (i = 0; i < dataArray.length; i++) {
                // If the sub-schema is null, use this field's schema.
                if (subSchema === null) {
                    validateDataChild(schema, dataArray[i]);
                }
                // Otherwise, use the sub-schema to validate this index's data.
                else {
                    subSchema.validateData(dataArray[i]);
                }
            }
        }
        
        /**
         * Validates a JSON object based on its "type" field. If the object 
         * doesn't have a "type" field, it is invalid. The list of valid types
         * are, "boolean", "number", "string", "object", and "array".
         * 
         * @param obj The object whose "type" field will be evaluated and used 
         *            to continue validation.
         * 
         * @see validateSchemaBoolean(object)
         * @see validateSchemaNumber(object)
         * @see validateSchemaString(object)
         * @see validateSchemaObject(object)
         * @see validateSchemaArray(object)
         */
        function validateSchemaChild(obj) {
            var type = obj[KEYWORD_TYPE]
              , typeType;
            
            if (type === null) {
                throw "The '" + 
                        KEYWORD_TYPE + 
                        "' field cannot be null: " + 
                        JSON.stringify(obj);
            }
            typeType = typeof type;
            if (typeType === "undefined") {
                throw "The '" + 
                        KEYWORD_TYPE + 
                        "' field is missing: " + 
                        JSON.stringify(obj);
            }
            if (Object.prototype.toString.call(type) !== JS_TYPE_STRING) {
                throw "The '" + 
                        KEYWORD_TYPE + 
                        "' field is not a string: " + 
                        JSON.stringify(obj);
            }
            
            if (type === TYPE_BOOLEAN) {
                validateSchemaBoolean(obj);
            }
            else if (type === TYPE_NUMBER) {
                validateSchemaNumber(obj);
            }
            else if (type === TYPE_STRING) {
                validateSchemaString(obj);
            }
            else if (type === TYPE_OBJECT) {
                validateSchemaObject(obj);
            }
            else if (type === TYPE_ARRAY) {
                validateSchemaArray(obj);
            }
            else {
                throw "Type unknown: " + type;
            }
        
            validateSchemaOptions(obj);
        }
        
        /**
         * Passes the data to the appropriate validator based on the schema.
         * 
         * @param schema The schema to use to validate the data.
         * 
         * @param data The data to validate.
         * 
         * @see validateDataBoolean(object, object)
         * @see validateDataNumber(object, object)
         * @see validateDataString(object, object)
         * @see validateDataObject(object, object)
         * @see validateDataArray(object, object)
         */
        function validateDataChild(schema, data) {
            var type = schema[KEYWORD_TYPE];
            
            if (type === TYPE_BOOLEAN) {
                validateDataBoolean(schema, data);
            }
            else if (type === TYPE_NUMBER) {
                validateDataNumber(schema, data);
            }
            else if (type === TYPE_STRING) {
                validateDataString(schema, data);
            }
            else if (type === TYPE_OBJECT) {
                validateDataObject(schema, data);
            }
            else if (type === TYPE_ARRAY) {
                validateDataArray(schema, data);
            }
        }
        
        /**
         * Validates a JSON object by checking for the "doc" and "optional" 
         * tags. Any combination of the tags may be given. 
         * 
         * The "doc" tag must be a string.
         * 
         * The "optional" tag must be a boolean.
         * 
         * @param obj The type object to check for options.
         */
        function validateSchemaOptions(obj) {
            var doc = obj[KEYWORD_DOC]
              , docType = typeof doc
              , optional = obj[KEYWORD_OPTIONAL]
              , optionalType = typeof optional;
            
            if ((docType !== "undefined") && 
                    (Object.prototype.toString.call(doc) !== JS_TYPE_STRING)) {
                
                throw "The 'doc' field's value must be of type string: " + 
                        JSON.stringify(obj);
            }
            
            if ((optionalType !== "undefined") && 
                (Object.prototype.toString.call(optional) !== JS_TYPE_BOOLEAN)) {
                
                throw "The 'optional' field's value must be of type boolean: " + 
                        JSON.stringify(obj);
            }
        }
        
        /**
         * Takes in a valid JSON object and validates that it conforms to the 
         * Concordia schema specification.
         * 
         * @param obj The JSON object to validate.
         * 
         * @return The given JSON object that represents a valid schema.
         * 
         * @throws The schema is not valid.
         */
        function validateSchema(obj) {
            var type = obj[KEYWORD_TYPE]
              , typeType
              , optionalType = typeof obj[KEYWORD_OPTIONAL];
            
            if (type === null) {
                throw "The root object's '" + 
                        KEYWORD_TYPE + 
                        "' field cannot be null: " + 
                        JSON.stringify(obj);
            }
            typeType = typeof type;
            if (typeType === "undefined") {
                throw "The root object's '" +
                        KEYWORD_TYPE +
                        "' field is missing: " + 
                        JSON.stringify(obj);
            }
            if (Object.prototype.toString.call(type) !== JS_TYPE_STRING) {
                throw "The root object's '" +
                        KEYWORD_TYPE +
                        "' field must be a string: " +
                        JSON.stringify(obj);
            }
            if ((type !== TYPE_OBJECT) && (type !== TYPE_ARRAY)) {
                throw "The root object's '" +
                        KEYWORD_TYPE +
                        "' field must either be " +
                        "'object' or 'array': " + 
                        JSON.stringify(obj);
            }
            
            if (optionalType !== "undefined") {
                throw "The 'optional' field is not allowed at the root of " +
                        "the definition.";
            }
            
            validateSchemaChild(obj);

            return obj;
        }
        
        /**
         * Validate data against any schema, even a partial one. This is used
         * internally to allow checking of subcomponents without worrying about
         * the specifics of the data.
         * 
         * @param data Any data to validate.
         * 
         *  @return The same data as it was passed in.
         */
        function validateDataNoCheck(data) {
            // Validate the data using this object's sub-schema.
            validateDataChild(this[KEYWORD_SCHEMA], data);
            
            // Returns the data just to conform to the function it is
            // shadowing, {@link #validateData(data)}.
            return data;
        };
        
        /**
         * Validate data against this object's schema.
         * 
         * @param data The data to validate against the schema, which must be
         *             valid JSON.
         * 
         *  @return The data that has been validated and now has a
         *          language-level representation.
         */
        concordia.validateData = function (data) {
            var jsonData = data
              , jsonDataType = Object.prototype.toString.call(jsonData);
            
            // If the data is a string, attempt to convert it into an object or
            // an array.
            if (jsonDataType === JS_TYPE_STRING) {
                jsonData = JSON.parse(data);
                jsonDataType = Object.prototype.toString.call(jsonData);
            }
            
            // The type of the data must be either an object or an array.
            if ((jsonDataType === JS_TYPE_ARRAY) ||
                (jsonDataType === JS_TYPE_OBJECT)) {
                
                validateDataChild(this[KEYWORD_SCHEMA], jsonData);
            }
            else {
                throw "The data must either be a JSON object or a JSON " +
                        "array or a string representing one of the two.";
            }
            
            return jsonData;
        };
        
        // Validate that the schema is valid.
        var schemaJson = schema;
        var schemaType = Object.prototype.toString.call(schema);
        // If we are given a string representing the schema, first convert it
        // into JSON.
        if (schemaType === JS_TYPE_STRING) {
            schemaJson = JSON.parse(schema);
            schemaType = Object.prototype.toString.call(schemaJson);
        }
        
        // If it isn't a JSON object, then throw an exception.
        if (schemaType !== JS_TYPE_OBJECT) {
            throw "The schema must either be a JSON object or a string " +
                    "representing a JSON object.";
        }
        
        // Validate the schema and, if it passes, store it as the schema.
        concordia[KEYWORD_SCHEMA] = validateSchema(schemaJson);

    // End of Concordia definition.
    }(this));
}