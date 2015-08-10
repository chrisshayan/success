Router.route('/downloadresume/:companyId/:entryId', {
    name: 'downloadResume',
    where: 'server',
    action: function() {
        var application = Collections.Applications.findOne({entryId: +this.params.entryId, companyId: +this.params.companyId});
        if(application && application.source == 2) {
            var fileName = application.data.fileName;
            var fileAlias = application.data.alias;
            var physicalFolder = application.data.physicalFolder;
            var mimeType = application.data.fileMime;
            var cvLink = sprintf(Meteor.settings.downloadResume, physicalFolder, fileName);

            this.response.writeHead(200, {'Content-type': mimeType, 'Content-disposition': 'attachment; filename=' + fileAlias});
            request(cvLink).pipe(this.response);
        } else {
            this.response.writeHead(400);
            this.response.end("Parameters invalid");
        }
    }
});