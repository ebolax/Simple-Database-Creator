module.exports = function (grunt)
{
    grunt.initConfig(
    {
        pkg: grunt.file.readJSON("package.json"),

        copy:
        {
            main:
            {
                files:
                [
                    // destination : source
                    {expand: true, cwd: 'node_modules/jquery/dist/', src: ['jquery.min.js'], dest: 'js/'},
                    {expand: true, cwd: 'node_modules/bootstrap/dist/js/', src: ['bootstrap.min.js'], dest: 'js/'},
                    {expand: true, cwd: 'node_modules/@popperjs/core/dist/umd/', src: ['popper.min.js'], dest: 'js/'},
                    {expand: true, cwd: 'node_modules/datatables/media/js/', src: ['jquery.dataTables.min.js'], dest: 'js/'},
                    {expand: true, cwd: 'node_modules/datatables.net-bs4/js/', src: ['dataTables.bootstrap4.min.js'], dest: 'js/'},
                    {expand: true, cwd: 'node_modules/lity-v2/dist/', src: ['lity.min.js'], dest: 'js/'},
                    {expand: true, cwd: 'node_modules/jquery.json-viewer/json-viewer/', src: ['jquery.json-viewer.js'], dest: 'js/'},
                    {expand: true, cwd: 'node_modules/jquery-ui-dist/', src: ['jquery-ui.min.js'], dest: 'js/'},
                    {expand: true, cwd: 'node_modules/jquery-timepicker/', src: ['jquery.timepicker.js'], dest: 'js/'},

                    {expand: true, cwd: 'node_modules/bootstrap/dist/css/', src: ['bootstrap.min.css'], dest: 'css/'},
                    {expand: true, cwd: 'node_modules/font-awesome/css/', src: ['font-awesome.min.css'], dest: 'css/'},
                    {expand: true, cwd: 'node_modules/datatables/media/css/', src: ['jquery.dataTables.min.css'], dest: 'css/'},
                    {expand: true, cwd: 'node_modules/datatables/media/images/', src: ['*.*'], dest: 'images/'},
                    {expand: true, cwd: 'node_modules/datatables.net-bs4/css/', src: ['dataTables.bootstrap4.min.css'], dest: 'css/'},
                    {expand: true, cwd: 'node_modules/font-awesome/fonts/', src: ['*'], dest: 'fonts/'},
                    {expand: true, cwd: 'node_modules/lity-v2/dist/', src: ['lity.min.css'], dest: 'css/'},
                    {expand: true, cwd: 'node_modules/jquery.json-viewer/json-viewer/', src: ['jquery.json-viewer.css'], dest: 'css/'},
                    //{expand: true, cwd: 'node_modules/jquery-ui-dist/', src: ['jquery-ui.min.css'], dest: 'css/'},
                    {expand: true, cwd: 'node_modules/jquery-ui-themes/themes/pepper-grinder/', src: ['jquery-ui.min.css'], dest: 'css/'},
                    {expand: true, cwd: 'node_modules/jquery-ui-themes/themes/pepper-grinder/images/', src: ['*'], dest: 'css/images/'},
                    {expand: true, cwd: 'node_modules/jquery-timepicker/', src: ['jquery.timepicker.css'], dest: 'css/'},

                    // tinymce
                    {expand: true, cwd: 'node_modules/tinymce/', src: ['tinymce.min.js'], dest: 'tinymce/'},
                    {expand: true, cwd: 'node_modules/tinymce/', src: ['jquery.tinymce.min.js'], dest: 'tinymce/'},
                    {expand: true, cwd: 'node_modules/tinymce/themes', src: ['**'], dest: 'tinymce/themes/'},
                    {expand: true, cwd: 'node_modules/tinymce/skins', src: ['**'], dest: 'tinymce/skins/'},
                    {expand: true, cwd: 'node_modules/tinymce/plugins', src: ['**'], dest: 'tinymce/plugins/'},
                    {expand: true, cwd: 'node_modules/tinymce/icons', src: ['**'], dest: 'tinymce/icons/'},
                ]
            }
        },
    });

    grunt.loadNpmTasks("grunt-contrib-copy");

    grunt.registerTask("default", ["copy"]);
};