const express =   require('express');
var app =         express();

var Role =        require('./models/role');
var Supervisor =  require('./models/supervisor');



function Main() {
    console.log("executing main");
    // Both supervisor and worker are using same code base

    // STEP 1
    // Check Registered server list
    // Start and register as a supervisor if number of supervisor is less than 2
    // Start and register as a worker if number of supervisor is 2

    // STEP 2
    // Start project base on the role
    // 
    // -SUPERVISOR
    // -Collect url params from url backlog documents
    // -Format the result into proper urls base on the site, type
    // -Group urls into a que
    // -Publish the que in to firebase
    // -Process, archive and remove the completed que from firebase
    // -Collect, porcess and archive worker's que report
    // 
    // -WORKER
    // -Get a url que from firebase and mark it as in progress
    // -fetch the url and store parsed data into database using site parsing code base
    // -set response properties after every request
    // -generate a tast report after the que is done
    // -mark the que as completed and publish the generated report

    var sup = new Supervisor();
    sup.registerServer();
    sup.getUrlBacklogs();
}

Main.prototype.getRole = function() {
    
};

Main.prototype.getRole = function() {
    
};

module.exports = Main;