"use strict";

module.exports = class Seed {

    constructor (id) {
        this.id = id;          // relative id to the other elements in the same batch
        //this.bId = batchId;    //batch id
        //this.bsz = batchSize;  //batch size
        this.att = 0;          // number of attempts
        this.res = null;       // response from the request: 200, 404, 403 etc.
        this.ds = 0;           // data score (number of parsed fields)/(num of target fields)
        this.st = false;       // status success mean request was ok, data parsing was ok and the data has been saved
    }

    queued () {
        this.att++;
    }

    setRes (res) {
        this.res = res
    }

    complete (status) {
        this.st = status;
    }

}