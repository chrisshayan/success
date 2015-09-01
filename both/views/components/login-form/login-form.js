if(Meteor.isClient) {
    LoginFormSchema = new SimpleSchema({
        email: {
            type: String,
            autoform: {
                placeholder: "Email"
            }
        },
        password: {
            type: String,
            autoform: {
                type: "password",
                placeholder: "Password"
            }
        }
    });

    LoginFormSchema.messages({
        "notFound": "User not found",
        "invalidPassword": "Incorrect password"
    });


    AutoForm.hooks({
        loginForm: {
            onSubmit: function(doc) {
                Meteor.loginWithVNW(doc.email, doc.password, function(err, result) {
                   if(err) {
                       if(err.reason.toLowerCase().indexOf("password") >= 0) {
                           LoginFormSchema.namedContext('loginForm').addInvalidKeys([{name: 'password', type: 'invalidPassword'}]);
                       } else if(err.reason.toLowerCase().indexOf("user") >= 0) {
                           LoginFormSchema.namedContext('loginForm').addInvalidKeys([{name: 'email', type: 'notFound'}]);
                       }
                   }
                });
                return false;
            }
        }
    })

    Template.loginForm.helpers({
        schema: function() {
            return LoginFormSchema;
        }
    })
}