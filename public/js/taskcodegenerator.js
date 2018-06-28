class _TaskCodeGenerator_  {
    constructor() {
        this.taskCodeID = 0;
    }

    GenerateID() {
        return this.taskCodeID++;
    }
}

var TaskCodeGenerator = (() => {
    var instance;
    return {
        getInstance: () => {
            if(instance == null) {
                instance = new _TaskCodeGenerator_();
            }
            return instance;
        }
    }
})();

if(typeof module !== 'undefined') {
    module.exports = TaskCodeGenerator;
}
