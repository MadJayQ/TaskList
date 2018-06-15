class _TaskList_  {
    constructor() {
        this.tasks = [];
        this.tableBody = $("#taskList").find('tbody');
    }

    addTask(task) {
        this.tableBody.append(task.stringify());
    }
}

var TaskList = (() => {
    var instance;
    return {
        getInstance: () => {
            if(instance == null) {
                instance = new _TaskList_();
            }
            return instance;
        }
    }
})();


function populateTaskList() {

    //TODO(Jake): Make sure to move this over to another callback later, this is absolutely awful
    requestAnimationFrame(
        () => {
            populateTaskList();
        }
    )
}


$(() => {
    var source = new EventSource('/events');
    source.onmessage = (e) => {
        document.write(e.data);
    } 
    /*
    requestAnimationFrame(
        () => {
            populateTaskList();
        }
    )
    */
});