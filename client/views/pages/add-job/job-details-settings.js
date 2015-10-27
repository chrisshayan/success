/**
 * Created by HungNguyen on 10/22/15.
 */

/*

 Template.jobDetailSettings.onCreated({

 });

 */

Template.jobDetailSettings.helpers({
    formatParagraph: function (text) {
        return text.replace(/\n/g, '<br/>');
    }
});
