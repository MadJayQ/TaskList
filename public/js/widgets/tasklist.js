class _TaskList_  {
    constructor() {
        this.tasks = [];
        this.tableBody = $("#taskList").find('tbody');
    }

    addTask(task) {
        var builtTask = new Task.Builder().fromJSON(task);
        this.tasks[builtTask.taskID] = builtTask;
    }

    addAllTasks() {
        this.tableBody.empty();
        for(var i = 0; i < this.tasks.length; i++) {
            var task = this.tasks[i];
            console.log(task);
            this.tableBody.append(task.stringify());
        }
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
        var parsedTasks = JSON.parse(e.data);
        for(var taskKey in parsedTasks) {
            var task = parsedTasks[taskKey];
            TaskList.getInstance().addTask(task);
        }
        TaskList.getInstance().addAllTasks();
    } 
});