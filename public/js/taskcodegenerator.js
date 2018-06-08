var TaskCodeID = 0;

class TaskCodeGenerator {
    constructor() {
        this.taskCodeMap = {};
    }
}

TaskCodeGenerator.GenerateID = () => {
    return TaskCodeID++;   
}
