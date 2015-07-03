Package.describe({
    name: "lab:vnw-apis",
    summary: "Vietnamworks apis",
    version: "0.0.1"
});

Package.onUse(function(api) {
    api.use([
        "pcel:mysql",
        "sgi:sprintfjs",
        "jparker:crypto-md5",
    ], 'server');

    api.addFiles('apis.js', 'server');
    api.export('APIS', 'server');
});