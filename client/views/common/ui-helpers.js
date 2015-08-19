/**
 * Created by HungNguyen on 8/19/15.
 */


var mappedFormat = [
    'MM/DD/YYYY, hh:mm',
    'MM/DD/YYYY',
    'hh:mm, DD/MM/YYYY'
];


UI.registerHelper('formatDate', function (context, formatType) {
    var format = (formatType != void 0) ? mappedFormat[formatType] : mappedFormat[0];

    if (context && typeof context === 'object')
        return moment(context).format(format);
});
