var tasks = [];
var Priority = {
    PRIORITY_URGENT: {
        id: 0,
        color: "#f31431",
        icon: "fas fa-exclamation-triangle fa-2x"
    },
    PRIORITY_DAILY: {
        id: 1,
        color: "#daa520",
        icon: "far fa-calendar fa-2x"
    },
    PRIORITY_GENERIC: {
        id: 2,
        color: "#808285",
        icon: "fas fa-tasks fa-2x"
    },
    PRIORITY_COMPLETE: {
        id: 3,
        color: "#00a03d",
        icon: "fas fa-check-circle fa-2x"
    },
    PRIORITY_MAX: {
        id: 4,
        color: "",
        icon: ""
    }
}
//jake is a dork! love lindsey! XD
class Task {
    constructor(builder) {
        if(arguments.length != 1) {
            console.error("[TASK]: Must use the Builder Interface to construct Tasks!");
            return undefined;
        }

        let priority = builder.priority;
        let owner = builder.owner;
        let code = builder.code;
        let name = builder.name;
        let taskID = builder.taskID;
        /// <summary>
        /// Object.defineProperties allows us to create private fields that cannot be edited post
        /// creation, this is the intention of the Builder design pattern
        /// </summary>
        Object.defineProperties(this, {
            'name': {
                value: name,
                writable: false //Private
            },
            'priority': {
                value: priority, 
                writable: true //Private 
            },
            'owner': {
                value: owner,
                writable: false //Private
            },
            'code': {
                value: code,
                writable: true //Private
            },
            'taskID': {
                value: taskID,
                writable: true
            }
        }); 
    }

    complete() {
        if(this.priority != Priority.PRIORITY_COMPLETE) {
            this.priority = Priority.PRIORITY_COMPLETE;
            this.rowContainer.childNodes = new Array();
            this.rowContainer = this.stringify();
        }
    }

    serialize() {
        var ret = {
            name: this.name,
            priority: this.priority,
            owner: this.owner,
            code: this.code,
            taskID: this.taskID
        };
        return JSON.stringify(ret);
    }
    
    stringify() {
        /*
        <tr>
            <td><i class="fas fa-exclamation-triangle fa-2x" style="color:#f31431;"></i></td>
            <td>Clean Tables</td>
            <td>Michelle</td>
            <td>0458</td>
            <td>Not Completed!</td>
            <td>N/A</td>
        </tr>
        */
       var row = document.createElement("tr");
       row.id = "task-row-" + this.taskID;
       var icon = document.createElement("i");
       icon.className = this.priority.icon;
       icon.style = "color:" + this.priority.color + ";"
       var iconHolder = document.createElement("td");
       iconHolder.appendChild(icon);

       var taskName = document.createElement("td");
       var taskIssuer = document.createElement("td");
       var taskCompletionCode = document.createElement("td");
       var taskCompleted = document.createElement("td");
       var taskCompletedBy = document.createElement("td");

       taskName.innerText = this.name;
       taskIssuer.innerText = this.owner;
       taskCompletionCode.innerText = this.code;
       taskCompleted.innerText = "Not Completed!";
       taskCompletedBy.innerText = "N/A";

       row.appendChild(iconHolder);
       row.appendChild(taskName);
       row.appendChild(taskIssuer);
       row.appendChild(taskCompletionCode);
       row.appendChild(taskCompleted);
       row.appendChild(taskCompletedBy);

       this.rowContainer = row;

       return row;
    }

    static get Builder() {
        /*
            JavaScript Builder Design Pattern
        */
        class Builder {
            constructor(priority, name, owner) {
                this.priority = priority;
                this.name = name;
                this.owner = owner;
                if(typeof module !== 'undefined') {
                    var _TaskCodeGenerator = require('./taskcodegenerator');
                    this.taskID = _TaskCodeGenerator.getInstance().GenerateID();
                } else {
                    this.taskID = TaskCodeGenerator.getInstance().GenerateID();
                }
                this.code = "0000";
            }

            build() {
                var task = new Task(this);
                //TaskList.getInstance().addTask(task);
                return task;
            }

            fromJSON(json) {
                var dat = JSON.parse(json);
                this.priority = dat.priority;
                this.name = dat.name;
                this.owner = dat.owner;
                var t = this.build();
                t.code = dat.code;
                t.taskID = dat.taskID;
                return t;
            }
        }
        return Builder;
    }
}

if(typeof module !== 'undefined') {
    module.exports.Task = Task;
    module.exports.Priority = Priority;
}