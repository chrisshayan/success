Router.route('/downloadresume/:companyId/:entryId/:token', {
    name: 'downloadResume',
    where: 'server',
    action: function () {
        try {
            var dataToken = IZToken.decode(this.params.token);
            if (dataToken.companyId == this.params.companyId && dataToken.expireTime >= Date.now()) {
                var application = Collections.Applications.findOne({
                    _id: this.params.entryId,
                    companyId: dataToken.companyId
                });
                if (application && application.source == 2) {
                    var fileName = application.data.fileName;
                    var fileAlias = application.data.alias;
                    var physicalFolder = application.data.physicalFolder;
                    var mimeType = application.data.fileMime;
                    var cvLink = sprintf(process.env.DOWNLOAD_RESUME_URL, physicalFolder, fileName);

                    this.response.writeHead(200, {
                        'Content-type': mimeType,
                        'Content-disposition': 'attachment; filename=' + fileAlias
                    });
                    request(cvLink).pipe(this.response);
                    return;
                }
            }
            this.response.writeHead(400);
            this.response.end("Parameters invalid");
        } catch (e) {
            this.response.writeHead(400);
            this.response.end("Parameters invalid");
        }
    }
});

/**
 * Implement webhooks
 */
Router.onBeforeAction(Iron.Router.bodyParser.json({limit: '50mb'}));
function authWebhookToken() {
    try {
        var token = this.request.headers['x-access-token'];
        if(!token || !IZToken.decode(token)) {
            this.response.writeHead(400);
            this.response.end(EJSON.stringify({success: false, msg: 'Access token invalid'}));
        } else {
            this.next();
        }
    }  catch (e) {
        console.trace('Received request to application hook: ', e);
        this.response.writeHead(400);
        this.response.end(EJSON.stringify({success: false, msg: 'Access token invalid'}));
    }
}

Router.route('/webhook/job', {
    where: 'server',
    onBeforeAction: authWebhookToken,
    action: function () {
        try {
            var data = this.request.body;
            check(data, {
                jobId: Number,
                userId: Number,
                companyId: Number
            });
            var type = null;
            switch (this.request.method.toLowerCase()) {
                case 'post':
                    type = 'addJob';
                    break;
                case 'put':
                    type = 'updateJob';
                    break;
            }
            type && SYNC_VNW.addQueue(type, data);
            this.response.writeHead(200);
            this.response.end(EJSON.stringify({success: true, msg: ''}));
        } catch (e) {
            console.trace('Received request to job hook: ', e);
            this.response.writeHead(400);
            this.response.end(EJSON.stringify({success: false, msg: 'Parameters invalid'}));
        }
    }
});


Router.route('/webhook/application', {
    where: 'server',
    onBeforeAction: authWebhookToken,
    action: function () {
        try {
            var data = this.request.body;
            check(data, {
                jobId: Number,
                entryId: Number,
                source: Number
            });
            var type = null;
            switch (this.request.method.toLowerCase()) {
                case 'post':
                    type = 'addApplication';
                    break;
                case 'put':
                    type = 'updateApplication';
                    break;
            }
            type && SYNC_VNW.addQueue(type, data);

            this.response.writeHead(200);
            this.response.end(EJSON.stringify({success: true, msg: ''}));
        } catch (e) {
            console.trace('Received request to application hook: ', e);
            this.response.writeHead(400);
            this.response.end(EJSON.stringify({success: false, msg: 'Parameters invalid'}));
        }
        return true;
    }
});
